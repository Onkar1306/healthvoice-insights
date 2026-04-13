import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, TrendingUp, Loader2 } from "lucide-react";
import { speechApi } from "@/lib/api";
import { toast } from "sonner";

export default function TopQuestions() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    speechApi.getTopQuestions()
      .then((res) => setQuestions(res.data))
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to load questions");
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Top Questions</h1>
        <p className="text-muted-foreground mt-1">Most frequently asked questions from customer conversations</p>
      </motion.div>

      {loading ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      ) : questions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload and analyze audio conversations to discover the most common questions asked by customers.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-3"
        >
          {questions.map((q, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
              className="glass-card p-5 flex items-start gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium">{q}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
