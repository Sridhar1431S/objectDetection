import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Square, Cpu, Gauge, Clock, Box, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeDetection } from "@/hooks/useRealtimeDetection";
import { getStreamUrl } from "@/lib/backendApi";

const RealtimePanel = () => {

  const rt = useRealtimeDetection();

  // default to MJPEG stream
  const [useStream, setUseStream] = useState(true);

  const handleStart = async () => {

    await rt.start();

    // automatically enable stream
    setUseStream(true);

  };

  return (
    <div className="space-y-6">

      {/* Controls */}

      <div className="flex flex-wrap items-center gap-4">

        {!rt.isRunning ? (

          <Button onClick={handleStart} className="gap-2 font-mono text-sm">

            <Play className="h-4 w-4" />

            Start Real-time Detection

          </Button>

        ) : (

          <Button
            onClick={rt.stop}
            variant="outline"
            className="gap-2 border-destructive bg-destructive/10 font-mono text-sm text-destructive hover:bg-destructive/20"
          >

            <Square className="h-4 w-4" />

            Stop Detection

          </Button>

        )}

        {rt.isRunning && (

          <>
            <div className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />

              </span>

              <span className="font-mono text-xs text-primary">LIVE</span>

            </div>

            <Button
              onClick={() => setUseStream((v) => !v)}
              variant="outline"
              size="sm"
              className="gap-2 font-mono text-xs"
            >

              <Video className="h-3.5 w-3.5" />

              {useStream ? "Switch to Frames" : "Switch to MJPEG Stream"}

            </Button>

          </>

        )}

      </div>

      {/* Stats */}

      {rt.isRunning && (

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >

          {[
            { icon: Gauge, label: "FPS", value: rt.fps.toFixed(1) },
            { icon: Clock, label: "Latency", value: `${rt.processingTime.toFixed(0)}ms` },
            { icon: Box, label: "Objects", value: rt.totalObjects },
            { icon: Cpu, label: "Device", value: rt.device ?? "—" },
          ].map((s, i) => (

            <div key={i} className="rounded-lg border border-border bg-card p-3 glow-border">

              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">

                <s.icon className="h-3.5 w-3.5 text-primary" />

                <span className="font-mono text-[10px] uppercase">{s.label}</span>

              </div>

              <p className="font-mono text-lg font-bold text-foreground">{s.value}</p>

            </div>

          ))}

        </motion.div>

      )}

      {/* Video Stream */}

      <div className="relative overflow-hidden rounded-lg border border-border bg-card glow-border">

        <div className="relative aspect-video w-full">

          {rt.isRunning ? (

            useStream ? (

              <img
                src={getStreamUrl()}
                alt="Live MJPEG Stream"
                className="h-full w-full object-contain"
              />

            ) : rt.annotatedFrame ? (

              <img
                src={rt.annotatedFrame}
                alt="Detection Frame"
                className="h-full w-full object-contain"
              />

            ) : (

              <div className="flex h-full items-center justify-center text-muted-foreground font-mono text-sm">

                Waiting for frames…

              </div>

            )

          ) : (

            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">

              <Play className="h-10 w-10 opacity-30" />

              <p className="font-mono text-sm">

                Press Start to begin real-time detection

              </p>

            </div>

          )}

        </div>

      </div>

      {/* Live Detections */}

      {rt.detections.length > 0 && (

        <div className="rounded-lg border border-border bg-card p-4 glow-border">

          <h3 className="mb-3 font-mono text-xs font-semibold uppercase text-muted-foreground">

            Live Detections

          </h3>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

            {rt.detections.map((d, i) => (

              <div
                key={i}
                className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2"
              >

                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: d.color,
                    boxShadow: `0 0 6px ${d.color}`
                  }}
                />

                <span className="font-mono text-sm font-semibold text-foreground">

                  {d.class}

                </span>

                <span className="ml-auto font-mono text-xs font-bold text-primary">

                  {(d.confidence * 100).toFixed(0)}%

                </span>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );

};

export default RealtimePanel;
