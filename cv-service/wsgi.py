"""wsgi.py — Gunicorn entry point for production deployment on Render."""
from app import create_app

application = create_app()

if __name__ == "__main__":
    application.run(debug=False)
