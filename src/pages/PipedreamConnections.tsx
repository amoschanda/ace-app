import { useState } from "react";
import { Share2, Plus, ExternalLink, Play } from "lucide-react";

export function PipedreamConnections() {
  const [webhookUrl, setWebhookUrl] = useState(import.meta.env.VITE_PIPEDREAM_WEBHOOK_URL || "");
  const [payload, setPayload] = useState('{"message": "Hello from Ace AI!"}');
  const [status, setStatus] = useState<string | null>(null);

  const testConnection = async () => {
    setStatus("testing");
    try {
      const res = await fetch("/api/pipedream/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, payload: JSON.parse(payload) }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "failed");
    } catch (err) {
      setStatus("failed");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Pipedream Connections</h1>
        <p className="text-stone-500 mt-1">Connect your AI to thousands of apps via Pipedream webhooks.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-700" />
            Add New Integration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Webhook URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://endpoint.m.pipedream.net/..."
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Test Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-mono text-sm"
              />
            </div>

            <button
              onClick={testConnection}
              className="w-full bg-stone-900 text-white py-3 rounded-lg font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Test Trigger
            </button>

            {status === "success" && (
              <p className="text-sm text-green-600 font-medium text-center">Trigger sent successfully!</p>
            )}
            {status === "failed" && (
              <p className="text-sm text-red-600 font-medium text-center">Failed to send trigger.</p>
            )}
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Share2 className="w-12 h-12 text-amber-500 mb-6" />
            <h2 className="text-2xl font-bold mb-4">How it works</h2>
            <ul className="space-y-4 text-stone-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-900 flex-shrink-0 flex items-center justify-center font-bold text-xs">1</span>
                <span>Create a new workflow in Pipedream with an HTTP Trigger.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-900 flex-shrink-0 flex items-center justify-center font-bold text-xs">2</span>
                <span>Paste the unique URL provided by Pipedream here.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-900 flex-shrink-0 flex items-center justify-center font-bold text-xs">3</span>
                <span>When Ace AI identifies a task, it will automatically trigger your Pipedream workflow.</span>
              </li>
            </ul>
            <a
              href="https://pipedream.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-amber-500 font-semibold hover:text-amber-400 transition-colors"
            >
              Go to Pipedream <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
