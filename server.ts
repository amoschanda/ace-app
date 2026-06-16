import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { clerkMiddleware, getAuth, clerkClient, requireAuth } from "@clerk/express";
import { getDb, saveDb } from "./src/db/store.js";
import { Sermon, Book, Course, ChurchEvent, StudyResource, BroadcastEmail } from "./src/types.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // -------------------------------------------------------------------
  // 1. AUTH: CLERK MIDDLEWARE + ADMIN GATE
  // -------------------------------------------------------------------
  // Wrap Clerk middleware so an unparseable Bearer token returns 401 (not Express 500).
  const baseClerk = clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(baseClerk(req, res, (err?: any) => {
      if (err) {
        const msg = err?.message || "";
        const isAuthErr = /jwt|token|clerk|unauthor|parse|unexpected end/i.test(msg);
        if (isAuthErr) {
          return res.status(401).json({ success: false, message: "Invalid or expired session token" });
        }
        return next(err);
      }
      next();
    })).catch((err) => {
      const msg = err?.message || "";
      const isAuthErr = /jwt|token|clerk|unauthor|parse|unexpected end/i.test(msg);
      if (isAuthErr && !res.headersSent) {
        return res.status(401).json({ success: false, message: "Invalid or expired session token" });
      }
      if (!res.headersSent) res.status(500).json({ success: false, message: "Auth middleware error" });
    });
  });

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    let auth: ReturnType<typeof getAuth>;
    try {
      auth = getAuth(req);
    } catch (err: any) {
      console.error("Clerk getAuth failed:", err?.message);
      return res.status(401).json({ success: false, message: "Invalid or expired session token" });
    }
    if (!auth || !auth.userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
      if (!primaryEmail || !adminEmails.includes(primaryEmail)) {
        return res.status(403).json({ success: false, message: "Forbidden: pastor/admin only" });
      }
      (req as any).adminUser = user;
      return next();
    } catch (err: any) {
      console.error("Admin verification failed:", err?.message || err);
      return res.status(401).json({ success: false, message: "Auth verification failed" });
    }
  };

  // Lightweight "who am I + isAdmin" probe used by the React app to show the Pastor Console.
  app.get("/api/me", async (req, res) => {
    const auth = getAuth(req);
    if (!auth.userId) {
      return res.json({ signedIn: false, isAdmin: false });
    }
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
      res.json({
        signedIn: true,
        userId: auth.userId,
        email: primaryEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        isAdmin: !!primaryEmail && adminEmails.includes(primaryEmail),
      });
    } catch (err) {
      res.json({ signedIn: true, userId: auth.userId, isAdmin: false });
    }
  });

  // -------------------------------------------------------------------
  // 2. API: SERMONS CRUD
  // -------------------------------------------------------------------
  app.get("/api/sermons", (req, res) => {
    const db = getDb();
    res.json(db.sermons);
  });

  app.post("/api/admin/sermons", requireAdmin, (req, res) => {
    const db = getDb();
    const sermon: Sermon = {
      id: "sermon-" + Date.now(),
      title: req.body.title || "Untitled Sermon",
      speaker: req.body.speaker || "Pastor Ken",
      date: req.body.date || new Date().toISOString().split('T')[0],
      audioUrl: req.body.audioUrl,
      videoUrl: req.body.videoUrl,
      series: req.body.series || "General Focus",
      description: req.body.description || "",
      notes: req.body.notes || ""
    };
    db.sermons.unshift(sermon);
    saveDb(db);
    res.status(201).json(sermon);
  });

  app.put("/api/admin/sermons/:id", requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.sermons.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Sermon not found" });

    db.sermons[index] = { ...db.sermons[index], ...req.body };
    saveDb(db);
    res.json(db.sermons[index]);
  });

  app.delete("/api/admin/sermons/:id", requireAdmin, (req, res) => {
    const db = getDb();
    db.sermons = db.sermons.filter(s => s.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // 3. API: BOOKS CRUD
  // -------------------------------------------------------------------
  app.get("/api/books", (req, res) => {
    const db = getDb();
    res.json(db.books);
  });

  app.post("/api/admin/books", requireAdmin, (req, res) => {
    const db = getDb();
    const book: Book = {
      id: "book-" + Date.now(),
      title: req.body.title || "New Theological Work",
      author: req.body.author || "Pastor Ken",
      coverUrl: req.body.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
      description: req.body.description || "",
      downloadUrl: req.body.downloadUrl || "#",
      pages: Number(req.body.pages) || 120,
      category: req.body.category || "General Study"
    };
    db.books.unshift(book);
    saveDb(db);
    res.status(201).json(book);
  });

  app.put("/api/admin/books/:id", requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.books.findIndex(b => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Book not found" });

    db.books[index] = { ...db.books[index], ...req.body };
    saveDb(db);
    res.json(db.books[index]);
  });

  app.delete("/api/admin/books/:id", requireAdmin, (req, res) => {
    const db = getDb();
    db.books = db.books.filter(b => b.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // 4. API: COURSES CRUD
  // -------------------------------------------------------------------
  app.get("/api/courses", (req, res) => {
    const db = getDb();
    res.json(db.courses);
  });

  app.post("/api/admin/courses", requireAdmin, (req, res) => {
    const db = getDb();
    const course: Course = {
      id: "course-" + Date.now(),
      title: req.body.title || "Faith Module",
      description: req.body.description || "",
      coverUrl: req.body.coverUrl || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400",
      modules: req.body.modules || []
    };
    db.courses.unshift(course);
    saveDb(db);
    res.status(201).json(course);
  });

  app.put("/api/admin/courses/:id", requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Course not found" });

    db.courses[index] = { ...db.courses[index], ...req.body };
    saveDb(db);
    res.json(db.courses[index]);
  });

  app.delete("/api/admin/courses/:id", requireAdmin, (req, res) => {
    const db = getDb();
    db.courses = db.courses.filter(c => c.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // 5. API: EVENTS CRUD
  // -------------------------------------------------------------------
  app.get("/api/events", (req, res) => {
    const db = getDb();
    res.json(db.events);
  });

  app.post("/api/admin/events", requireAdmin, (req, res) => {
    const db = getDb();
    const ev: ChurchEvent = {
      id: "event-" + Date.now(),
      title: req.body.title || "Church Gathering",
      date: req.body.date || new Date().toISOString().split('T')[0],
      time: req.body.time || "10:00 AM",
      location: req.body.location || "Sanctuary",
      description: req.body.description || "",
      image: req.body.image || "https://images.unsplash.com/photo-1438243447756-33fcb71e1a3c?auto=format&fit=crop&q=80&w=400",
      type: req.body.type || "service"
    };
    db.events.push(ev);
    saveDb(db);
    res.status(201).json(ev);
  });

  app.put("/api/admin/events/:id", requireAdmin, (req, res) => {
    const db = getDb();
    const index = db.events.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Event not found" });

    db.events[index] = { ...db.events[index], ...req.body };
    saveDb(db);
    res.json(db.events[index]);
  });

  app.delete("/api/admin/events/:id", requireAdmin, (req, res) => {
    const db = getDb();
    db.events = db.events.filter(e => e.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // 6. API: STUDY RESOURCES CRUD
  // -------------------------------------------------------------------
  app.get("/api/resources", (req, res) => {
    const db = getDb();
    res.json(db.resources);
  });

  app.post("/api/admin/resources", requireAdmin, (req, res) => {
    const db = getDb();
    const resource: StudyResource = {
      id: "res-" + Date.now(),
      title: req.body.title || "Theology Handout",
      category: req.body.category || "Study Material",
      fileType: req.body.fileType || "PDF Document",
      description: req.body.description || "",
      downloadUrl: req.body.downloadUrl || "#",
      fileSize: req.body.fileSize || "1.5 MB"
    };
    db.resources.unshift(resource);
    saveDb(db);
    res.status(201).json(resource);
  });

  app.delete("/api/admin/resources/:id", requireAdmin, (req, res) => {
    const db = getDb();
    db.resources = db.resources.filter(r => r.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // 7. API: EMAIL BROADCASTS & REAL RESEND SENDER
  // -------------------------------------------------------------------
  app.get("/api/emails", (req, res) => {
    const db = getDb();
    res.json(db.emails);
  });

  app.post("/api/admin/send-email", requireAdmin, async (req, res) => {
    const { subject, body, targetGroup, testEmailAddress } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and body are required." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.ADMIN_BROADCAST_FROM || "Pastor Ken Study Portal <onboarding@resend.dev>";
    const defaultTo = process.env.ADMIN_BROADCAST_DEFAULT_TO || "acemayeson8@gmail.com";
    const errors: string[] = [];
    let resendOk = false;

    const finalToEmail = testEmailAddress || defaultTo;

    console.log(`Sending email broadcast via Resend to: ${finalToEmail}...`);

    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromAddress,
          to: finalToEmail,
          subject: `Study Notification: ${subject}`,
          html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fcfcf9; color: #1c1917;">
              <div style="border-bottom: 2px solid #d97706; padding-bottom: 16px; margin-bottom: 20px;">
                <h1 style="color: #b45309; margin: 0; font-size: 22px; font-weight: 600;">Pastor Ken's Study Notes</h1>
                <p style="margin: 4px 0 0 0; color: #78716c; font-size: 13px;">Pastor Ken's Ministry and Learner Portal Bulletin</p>
              </div>
              <div style="font-size: 16px; line-height: 1.6; color: #44403c;">
                <p style="font-weight: 500;">Dear Member,</p>
                <div style="background-color: #ffffff; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-style: italic;">
                  ${body.replace(/\n/g, '<br>')}
                </div>
                <p style="margin-top: 24px;">To access your active Bible study modules, view live recordings, download study pack PDFs, or update your profiles, log in to your personal platform portal.</p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="https://pastor-ken.vercel.app" style="background-color: #1c1917; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; display: inline-block;">Go to Pastor Ken</a>
                </div>
              </div>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 11px; color: #a8a29e; text-align: center; margin: 0;">This email was broadcast using your active Resend API module integration. Designed by Ace App.</p>
            </div>
          `
        })
      });

      resendOk = resendResponse.ok;
      if (!resendResponse.ok) {
        const errText = await resendResponse.text();
        console.error("Resend delivery failed:", errText);
        errors.push(`Resend Server Error: ${errText}`);
      }
    } catch (e: any) {
      console.error("Resend communication exception:", e);
      errors.push(`Network error: ${e.message}`);
    }

    // Save history
    const db = getDb();
    const emailObj: BroadcastEmail = {
      id: "email-" + Date.now(),
      subject,
      body,
      sentAt: new Date().toISOString(),
      recipients: targetGroup || "members",
      status: resendOk ? "sent" : "draft"
    };

    db.emails.unshift(emailObj);
    saveDb(db);

    if (resendOk) {
      return res.json({ success: true, message: "Email broadcast sent successfully via Resend!", record: emailObj });
    } else {
      return res.status(502).json({
        success: false,
        message: "Broadcaster recorded locally as draft, but Resend API integration failed.",
        errors,
        record: emailObj
      });
    }
  });


  // -------------------------------------------------------------------
  // 8. VITE MIDDLEWARE AND SPA ROUTING
  // -------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development Vite server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static items for production...");
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

startServer().catch(err => {
  console.error("Server boot crash:", err);
});
