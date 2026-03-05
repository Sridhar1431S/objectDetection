import { Wifi, WifiOff, Activity } from "lucide-react";

interface StatusBarProps {
  isWebcamActive: boolean;
  detectionCount: number;
  isProcessing: boolean;
}

const StatusBar = ({ isWebcamActive, detectionCount, isProcessing }: StatusBarProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5">
        {isWebcamActive ? (
          <Wifi className="h-3 w-3 text-primary" />
        ) : (
          <WifiOff className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="font-mono text-xs text-secondary-foreground">
          {isWebcamActive ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {(isProcessing || detectionCount > 0) && (
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5">
          <Activity className={`h-3 w-3 ${isProcessing ? "animate-pulse text-primary" : "text-primary"}`} />
          <span className="font-mono text-xs text-secondary-foreground">
            {isProcessing ? "DETECTING..." : `${detectionCount} OBJECTS`}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
