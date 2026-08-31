"""
analyze.py — /analyze route for Flask CV service.
Accepts image upload, executes MediaPipe pose analysis in IMAGE mode,
and returns structured report card data and OpenCV annotated image.
"""
import base64
from flask import Blueprint, request, jsonify
from app.pose.analyzer import process_image_bytes

analyze_bp = Blueprint("analyze", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    """
    POST /analyze
    Accepts:
      - multipart/form-data with file field 'image' (or 'photo')
      - OR application/json with base64 string in 'image' field
      - optional 'asanaId' / 'asana_id' field (defaults to 'virabhadrasanaII')
    """
    asana_id = request.form.get("asanaId") or request.form.get("asana_id") or "virabhadrasanaII"
    image_bytes = None

    # 1. Handle multipart/form-data upload
    if "image" in request.files or "photo" in request.files:
        file = request.files.get("image") or request.files.get("photo")
        if file.filename == "":
            return jsonify({"error": "No selected file", "message": "Please select an image file to upload."}), 400

        if not allowed_file(file.filename):
            return jsonify({
                "error": "Unsupported file type",
                "message": f"Supported formats are: {', '.join(sorted(ALLOWED_EXTENSIONS)).upper()}."
            }), 400

        image_bytes = file.read()

    # 2. Handle JSON base64 payload
    elif request.is_json:
        data = request.get_json() or {}
        asana_id = data.get("asanaId") or data.get("asana_id") or asana_id
        b64_image = data.get("image")

        if not b64_image:
            return jsonify({"error": "Missing image", "message": "No image provided in request body."}), 400

        # Strip data URI prefix if present (e.g. data:image/png;base64,...)
        if "," in b64_image:
            b64_image = b64_image.split(",", 1)[1]

        try:
            image_bytes = base64.b64decode(b64_image)
        except Exception as e:
            return jsonify({"error": "Invalid base64", "message": "Could not decode base64 image data."}), 400

    else:
        return jsonify({
            "error": "Bad request",
            "message": "Please provide an image via multipart form upload ('image') or JSON base64 ('image')."
        }), 400

    # 3. Validate byte content & size
    if not image_bytes or len(image_bytes) == 0:
        return jsonify({"error": "Empty file", "message": "The uploaded image file is empty."}), 400

    if len(image_bytes) > MAX_CONTENT_LENGTH:
        return jsonify({
            "error": "File too large",
            "message": "Image exceeds maximum allowed size of 10 MB."
        }), 400

    # 4. Process image through MediaPipe & OpenCV pipeline
    try:
        result = process_image_bytes(image_bytes, asana_id=asana_id)
        return jsonify(result), 200
    except ValueError as val_err:
        return jsonify({"error": "Unprocessable image", "message": str(val_err)}), 422
    except Exception as exc:
        return jsonify({
            "error": "Analysis failure",
            "message": f"An unexpected error occurred during pose analysis: {str(exc)}"
        }), 500
