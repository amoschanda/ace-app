import { useState } from "react";
import { AlertCircle, Trash2, RefreshCw } from "lucide-react";

export function TikTokAuditor() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/audit-tiktok", { method: "POST" });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">AI TikTok Auditor</h1>
          <p className="text-stone-500 mt-1">Identify videos that are harming your engagement.</p>
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center gap-2 bg-amber-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : "Run New Audit"}
        </button>
      </header>

      {!results && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900">No Audit Data Yet</h2>
          <p className="text-stone-600 mt-2 mb-6 max-w-sm mx-auto">
            Click the button above to have our AI analyze your TikTok profile and suggest deletions.
          </p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-stone-900">AI Recommendation Summary</h3>
            <div className="prose prose-stone max-w-none text-stone-600 whitespace-pre-wrap">
              {results.audit}
            </div>
          </div>

          <div className="grid gap-4">
            {results.videos.map((video: any) => (
              <div key={video.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-6">
                <div className="w-24 h-32 bg-stone-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                   <Video className="w-8 h-8 text-stone-300" />
                   <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                     {video.views} views
                   </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-900 line-clamp-1">{video.description}</h4>
                  <p className="text-sm text-stone-500 mt-1">Posted on {video.date}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                      video.views < 100 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {video.views < 100 ? "Recommendation: Delete" : "Engagement: OK"}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-stone-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Video(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
      <rect width="14" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}
