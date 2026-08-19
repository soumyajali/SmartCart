import os
import uuid
import re
from sqlalchemy import create_engine, text
from app.aggregation.base_adapter import BasePlatformAdapter
from playwright.sync_api import sync_playwright

db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASSWORD", "")
db_host = os.getenv("DB_HOST", "localhost")
db_name = os.getenv("DB_NAME", "smartcart")
mysql_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}?connect_timeout=2"
engine = create_engine(mysql_uri)

class AmazonLiveAdapter(BasePlatformAdapter):
    def __init__(self):
        super().__init__("Amazon")

    def search(self, query: str) -> list:
        print(f"[{self.platform_name}] Attempting to fetch live data for '{query}'...")
        live_results = self._scrape_amazon(query)
        if live_results and len(live_results) > 0:
            print(f"[{self.platform_name}] Successfully scraped {len(live_results)} items live.")
            return live_results
            
        if os.getenv("SMARTCART_USE_CACHE", "false").lower() == "true":
            print(f"[{self.platform_name}] Live scraping failed or blocked. Using cached listings.")
            return self._fallback_search(query)
        print(f"[{self.platform_name}] Live scraping failed or blocked. Returning no results.")
        return []

    def _scrape_amazon(self, query: str) -> list:
        results = []
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                    viewport={"width": 1920, "height": 1080}
                )
                page = context.new_page()
                url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
                page.goto(url, wait_until="domcontentloaded", timeout=4000)
                
                try:
                    page.wait_for_selector('div[data-component-type="s-search-result"]', timeout=2000)
                except:
                    browser.close()
                    return []
                
                items = page.locator('div[data-component-type="s-search-result"]').all()
                for item in items[:5]:
                    try:
                        title_loc = item.locator('h2 a span, h2 span.a-text-normal')
                        if title_loc.count() == 0: continue
                        name = title_loc.inner_text().strip()
                        
                        price_loc = item.locator('.a-price-whole')
                        price = 0.0
                        if price_loc.count() > 0:
                            p_text = price_loc.first.inner_text().replace(',', '').strip()
                            if p_text.isdigit(): price = float(p_text)
                            
                        if price == 0.0: continue
                        
                        orig_loc = item.locator('.a-text-price .a-offscreen')
                        original_price = price
                        if orig_loc.count() > 0:
                            o_text = orig_loc.first.inner_text().replace('₹', '').replace(',', '').strip()
                            o_text = re.sub(r'[^\d.]', '', o_text)
                            if o_text: original_price = float(o_text)
                            
                        img_loc = item.locator('.s-image')
                        image_url = img_loc.get_attribute('src') if img_loc.count() > 0 else ""
                        
                        link_loc = item.locator('h2 a')
                        product_url = "https://www.amazon.in" + link_loc.get_attribute('href') if link_loc.count() > 0 else url
                        
                        discount = 0
                        if original_price > price:
                            discount = round(((original_price - price) / original_price) * 100)

                        temp_id = str(uuid.uuid4())
                        
                        results.append({
                            "id": temp_id,
                            "product_id": temp_id, 
                            "name": name,
                            "brand": "Unknown", 
                            "category": query,
                            "description": name,
                            "image_url": image_url,
                            "price": price,
                            "original_price": original_price,
                            "discount": discount,
                            # Populate these only when the retailer exposes them;
                            # never manufacture ratings for a comparison result.
                            "rating": 0,
                            "review_count": 0,
                            "availability": "In Stock",
                            "seller": "Amazon Retail",
                            "platform": self.platform_name,
                            "product_url": product_url,
                            "specifications": {}
                        })
                    except Exception as e:
                        print(f"Error parsing Amazon item: {e}")
                        continue
                        
                browser.close()
        except Exception as e:
            print(f"Amazon scraping error: {e}")
            
        return results

    def _fallback_search(self, query: str) -> list:
        results = []
        with engine.connect() as conn:
            sql = text("""
                SELECT p.id as product_id, p.name, p.brand, p.category, p.description, p.image_url,
                       l.id as listing_id, l.seller, l.price, l.original_price, l.rating, l.review_count, 
                       l.availability, l.product_url
                FROM products p
                JOIN product_listings l ON p.id = l.product_id
                WHERE l.platform = :platform AND (p.name LIKE :q OR p.brand LIKE :q OR p.category LIKE :q)
            """)
            rows = conn.execute(sql, {"platform": self.platform_name, "q": f"%{query}%"}).fetchall()
            
            for row in rows:
                price = float(row.price) if row.price else 0.0
                original_price = float(row.original_price) if row.original_price else 0.0
                discount = 0
                if original_price > 0 and original_price > price:
                    discount = round(((original_price - price) / original_price) * 100)
                    
                results.append({
                    "id": row.listing_id,
                    "product_id": row.product_id,
                    "name": row.name,
                    "brand": row.brand,
                    "category": row.category,
                    "description": row.description,
                    "image_url": row.image_url,
                    "price": price,
                    "original_price": original_price,
                    "discount": discount,
                    "rating": float(row.rating) if row.rating else 0.0,
                    "review_count": row.review_count,
                    "availability": row.availability,
                    "seller": row.seller,
                    "platform": self.platform_name,
                    "product_url": row.product_url,
                    "specifications": {}
                })
        return results
