import React, { useState, useEffect, useCallback } from "react";
import { useAuth, useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Sermon, Book, Course, ChurchEvent, StudyResource, BroadcastEmail } from "../types.js";
import {
  Lock, LayoutDashboard, Plus, Trash2, Mail, Check, AlertCircle,
  BookOpen, Video, Calendar, Send, FileText, GraduationCap, ShieldAlert
} from "lucide-react";

type AdminTab = "sermons" | "books" | "courses" | "events" | "resources" | "broadcaster";

export default function AdminPanel() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [meCheck, setMeCheck] = useState<{ isAdmin: boolean; email?: string } | null>(null);
  const [verifyError, setVerifyError] = useState("");

  const [activeTab, setActiveTab] = useState<AdminTab>("sermons");

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastEmail[]>([]);

  const [emailSubject, setEmailSubject] = useState("Weekly Study Bulletin: Putting on the Whole Armor of God");
  const [emailBody, setEmailBody] = useState("Beloved,\n\nI want to encourage you this week to standing strong in Ephesians 6. The whole armor of God is not armor of steel, but armor of grace and light.\n\nBlessings,\nPst. Ken");
  const [emailRecipientGroup, setEmailRecipientGroup] = useState("members");
  const [testEmail, setTestEmail] = useState("acemayeson8@gmail.com");
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error" | "sending" | ""; message: string }>({ type: "", message: "" });

  const [showAddForm, setShowAddForm] = useState(false);
  const [sermonForm, setSermonForm] = useState({ title: "", speaker: "Pastor Ken", date: "", series: "", videoUrl: "", audioUrl: "", description: "", notes: "" });
  const [bookForm, setBookForm] = useState({ title: "", author: "Pastor Ken", coverUrl: "", description: "", downloadUrl: "#", pages: 120, category: "Theology" });
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "10:00 AM", location: "Sanctuary", description: "", image: "", type: "service" as ChurchEvent["type"] });
  const [resourceForm, setResourceForm] = useState({ title: "", category: "Sermon Companion", fileType: "PDF Document", description: "", downloadUrl: "#", fileSize: "1.2 MB" });

  const authFetch = useCallback(async (input: string, init: RequestInit = {}) => {
    const token = await getToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
    return fetch(input, { ...init, headers });
  }, [getToken]);

  const loadAllData = useCallback(() => {
    fetch("/api/sermons").then(r => r.json()).then(setSermons).catch(() => {});
    fetch("/api/books").then(r => r.json()).then(setBooks).catch(() => {});
    fetch("/api/courses").then(r => r.json()).then(setCourses).catch(() => {});
    fetch("/api/events").then(r => r.json()).then(setEvents).catch(() => {});
    fetch("/api/resources").then(r => r.json()).then(setResources).catch(() => {});
    authFetch("/api/emails").then(r => r.json()).then(setBroadcasts).catch(() => {});
  }, [authFetch]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setMeCheck(null); return; }
    authFetch("/api/me")
      .then(r => r.json())
      .then((d) => {
        setMeCheck({ isAdmin: !!d.isAdmin, email: d.email });
        if (d.isAdmin) loadAllData();
      })
      .catch((e) => setVerifyError(e.message || "Verification failed"));
  }, [isLoaded, isSignedIn, authFetch, loadAllData]);

  // --- Sermons CRUD ---
  const submitSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch("/api/admin/sermons", { method: "POST", body: JSON.stringify(sermonForm) });
    if (res.ok) { setSermonForm({ title: "", speaker: "Pastor Ken", date: "", series: "", videoUrl: "", audioUrl: "", description: "", notes: "" }); setShowAddForm(false); loadAllData(); }
  };
  const deleteSermon = async (id: string) => { await authFetch(`/api/admin/sermons/${id}`, { method: "DELETE" }); loadAllData(); };

  const submitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch("/api/admin/books", { method: "POST", body: JSON.stringify(bookForm) });
    if (res.ok) { setBookForm({ title: "", author: "Pastor Ken", coverUrl: "", description: "", downloadUrl: "#", pages: 120, category: "Theology" }); setShowAddForm(false); loadAllData(); }
  };
  const deleteBook = async (id: string) => { await authFetch(`/api/admin/books/${id}`, { method: "DELETE" }); loadAllData(); };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch("/api/admin/events", { method: "POST", body: JSON.stringify(eventForm) });
    if (res.ok) { setEventForm({ title: "", date: "", time: "10:00 AM", location: "Sanctuary", description: "", image: "", type: "service" }); setShowAddForm(false); loadAllData(); }
  };
  const deleteEvent = async (id: string) => { await authFetch(`/api/admin/events/${id}`, { method: "DELETE" }); loadAllData(); };

  const submitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch("/api/admin/resources", { method: "POST", body: JSON.stringify(resourceForm) });
    if (res.ok) { setResourceForm({ title: "", category: "Sermon Companion", fileType: "PDF Document", description: "", downloadUrl: "#", fileSize: "1.2 MB" }); setShowAddForm(false); loadAllData(); }
  };
  const deleteResource = async (id: string) => { await authFetch(`/api/admin/resources/${id}`, { method: "DELETE" }); loadAllData(); };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus({ type: "sending", message: "Dispatching via Resend..." });
    try {
      const res = await authFetch("/api/admin/send-email", {
        method: "POST",
        body: JSON.stringify({ subject: emailSubject, body: emailBody, targetGroup: emailRecipientGroup, testEmailAddress: testEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus({ type: "success", message: data.message || "Broadcast sent successfully." });
        loadAllData();
      } else {
        setEmailStatus({ type: "error", message: data.message || "Broadcast failed." });
      }
    } catch (err: any) {
      setEmailStatus({ type: "error", message: err.message || "Network failure" });
    }
  };

  // ----------- VIEW: NOT SIGNED IN -----------
  if (!isLoaded) {
    return <div className="text-white/60 py-12 text-center text-sm">Loading session...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-ink-light border border-white/10 rounded-2xl p-8 text-center space-y-6" data-testid="admin-signin-card">
        <div className="w-14 h-14 mx-auto border border-gold/30 rounded-full flex items-center justify-center">
          <Lock size={22} className="text-gold" />
        </div>
        <h2 className="font-serif text-2xl">Pastor Console</h2>
        <p className="text-white/60 text-sm">Sign in with your Clerk account to access administration. Only authorised pastor accounts may proceed.</p>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-gold hover:bg-gold-hover text-black px-6 py-3 font-semibold w-full" data-testid="admin-clerk-signin">
              Sign in with Clerk
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    );
  }

  // ----------- VIEW: SIGNED IN BUT NOT ADMIN -----------
  if (meCheck && !meCheck.isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-ink-light border border-amber-500/20 rounded-2xl p-8 text-center space-y-4" data-testid="admin-forbidden">
        <ShieldAlert size={28} className="mx-auto text-amber-400" />
        <h2 className="font-serif text-2xl">Not Authorised</h2>
        <p className="text-white/60 text-sm">
          You are signed in as <span className="font-mono text-gold">{meCheck.email || user?.primaryEmailAddress?.emailAddress}</span>, but this email is not on the pastor admin list.
        </p>
        <p className="text-white/40 text-xs">To enable admin access, add this email to <code>ADMIN_EMAILS</code> in your server environment.</p>
        <div className="flex justify-center pt-2"><UserButton afterSignOutUrl="/" /></div>
      </div>
    );
  }

  if (!meCheck) {
    return <div className="text-white/60 py-12 text-center text-sm">Verifying pastor credentials...</div>;
  }

  // ----------- VIEW: ADMIN DASHBOARD -----------
  const tabs = [
    { id: "sermons" as AdminTab, label: "Sermons", icon: Video, count: sermons.length },
    { id: "books" as AdminTab, label: "Books", icon: BookOpen, count: books.length },
    { id: "courses" as AdminTab, label: "Courses", icon: GraduationCap, count: courses.length },
    { id: "events" as AdminTab, label: "Events", icon: Calendar, count: events.length },
    { id: "resources" as AdminTab, label: "Handouts", icon: FileText, count: resources.length },
    { id: "broadcaster" as AdminTab, label: "Broadcaster", icon: Mail, count: broadcasts.length },
  ];

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-gold" />
          </div>
          <div>
            <h2 className="font-serif text-2xl">Pastor Console</h2>
            <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Signed in as {meCheck.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Admin verified</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setShowAddForm(false); }}
              data-testid={`admin-tab-${t.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold transition ${
                isActive ? "bg-gold text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              <span className={`text-[10px] ${isActive ? "text-black/60" : "text-white/40"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Action bar */}
      {activeTab !== "broadcaster" && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(v => !v)}
            data-testid="admin-add-toggle"
            className="flex items-center gap-2 bg-gold/10 border border-gold/40 hover:bg-gold/20 text-gold px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-bold"
          >
            <Plus size={14} /> {showAddForm ? "Cancel" : `Add New ${activeTab.slice(0, -1)}`}
          </button>
        </div>
      )}

      {/* Forms */}
      {showAddForm && activeTab === "sermons" && (
        <form onSubmit={submitSermon} className="bg-ink-light border border-white/10 rounded-xl p-6 space-y-3" data-testid="form-sermon">
          <input required placeholder="Title" value={sermonForm.title} onChange={e => setSermonForm({ ...sermonForm, title: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Series" value={sermonForm.series} onChange={e => setSermonForm({ ...sermonForm, series: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input type="date" value={sermonForm.date} onChange={e => setSermonForm({ ...sermonForm, date: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Video URL" value={sermonForm.videoUrl} onChange={e => setSermonForm({ ...sermonForm, videoUrl: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Audio URL" value={sermonForm.audioUrl} onChange={e => setSermonForm({ ...sermonForm, audioUrl: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <textarea placeholder="Description" value={sermonForm.description} onChange={e => setSermonForm({ ...sermonForm, description: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm min-h-[80px]" />
          <textarea placeholder="Study Notes (markdown ok)" value={sermonForm.notes} onChange={e => setSermonForm({ ...sermonForm, notes: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm min-h-[80px]" />
          <button type="submit" className="bg-gold text-black px-4 py-2 rounded font-bold text-sm">Publish Sermon</button>
        </form>
      )}
      {showAddForm && activeTab === "books" && (
        <form onSubmit={submitBook} className="bg-ink-light border border-white/10 rounded-xl p-6 space-y-3" data-testid="form-book">
          <input required placeholder="Title" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Cover URL" value={bookForm.coverUrl} onChange={e => setBookForm({ ...bookForm, coverUrl: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Download URL" value={bookForm.downloadUrl} onChange={e => setBookForm({ ...bookForm, downloadUrl: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input type="number" placeholder="Pages" value={bookForm.pages} onChange={e => setBookForm({ ...bookForm, pages: Number(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Category" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <textarea placeholder="Description" value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm min-h-[80px]" />
          <button type="submit" className="bg-gold text-black px-4 py-2 rounded font-bold text-sm">Publish Book</button>
        </form>
      )}
      {showAddForm && activeTab === "events" && (
        <form onSubmit={submitEvent} className="bg-ink-light border border-white/10 rounded-xl p-6 space-y-3" data-testid="form-event">
          <input required placeholder="Title" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Time (e.g. 10:00 AM)" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Location" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Image URL" value={eventForm.image} onChange={e => setEventForm({ ...eventForm, image: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <select value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value as ChurchEvent["type"] })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm">
            <option value="service">Service</option><option value="prayer">Prayer</option><option value="study">Study</option><option value="special">Special</option>
          </select>
          <textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm min-h-[80px]" />
          <button type="submit" className="bg-gold text-black px-4 py-2 rounded font-bold text-sm">Publish Event</button>
        </form>
      )}
      {showAddForm && activeTab === "resources" && (
        <form onSubmit={submitResource} className="bg-ink-light border border-white/10 rounded-xl p-6 space-y-3" data-testid="form-resource">
          <input required placeholder="Title" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Category" value={resourceForm.category} onChange={e => setResourceForm({ ...resourceForm, category: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="File Type" value={resourceForm.fileType} onChange={e => setResourceForm({ ...resourceForm, fileType: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="Download URL" value={resourceForm.downloadUrl} onChange={e => setResourceForm({ ...resourceForm, downloadUrl: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <input placeholder="File Size" value={resourceForm.fileSize} onChange={e => setResourceForm({ ...resourceForm, fileSize: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" />
          <textarea placeholder="Description" value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm min-h-[80px]" />
          <button type="submit" className="bg-gold text-black px-4 py-2 rounded font-bold text-sm">Publish Resource</button>
        </form>
      )}

      {/* Lists */}
      {activeTab === "sermons" && (
        <div className="space-y-2" data-testid="list-sermons">
          {sermons.map(s => (
            <div key={s.id} className="flex justify-between items-center bg-ink-light border border-white/10 rounded p-3">
              <div><div className="font-serif">{s.title}</div><div className="text-xs text-white/40 font-mono">{s.series} • {s.date}</div></div>
              <button onClick={() => deleteSermon(s.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {activeTab === "books" && (
        <div className="space-y-2" data-testid="list-books">
          {books.map(b => (
            <div key={b.id} className="flex justify-between items-center bg-ink-light border border-white/10 rounded p-3">
              <div><div className="font-serif">{b.title}</div><div className="text-xs text-white/40 font-mono">{b.author} • {b.category}</div></div>
              <button onClick={() => deleteBook(b.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {activeTab === "events" && (
        <div className="space-y-2" data-testid="list-events">
          {events.map(ev => (
            <div key={ev.id} className="flex justify-between items-center bg-ink-light border border-white/10 rounded p-3">
              <div><div className="font-serif">{ev.title}</div><div className="text-xs text-white/40 font-mono">{ev.date} • {ev.time} • {ev.location}</div></div>
              <button onClick={() => deleteEvent(ev.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {activeTab === "resources" && (
        <div className="space-y-2" data-testid="list-resources">
          {resources.map(r => (
            <div key={r.id} className="flex justify-between items-center bg-ink-light border border-white/10 rounded p-3">
              <div><div className="font-serif">{r.title}</div><div className="text-xs text-white/40 font-mono">{r.category} • {r.fileType} • {r.fileSize}</div></div>
              <button onClick={() => deleteResource(r.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
      {activeTab === "courses" && (
        <div className="space-y-2" data-testid="list-courses">
          {courses.map(c => (
            <div key={c.id} className="bg-ink-light border border-white/10 rounded p-3">
              <div className="font-serif">{c.title}</div>
              <div className="text-xs text-white/40 font-mono">{c.modules?.length || 0} modules</div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcaster */}
      {activeTab === "broadcaster" && (
        <form onSubmit={sendBroadcast} className="bg-ink-light border border-white/10 rounded-xl p-6 space-y-4" data-testid="form-broadcaster">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gold" />
            <h3 className="font-serif text-lg">Resend Broadcaster</h3>
          </div>
          <input required placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm" data-testid="broadcast-subject" />
          <textarea required placeholder="Body" value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm min-h-[180px]" data-testid="broadcast-body" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={emailRecipientGroup} onChange={e => setEmailRecipientGroup(e.target.value)} className="bg-black/30 border border-white/10 rounded p-2 text-sm">
              <option value="members">All Members</option>
              <option value="leaders">Leaders</option>
              <option value="all">Everyone</option>
            </select>
            <input placeholder="Test recipient email" value={testEmail} onChange={e => setTestEmail(e.target.value)} className="bg-black/30 border border-white/10 rounded p-2 text-sm" data-testid="broadcast-to" />
          </div>
          <button type="submit" disabled={emailStatus.type === "sending"} className="bg-gold hover:bg-gold-hover text-black px-6 py-3 rounded font-bold text-sm flex items-center gap-2 disabled:opacity-50" data-testid="broadcast-send">
            <Send size={14} /> {emailStatus.type === "sending" ? "Dispatching..." : "Transmit Broadcast Live"}
          </button>
          {emailStatus.message && (
            <div className={`flex items-center gap-2 text-xs ${emailStatus.type === "success" ? "text-emerald-400" : emailStatus.type === "error" ? "text-red-400" : "text-white/60"}`} data-testid="broadcast-status">
              {emailStatus.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />} {emailStatus.message}
            </div>
          )}
          <div className="pt-4 border-t border-white/5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Recent Broadcasts</div>
            {broadcasts.slice(0, 5).map(b => (
              <div key={b.id} className="flex justify-between text-xs py-1 text-white/60">
                <span>{b.subject}</span>
                <span className={`font-mono ${b.status === "sent" ? "text-emerald-400" : "text-amber-400"}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </form>
      )}

      {verifyError && <div className="text-red-400 text-sm" data-testid="admin-error">{verifyError}</div>}
    </div>
  );
}
