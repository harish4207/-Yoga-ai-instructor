"""
analyzer.py — Python implementation of pose analysis and OpenCV annotation for 8-Asana MVP.
Supports:
1. Tadasana (Mountain Pose)
2. Vrikshasana (Tree Pose)
3. Trikonasana (Triangle Pose)
4. Virabhadrasana II (Warrior II)
5. Bhujangasana (Cobra Pose)
6. Adho Mukha Svanasana (Downward-Facing Dog)
7. Setu Bandhasana (Bridge Pose)
8. Dandasana (Staff Pose)
"""
import math
import base64
import cv2
import numpy as np
import mediapipe as mp

# MediaPipe Pose connections
POSE_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),
    (11, 12), (11, 23), (12, 24), (23, 24),
    (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    (23, 25), (25, 27), (27, 29), (27, 31), (29, 31),
    (24, 26), (26, 28), (28, 30), (28, 32), (30, 32),
]

BODY_PART_NAMES = {
    0: "nose", 1: "left eye", 2: "left eye", 3: "left eye",
    4: "right eye", 5: "right eye", 6: "right eye",
    11: "left shoulder", 12: "right shoulder",
    13: "left elbow", 14: "right elbow",
    15: "left wrist", 16: "right wrist",
    23: "left hip", 24: "right hip",
    25: "left knee", 26: "right knee",
    27: "left ankle", 28: "right ankle",
}

REQUIRED_LANDMARKS_DEFAULT = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
MIN_VISIBILITY_THRESHOLD = 0.55

# Human-readable correction templates (English & Telugu)
CORRECTION_MESSAGES = {
    "lower_shoulders": "Relax your shoulders slightly.",
    "relax_shoulders": "Keep your shoulders down.",
    "raise_arms": "Raise your arms.",
    "extend_arms": "Extend your arms.",
    "extend_left_arm": "Extend your left arm.",
    "extend_right_arm": "Extend your right arm.",
    "bend_front_knee": "Bend your front knee a little more.",
    "align_front_knee": "Align your front knee over your ankle.",
    "straighten_knees": "Straighten your knees.",
    "straighten_back_leg": "Keep your back leg straight.",
    "lift_bent_knee": "Turn your bent knee outward.",
    "keep_torso_upright": "Keep your spine upright.",
    "lengthen_spine": "Lengthen your spine.",
    "lift_chest": "Lift your chest.",
    "soften_elbows": "Keep a soft bend in your elbows.",
    "lift_hips_higher": "Lift your hips higher.",
    "press_hips_back": "Press your hips back and up.",
    "align_hips_shoulders": "Align your hips with your shoulders.",
    "ground_feet": "Press your feet into the ground.",
    "move_back": "Step back to fit in frame.",
    "move_forward": "Step closer to the camera.",
    "move_left": "Step slightly to your left.",
    "move_right": "Step slightly to your right.",
    "hold_position": "Hold this position.",
    "good_job": "Good job. Keep holding.",
    "excellent": "Excellent alignment.",
    "try_again": "Breathe and try again.",
    "keep_breathing": "Keep breathing evenly.",
}

# 8 Asana Rule Sets
ASANA_RULES_MAP = {
    "tadasana": [
        {"rule_id": "left_knee_straight", "description": "Left knee extended (165–180°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 165, "target_max": 180, "weight": 0.25, "severity": "important", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "right_knee_straight", "description": "Right knee extended (165–180°)", "landmark_a": 24, "landmark_b": 26, "landmark_c": 28, "target_min": 165, "target_max": 180, "weight": 0.25, "severity": "important", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "torso_vertical_left", "description": "Left torso vertical (165–180°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 165, "target_max": 180, "weight": 0.25, "severity": "critical", "corrections": {"too_low": "keep_torso_upright", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "torso_vertical_right", "description": "Right torso vertical (165–180°)", "landmark_a": 12, "landmark_b": 24, "landmark_c": 26, "target_min": 165, "target_max": 180, "weight": 0.25, "severity": "critical", "corrections": {"too_low": "keep_torso_upright", "too_high": "good_job", "on_target": "good_job"}},
    ],
    "vrikshasana": [
        {"rule_id": "standing_leg_straight", "description": "Standing leg straight (165–180°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 165, "target_max": 180, "weight": 0.35, "severity": "critical", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "bent_knee_flexion", "description": "Bent leg acute flexion (35–85°)", "landmark_a": 24, "landmark_b": 26, "landmark_c": 28, "target_min": 35, "target_max": 85, "weight": 0.30, "severity": "important", "corrections": {"too_low": "lift_bent_knee", "too_high": "lift_bent_knee", "on_target": "good_job"}},
        {"rule_id": "torso_upright", "description": "Torso upright (165–180°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 165, "target_max": 180, "weight": 0.20, "severity": "important", "corrections": {"too_low": "keep_torso_upright", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "shoulders_level", "description": "Shoulders relaxed (140–180°)", "landmark_a": 13, "landmark_b": 11, "landmark_c": 12, "target_min": 140, "target_max": 180, "weight": 0.15, "severity": "mild", "corrections": {"too_low": "relax_shoulders", "too_high": "good_job", "on_target": "good_job"}},
    ],
    "trikonasana": [
        {"rule_id": "front_knee_straight", "description": "Front knee straight (165–180°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 165, "target_max": 180, "weight": 0.30, "severity": "critical", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "rear_leg_straight", "description": "Rear leg straight (165–180°)", "landmark_a": 24, "landmark_b": 26, "landmark_c": 28, "target_min": 165, "target_max": 180, "weight": 0.25, "severity": "important", "corrections": {"too_low": "straighten_back_leg", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "arms_vertical_line", "description": "Arms vertical line (160–180°)", "landmark_a": 12, "landmark_b": 14, "landmark_c": 16, "target_min": 160, "target_max": 180, "weight": 0.25, "severity": "important", "corrections": {"too_low": "extend_arms", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "lateral_torso_extension", "description": "Lateral torso extension (40–75°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 40, "target_max": 75, "weight": 0.20, "severity": "important", "corrections": {"too_low": "lengthen_spine", "too_high": "lengthen_spine", "on_target": "good_job"}},
    ],
    "virabhadrasanaII": [
        {"rule_id": "front_knee_angle", "description": "Front knee bend (80–100°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 80, "target_max": 100, "weight": 0.30, "severity": "critical", "corrections": {"too_low": "align_front_knee", "too_high": "bend_front_knee", "on_target": "good_job"}},
        {"rule_id": "left_arm_alignment", "description": "Left arm extended (160–180°)", "landmark_a": 11, "landmark_b": 13, "landmark_c": 15, "target_min": 160, "target_max": 180, "weight": 0.15, "severity": "important", "corrections": {"too_low": "extend_left_arm", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "right_arm_alignment", "description": "Right arm extended (160–180°)", "landmark_a": 12, "landmark_b": 14, "landmark_c": 16, "target_min": 160, "target_max": 180, "weight": 0.15, "severity": "important", "corrections": {"too_low": "extend_right_arm", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "torso_upright", "description": "Torso upright (80–100°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 80, "target_max": 100, "weight": 0.20, "severity": "important", "corrections": {"too_low": "keep_torso_upright", "too_high": "keep_torso_upright", "on_target": "good_job"}},
        {"rule_id": "rear_leg_straight", "description": "Rear leg straight (160–180°)", "landmark_a": 24, "landmark_b": 26, "landmark_c": 28, "target_min": 160, "target_max": 180, "weight": 0.20, "severity": "important", "corrections": {"too_low": "straighten_back_leg", "too_high": "good_job", "on_target": "good_job"}},
    ],
    "bhujangasana": [
        {"rule_id": "chest_lift_extension", "description": "Chest lifted spinal curve (135–165°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 135, "target_max": 165, "weight": 0.40, "severity": "critical", "corrections": {"too_low": "lift_chest", "too_high": "lift_chest", "on_target": "good_job"}},
        {"rule_id": "elbow_soft_flexion", "description": "Elbows softly bent (110–150°)", "landmark_a": 11, "landmark_b": 13, "landmark_c": 15, "target_min": 110, "target_max": 150, "weight": 0.30, "severity": "important", "corrections": {"too_low": "soften_elbows", "too_high": "soften_elbows", "on_target": "good_job"}},
        {"rule_id": "legs_extended_grounded", "description": "Legs extended on mat (165–180°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 165, "target_max": 180, "weight": 0.30, "severity": "important", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
    ],
    "adhoMukhaSvanasana": [
        {"rule_id": "hip_inversion_peak", "description": "Inverted V hip apex (65–95°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 65, "target_max": 95, "weight": 0.40, "severity": "critical", "corrections": {"too_low": "press_hips_back", "too_high": "press_hips_back", "on_target": "good_job"}},
        {"rule_id": "arms_spine_line", "description": "Arms and spine line (160–180°)", "landmark_a": 15, "landmark_b": 11, "landmark_c": 23, "target_min": 160, "target_max": 180, "weight": 0.30, "severity": "important", "corrections": {"too_low": "lengthen_spine", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "legs_extended", "description": "Legs extended (155–180°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 155, "target_max": 180, "weight": 0.30, "severity": "important", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
    ],
    "setuBandhasana": [
        {"rule_id": "pelvic_lift_extension", "description": "Pelvic lift high (150–180°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 150, "target_max": 180, "weight": 0.50, "severity": "critical", "corrections": {"too_low": "lift_hips_higher", "too_high": "good_job", "on_target": "good_job"}},
        {"rule_id": "knee_ankle_stacking", "description": "Knees stacked over ankles (80–105°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 80, "target_max": 105, "weight": 0.50, "severity": "important", "corrections": {"too_low": "align_front_knee", "too_high": "align_front_knee", "on_target": "good_job"}},
    ],
    "dandasana": [
        {"rule_id": "torso_seated_upright", "description": "Seated 90° upright torso (85–100°)", "landmark_a": 11, "landmark_b": 23, "landmark_c": 25, "target_min": 85, "target_max": 100, "weight": 0.50, "severity": "critical", "corrections": {"too_low": "keep_torso_upright", "too_high": "keep_torso_upright", "on_target": "good_job"}},
        {"rule_id": "legs_extended_straight", "description": "Legs straight along mat (165–180°)", "landmark_a": 23, "landmark_b": 25, "landmark_c": 27, "target_min": 165, "target_max": 180, "weight": 0.50, "severity": "important", "corrections": {"too_low": "straighten_knees", "too_high": "good_job", "on_target": "good_job"}},
    ],
}


def score_rule_gradual(deviation):
    """
    Continuous forgiving score (0.0 to 1.0) matching frontend scoringEngine.js:
    - <= 3.0°: Normal human variation -> 1.0 (100%)
    - 3.0° to 8.0°: Gentle quadratic rolloff -> 0.90 to 1.00
    - 8.0° to 18.0°: Linear descent -> 0.55 to 0.90
    - > 18.0°: Steeper descent to 0
    """
    if deviation <= 3.0:
        return 1.0
    if deviation <= 8.0:
        t = (deviation - 3.0) / 5.0
        return 1.0 - 0.10 * (t ** 1.2)
    if deviation <= 18.0:
        t = (deviation - 8.0) / 10.0
        return 0.90 - 0.35 * t
    t = (deviation - 18.0) / 22.0
    return max(0.0, 0.55 - 0.55 * t)


def get_score_tier(score):
    if score is None:
        return {"label": "INCOMPLETE", "color": "#64748b"}
    if score >= 85:
        return {"label": "STRONG", "color": "#16a34a"}
    if score >= 70:
        return {"label": "GOOD", "color": "#2563eb"}
    if score >= 55:
        return {"label": "CLOSE", "color": "#ca8a04"}
    if score >= 40:
        return {"label": "NEEDS ATTENTION", "color": "#ea580c"}
    return {"label": "SIGNIFICANT DEVIATION", "color": "#dc2626"}


def calculate_angle_2d(a, b, c):
    """Calculates 2D planar angle at vertex B between points A, B, C in degrees (0 to 180)."""
    if a is None or b is None or c is None:
        return -1.0

    ba_x = a["x"] - b["x"]
    ba_y = a["y"] - b["y"]
    bc_x = c["x"] - b["x"]
    bc_y = c["y"] - b["y"]

    mag_ba = math.sqrt(ba_x * ba_x + ba_y * ba_y)
    mag_bc = math.sqrt(bc_x * bc_x + bc_y * bc_y)

    if mag_ba < 1e-7 or mag_bc < 1e-7:
        return -1.0

    dot = (ba_x * bc_x + ba_y * bc_y) / (mag_ba * mag_bc)
    dot = max(-1.0, min(1.0, dot))
    return math.degrees(math.acos(dot))


def check_visibility(landmarks, required_indices=None, threshold=MIN_VISIBILITY_THRESHOLD, min_fraction=0.75):
    if not landmarks or len(landmarks) < 33:
        return {
            "passed": False,
            "visible_fraction": 0.0,
            "missing_parts": ["body"],
            "message": "Unable to confidently evaluate this pose. Please ensure your full body is visible in the frame."
        }

    req = required_indices or REQUIRED_LANDMARKS_DEFAULT
    visible_count = 0
    missing_parts = set()

    for idx in req:
        vis = landmarks[idx].get("visibility", 1.0)
        if vis >= threshold:
            visible_count += 1
        else:
            part_name = BODY_PART_NAMES.get(idx, f"point {idx}")
            missing_parts.add(part_name)

    fraction = visible_count / len(req)
    passed = fraction >= min_fraction

    if passed:
        message = None
    else:
        parts_str = ", ".join(sorted(list(missing_parts))[:3])
        message = f"Unable to confidently evaluate this pose. Missing or obscured: {parts_str}. Please upload a photo where your full body is visible."

    return {
        "passed": passed,
        "visible_fraction": fraction,
        "missing_parts": list(missing_parts),
        "message": message,
    }


def evaluate_warrior_ii(landmarks):
    """Backwards-compatible wrapper for Virabhadrasana II evaluation."""
    return evaluate_asana(landmarks, "virabhadrasanaII")


def evaluate_asana(landmarks, asana_id="virabhadrasanaII"):
    """
    Evaluates landmarks against rules for the specified asana ID using forgiving continuous scoring.
    """
    rules = ASANA_RULES_MAP.get(asana_id, ASANA_RULES_MAP["virabhadrasanaII"])
    vis_check = check_visibility(landmarks)

    if not vis_check["passed"]:
        return {
            "score": None,
            "tier": get_score_tier(None),
            "session_ready": False,
            "rule_results": [],
            "strengths": [],
            "areas_to_improve": [],
            "top_correction": None,
            "visibility": vis_check,
        }

    weighted_sum = 0.0
    total_weight = 0.0
    rule_results = []
    strengths = []
    deviations = []
    areas_to_improve = []

    for rule in rules:
        idx_a = rule["landmark_a"]
        idx_b = rule["landmark_b"]
        idx_c = rule["landmark_c"]

        lm_a = landmarks[idx_a]
        lm_b = landmarks[idx_b]
        lm_c = landmarks[idx_c]

        vis_a = lm_a.get("visibility", 1.0) >= MIN_VISIBILITY_THRESHOLD
        vis_b = lm_b.get("visibility", 1.0) >= MIN_VISIBILITY_THRESHOLD
        vis_c = lm_c.get("visibility", 1.0) >= MIN_VISIBILITY_THRESHOLD

        if not (vis_a and vis_b and vis_c):
            rule_results.append({
                "rule_id": rule["rule_id"],
                "description": rule["description"],
                "angle": None,
                "rule_score": None,
                "direction": "low_visibility",
                "target_min": rule["target_min"],
                "target_max": rule["target_max"],
                "severity": rule["severity"],
                "weight": rule["weight"],
                "status": "low_visibility",
            })
            continue

        angle = calculate_angle_2d(lm_a, lm_b, lm_c)
        t_min = rule["target_min"]
        t_max = rule["target_max"]

        deviation = max(0.0, t_min - angle, angle - t_max)
        rule_score = score_rule_gradual(deviation)

        if angle < t_min:
            direction = "too_low"
        elif angle > t_max:
            direction = "too_high"
        else:
            direction = "on_target"

        weighted_sum += rule_score * rule["weight"]
        total_weight += rule["weight"]

        correction_key = rule["corrections"].get(direction, "")
        message = CORRECTION_MESSAGES.get(correction_key, "")

        item = {
            "rule_id": rule["rule_id"],
            "description": rule["description"],
            "angle": round(angle, 1),
            "rule_score": round(rule_score * 100),
            "direction": direction,
            "deviation_deg": round(deviation, 1),
            "target_min": t_min,
            "target_max": t_max,
            "severity": rule["severity"],
            "status": "pass" if direction == "on_target" or deviation <= 3.0 else "deviated",
            "correction_key": correction_key,
            "message": message,
        }
        rule_results.append(item)

        if direction == "on_target" or deviation <= 3.0:
            strengths.append(rule["rule_id"])
        else:
            sev_multiplier = 3 if rule["severity"] == "critical" else (2 if rule["severity"] == "important" else 1)
            priority = sev_multiplier * deviation
            deviations.append({
                **item,
                "priority": priority,
            })
            areas_to_improve.append(rule["description"].split(" (")[0])

    deviations.sort(key=lambda d: d["priority"], reverse=True)
    top_correction = deviations[0] if deviations else None

    total_score = round((weighted_sum / total_weight) * 100) if total_weight > 0 else 0
    tier = get_score_tier(total_score)

    return {
        "score": total_score,
        "tier": tier,
        "session_ready": True,
        "rule_results": rule_results,
        "strengths": strengths,
        "areas_to_improve": areas_to_improve,
        "top_correction": top_correction,
        "visibility": vis_check,
    }


def draw_annotated_skeleton(image_bgr, landmarks, evaluation):
    annotated = image_bgr.copy()
    h, w, _ = annotated.shape

    def to_pixel(lm):
        return int(lm["x"] * w), int(lm["y"] * h)

    # Determine deviations
    deviated_rules = {r["rule_id"]: r for r in evaluation.get("rule_results", []) if r.get("status") == "deviated"}

    for idx_a, idx_b in POSE_CONNECTIONS:
        if idx_a >= len(landmarks) or idx_b >= len(landmarks):
            continue
        lm_a = landmarks[idx_a]
        lm_b = landmarks[idx_b]

        vis_a = lm_a.get("visibility", 1.0) >= MIN_VISIBILITY_THRESHOLD
        vis_b = lm_b.get("visibility", 1.0) >= MIN_VISIBILITY_THRESHOLD

        if not (vis_a and vis_b):
            color = (128, 128, 128)
            thickness = 2
        else:
            color = (0, 230, 118)  # Bright Green for healthy alignment
            thickness = 3

        pt_a = to_pixel(lm_a)
        pt_b = to_pixel(lm_b)
        cv2.line(annotated, pt_a, pt_b, color, thickness, cv2.LINE_AA)

    for i, lm in enumerate(landmarks):
        pt = to_pixel(lm)
        vis = lm.get("visibility", 1.0)
        if vis >= MIN_VISIBILITY_THRESHOLD:
            radius = 6 if i in REQUIRED_LANDMARKS_DEFAULT else 4
            cv2.circle(annotated, pt, radius + 2, (255, 255, 255), -1, cv2.LINE_AA)
            cv2.circle(annotated, pt, radius, (0, 200, 83), -1, cv2.LINE_AA)
        else:
            cv2.circle(annotated, pt, 5, (0, 0, 255), -1, cv2.LINE_AA)

    return annotated


def process_image_bytes(image_bytes, asana_id="virabhadrasanaII"):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise ValueError("Invalid image content. Unable to decode image bytes.")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    mp_pose = mp.solutions.pose
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5
    ) as pose:
        results = pose.process(img_rgb)

    if not results.pose_landmarks:
        return {
            "success": True,
            "pose_detected": False,
            "session_ready": False,
            "message": "No person detected in the photograph. Please ensure your full body is visible in the frame.",
            "score": None,
            "tier": get_score_tier(None),
            "landmarks": [],
            "rule_results": [],
            "strengths": [],
            "areas_to_improve": [],
            "top_correction": None,
            "visibility": {"passed": False, "visible_fraction": 0.0, "missing_parts": ["person"], "message": "No person detected"},
            "annotated_image": None,
        }

    landmarks = []
    for lm in results.pose_landmarks.landmark:
        landmarks.append({
            "x": lm.x,
            "y": lm.y,
            "z": lm.z,
            "visibility": getattr(lm, "visibility", 1.0),
            "presence": getattr(lm, "presence", 1.0),
        })

    evaluation = evaluate_asana(landmarks, asana_id=asana_id)
    annotated_bgr = draw_annotated_skeleton(img_bgr, landmarks, evaluation)

    _, buffer = cv2.imencode(".jpg", annotated_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    b64_encoded = base64.b64encode(buffer).decode("utf-8")

    return {
        "success": True,
        "pose_detected": True,
        "session_ready": evaluation["session_ready"],
        "asana_id": asana_id,
        "asana_name": asana_id.capitalize(),
        "score": evaluation["score"],
        "tier": evaluation["tier"],
        "landmarks": landmarks,
        "rule_results": evaluation["rule_results"],
        "strengths": evaluation["strengths"],
        "areas_to_improve": evaluation["areas_to_improve"],
        "top_correction": evaluation["top_correction"],
        "visibility": evaluation["visibility"],
        "annotated_image": f"data:image/jpeg;base64,{b64_encoded}",
    }
