import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Zap, Target, Box, Eye } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DetectionCanvas from "@/components/DetectionCanvas";
import DetectionList from "@/components/DetectionList";
import StatusBar from "@/components/StatusBar";
import RealtimePanel from "@/components/RealtimePanel";
import type { Detection } from "@/types/detection";

const DetectionPage = () => {
  const [searchParams] = useSearchParams();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectImage = useCallback(async (imageDataUrl: string, retries = 0) => {
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
      toast({ title: "Invalid Image", description: "Please upload a valid image file.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    if (retries === 0) setDetections([]);

    const img = new Image();
    img.onload = () => setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = imageDataUrl;

    try {
      const { data, error } = await supabase.functions.invoke('detect-image', {
        body: { image: imageDataUrl },
      });
      if (error) throw error;
      if (data?.loading && retries < 3) {
        toast({ title: "Model Loading", description: "AI model is warming up, retrying..." });
        await new Promise(r => setTimeout(r, 5000));
        return detectImage(imageDataUrl, retries + 1);
      }
      if (data?.detections) {
        setDetections(data.detections);
        toast({ title: "Detection Complete", description: `Found ${data.detections.length} object(s)` });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Detection failed:", err);
      toast({ title: "Detection Failed", description: err.message || "Could not process the image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    const storedImage = sessionStorage.getItem("detection-image");
    if (storedImage) {
      sessionStorage.removeItem("detection-image");
      setUploadedImage(storedImage);
      detectImage(storedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setUploadedImage(dataUrl);
      detectImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [detectImage]);

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <main className="mx-auto max-w-7xl p-6">
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="realtime" className="font-mono text-xs">Real-time (Backend)</TabsTrigger>
            <TabsTrigger value="image" className="font-mono text-xs">Image Upload</TabsTrigger>
          </TabsList>

          {/* ─── Real-time backend tab ─── */}
          <TabsContent value="realtime">
            <RealtimePanel />
          </TabsContent>

          {/* ─── Image upload tab ─── */}
          <TabsContent value="image" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Button onClick={handleUpload} variant="outline" className="gap-2 border-border bg-card font-mono text-sm text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary">
                  <Upload className="h-4 w-4" /> Upload Image
                </Button>
              </div>
              <StatusBar isWebcamActive={false} detectionCount={detections.length} isProcessing={isProcessing} />
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
                <DetectionCanvas image={uploadedImage} isWebcamActive={false} videoRef={{ current: null }} detections={detections} isProcessing={isProcessing} imageSize={imageSize} />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <DetectionList detections={detections} isProcessing={isProcessing} />
              </motion.div>
            </div>

            <AnimatePresence>
              {detections.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { icon: Target, label: "Objects Detected", value: detections.length },
                    { icon: Zap, label: "Avg Confidence", value: `${(detections.reduce((a, d) => a + d.confidence, 0) / detections.length * 100).toFixed(1)}%` },
                    { icon: Box, label: "Unique Classes", value: new Set(detections.map((d) => d.name)).size },
                    { icon: Eye, label: "Model", value: "Gemini Flash" },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-4 glow-border">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DetectionPage;
