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
from app.aggregation.dummy_json_adapter import DummyJsonAdapter
from app.aggregation.google_shopping_adapter import GoogleShoppingAdapter

db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASSWORD", "")
db_host = os.getenv("DB_HOST", "localhost")
db_name = os.getenv("DB_NAME", "smartcart")
mysql_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}?connect_timeout=2"
engine = create_engine(mysql_uri)

def normalize_name(name):
    # Remove special characters, extra spaces, and lowercase for robust matching
    name = re.sub(r'[^a-zA-Z0-9\s]', '', name).lower()
    return " ".join(name.split())

class ProductAggregator:
    def __init__(self):
        self.adapters = [
            GoogleShoppingAdapter(),
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

        # Retailers can block automated lookups and Google Shopping requires a
        # configured API key. Keep search useful in that case with a catalog
        # source whose thumbnail and direct product page are from the same item.
        if not all_results:
            all_results = DummyJsonAdapter().search(query)

        # Demo records are opt-in. Production searches must never silently show fake products.
        if os.getenv("SMARTCART_USE_MOCK_DATA", "false").lower() == "true" and len(all_results) < 2:
            print("Live sources returned too few results. Injecting opt-in demo data.")
            all_results.extend([
                {
                    "id": "MOCK-AMZ-1",
                    "product_id": "PROD-IPHONE15",
                    "name": "Apple iPhone 15 (128 GB) - Black",
                    "brand": "Apple",
                    "category": "Smartphones",
                    "description": "Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera.",
                    "image_url": "https://m.media-amazon.com/images/I/71657TiFeHL._SX679_.jpg",
                    "specifications": {"RAM": "6GB", "Storage": "128GB"},
                    "platform": "Amazon",
                    "seller": "Appario Retail",
                    "price": 65999,
                    "original_price": 79900,
                    "discount": 17,
                    "rating": 4.6,
                    "review_count": 12450,
                    "availability": "In Stock",
                    "product_url": "https://amazon.in/iphone-15"
                },
                {
                    "id": "MOCK-FLIP-1",
                    "product_id": "PROD-IPHONE15",
                    "name": "Apple iPhone 15 (Black, 128 GB)",
                    "brand": "Apple",
                    "category": "Smartphones",
                    "description": "Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera.",
                    "image_url": "https://rukminim2.flixcart.com/image/850/1000/xif0q/mobile/h/d/9/-original-imagtc2qzpzcdfaq.jpeg",
                    "specifications": {"RAM": "6GB", "Storage": "128GB"},
                    "platform": "Flipkart",
                    "seller": "SuperComNet",
                    "price": 66499,
                    "original_price": 79900,
                    "discount": 16,
                    "rating": 4.7,
                    "review_count": 8900,
                    "availability": "In Stock",
                    "product_url": "https://flipkart.com/iphone-15"
                },
                {
                    "id": "MOCK-REL-1",
                    "product_id": "PROD-IPHONE15",
                    "name": "Apple iPhone 15 128GB Black",
                    "brand": "Apple",
                    "category": "Smartphones",
                    "description": "Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera.",
                    "image_url": "https://www.reliancedigital.in/medias/Apple-iPhone-15-493839308-i-1-1200Wx1200H",
                    "specifications": {"RAM": "6GB", "Storage": "128GB"},
                    "platform": "Reliance Digital",
                    "seller": "Reliance",
                    "price": 54999,
                    "original_price": 79900,
                    "discount": 31,
                    "rating": 4.5,
                    "review_count": 1200,
                    "availability": "Only 2 left in stock",
                    "product_url": "https://reliancedigital.in/iphone-15"
                }
            ])

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
            elif not unified_products[matched_key].get("image_url") and item.get("image_url"):
                # Preserve the first retailer-hosted product photo available for
                # this matched product instead of substituting a generic image.
                unified_products[matched_key]["image_url"] = item["image_url"]
                
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
                "product_url": item["product_url"],
                "image_url": item.get("image_url", ""),
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
