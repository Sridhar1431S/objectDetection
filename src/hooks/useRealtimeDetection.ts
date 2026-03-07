import { useState, useRef, useCallback } from "react";
import {
  startDetection,
  detectFrame,
  stopDetection,
  type DetectResponse,
  type StartResponse,
} from "@/lib/backendApi";
import { toast } from "@/hooks/use-toast";

export interface RealtimeState {
  isRunning: boolean;
  sessionId: string | null;
  device: string | null;
  fps: number;
  processingTime: number;
  annotatedFrame: string | null;
  detections: DetectResponse["detections"];
  totalObjects: number;
}

export function useRealtimeDetection() {
  const [state, setState] = useState<RealtimeState>({
    isRunning: false,
    sessionId: null,
    device: null,
    fps: 0,
    processingTime: 0,
    annotatedFrame: null,
    detections: [],
    totalObjects: 0,
  });

  const loopRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const start = useCallback(async (confidence = 0.5) => {
    try {
      const res: StartResponse = await startDetection();
      setState((s) => ({
        ...s,
        isRunning: true,
        sessionId: res.session_id,
        device: res.device,
      }));
      runningRef.current = true;

      // detection loop
      const loop = async () => {
        if (!runningRef.current) return;
        try {
          const det = await detectFrame(confidence);
          setState((s) => ({
            ...s,
            fps: det.fps,
            processingTime: det.processing_time_ms,
            annotatedFrame: det.annotated_frame
              ? `data:image/jpeg;base64,${det.annotated_frame}`
              : s.annotatedFrame,
            detections: det.detections,
            totalObjects: det.total_objects,
          }));
        } catch {
          // silent – frame may have been skipped
        }
        if (runningRef.current) {
          loopRef.current = window.setTimeout(loop, 33); // ~30 FPS
        }
      };
      loop();

      toast({ title: "Detection Started", description: `Session ${res.session_id} on ${res.device}` });
    } catch (err: any) {
      toast({ title: "Start Failed", description: err.message, variant: "destructive" });
    }
  }, []);

  const stop = useCallback(async () => {
    runningRef.current = false;
    if (loopRef.current) clearTimeout(loopRef.current);
    try {
      await stopDetection();
    } catch {
      // ignore
    }
    setState((s) => ({ ...s, isRunning: false }));
    toast({ title: "Detection Stopped" });
  }, []);

  return { ...state, start, stop };
}
