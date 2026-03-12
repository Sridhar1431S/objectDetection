import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getRecentDetections, type HistoryDetection } from "@/lib/backendApi";

const POLL_INTERVAL = 3000; // 3 seconds

const History = () => {
  const [rows, setRows] = useState<HistoryDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await getRecentDetections(100);
      setRows(res.detections ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    intervalRef.current = window.setInterval(() => load(true), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <main className="mx-auto max-w-7xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-bold text-foreground">Detection History</h1>
              <p className="text-sm text-muted-foreground">
                Live-updating detection log from the database
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[10px] text-primary">AUTO-REFRESH</span>
            </span>
            <Button onClick={() => load()} variant="outline" size="sm" className="gap-2 font-mono text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="font-mono text-sm">{error}</p>
          </div>
        )}

        {!loading && rows.length === 0 && !error && (
          <div className="py-20 text-center text-muted-foreground">
            <Clock className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-mono text-sm">No detections yet. Run a real-time session first.</p>
          </div>
        )}

        {rows.length > 0 && (
          <div className="rounded-lg border border-border bg-card glow-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Timestamp</TableHead>
                  <TableHead className="font-mono text-xs">Frame ID</TableHead>
                  <TableHead className="font-mono text-xs">Objects</TableHead>
                  <TableHead className="font-mono text-xs">Classes</TableHead>
                  <TableHead className="font-mono text-xs">Processing</TableHead>
                  <TableHead className="font-mono text-xs">Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(r.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.frame_id?.slice(0, 12)}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {r.total_objects}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-xs">
                      {r.detected_classes}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.processing_time_ms?.toFixed(1)}ms
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.device}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
