import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Camera, ArrowRight, Shield, Zap, Target, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Store in sessionStorage and navigate to detection
      const reader = new FileReader();
      reader.onload = (ev) => {
        sessionStorage.setItem("detection-image", ev.target?.result as string);
        navigate("/detection");
      };
      reader.readAsDataURL(file);
    },
    [navigate]
  );

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
          >
            <Eye className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-primary">Powered by YOLO AI</span>
          </motion.div>

          {/* Title */}
          <h1 className="font-mono text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Real-time Object{" "}
            <span className="text-primary glow-text">Detection System</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Experience cutting-edge AI technology that identifies and tracks objects in
            images and video streams with exceptional accuracy and speed.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleUpload}
              size="lg"
              className="gap-3 rounded-lg bg-primary px-8 py-6 font-mono text-base text-primary-foreground hover:bg-primary/90 glow-border"
            >
              <Upload className="h-5 w-5" />
              Upload Image
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate("/detection?webcam=true")}
              size="lg"
              variant="outline"
              className="gap-3 rounded-lg border-border bg-card px-8 py-6 font-mono text-base text-foreground hover:border-primary hover:bg-primary/10"
            >
              <Camera className="h-5 w-5" />
              Start Webcam Detection
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Real-time Processing",
              desc: "Lightning-fast inference with YOLOv8 for instant object detection results.",
            },
            {
              icon: Target,
              title: "High Accuracy",
              desc: "State-of-the-art detection with confidence scoring across 80+ object classes.",
            },
            {
              icon: Shield,
              title: "Privacy First",
              desc: "All processing happens securely. Your images and video feeds stay private.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="rounded-xl border border-border bg-card p-6 glow-border"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
