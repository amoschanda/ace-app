import { useState } from "react";
import { Linkedin, Send, BrainCircuit, Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function LinkedInWorkflow() {
  const [postContent, setPostContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [results, setResults] = useState<any>(null);

  const executeWorkflow = async () => {
    if (!postContent.trim()) return;
    setStatus("loading");

    try {
      const response = await fetch("/api/pipedream/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: import.meta.env.VITE_PIPEDREAM_WEBHOOK_URL,
          payload: {
            action: "linkedin_post_ai_audit",
            content: postContent,
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("success");
        setResults(data);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">LinkedIn & AI Workflow</h1>
        <p className="text-stone-500 mt-1">Compose a post, save to DB, publish to LinkedIn, and process with AI—all in one click.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-stone-700 mb-3">Compose LinkedIn Post</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What do you want to share today?"
              className="w-full h-40 px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={executeWorkflow}
                disabled={status === "loading" || !postContent.trim()}
                className="flex items-center gap-2 bg-amber-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Execute Complete Workflow
              </button>
            </div>
          </div>

          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900">Workflow Executed Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Your post was saved, published, and analyzed by the AI module.</p>
              </div>
            </div>
          )}
        </div>

        {/* Workflow Steps (Visualizer) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest px-2">Live Workflow Steps</h2>

          {[
            { id: 1, label: "Validate Auth", icon: CheckCircle2, desc: "Verifying Clerk Session" },
            { id: 2, label: "Store User Data", icon: Database, desc: "Supabase PG Sync" },
            { id: 3, label: "LinkedIn Post", icon: Linkedin, desc: "Publishing Content" },
            { id: 4, label: "AI Analysis", icon: BrainCircuit, desc: "OpenAI Processing" },
            { id: 5, label: "Store Results", icon: Database, desc: "Final DB Update" },
          ].map((step, i) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                status === "loading" && i === 0 ? "border-amber-500 bg-amber-50 animate-pulse" :
                status === "success" ? "border-green-200 bg-green-50" : "border-stone-200 bg-white"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === "success" ? "bg-green-600 text-white" : "bg-stone-100 text-stone-400"
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${status === "success" ? "text-green-900" : "text-stone-700"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-stone-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
