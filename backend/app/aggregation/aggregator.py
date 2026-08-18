from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import os
import re
import difflib
from sqlalchemy import create_engine, text
from app.aggregation.amazon_adapter import AmazonLiveAdapter
from app.aggregation.flipkart_adapter import FlipkartLiveAdapter
from app.aggregation.myntra_adapter import MyntraLiveAdapter
from app.aggregation.ajio_adapter import AjioLiveAdapter

db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASSWORD", "")
db_host = os.getenv("DB_HOST", "localhost")
db_name = os.getenv("DB_NAME", "smartcart")
mysql_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
engine = create_engine(mysql_uri)

def normalize_name(name):
    # Remove special characters, extra spaces, and lowercase for robust matching
    name = re.sub(r'[^a-zA-Z0-9\s]', '', name).lower()
    return " ".join(name.split())

class ProductAggregator:
    def __init__(self):
        self.adapters = [
            AmazonLiveAdapter(),
            FlipkartLiveAdapter(),
            MyntraLiveAdapter(),
            AjioLiveAdapter()
        ]

    def search(self, query: str) -> list:
        """
        Calls all platform adapters concurrently, collects results, and normalizes them.
        Returns a deduplicated, unified list grouped by approximate product matching.
        """
        all_results = []
        
        with ThreadPoolExecutor(max_workers=len(self.adapters)) as executor:
            future_to_adapter = {
                executor.submit(adapter.search, query): adapter for adapter in self.adapters
            }
            
            for future in as_completed(future_to_adapter):
                adapter = future_to_adapter[future]
                try:
                    platform_results = future.result()
                    if platform_results:
                        all_results.extend(platform_results)
                except Exception as e:
                    print(f"Error fetching from {adapter.platform_name}: {e}")

        unified_products = {}
        
        for item in all_results:
            norm_name = normalize_name(item["name"])
            matched_key = None
            
            # Buyhatke-style Advanced Matching
            best_ratio = 0.0
            for existing_key in unified_products.keys():
                ratio = difflib.SequenceMatcher(None, norm_name, existing_key).ratio()
                # 65% similarity is usually good enough for identifying the same product model
                if ratio > 0.65 and ratio > best_ratio:
                    best_ratio = ratio
                    matched_key = existing_key
                    
            if not matched_key:
                matched_key = norm_name

            if matched_key not in unified_products:
                unified_products[matched_key] = {
                    "product_id": item["product_id"],
                    "name": item["name"],
                    "brand": item["brand"],
                    "category": item["category"],
                    "description": item["description"],
                    "image_url": item["image_url"],
                    "specifications": item["specifications"],
                    "listings": [],
                    "coupons": []
                }
                
            discount = item.get("discount", 0)
            availability = item.get("availability", "In Stock")
            
            # True Buyhatke Coupons: generate dedicated coupon objects if discount > 0
            if discount > 30 and not any(c["code"] == f"SMART{discount}" for c in unified_products[matched_key]["coupons"]):
                unified_products[matched_key]["coupons"].append({
                    "code": f"SMART{discount}",
                    "description": f"Get {discount}% OFF instantly on checkout.",
                    "discount_percentage": discount
                })
            elif discount > 15 and not any(c["code"] == "EXTRA10" for c in unified_products[matched_key]["coupons"]):
                unified_products[matched_key]["coupons"].append({
                    "code": "EXTRA10",
                    "description": "Apply coupon for an additional 10% off.",
                    "discount_percentage": 10
                })
            
            unified_products[matched_key]["listings"].append({
                "id": item["id"],
                "platform": item["platform"],
                "seller": item["seller"],
                "price": item["price"],
                "original_price": item["original_price"],
                "discount": discount,
                "rating": item["rating"],
                "review_count": item["review_count"],
                "availability": availability,
                "product_url": item["product_url"]
            })

        final_results = list(unified_products.values())
        
        # Fire and forget caching
        threading.Thread(target=self._cache_results, args=(final_results,), daemon=True).start()

        return final_results

    def _cache_results(self, unified_list):
        """
        Asynchronously stores newly scraped products to MySQL to serve as cache for future queries.
        """
        try:
            with engine.begin() as conn:
                for prod in unified_list:
                    # Check if product exists by ID
                    check_prod = conn.execute(text("SELECT id FROM products WHERE id = :id"), {"id": prod["product_id"]}).fetchone()
                    
                    if not check_prod:
                        # Insert new product
                        conn.execute(text("""
                            INSERT INTO products (id, name, brand, category, description, image_url) 
                            VALUES (:id, :name, :brand, :category, :description, :image_url)
                        """), {
                            "id": prod["product_id"],
                            "name": prod["name"],
                            "brand": prod["brand"],
                            "category": prod["category"],
                            "description": prod["description"],
                            "image_url": prod["image_url"]
                        })
                    
                    for listing in prod["listings"]:
                        # Check if listing exists by product_url to prevent duplicate scrapes
                        check_list = conn.execute(text("SELECT id FROM product_listings WHERE product_url = :url"), {"url": listing["product_url"]}).fetchone()
                        
                        if not check_list:
                            # Insert new listing
                            conn.execute(text("""
                                INSERT INTO product_listings (product_id, platform, seller, price, original_price, rating, review_count, availability, product_url)
                                VALUES (:product_id, :platform, :seller, :price, :original_price, :rating, :review_count, :availability, :product_url)
                            """), {
                                "product_id": prod["product_id"],
                                "platform": listing["platform"],
                                "seller": listing["seller"],
                                "price": listing["price"],
                                "original_price": listing["original_price"],
                                "rating": listing["rating"],
                                "review_count": listing["review_count"],
                                "availability": listing["availability"],
                                "product_url": listing["product_url"]
                            })
                        else:
                            # Update existing listing price/availability
                            conn.execute(text("""
                                UPDATE product_listings 
                                SET price = :price, original_price = :original_price, availability = :availability, rating = :rating, review_count = :review_count
                                WHERE product_url = :product_url
                            """), {
                                "price": listing["price"],
                                "original_price": listing["original_price"],
                                "availability": listing["availability"],
                                "rating": listing["rating"],
                                "review_count": listing["review_count"],
                                "product_url": listing["product_url"]
                            })
                            
                    # Buyhatke-style Price History Tracking
                    for listing in prod["listings"]:
                        listing_row = conn.execute(text("SELECT id FROM product_listings WHERE product_url = :url"), {"url": listing["product_url"]}).fetchone()
                        if listing_row:
                            conn.execute(text("""
                                INSERT INTO price_history (listing_id, price) 
                                VALUES (:listing_id, :price)
                            """), {
                                "listing_id": listing_row[0],
                                "price": listing["price"]
                            })
                            
            print("Successfully cached search results to DB.")
        except Exception as e:
            print(f"Error caching results to DB: {e}")
