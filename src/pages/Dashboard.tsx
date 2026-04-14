import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Upload, BarChart3, HelpCircle, Loader2, AudioLines } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { speechApi } from "@/lib/api";

interface DashboardData {
  totalAnalysis: number;
  averageAgentScore: number;
  topQuestionsCount: number;
  totalAudios: number;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    speechApi
      .getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Analyses", value: data?.totalAnalysis ?? "—", icon: BarChart3, gradient: "from-primary to-accent" },
    { label: "Total Audios", value: data?.totalAudios ?? "—", icon: AudioLines, gradient: "from-accent to-info" },
    { label: "Avg. Agent Score", value: data?.averageAgentScore ?? "—", icon: Activity, gradient: "from-success to-accent" },
    { label: "Top Questions", value: data?.topQuestionsCount ?? "—", icon: HelpCircle, gradient: "from-warning to-destructive" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, <span className="text-gradient">{user?.username}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your analytics overview</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="stat-card group relative overflow-hidden rounded-2xl border border-border/50 p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} mb-4`}>
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 p-10 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative z-10">
          <Upload className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Start Your First Analysis</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload an audio conversation to get AI-powered insights including sentiment analysis, transcript, and agent performance metrics.
          </p>
          <Link to="/upload">
            <button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5">
              <Upload className="w-4 h-4" /> Upload Audio
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
