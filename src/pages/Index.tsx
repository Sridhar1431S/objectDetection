import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, CameraOff, Eye, Zap, Target, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import DetectionCanvas from "@/components/DetectionCanvas";
import DetectionList from "@/components/DetectionList";
import StatusBar from "@/components/StatusBar";

export interface Detection {
  id: number;
  name: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const MOCK_DETECTIONS: Detection[] = [
  { id: 1, name: "Person", confidence: 0.97, x: 50, y: 30, width: 180, height: 340, color: "hsl(150, 100%, 45%)" },
  { id: 2, name: "Car", confidence: 0.91, x: 300, y: 200, width: 220, height: 140, color: "hsl(45, 100%, 55%)" },
  { id: 3, name: "Dog", confidence: 0.85, x: 500, y: 280, width: 100, height: 90, color: "hsl(200, 100%, 55%)" },
  { id: 4, name: "Bicycle", confidence: 0.78, x: 180, y: 250, width: 120, height: 110, color: "hsl(340, 100%, 55%)" },
  { id: 5, name: "Traffic Light", confidence: 0.94, x: 420, y: 10, width: 40, height: 90, color: "hsl(0, 100%, 55%)" },
];

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setIsWebcamActive(false);
      setIsProcessing(true);
      // Simulate detection
      setTimeout(() => {
        setDetections(MOCK_DETECTIONS);
        setIsProcessing(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  }, []);

  const toggleWebcam = useCallback(async () => {
    if (isWebcamActive) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      setIsWebcamActive(false);
      setDetections([]);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUploadedImage(null);
      setIsWebcamActive(true);
      // Simulate continuous detection
      setTimeout(() => {
        setDetections(MOCK_DETECTIONS.slice(0, 3));
      }, 1000);
    } catch {
      console.error("Webcam access denied");
    }
  }, [isWebcamActive]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-border">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-tight text-foreground glow-text">
                Real-Time Object Detection
              </h1>
              <p className="font-mono text-xs text-muted-foreground">Powered by YOLO</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBar
              isWebcamActive={isWebcamActive}
              detectionCount={detections.length}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap gap-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={handleUpload}
            variant="outline"
            className="gap-2 border-border bg-card font-mono text-sm text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
          <Button
            onClick={toggleWebcam}
            variant="outline"
            className={`gap-2 font-mono text-sm ${
              isWebcamActive
                ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {isWebcamActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {isWebcamActive ? "Stop Webcam" : "Start Webcam Detection"}
          </Button>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Detection Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <DetectionCanvas
              image={uploadedImage}
              isWebcamActive={isWebcamActive}
              videoRef={videoRef}
              detections={detections}
              isProcessing={isProcessing}
            />
          </motion.div>

          {/* Detection Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DetectionList detections={detections} isProcessing={isProcessing} />
          </motion.div>
        </div>

        {/* Stats Bar */}
        <AnimatePresence>
          {detections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { icon: Target, label: "Objects Detected", value: detections.length },
                { icon: Zap, label: "Avg Confidence", value: `${(detections.reduce((a, d) => a + d.confidence, 0) / detections.length * 100).toFixed(1)}%` },
                { icon: Box, label: "Unique Classes", value: new Set(detections.map((d) => d.name)).size },
                { icon: Eye, label: "Model", value: "YOLOv8" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4 glow-border"
                >
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="font-mono text-xs">{stat.label}</span>
                  </div>
                  <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
