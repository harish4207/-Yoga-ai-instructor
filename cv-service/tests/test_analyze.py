import io
import base64
import pytest
import numpy as np
import cv2
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def create_test_image(width=400, height=400, color=(100, 150, 200)):
    """Generates an in-memory test JPEG image byte stream."""
    img = np.full((height, width, 3), color, dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", img)
    return io.BytesIO(buffer.tobytes())


def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "ai-yoga-coach-cv"


def test_missing_file(client):
    res = client.post("/analyze", data={})
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data


def test_empty_file(client):
    data = {"image": (io.BytesIO(b""), "empty.jpg")}
    res = client.post("/analyze", data=data, content_type="multipart/form-data")
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data


def test_invalid_file_extension(client):
    data = {"image": (io.BytesIO(b"dummy plain text"), "report.txt")}
    res = client.post("/analyze", data=data, content_type="multipart/form-data")
    assert res.status_code == 400
    data = res.get_json()
    assert data["error"] == "Unsupported file type"


def test_malformed_base64_json(client):
    res = client.post("/analyze", json={"image": "not_valid_base64$$$"})
    assert res.status_code in [400, 422]


def test_no_person_detected(client):
    img_io = create_test_image(300, 300, color=(50, 50, 50))
    data = {"image": (img_io, "blank.jpg"), "asanaId": "virabhadrasanaII"}
    res = client.post("/analyze", data=data, content_type="multipart/form-data")
    assert res.status_code == 200
    payload = res.get_json()
    assert payload["success"] is True
    assert payload["pose_detected"] is False
    assert payload["session_ready"] is False
    assert "No person detected" in payload["message"]


def test_base64_image_upload(client):
    img = np.full((300, 300, 3), (120, 120, 120), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", img)
    b64 = base64.b64encode(buffer.tobytes()).decode("utf-8")

    res = client.post("/analyze", json={"image": f"data:image/jpeg;base64,{b64}", "asanaId": "virabhadrasanaII"})
    assert res.status_code == 200
    payload = res.get_json()
    assert payload["success"] is True
