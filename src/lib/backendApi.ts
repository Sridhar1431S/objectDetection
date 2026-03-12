/**
 * Backend API service for communicating with the self-hosted
 * Python real-time object detection server.
 */

const BASE_URL =
  (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:5000";

async function api<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend ${res.status}: ${text}`);
  }

  return res.json();
}

/* ───────────────── realtime endpoints ───────────────── */

export interface StartResponse {
  success: boolean;
  session_id: string;
  device: string;
  timestamp: string;
}

export async function startDetection(): Promise<StartResponse> {
  return api("/api/realtime/start", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export interface RealtimeDetection {
  id: number;
  class: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
}

export interface DetectResponse {
  success: boolean;
  fps: number;
  processing_time_ms: number;
  annotated_frame: string | null;
  total_objects: number;
  detections: RealtimeDetection[];
}

export async function detectFrame(
  confidence = 0.5,
  iou = 0.45
): Promise<DetectResponse> {
  return api("/api/realtime/detect", {
    method: "POST",
    body: JSON.stringify({ confidence, iou })
  });
}

export async function stopDetection(): Promise<{ success: boolean }> {
  return api("/api/realtime/stop", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export interface StatusResponse {
  is_streaming: boolean;
  session_id: string | null;
  frame_count: number;
  elapsed_seconds: number;
  device: string;
}

export async function getStatus(): Promise<StatusResponse> {
  return api("/api/realtime/status");
}

export function getStreamUrl(): string {
  return `${BASE_URL}/api/realtime/stream`;
}

/* ───────────────── history endpoints ───────────────── */

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

/* ───────────────── stats endpoint ───────────────── */

export interface RecentSession {
  session_id: string;
  total_frames: number;
  start_time: string;
}

export interface StatsResponse {
  total_detections: number;
  total_sessions: number;
  avg_confidence: number;
  avg_processing_time: number;
  class_distribution: Record<string, number>;
  classes_detected: {
    class: string;
    count: number;
    avg_confidence: number;
  }[];
  session_stats: {
    count: number;
    detections: number;
    fps: number;
  };
  recent_sessions: RecentSession[];
}

export async function getStats(): Promise<StatsResponse> {
  return api("/api/detections/stats");
}

export function getBackendUrl(): string {
  return BASE_URL;
}
