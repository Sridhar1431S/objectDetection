import { motion } from "framer-motion";
import { ImageIcon, Scan } from "lucide-react";
import type { Detection } from "@/types/detection";

interface DetectionCanvasProps {
  image: string | null;
  isWebcamActive: boolean;
  detections: Detection[];
  isProcessing: boolean;
  imageSize?: { width: number; height: number } | null;
}

const DetectionCanvas = ({
  image,
  isWebcamActive,
  detections,
  isProcessing,
  imageSize,
}: DetectionCanvasProps) => {

  const containerW = 800;
  const containerH = 500;

  const scaleX = imageSize ? containerW / imageSize.width : 1;
  const scaleY = imageSize ? containerH / imageSize.height : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card glow-border"
      style={{ width: containerW, maxWidth: "100%", height: containerH }}
    >
      {image ? (
        <>
          <img
            src={image}
            alt="Detection target"
            className="h-full w-full object-contain"
          />

          {detections.map((d) => (
            <div
              key={d.id}
              className="absolute border-2 rounded"
              style={{
                left: d.x * scaleX,
                top: d.y * scaleY,
                width: d.width * scaleX,
                height: d.height * scaleY,
                borderColor: d.color,
              }}
            >
              <span
                className="absolute -top-5 left-0 rounded px-1 text-[10px] font-mono font-bold text-background"
                style={{ backgroundColor: d.color }}
              >
                {d.name} {(d.confidence * 100).toFixed(0)}%
              </span>
            </div>
          ))}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <Scan className="h-10 w-10 animate-pulse text-primary" />
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <ImageIcon className="h-12 w-12" />
          <p className="font-mono text-sm">Upload an image to detect objects</p>
        </div>
      )}
    </motion.div>
  );
};

export default DetectionCanvas;
