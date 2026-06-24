import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Clerk Middleware
  app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }));

  // API Routes
  app.get("/api/me", async (req, res) => {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.json({ signedIn: false });
    }
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      res.json({
        signedIn: true,
        userId: auth.userId,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // AI Audit Endpoint (Mocking TikTok Data for now)
  app.post("/api/ai/audit-tiktok", async (req, res) => {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

    // In a real app, you'd fetch videos from TikTok API here
    const mockVideos = [
      { id: "1", description: "Dancing in the rain", views: 10, date: "2023-01-01" },
      { id: "2", description: "Why I love coding", views: 5000, date: "2023-05-10" },
      { id: "3", description: "Bad joke video", views: 2, date: "2023-06-15" },
    ];

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze these TikTok videos and recommend which ones should be deleted based on low engagement (views) or outdated content. Provide a reason for each recommendation.
      Videos: ${JSON.stringify(mockVideos)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Save to Supabase
      try {
        await supabase
          .from('audits')
          .insert([{ user_id: auth.userId, result: text, videos_data: mockVideos }]);
      } catch (dbErr) {
        console.error("Supabase insert failed:", dbErr);
      }

      res.json({ audit: text, videos: mockVideos });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI Audit failed" });
    }
  });

  // Pipedream Trigger Endpoint
  app.get("/api/audits", async (req, res) => {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', auth.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  app.post("/api/pipedream/trigger", async (req, res) => {
    const auth = getAuth(req);
    const { webhookUrl, payload } = req.body;
    if (!webhookUrl) return res.status(400).json({ error: "Webhook URL required" });

    try {
      const fullPayload = {
        ...payload,
        user: {
          id: auth.userId,
          email: (await clerkClient.users.getUser(auth.userId || "")).primaryEmailAddress?.emailAddress
        }
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });
      res.json({ success: response.ok });
    } catch (err) {
      res.status(500).json({ error: "Failed to trigger Pipedream" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
