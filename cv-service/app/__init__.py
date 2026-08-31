"""
AI Yoga Coach — Flask CV Service
Provides server-side MediaPipe pose analysis and OpenCV annotation.
Phase 1: Health check scaffold only.
Phase 3: Full /analyze endpoint.
"""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Allow requests from the frontend
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    CORS(app, origins=allowed_origins)

    # Register blueprints
    from app.routes.analyze import analyze_bp
    app.register_blueprint(analyze_bp)

    @app.route("/health")
    def health():
        return {"status": "ok", "service": "ai-yoga-coach-cv"}, 200

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Not found"}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {"error": "Internal server error"}, 500

    return app
