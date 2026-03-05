import { RefObject } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Scan } from "lucide-react";
import type { Detection } from "@/pages/Index";

interface DetectionCanvasProps {
  image: string | null;
  isWebcamActive: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  detections: Detection[];
  isProcessing: boolean;
}

const DetectionCanvas = ({
  image,
  isWebcamActive,
  videoRef,
  detections,
  isProcessing,
}: DetectionCanvasProps) => {
  const showPlaceholder = !image && !isWebcamActive;

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card glow-border">
      {/* Scan line effect */}
      {isProcessing && (
        <div className="pointer-events-none absolute inset-0 z-20 scan-line" />
      )}

      <div className="relative aspect-video w-full">
        {showPlaceholder && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="rounded-full bg-secondary p-6">
              <ImageIcon className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="font-mono text-sm font-medium">No Input Source</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Upload an image or start webcam detection
              </p>
            </div>
          </div>
        )}

        {image && (
          <img
            src={image}
            alt="Uploaded for detection"
            className="h-full w-full object-contain"
          />
        )}

        {isWebcamActive && (
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Bounding boxes overlay */}
        {detections.map((det) => (
          <motion.div
            key={det.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: det.id * 0.1 }}
            className="absolute border-2"
            style={{
              left: `${(det.x / 700) * 100}%`,
              top: `${(det.y / 400) * 100}%`,
              width: `${(det.width / 700) * 100}%`,
              height: `${(det.height / 400) * 100}%`,
              borderColor: det.color,
              boxShadow: `0 0 8px ${det.color}40`,
            }}
          >
            <span
              className="absolute -top-5 left-0 whitespace-nowrap rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold"
              style={{
                backgroundColor: det.color,
                color: "hsl(220, 20%, 6%)",
              }}
            >
              {det.name} {(det.confidence * 100).toFixed(0)}%
            </span>
          </motion.div>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-card px-6 py-3 glow-border">
              <Scan className="h-5 w-5 animate-spin text-primary" />
              <span className="font-mono text-sm text-primary">Analyzing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionCanvas;
