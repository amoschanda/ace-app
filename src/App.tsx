import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { TikTokAuditor } from "./pages/TikTokAuditor";
import { LinkedInWorkflow } from "./pages/LinkedInWorkflow";
import { PipedreamConnections } from "./pages/PipedreamConnections";
import { useState } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <div>
      <SignedIn>
        <Layout setCurrentPage={setCurrentPage} currentPage={currentPage}>
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "tiktok" && <TikTokAuditor />}
          {currentPage === "linkedin" && <LinkedInWorkflow />}
          {currentPage === "pipedream" && <PipedreamConnections />}
        </Layout>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-4 text-center">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">Ace AI Social Manager</h1>
          <p className="text-stone-600 mb-8 max-w-md">
            Manage your social media with the power of AI. Connect TikTok, Pipedream, and more.
          </p>
          <SignInButton mode="modal">
            <button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}
