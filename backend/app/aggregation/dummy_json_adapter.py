import requests
import random
from app.aggregation.base_adapter import BasePlatformAdapter

class DummyJsonAdapter(BasePlatformAdapter):
    def __init__(self):
        super().__init__("DummyJson")

    def search(self, query: str) -> list:
        url = f"https://dummyjson.com/products/search?q={query}"
        results = []
        try:
            response = requests.get(url, timeout=4)
            if response.status_code == 200:
                data = response.json()
                for item in data.get("products", []):
                    # Convert USD to INR
                    base_price = float(item["price"]) * 83
                    
                    # Generate random listings for the UI
                    platforms = ["Amazon", "Flipkart", "Myntra", "Ajio", "Reliance Digital"]
                    selected_platforms = random.sample(platforms, random.randint(2, 4))
                    
                    for platform in selected_platforms:
                        variation = random.uniform(0.9, 1.1)
                        price = round(base_price * variation)
                        original_price = round(price * random.uniform(1.1, 1.4))
                        
                        results.append({
                            "id": f"DUMMY-{item['id']}-{platform}",
                            "product_id": str(item["id"]),
                            "name": item["title"],
                            "brand": item.get("brand", "Generic"),
                            "category": item["category"],
                            "description": item["description"],
                            "image_url": item["thumbnail"],
                            "specifications": {},
                            "platform": platform,
                            "seller": f"{platform} Retail",
                            "price": price,
                            "original_price": original_price,
                            "discount": round(((original_price - price) / original_price) * 100) if original_price else 0,
                            "rating": round(item["rating"] - random.uniform(0, 0.5), 1),
                            "review_count": random.randint(50, 1500),
                            "availability": "In Stock",
                            "product_url": f"https://www.{platform.lower().replace(' ', '')}.com/search?q={query}"
                        })
        except Exception as e:
            print(f"DummyJson failed: {e}")
        return results
