/**
 * poseLandmarker.js
 * MediaPipe Tasks Vision Pose Landmarker service for browser runtime.
 *
 * Uses official @mediapipe/tasks-vision package.
 */
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance = null;
let currentMode = null;
let initPromise = null;

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Initialize or get singleton PoseLandmarker instance
 * @param {'IMAGE' | 'VIDEO'} mode
 */
export async function getPoseLandmarker(mode = 'VIDEO') {
  if (poseLandmarkerInstance) {
    if (currentMode !== mode) {
      await poseLandmarkerInstance.setOptions({ runningMode: mode });
      currentMode = mode;
    }
    return poseLandmarkerInstance;
  }

  if (initPromise) {
    const instance = await initPromise;
    if (currentMode !== mode) {
      await instance.setOptions({ runningMode: mode });
      currentMode = mode;
    }
    return instance;
  }

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: mode,
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    poseLandmarkerInstance = landmarker;
    currentMode = mode;
    return landmarker;
  })();

  return initPromise;
}

/**
 * Process a single video/webcam frame
 * @param {HTMLVideoElement} videoElement
 * @param {number} timestampMs
 */
export function detectVideoFrame(videoElement, timestampMs) {
  if (!poseLandmarkerInstance || currentMode !== 'VIDEO') {
    throw new Error('PoseLandmarker is not initialized in VIDEO mode.');
  }
  return poseLandmarkerInstance.detectForVideo(videoElement, timestampMs);
}

/**
 * Process a static image element
 * @param {HTMLImageElement | HTMLCanvasElement} imageElement
 */
export function detectImage(imageElement) {
  if (!poseLandmarkerInstance || currentMode !== 'IMAGE') {
    throw new Error('PoseLandmarker is not initialized in IMAGE mode.');
  }
  return poseLandmarkerInstance.detect(imageElement);
}
