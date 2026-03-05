import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Loader2 } from "lucide-react";
import type { Detection } from "@/pages/Index";

interface DetectionListProps {
  detections: Detection[];
  isProcessing: boolean;
}

const DetectionList = ({ detections, isProcessing }: DetectionListProps) => {
  return (
    <div className="rounded-lg border border-border bg-card glow-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Crosshair className="h-4 w-4 text-primary" />
        <h2 className="font-mono text-sm font-semibold text-foreground">
          Detections
        </h2>
        {detections.length > 0 && (
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
            {detections.length}
          </span>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto p-3">
        {isProcessing && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            <span className="font-mono text-xs">Processing...</span>
          </div>
        )}

        {!isProcessing && detections.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="font-mono text-xs">No detections yet</p>
          </div>
        )}

        <AnimatePresence>
          {detections.map((det, i) => (
            <motion.div
              key={det.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="mb-2 last:mb-0 rounded-md border border-border bg-secondary/50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: det.color, boxShadow: `0 0 6px ${det.color}` }}
                  />
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {det.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-primary">
                  {(det.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Confidence bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${det.confidence * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: det.color }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DetectionList;
