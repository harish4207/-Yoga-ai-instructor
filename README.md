# AI Yoga Coach

> A web-based AI yoga coaching application using on-device computer vision, multilingual feedback, and transparent rule-based posture evaluation.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Live CV | MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) |
| Photo CV | MediaPipe Tasks Vision IMAGE mode (browser-first) |
| Backend API | Node.js + Express |
| Database | MongoDB Atlas M0 (free tier) |
| Python CV Service | Flask + MediaPipe Python + OpenCV (Phase 3+) |
| TTS | Bhashini → Web Speech API fallback |
| Frontend hosting | Vercel (free hobby plan) |
| Backend hosting | Render (free tier) |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB Atlas account (free M0 cluster)

### Frontend
```bash
cd frontend
cp .env.example .env  # fill in VITE_API_URL
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env  # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

### CV Service (Phase 3+)
```bash
cd cv-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
flask --app wsgi:application run --port 5001
```

## Architecture

See [`implementation_plan.md`](https://github.com/your-repo/ai-yoga-coach) for the full Phase 0 architecture document.

## Phase Status

| Phase | Status | Description |
|---|---|---|
| 0 | ✅ Complete | Architecture + verification |
| 1 | ✅ Complete | Project foundation + skeleton |
| 2 | 🔲 Next | Live webcam coaching (Warrior II) |
| 3 | 🔲 Pending | Photo analysis report card |
| 4 | 🔲 Pending | Native-language feedback (Bhashini) |
| 5 | 🔲 Pending | All five asanas |
| 6 | 🔲 Pending | Full live coaching UX |
| 7 | 🔲 Pending | Progress tracking |
| 8 | 🔲 Future | Surya Namaskar flow |
| 9 | 🔲 Future | Advanced AI |

## Important Notes

- Camera feed never leaves your device during live coaching (on-device inference)
- This is not a medical application
- Alignment ranges are teaching guidelines, not clinical standards
- Score percentages represent alignment relative to target ranges, not perfection
