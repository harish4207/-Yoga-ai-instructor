import pytest
import numpy as np
import cv2
from app.pose.analyzer import (
    calculate_angle_2d,
    check_visibility,
    evaluate_warrior_ii,
    draw_annotated_skeleton,
    MIN_VISIBILITY_THRESHOLD,
)


def make_mock_landmarks(visibility=0.95):
    """Creates a 33-landmark list for a geometric Warrior II."""
    lm = [{"x": 0.5, "y": 0.5, "z": 0.0, "visibility": visibility, "presence": visibility} for _ in range(33)]

    # Shoulders
    lm[11] = {"x": 0.44, "y": 0.32, "z": 0.0, "visibility": visibility}
    lm[12] = {"x": 0.56, "y": 0.32, "z": 0.0, "visibility": visibility}

    # Left arm (straight 180°)
    lm[13] = {"x": 0.32, "y": 0.32, "z": 0.0, "visibility": visibility}
    lm[15] = {"x": 0.20, "y": 0.32, "z": 0.0, "visibility": visibility}

    # Right arm (straight 180°)
    lm[14] = {"x": 0.68, "y": 0.32, "z": 0.0, "visibility": visibility}
    lm[16] = {"x": 0.80, "y": 0.32, "z": 0.0, "visibility": visibility}

    # Hips
    lm[23] = {"x": 0.46, "y": 0.52, "z": 0.0, "visibility": visibility}
    lm[24] = {"x": 0.54, "y": 0.52, "z": 0.0, "visibility": visibility}

    # Front left leg (90° bend)
    lm[25] = {"x": 0.34, "y": 0.52, "z": 0.0, "visibility": visibility}
    lm[27] = {"x": 0.34, "y": 0.82, "z": 0.0, "visibility": visibility}

    # Rear right leg (straight ~175°)
    lm[26] = {"x": 0.65, "y": 0.66, "z": 0.0, "visibility": visibility}
    lm[28] = {"x": 0.76, "y": 0.80, "z": 0.0, "visibility": visibility}

    return lm


def test_calculate_angle_2d():
    a = {"x": 0.0, "y": 1.0}
    b = {"x": 0.0, "y": 0.0}
    c = {"x": 1.0, "y": 0.0}
    assert calculate_angle_2d(a, b, c) == pytest.approx(90.0, abs=0.1)

    a_collinear = {"x": -1.0, "y": 0.0}
    c_collinear = {"x": 1.0, "y": 0.0}
    assert calculate_angle_2d(a_collinear, b, c_collinear) == pytest.approx(180.0, abs=0.1)


def test_visibility_check_pass_and_fail():
    landmarks = make_mock_landmarks(visibility=0.9)
    res_pass = check_visibility(landmarks)
    assert res_pass["passed"] is True
    assert res_pass["visible_fraction"] == 1.0

    low_vis_landmarks = make_mock_landmarks(visibility=0.2)
    res_fail = check_visibility(low_vis_landmarks)
    assert res_fail["passed"] is False
    assert "Unable to confidently evaluate" in res_fail["message"]


def test_evaluate_warrior_ii_scoring():
    landmarks = make_mock_landmarks(visibility=0.95)
    eval_res = evaluate_warrior_ii(landmarks)

    assert eval_res["session_ready"] is True
    assert eval_res["score"] >= 90
    assert len(eval_res["rule_results"]) == 5
    assert len(eval_res["strengths"]) > 0


def test_draw_annotated_skeleton_opencv():
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    landmarks = make_mock_landmarks(visibility=0.95)
    eval_res = evaluate_warrior_ii(landmarks)

    annotated = draw_annotated_skeleton(img, landmarks, eval_res)
    assert annotated.shape == (480, 640, 3)
    # Check that pixels were modified (skeleton drawn)
    assert np.any(annotated > 0)
