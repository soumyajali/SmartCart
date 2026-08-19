# SmartCart — AI-Powered E-Commerce Aggregator

Online shopping has become one of the fastest-growing digital services. Millions of users purchase products daily through platforms like Amazon, Flipkart, and Myntra. However, customers often face problems such as fake reviews, misleading ratings, price differences, and difficulty comparing products across multiple websites. 

SmartCart is an advanced e-commerce aggregator platform designed to solve these problems by combining product comparison, fake review detection, AI recommendations, and smart analytics into a single system.

## ❗ Problem Statement

Customers face several challenges while shopping online:
*   Fake and spam product reviews
*   Different prices across websites
*   Difficulty comparing products
*   Misleading ratings and offers
*   Time-consuming product search
*   Lack of trustworthy recommendations

These issues reduce customer trust and create confusion during online shopping.

## 🎯 Objectives

The main objectives of SmartCart are:
*   To aggregate products from multiple e-commerce websites
*   To compare prices, ratings, and specifications
*   To detect fake reviews using Artificial Intelligence
*   To recommend trusted products intelligently
*   To analyze customer sentiments
*   To provide real-time price tracking
*   To improve user shopping experience

## 🚀 Key Features / Proposed Solution

*   **Unified comparison platform:** Search once, view listings and prices from across the web.
*   **AI fake review detection:** Integrated NLP Microservice that classifies reviews as Genuine or Fake.
*   **Smart recommendation system:** Smart sorting that highlights the absolute best "SmartCart Choice" balancing price, genuine rating, and trust.
*   **Sentiment analysis:** NLP-driven breakdown of positive, neutral, and negative review distributions.
*   **Real-time price tracking:** Interactive charts plotting historical price fluctuations.
*   **Fraud seller detection:** Identifies and flags suspicious sellers based on aggregate fake review metrics.
*   **Voice Search & AI Chatbot:** Hands-free voice searching and conversational AI shopping assistant.

## 📦 Modules of the System

1.  **User Module**: Allows users to search and compare products.
2.  **Product Aggregation Module**: Collects product data from multiple websites concurrently.
3.  **Fake Review Detection Module**: Analyzes reviews using Machine Learning (Logistic Regression).
4.  **Recommendation Module**: Suggests trusted products and identifies the "SmartCart Choice".
5.  **Sentiment Analysis Module**: Analyzes customer opinions via NLP polarity scoring.
6.  **Price Tracking Module**: Tracks product prices over time and visualizes historical trends.

## ⚙️ Working of the System

**Step-by-Step Working:**
1. User searches for a product.
2. SmartCart collects products from multiple websites.
3. Reviews are analyzed using AI.
4. Fake reviews are filtered.
5. Sentiment analysis is performed.
6. Products are ranked using trust score.
7. Recommendation engine suggests best products.
8. Final comparison dashboard is displayed.

## 🎨 Prototype & Dashboard Design

**Prototype Includes:**
*   Home Page
*   Search Bar
*   Product Cards
*   Price Comparison Section
*   Fake Review Detection
*   Dashboard Analytics
*   Trust Score Display
*   Chatbot Interface

**Dashboard Displays:**
*   Product comparison charts
*   Sentiment analysis graphs
*   Price tracking history
*   Review statistics

---

## 🏗 Architecture

SmartCart utilizes a modern 3-Tier Microservices Architecture:

1.  **Frontend:** React (Vite) + Recharts + CSS Modules
2.  **Backend API:** Python Flask + SQLAlchemy + PyMongo
3.  **ML Microservice:** Python Flask + Scikit-Learn (Logistic Regression, TF-IDF) + TextBlob
4.  **Databases:** 
    *   **MySQL:** Relational data (Products, Listings, Price History)
    *   **MongoDB:** Unstructured/Document data (Reviews, ML Predictions)

---

## 🛠 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   MySQL Server
*   MongoDB Server

### 1. Database Setup
Ensure MySQL is running on `localhost:3306` with an empty database named `smartcart`.
Ensure MongoDB is running on `localhost:27017`.

### 2. Backend API
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt # (Flask, SQLAlchemy, PyMySQL, PyMongo, requests, pytest)
playwright install chromium
python app.py
```
*(Runs on `http://127.0.0.1:5000`)*

Search results are fetched from the configured retailer adapters (Amazon, Flipkart,
Myntra, and Ajio). Retailers may block automated requests; in that case SmartCart
returns only cached records and does not show demo products by default. To enable
cached records for development, set `SMARTCART_USE_CACHE=true`. To enable demo
records for UI development only, set `SMARTCART_USE_MOCK_DATA=true` before
starting the backend.

### Live retailer listings

For reliable live listings and retailer product links, set `SERPAPI_KEY` in
`backend/.env`. SmartCart then uses SerpApi's Google Shopping endpoint for India,
which returns current products offered by real merchants. Create a key at
https://serpapi.com/manage-api-key, add `SERPAPI_KEY=your_key`, and restart the
backend. The direct Amazon, Flipkart, Myntra, and AJIO adapters continue to run
as fallbacks, but those sites can block automated browser requests.

### 3. ML Microservice
```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install scikit-learn textblob flask flask-cors pandas
python app.py
```
*(Runs on `http://127.0.0.1:5001`)*

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🧪 Testing
The backend is fully tested using `pytest`.
```bash
cd backend
source venv/bin/activate
pytest tests/
```

## 📜 License
This project is developed as a showcase implementation of Advanced Agentic Coding paradigms.
