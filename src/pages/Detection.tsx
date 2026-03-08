import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, CameraOff, Zap, Target, Box, Eye } from "lucide-react";
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

const BACKEND_URL = "http://127.0.0.1:5000";

const DetectionPage = () => {

  const [searchParams] = useSearchParams();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectImage = useCallback(async (imageDataUrl: string, retries = 0) => {

    if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
      toast({
        title: "Invalid Image",
        description: "Please upload a valid image file.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    if (retries === 0) setDetections([]);

    const img = new Image();
    img.onload = () => setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    img.src = imageDataUrl;

    try {

      const { data, error } = await supabase.functions.invoke('detect-image', {
        body: { image: imageDataUrl },
      });

      if (error) throw error;

      if (data?.loading && retries < 3) {

        toast({
          title: "Model Loading",
          description: "AI model is warming up..."
        });

        await new Promise(r => setTimeout(r, 5000));

        return detectImage(imageDataUrl, retries + 1);
      }

      if (data?.detections) {

        setDetections(data.detections);

        toast({
          title: "Detection Complete",
          description: `Found ${data.detections.length} object(s)`
        });
      }

    } catch (err: any) {

      console.error(err);

      toast({
        title: "Detection Failed",
        description: err.message || "Could not process the image.",
        variant: "destructive"
      });

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

    if (searchParams.get("webcam") === "true") startBackendDetection();

  }, []);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {

      const dataUrl = ev.target?.result as string;

      setUploadedImage(dataUrl);

      setIsWebcamActive(false);

      detectImage(dataUrl);

    };

    reader.readAsDataURL(file);

  }, [detectImage]);

  const startBackendDetection = async () => {

    try {

      await fetch(`${BACKEND_URL}/api/realtime/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      setUploadedImage(null);
      setIsWebcamActive(true);

      toast({
        title: "Detection Started",
        description: "Backend webcam detection started"
      });

    } catch {

      toast({
        title: "Webcam Error",
        description: "Could not start backend webcam",
        variant: "destructive"
      });

    }

  };

  const stopBackendDetection = async () => {

    await fetch(`${BACKEND_URL}/api/realtime/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    setIsWebcamActive(false);

  };

  const toggleWebcam = useCallback(() => {

    if (isWebcamActive) {

      stopBackendDetection();

    } else {

      startBackendDetection();

    }

  }, [isWebcamActive]);

  return (

    <div className="min-h-[calc(100vh-73px)]">

      <main className="mx-auto max-w-7xl p-6">

        <Tabs defaultValue="image" className="space-y-6">

          <TabsList className="bg-secondary">

            <TabsTrigger value="image" className="font-mono text-xs">
              Image Upload
            </TabsTrigger>

            <TabsTrigger value="realtime" className="font-mono text-xs">
              Real-time Detection
            </TabsTrigger>

          </TabsList>

          {/* IMAGE DETECTION */}

          <TabsContent value="image" className="space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-4"
            >

              <div className="flex flex-wrap gap-4">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button onClick={handleUpload} variant="outline" className="gap-2">

                  <Upload className="h-4 w-4" />
                  Upload Image

                </Button>

              </div>

              <StatusBar
                isWebcamActive={false}
                detectionCount={detections.length}
                isProcessing={isProcessing}
              />

            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">

              <div className="lg:col-span-2">

                <DetectionCanvas
                  image={uploadedImage}
                  isWebcamActive={false}
                  detections={detections}
                  isProcessing={isProcessing}
                  imageSize={imageSize}
                />

              </div>

              <DetectionList
                detections={detections}
                isProcessing={isProcessing}
              />

            </div>

          </TabsContent>

          {/* REALTIME DETECTION */}

          <TabsContent value="realtime">

            <div className="space-y-6">

              <Button onClick={toggleWebcam} className="gap-2">

                {isWebcamActive ? <CameraOff /> : <Camera />}

                {isWebcamActive ? "Stop Detection" : "Start Detection"}

              </Button>

              {isWebcamActive && (

                <img
                  src={`${BACKEND_URL}/api/realtime/stream`}
                  style={{
                    width: "100%",
                    borderRadius: "12px"
                  }}
                />

              )}

            </div>

          </TabsContent>

        </Tabs>

      </main>

    </div>

  );

};

export default DetectionPage;
