import { motion } from "framer-motion";
import { Info } from "lucide-react";

const About = () => (
  <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Info className="h-8 w-8 text-primary" />
      </div>
      <h2 className="font-mono text-2xl font-bold text-foreground">About AI Detect</h2>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        AI Detect leverages state-of-the-art YOLO (You Only Look Once) deep learning models
        for real-time object detection. Upload images or use your webcam to instantly identify
        and classify objects with high accuracy.
      </p>
    </motion.div>
  </div>
);

export default About;
