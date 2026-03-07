import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, AlertCircle, Cpu, Target, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getStats, type StatsResponse } from "@/lib/backendApi";

const Stats = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStats();
      setStats(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const chartData = stats
    ? Object.entries(stats.class_distribution).map(([name, count]) => ({ name, count }))
    : [];

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
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-bold text-foreground">Statistics</h1>
              <p className="text-sm text-muted-foreground">Detection analytics from the database</p>
            </div>
          </div>
          <Button onClick={load} variant="outline" size="sm" className="gap-2 font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </motion.div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="font-mono text-sm">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Target, label: "Total Detections", value: stats.total_detections },
                { icon: Activity, label: "Total Sessions", value: stats.total_sessions },
                { icon: Cpu, label: "Avg Confidence", value: `${(stats.avg_confidence * 100).toFixed(1)}%` },
                { icon: Clock, label: "Avg Processing", value: `${stats.avg_processing_time.toFixed(1)}ms` },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-lg border border-border bg-card p-4 glow-border"
                >
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <s.icon className="h-4 w-4 text-primary" />
                    <span className="font-mono text-xs">{s.label}</span>
                  </div>
                  <p className="font-mono text-xl font-bold text-foreground">{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Class distribution chart */}
            {chartData.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6 glow-border">
                <h3 className="mb-4 font-mono text-sm font-semibold text-foreground">
                  Class Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 20%)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(220 10% 50%)", fontSize: 11, fontFamily: "monospace" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(220 10% 50%)", fontSize: 11, fontFamily: "monospace" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220 18% 10%)",
                        border: "1px solid hsl(150 30% 18%)",
                        borderRadius: 8,
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(150, 100%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent sessions */}
            {stats.recent_sessions?.length > 0 && (
              <div className="mt-6 rounded-lg border border-border bg-card p-6 glow-border">
                <h3 className="mb-4 font-mono text-sm font-semibold text-foreground">
                  Recent Sessions
                </h3>
                <div className="space-y-2">
                  {stats.recent_sessions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border bg-secondary/50 px-4 py-2"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{s.session_id}</span>
                      <span className="font-mono text-xs text-foreground">{s.total_frames} frames</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(s.start_time).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Stats;
