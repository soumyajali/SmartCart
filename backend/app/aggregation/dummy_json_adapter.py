import requests
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
                    
                    # This is a catalog fallback, not a simulated retailer.
                    # Keep the image and product URL from the same source item.
                    price = round(base_price)
                    results.append({
                        "id": f"CATALOG-{item['id']}",
                        "product_id": str(item["id"]),
                        "name": item["title"],
                        "brand": item.get("brand", "Generic"),
                        "category": item["category"],
                        "description": item["description"],
                        "image_url": item.get("thumbnail") or item.get("images", [""])[0],
                        "specifications": {},
                        "platform": "Product catalog",
                        "seller": "Product catalog",
                        "price": price,
                        "original_price": price,
                        "discount": 0,
                        "rating": float(item.get("rating") or 0),
                        "review_count": 0,
                        "availability": "View product",
                        "product_url": f"https://dummyjson.com/products/{item['id']}",
                    })
        except Exception as e:
            print(f"DummyJson failed: {e}")
        return results
