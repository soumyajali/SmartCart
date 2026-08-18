from flask import Blueprint, request, jsonify
from datetime import datetime
from app.aggregation.aggregator import ProductAggregator

product_bp = Blueprint('products', __name__)
aggregator = ProductAggregator()

@product_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '').strip()
    try:
        results = aggregator.search(query)
        # Attach trust scores and adjusted ratings to aggregated products
        for product in results:
            reviews_cursor = mongo_db["reviews"].find({"product_id": product["product_id"]}, {"_id": 0})
            reviews = list(reviews_cursor)
            if reviews:
                total_trust = sum((r.get("trust_score") or 50) for r in reviews)
                product["aggregate_trust_score"] = round(total_trust / len(reviews))
                
                # Adjusted Rating calculation
                genuine_reviews = [r for r in reviews if r.get("prediction") == "genuine"]
                if genuine_reviews:
                    product["adjusted_rating"] = round(sum((r.get("rating") or 0) for r in genuine_reviews) / len(genuine_reviews), 1)
                else:
                    product["adjusted_rating"] = None
                    
                # Recommendation Score: (Adjusted Rating * 20) + (Trust Score * 0.5) - just a basic formula
                if product["adjusted_rating"] and product["aggregate_trust_score"]:
                    product["recommendation_score"] = (product["adjusted_rating"] * 20) + (product["aggregate_trust_score"] * 0.5)
                else:
                    product["recommendation_score"] = 0
            else:
                product["aggregate_trust_score"] = None
                product["adjusted_rating"] = None
                product["recommendation_score"] = 0

        # Sort by recommendation score descending and mark the top one as SmartCart Choice
        results.sort(key=lambda x: x.get("recommendation_score", 0), reverse=True)
        if results and results[0].get("recommendation_score", 0) > 0:
            results[0]["smartcart_choice"] = True

        return jsonify({
            "success": True,
            "query": query,
            "count": len(results),
            "products": results
        })
    except Exception as e:
        print(f"Search API Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": {
                "code": "SEARCH_FAILED",
                "message": "Unable to retrieve product results."
            }
        }), 500
import os
import requests
from pymongo import MongoClient
from flask import current_app

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
mongo_client = MongoClient(mongo_uri)
mongo_db = mongo_client["smartcart"]

ml_service_url = os.getenv("ML_SERVICE_URL", "http://localhost:5001")

@product_bp.route('/<product_id>/reviews', methods=['GET'])
def get_reviews(product_id):
    try:
        reviews_cursor = mongo_db["reviews"].find({"product_id": product_id}, {"_id": 0})
        reviews = list(reviews_cursor)
        
        # Check and process pending ML predictions
        for review in reviews:
            if review.get("prediction") == "pending":
                try:
                    response = requests.post(f"{ml_service_url}/api/ml/fake-review", json={"text": review["review_text"]})
                    if response.status_code == 200:
                        ml_data = response.json()
                        review["prediction"] = ml_data["prediction"]
                        review["confidence"] = ml_data["confidence"]
                        review["trust_score"] = ml_data["trust_score"]
                        review["sentiment"] = ml_data.get("sentiment", "neutral")
                        review["sentiment_score"] = ml_data.get("sentiment_score", 0.0)
                        
                        # Update DB
                        mongo_db["reviews"].update_one(
                            {"review_id": review["review_id"]},
                            {"$set": {
                                "prediction": ml_data["prediction"],
                                "confidence": ml_data["confidence"],
                                "trust_score": ml_data["trust_score"],
                                "sentiment": review["sentiment"],
                                "sentiment_score": review["sentiment_score"]
                            }}
                        )
                except Exception as ml_e:
                    print(f"ML Service Error: {ml_e}")

        # Compute Aggregate Trust Score & Adjusted Rating
        total_reviews = len(reviews)
        if total_reviews > 0:
            total_trust = sum((r.get("trust_score") or 50) for r in reviews)
            aggregate_trust_score = round(total_trust / total_reviews)
            
            # Genuine tracking
            genuine_reviews = [r for r in reviews if r.get("prediction") == "genuine"]
            genuine_percentage = round((len(genuine_reviews) / total_reviews) * 100)
            
            # Original & Adjusted Rating
            original_rating = round(sum(r.get("rating", 0) for r in reviews) / total_reviews, 1)
            adjusted_rating = round(sum(r.get("rating", 0) for r in genuine_reviews) / len(genuine_reviews), 1) if genuine_reviews else None
            
        else:
            aggregate_trust_score = None
            genuine_percentage = None
            original_rating = None
            adjusted_rating = None

        return jsonify({
            "success": True,
            "product_id": product_id,
            "count": total_reviews,
            "aggregate_trust_score": aggregate_trust_score,
            "genuine_percentage": genuine_percentage,
            "original_rating": original_rating,
            "adjusted_rating": adjusted_rating,
            "reviews": reviews
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "REVIEWS_FAILED",
                "message": "Unable to fetch reviews."
            }
        }), 500

from sqlalchemy import text, create_engine

mysql_uri = os.getenv("DB_URI", f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}/{os.getenv('DB_NAME', 'smartcart')}")
engine = create_engine(mysql_uri)

@product_bp.route('/<product_id>/price-history', methods=['GET'])
def get_price_history(product_id):
    try:
        query = text("""
            SELECT ph.recorded_at as date, ph.price, l.platform 
            FROM price_history ph
            JOIN product_listings l ON ph.listing_id = l.id
            JOIN products p ON l.product_id = p.id
            WHERE p.id = :product_id
            ORDER BY ph.recorded_at ASC
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query, {"product_id": product_id})
            history = [{"date": str(row[0]), "price": float(row[1]), "platform": row[2]} for row in result]
            
        return jsonify({
            "success": True,
            "product_id": product_id,
            "history": history
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "PRICE_HISTORY_FAILED",
                "message": str(e)
            }
        }), 500

@product_bp.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        from sqlalchemy import text
        
        # Total products
        with engine.connect() as conn:
            total_products = conn.execute(text("SELECT COUNT(*) FROM products")).scalar()
            
        # MongoDB Aggregations
        pipeline = [
            {"$group": {
                "_id": "$platform",
                "total_reviews": {"$sum": 1},
                "fake_count": {"$sum": {"$cond": [{"$eq": ["$prediction", "fake"]}, 1, 0]}},
                "genuine_count": {"$sum": {"$cond": [{"$eq": ["$prediction", "genuine"]}, 1, 0]}},
                "sentiment_positive": {"$sum": {"$cond": [{"$eq": ["$sentiment", "Positive"]}, 1, 0]}},
                "sentiment_neutral": {"$sum": {"$cond": [{"$eq": ["$sentiment", "Neutral"]}, 1, 0]}},
                "sentiment_negative": {"$sum": {"$cond": [{"$eq": ["$sentiment", "Negative"]}, 1, 0]}}
            }}
        ]
        platform_stats = list(mongo_db["reviews"].aggregate(pipeline))
        
        total_reviews = sum(stat["total_reviews"] for stat in platform_stats)
        total_fake = sum(stat["fake_count"] for stat in platform_stats)
        total_genuine = sum(stat["genuine_count"] for stat in platform_stats)
        
        # Sort platforms by fake_count descending
        offenders = sorted(platform_stats, key=lambda x: x["fake_count"], reverse=True)
        
        # Fraud Seller Detection Join
        # 1. Get review counts grouped by (product_id, platform)
        product_pipeline = [
            {"$group": {
                "_id": {"product_id": "$product_id", "platform": "$platform"},
                "total_reviews": {"$sum": 1},
                "fake_count": {"$sum": {"$cond": [{"$eq": ["$prediction", "fake"]}, 1, 0]}}
            }}
        ]
        product_stats = list(mongo_db["reviews"].aggregate(product_pipeline))
        
        # 2. Get seller mapping from MySQL
        with engine.connect() as conn:
            seller_query = text("SELECT product_id, platform, seller FROM product_listings")
            seller_rows = conn.execute(seller_query).fetchall()
            
        # Map (product_id, platform) -> seller
        seller_map = {(row.product_id, row.platform): row.seller for row in seller_rows}
        
        # 3. Aggregate by seller
        seller_aggregation = {}
        for stat in product_stats:
            pid = stat["_id"]["product_id"]
            plat = stat["_id"]["platform"]
            seller = seller_map.get((pid, plat), "Unknown Seller")
            
            key = f"{seller}|{plat}"
            if key not in seller_aggregation:
                seller_aggregation[key] = {
                    "seller": seller,
                    "platform": plat,
                    "total_reviews": 0,
                    "fake_count": 0
                }
            
            seller_aggregation[key]["total_reviews"] += stat["total_reviews"]
            seller_aggregation[key]["fake_count"] += stat["fake_count"]
            
        # Format and sort
        fraudulent_sellers = []
        for v in seller_aggregation.values():
            if v["total_reviews"] > 0:
                v["fake_percentage"] = round((v["fake_count"] / v["total_reviews"]) * 100, 1)
                fraudulent_sellers.append(v)
                
        # Sort by fake_count descending
        fraudulent_sellers.sort(key=lambda x: x["fake_count"], reverse=True)
        total_positive = sum(stat.get("sentiment_positive", 0) for stat in platform_stats)
        total_neutral = sum(stat.get("sentiment_neutral", 0) for stat in platform_stats)
        total_negative = sum(stat.get("sentiment_negative", 0) for stat in platform_stats)
        
        # Sort platforms by fake_count descending
        offenders = sorted(platform_stats, key=lambda x: x["fake_count"], reverse=True)
        
        return jsonify({
            "success": True,
            "total_products": total_products,
            "total_reviews": total_reviews,
            "overall_predictions": {
                "genuine": total_genuine,
                "fake": total_fake
            },
            "overall_sentiment": {
                "positive": total_positive,
                "neutral": total_neutral,
                "negative": total_negative
            },
            "platform_stats": offenders,
            "fraudulent_sellers": fraudulent_sellers
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "ANALYTICS_FAILED",
                "message": str(e)
            }
        }), 500

@product_bp.route('/alerts', methods=['POST'])
def create_alert():
    try:
        data = request.json
        if not data or not data.get("email") or not data.get("product_id") or not data.get("target_price"):
            return jsonify({"success": False, "message": "Missing required fields."}), 400
            
        alert = {
            "email": data["email"],
            "product_id": data["product_id"],
            "target_price": float(data["target_price"]),
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        
        mongo_db["price_alerts"].insert_one(alert)
        
        return jsonify({
            "success": True,
            "message": "Price drop alert successfully saved."
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "ALERT_FAILED",
                "message": str(e)
            }
        }), 500
