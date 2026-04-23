import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speechApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  History as HistoryIcon,
  FileAudio,
  Calendar,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  MessageSquare,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface HistoryItem {
  id: number;
  transcript: string;
  sentiment: string;
  agentScore: number;
  accuracy: number;
  commonQuestions: string;
  alerts: string;
  fileName: string;
  createdAt: string;
}

const parseList = (s: string): string[] => {
  if (!s) return [];
  const trimmed = s.trim().replace(/^\[|\]$/g, "");
  if (!trimmed) return [];
  return trimmed.split(",").map((x) => x.trim()).filter(Boolean);
};

const sentimentConfig: Record<string, { bg: string; text: string; icon: typeof Smile }> = {
  POSITIVE: { bg: "bg-success/15 border-success/30", text: "text-success", icon: Smile },
  NEUTRAL: { bg: "bg-warning/15 border-warning/30", text: "text-warning", icon: Meh },
  NEGATIVE: { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive", icon: Frown },
};

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const c = sentimentConfig[sentiment.toUpperCase()] || sentimentConfig.NEUTRAL;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" /> {sentiment}
    </span>
  );
}

function GaugeChart({ value, label, color }: { value: number; label: string; color: string }) {
  const data = [{ value }, { value: 100 - value }];
  return (
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={34} outerRadius={48} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await speechApi.getHistory();
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setItems(sorted);
      } catch (err: any) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary" />
          Analysis History
        </h1>
        <p className="text-muted-foreground mt-1">
          All your previous audio analyses in one place
        </p>
      </motion.div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileAudio className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-foreground font-medium">No history yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload an audio file to start analyzing
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelected(item)}
                className="w-full glass-card p-4 text-left hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <FileAudio className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground truncate">
                        #{item.id} · {item.fileName}
                      </p>
                      <SentimentBadge sentiment={item.sentiment} />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" /> Agent {item.agentScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Accuracy {item.accuracy}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-primary" />
                  Analysis #{selected.id}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3 flex-wrap">
                  <span>{selected.fileName}</span>
                  <span>·</span>
                  <span>{formatDate(selected.createdAt)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Metrics row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="glass-card p-4 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground mb-2">Sentiment</span>
                    <SentimentBadge sentiment={selected.sentiment} />
                  </div>
                  <div className="glass-card p-4 flex items-center justify-center">
                    <GaugeChart value={selected.accuracy} label="Accuracy" color="hsl(210, 100%, 50%)" />
                  </div>
                  <div className="glass-card p-4 flex items-center justify-center">
                    <GaugeChart value={selected.agentScore} label="Agent Score" color="hsl(145, 65%, 42%)" />
                  </div>
                </div>

                {/* Alerts */}
                {parseList(selected.alerts).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" /> Alerts
                    </h3>
                    <div className="space-y-2">
                      {parseList(selected.alerts).map((a, i) => (
                        <div key={i} className="glass-card p-3 border-l-4 border-l-destructive text-sm text-foreground">
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Questions */}
                {parseList(selected.commonQuestions).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-accent" /> Common Questions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parseList(selected.commonQuestions).map((q, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Transcript
                  </h3>
                  <div className="max-h-64 overflow-y-auto bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {selected.transcript || "No transcript available."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
