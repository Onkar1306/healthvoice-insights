import { motion } from "framer-motion";
import { Activity, Upload, BarChart3, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Analyses", value: "—", icon: BarChart3, color: "text-primary" },
  { label: "Audio Uploads", value: "—", icon: Upload, color: "text-accent" },
  { label: "Avg. Agent Score", value: "—", icon: Activity, color: "text-success" },
  { label: "Top Questions", value: "—", icon: HelpCircle, color: "text-warning" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, <span className="text-gradient">{user?.username}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your analytics overview</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-8 text-center">
        <Upload className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Start Your First Analysis</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Upload an audio conversation to get AI-powered insights including sentiment analysis, transcript, and agent performance metrics.
        </p>
        <Link to="/upload">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" /> Upload Audio
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
