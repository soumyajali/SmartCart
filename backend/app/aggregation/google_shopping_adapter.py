"""Live product search through SerpApi's Google Shopping endpoint.

Google Shopping results include the merchant name, current price, image, and a
link to the retailer's product page.  This provides a supported alternative to
scraping retailers that block automated browser traffic.
"""

import hashlib
import os
import requests

from app.aggregation.base_adapter import BasePlatformAdapter


class GoogleShoppingAdapter(BasePlatformAdapter):
    """Fetch real retailer listings from Google Shopping via SerpApi."""

    endpoint = "https://serpapi.com/search.json"

    def __init__(self):
        super().__init__("Google Shopping")
        self.api_key = os.getenv("SERPAPI_KEY")

    def search(self, query: str) -> list:
        if not self.api_key or not query:
            return []

        params = {
            "engine": "google_shopping",
            "q": query,
            "google_domain": "google.co.in",
            "gl": "in",
            "hl": "en",
            "api_key": self.api_key,
        }

        try:
            response = requests.get(self.endpoint, params=params, timeout=12)
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException as error:
            print(f"[{self.platform_name}] Live search failed: {error}")
            return []

        if payload.get("error"):
            print(f"[{self.platform_name}] Live search failed: {payload['error']}")
            return []

        return [
            product
            for item in payload.get("shopping_results", [])[:20]
            if (product := self._normalize_product(item, query)) is not None
        ]

    def _normalize_product(self, item: dict, query: str) -> dict | None:
        price = item.get("extracted_price")
        if price is None:
            return None

        product_url = item.get("link") or item.get("product_link")
        if not product_url:
            return None

        original_price = item.get("extracted_old_price") or price
        product_id = item.get("product_id") or hashlib.sha256(product_url.encode()).hexdigest()[:24]
        listing_id = hashlib.sha256(f"{self.platform_name}:{product_url}".encode()).hexdigest()[:24]
        merchant = item.get("source") or "Retailer"
        title = item.get("title") or query

        try:
            price = float(price)
            original_price = float(original_price)
        except (TypeError, ValueError):
            return None

        review_count = item.get("reviews") or 0
        if isinstance(review_count, str):
            review_count = review_count.replace(",", "")

        return {
            "id": listing_id,
            "product_id": product_id,
            "name": title,
            "brand": item.get("brand") or "Unknown",
            "category": query,
            "description": title,
            "image_url": item.get("thumbnail") or "",
            "specifications": {},
            "platform": merchant,
            "seller": merchant,
            "price": price,
            "original_price": original_price,
            "discount": round((original_price - price) * 100 / original_price) if original_price > price else 0,
            "rating": float(item.get("rating") or 0),
            "review_count": int(review_count) if str(review_count).isdigit() else 0,
            "availability": item.get("delivery") or "Check retailer site",
            "product_url": product_url,
        }
