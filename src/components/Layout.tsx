import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, ShieldCheck, Share2, LogOut, Linkedin } from "lucide-react";

export function Layout({ children, setCurrentPage, currentPage }: any) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tiktok", label: "AI TikTok Auditor", icon: ShieldCheck },
    { id: "linkedin", label: "LinkedIn AI Workflow", icon: Linkedin },
    { id: "pipedream", label: "Pipedream", icon: Share2 },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-amber-800">Ace AI</h1>
          <p className="text-xs text-stone-500">Social Management</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? "bg-amber-50 text-amber-800"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium text-stone-700">Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
