/**
 * Backend API service for communicating with the self-hosted
 * Python real-time object detection server.
 *
 * Set VITE_BACKEND_URL in your environment or it defaults to
 * http://localhost:5000
 */

const BASE_URL =
  (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:5000";

/* ─── helpers ─────────────────────────────────────────── */

async function api<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend ${res.status}: ${text}`);
  }
  return res.json();
}

/* ─── real-time endpoints ─────────────────────────────── */

export interface StartResponse {
  success: boolean;
  session_id: string;
  device: string;
  timestamp: string;
}

export async function startDetection(cameraId = 0): Promise<StartResponse> {
  return api("/api/realtime/start", {
    method: "POST",
    body: JSON.stringify({ camera_id: cameraId }),
  });
}

export interface DetectResponse {
  success: boolean;
  frame_id: string;
  timestamp: string;
  processing_time_ms: number;
  fps: number;
  detections: {
    class: string;
    confidence: number;
    bbox: [number, number, number, number]; // x1,y1,x2,y2
    color: string;
  }[];
  annotated_frame: string; // base64 jpeg
  total_objects: number;
}

export async function detectFrame(
  confidence = 0.5,
  iou = 0.45
): Promise<DetectResponse> {
  return api("/api/realtime/detect", {
    method: "POST",
    body: JSON.stringify({ confidence, iou }),
  });
}

export async function stopDetection(): Promise<{ success: boolean }> {
  return api("/api/realtime/stop", { method: "POST", body: JSON.stringify({}) });
}

export interface StatusResponse {
  is_running: boolean;
  session_id: string | null;
  device: string;
  total_detections: number;
  uptime_seconds: number;
}

export async function getStatus(): Promise<StatusResponse> {
  return api("/api/realtime/status");
}

export function getStreamUrl(): string {
  return `${BASE_URL}/api/realtime/stream`;
}

/* ─── history / stats endpoints ───────────────────────── */

export interface HistoryDetection {
  id: number;
  frame_id: string;
  timestamp: string;
  total_objects: number;
  detected_classes: string;
  confidence_scores: string;
  bounding_boxes: string;
  processing_time_ms: number;
  device: string;
}

export async function getRecentDetections(
  limit = 50
): Promise<{ detections: HistoryDetection[] }> {
  return api(`/api/detections/recent?limit=${limit}`);
}

export async function getSessionDetections(
  sessionId: string
): Promise<{ detections: HistoryDetection[] }> {
  return api(`/api/detections/session/${sessionId}`);
}

export interface StatsResponse {
  total_detections: number;
  total_sessions: number;
  class_distribution: Record<string, number>;
  avg_confidence: number;
  avg_processing_time: number;
  recent_sessions: {
    session_id: string;
    start_time: string;
    end_time: string | null;
    total_frames: number;
  }[];
}

export async function getStats(): Promise<StatsResponse> {
  return api("/api/detections/stats");
}

export function getBackendUrl(): string {
  return BASE_URL;
}
