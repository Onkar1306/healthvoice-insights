import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, X, AlertTriangle, Smile, Meh, Frown, MessageSquare, Target, Award } from "lucide-react";
import { speechApi } from "@/lib/api";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AnalysisResult {
  alerts: string[];
  sentiment: string;
  transcript: string;
  commonQuestions: string[];
  accuracy: number;
  agentScore: number;
}

function GaugeChart({ value, label, color }: { value: number; label: string; color: string }) {
  const data = [
    { value: value },
    { value: 100 - value },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={40} outerRadius={55} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground mt-2">{label}</span>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config: Record<string, { bg: string; text: string; icon: typeof Smile }> = {
    POSITIVE: { bg: "bg-success/15 border-success/30", text: "text-success", icon: Smile },
    NEUTRAL: { bg: "bg-warning/15 border-warning/30", text: "text-warning", icon: Meh },
    NEGATIVE: { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive", icon: Frown },
  };
  const c = config[sentiment.toUpperCase()] || config.NEUTRAL;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${c.bg} ${c.text}`}>
      <Icon className="w-4 h-4" /> {sentiment}
    </span>
  );
}

export default function UploadAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("audio/")) {
      toast.error("Please upload an audio file");
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await speechApi.transcribe(file);
      setResult(res.data);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Upload & Analyze</h1>
        <p className="text-muted-foreground mt-1">Upload an audio conversation for AI-powered analysis</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`glass-card border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
          <p className="text-foreground font-medium">
            {dragOver ? "Drop your audio file here" : "Drag & drop an audio file, or click to browse"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Supports MP3, WAV, M4A, and more</p>
        </div>

        {file && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileAudio className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setFile(null); setResult(null); }} className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="px-5 py-2 rounded-lg gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : "Analyze"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground font-medium">Analyzing your audio...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Alerts */}
            {result.alerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" /> Alerts
                </h3>
                {result.alerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 border-l-4 border-l-destructive flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{alert}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Sentiment + Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Sentiment</h3>
                <SentimentBadge sentiment={result.sentiment} />
              </div>
              <div className="glass-card p-6 flex flex-col items-center justify-center">
                <GaugeChart value={Math.round(result.accuracy)} label="Accuracy" color="hsl(210, 100%, 50%)" />
              </div>
              <div className="glass-card p-6 flex flex-col items-center justify-center">
                <GaugeChart value={Math.round(result.agentScore)} label="Agent Score" color="hsl(145, 65%, 42%)" />
              </div>
            </div>

            {/* Transcript */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" /> Transcript
              </h3>
              <div className="max-h-64 overflow-y-auto bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.transcript || "No transcript available."}</p>
              </div>
            </div>

            {/* Common Questions */}
            {result.commonQuestions.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-accent" /> Common Questions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.commonQuestions.map((q, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
