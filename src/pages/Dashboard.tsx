import { motion } from "motion/react";
import { TrendingUp, Video, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function Dashboard() {
  const [recentAudits, setRecentAudits] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/audits")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentAudits(data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const stats = [
    { label: "Total Posts", value: "124", icon: Video, color: "text-blue-600" },
    { label: "Avg Engagement", value: "4.2%", icon: TrendingUp, color: "text-green-600" },
    { label: "AI Suggestions", value: "12", icon: Zap, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Welcome Back</h1>
        <p className="text-stone-500 mt-1">Here is what's happening with your socials today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
            <h2 className="text-3xl font-bold text-stone-900">{stat.value}</h2>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentAudits.length > 0 ? (
            recentAudits.map((audit) => (
              <div key={audit.id} className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">
                    {audit.videos_data ? "AI TikTok Audit" : "LinkedIn Workflow Execution"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {new Date(audit.created_at).toLocaleString()}
                  </p>
                </div>
                <button className="text-xs font-semibold text-amber-700 hover:underline">View Report</button>
              </div>
            ))
          ) : (
            <p className="text-stone-500 text-sm italic">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
