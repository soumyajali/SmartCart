import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import create_engine
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)

# MySQL Setup
db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASSWORD", "")
db_host = os.getenv("DB_HOST", "localhost")
db_name = os.getenv("DB_NAME", "smartcart")
mysql_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"

try:
    engine = create_engine(mysql_uri)
    engine.connect()
    print("MySQL Connected successfully!")
except Exception as e:
    print(f"Error connecting to MySQL: {e}")

# MongoDB Setup
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
try:
    mongo_client = MongoClient(mongo_uri)
    mongo_db = mongo_client["smartcart"]
    print("MongoDB Connected successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")


from app.routes.product_routes import product_bp
from app.routes.admin_routes import admin_bp
from app.routes.chatbot_routes import chatbot_bp

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

app.register_blueprint(product_bp, url_prefix='/api/products')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
