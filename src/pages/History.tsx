import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const History = () => (
  <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Clock className="h-8 w-8 text-primary" />
      </div>
      <h2 className="font-mono text-2xl font-bold text-foreground">Detection History</h2>
      <p className="mt-2 text-muted-foreground">Your past detections will appear here.</p>
    </motion.div>
  </div>
);

export default History;
