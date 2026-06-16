import React, { useState, useEffect } from "react";
import { 
  BookOpen, Video, GraduationCap, Calendar, FileText, Lock, 
  Shield, Radio, Quote, ArrowRight, Menu, X, ExternalLink
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import SermonHub from "./components/SermonHub";
import TheologicalLibrary from "./components/TheologicalLibrary";
import FaithAcademy from "./components/FaithAcademy";
import EventCalendar from "./components/EventCalendar";
import ResourceHub from "./components/ResourceHub";
import LiveBroadcast from "./components/LiveBroadcast";
import AdminPanel from "./components/AdminPanel";
import { Course, ChurchEvent } from "./types";

type ViewModeType = "landing" | "portal";
type ActiveTabType = "sermons" | "books" | "academy" | "events" | "resources" | "live" | "admin";

export default function App() {
  const { isSignedIn } = useUser();
  const [viewMode, setViewMode] = useState<ViewModeType>("landing");
  const [activeTab, setActiveTab] = useState<ActiveTabType>("sermons");
  const [selectedSermonTitle, setSelectedSermonTitle] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load courses and events for dynamic landing page display
  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error loading courses:", err));

    fetch("/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleSelectSermonInHub = (sermon: any) => {
    setSelectedSermonTitle(sermon.title);
  };

  const handleEnterPortal = (tab: ActiveTabType = "sermons") => {
    setActiveTab(tab);
    setViewMode("portal");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExitPortal = () => {
    setViewMode("landing");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="ace-app-root" className="min-h-screen bg-ink text-white flex flex-col justify-between selection:bg-gold selection:text-black">
      
      {/* 2. HEADER NAVIGATION BAR */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-ink/90 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo brand */}
          <button onClick={handleExitPortal} className="flex items-center gap-3 text-left focus:outline-none hover:opacity-90 transition">
            <div className="w-10 h-10 border border-gold/40 rounded flex items-center justify-center bg-black/40">
              <span className="font-serif text-gold text-xl leading-none">ה</span>
            </div>
            <div className="leading-tight">
              <div className="font-serif text-base sm:text-lg tracking-wide text-white">Intentional Living</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold/60 mt-0.5">University</div>
            </div>
          </button>

          {/* Landing Mode Menu Links */}
          {viewMode === "landing" ? (
            <nav id="landing-navigation" className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#courses" className="text-white/70 hover:text-white transition-colors">Courses</a>
              <a href="#standards" className="text-white/70 hover:text-white transition-colors">Standards</a>
              <a href="#events" className="text-white/70 hover:text-white transition-colors">Events</a>
              <a href="#about" className="text-white/70 hover:text-white transition-colors">About</a>
            </nav>
          ) : (
            /* Portal Tab Navigation links, desktop view */
            <nav id="portal-navigation" className="hidden lg:flex items-center space-x-1">
              {[
                { id: "sermons", label: "Sermons & Outlines", icon: Video },
                { id: "books", label: "Theological Library", icon: BookOpen },
                { id: "academy", label: "Faith Academy", icon: GraduationCap },
                { id: "events", label: "Events Calendar", icon: Calendar },
                { id: "resources", label: "Handouts", icon: FileText },
                { id: "live", label: "Live Sanctuary", icon: Radio, highlight: true },
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    id={`tab-nav-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTabType)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      tab.highlight && !isSelected
                      ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                      : isSelected
                      ? "bg-gold text-black shadow-md font-bold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={tab.highlight ? "animate-pulse" : ""} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right actions: Portal Login / Return Home */}
          <div className="hidden md:flex items-center space-x-3">
            {viewMode === "landing" ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      id="nav-signin"
                      className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                      data-testid="nav-signin"
                    >
                      Member Sign-In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      id="nav-cta-enroll"
                      className="bg-gold text-black px-5 py-2.5 text-sm font-medium hover:bg-gold-hover transition-colors"
                      data-testid="nav-cta-enroll"
                    >
                      Enroll Now
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <button
                    onClick={() => handleEnterPortal("sermons")}
                    className="bg-gold text-black px-5 py-2.5 text-sm font-medium hover:bg-gold-hover transition-colors"
                    data-testid="nav-enter-portal"
                  >
                    Enter Portal
                  </button>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            ) : (
              <>
                <button
                  id="tab-nav-admin"
                  onClick={() => setActiveTab("admin")}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === "admin"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Lock size={13} />
                  <span>Pastor Console</span>
                </button>
                <button
                  onClick={handleExitPortal}
                  className="border border-white/20 text-white hover:bg-white hover:text-black px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Campus Website Home
                </button>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>

          {/* Hamburger Menu (Mobile Navigation Toggle) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-white p-2 hover:opacity-80 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Area */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-ink-light border-b border-white/10 animate-fade-in p-6 space-y-4">
            {viewMode === "landing" ? (
              <div className="flex flex-col space-y-3 font-sans">
                <a href="#courses" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold py-2 text-sm">Courses</a>
                <a href="#standards" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold py-2 text-sm">Standards</a>
                <a href="#events" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold py-2 text-sm">Events</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold py-2 text-sm">About</a>
                <hr className="border-white/10 my-2" />
                <button 
                  onClick={() => handleEnterPortal("sermons")} 
                  className="w-full text-center py-2.5 text-sm font-semibold text-white/80 bg-white/5 rounded-lg hover:bg-white/10"
                >
                  Member Sign-In
                </button>
                <button 
                  onClick={() => handleEnterPortal("sermons")} 
                  className="w-full text-center py-2.5 text-sm font-semibold text-black bg-gold rounded-lg hover:opacity-90"
                >
                  Enter Portal
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 font-sans">
                {[
                  { id: "sermons", label: "Sermons & Outlines" },
                  { id: "books", label: "Theological Books" },
                  { id: "academy", label: "Faith Academy" },
                  { id: "events", label: "Events Calendar" },
                  { id: "resources", label: "Handout Materials" },
                  { id: "live", label: "Live Sanctuary" },
                  { id: "admin", label: "Pastor Console (Admin)" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as ActiveTabType);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-sm transition ${
                      activeTab === tab.id
                      ? "bg-gold text-black font-semibold"
                      : "text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <hr className="border-white/10 my-2" />
                <button onClick={handleExitPortal} className="w-full text-center py-2.5 text-xs uppercase font-bold tracking-wider text-stone-400 bg-white/5 border border-white/10 rounded-lg">
                  Exit to Landing Homepage
                </button>
              </div>
            )}
          </div>
        )}
      </header>


      {/* 3. LANDING PAGE VIEW (The Stunning Vercel UI Representation) */}
      {viewMode === "landing" && (
        <div className="flex-1 font-sans">
          
          {/* HERO SECTION */}
          <section id="welcome-message-block" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden flex items-center min-h-[90vh]">
            {/* Background Image Matching exact look */}
            <div className="absolute inset-0 -z-10" style={{
              backgroundImage: `url("https://static.prod-images.emergentagent.com/jobs/1d22ebcf-31f2-41fb-901b-e279db58d55d/images/859513e817dd0168597b40ea6f3ed82c75131d6ac6aac4ae221ca970cab2c31d.png")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div className="absolute inset-0 -z-10 bg-ink/80"></div>
            {/* Soft grid/grain background helper */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#c5a880_1px,transparent_1.5px)] opacity-5 [background-size:24px_24px]"></div>
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-left">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9 animate-fade-in space-y-8">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold font-semibold">
                    <span className="w-8 h-px bg-gold"></span>
                    <span>An Intentional School of Faith</span>
                  </div>
                  <h1 className="font-serif font-light text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
                    Recover the <em className="text-gold not-italic font-serif">Hebraic</em><br/>foundation of your faith.
                  </h1>
                  <p className="max-w-2xl text-lg text-white/70 font-light leading-relaxed">
                    Intentional Living University is a global school for Hebraic studies, biblical languages, and ministry training — taught by Pastor Ken and a faculty rooted in scripture. Step into a curriculum forged for the called.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4">
                    <a 
                      href="#courses" 
                      className="bg-gold text-black px-8 py-4 font-semibold text-sm tracking-wide shadow-lg hover:bg-gold-hover transition-colors"
                      data-testid="hero-explore-courses"
                    >
                      Explore Courses
                    </a>
                    <button 
                      onClick={() => handleEnterPortal("sermons")}
                      className="border border-white/20 text-white px-8 py-4 font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all"
                      data-testid="hero-enter-portal"
                    >
                      {isSignedIn ? "Enter Member Portal" : "Sign in to Enter"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats highlights */}
              <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-6 gap-6" data-testid="hero-stats">
                <div id="stat1" className="py-8">
                  <div className="font-serif text-5xl sm:text-7xl text-gold tracking-tighter">12</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/60 font-semibold">Live Courses</div>
                </div>
                <div id="stat2" className="py-8 lg:border-l border-white/10 lg:pl-8">
                  <div className="font-serif text-5xl sm:text-7xl text-gold tracking-tighter">1.8K+</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/60 font-semibold">Students Enrolled</div>
                </div>
                <div id="stat3" className="py-8 lg:border-l border-white/10 lg:pl-8">
                  <div className="font-serif text-5xl sm:text-7xl text-gold tracking-tighter">22</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/60 font-semibold">Hebrew Letters Mastered</div>
                </div>
                <div id="stat4" className="py-8 lg:border-l border-white/10 lg:pl-8">
                  <div className="font-serif text-5xl sm:text-7xl text-gold tracking-tighter">100%</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-white/60 font-semibold">Scripture-Anchored</div>
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC COURSES CATALOG SECTION */}
          <section id="courses" className="py-24 sm:py-32 bg-ink-light border-y border-white/5 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-left">
              <div className="grid grid-cols-12 gap-6 mb-16 items-end">
                <div className="col-span-12 lg:col-span-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4 font-semibold">The Curriculum</div>
                  <h2 className="font-serif font-light text-4xl sm:text-6xl tracking-tight leading-tight">
                    Courses for the <em className="text-gold not-italic font-serif">called.</em>
                  </h2>
                </div>
                <div className="col-span-12 lg:col-span-5 lg:col-start-8">
                  <p className="text-white/60 font-light text-lg leading-relaxed">
                    Each course is a 6 to 16-week immersion. Live cohorts, recorded lectures, weekly study circles, and direct access to faculty.
                  </p>
                </div>
              </div>

              {/* Dynamic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <div 
                      key={course.id}
                      onClick={() => handleEnterPortal("academy")}
                      className="group bg-ink rounded-xl border border-white/10 hover:border-gold/30 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 cursor-pointer hover:shadow-[0_4px_20px_rgba(197,168,128,0.05)] text-left"
                    >
                      <div className="space-y-4">
                        <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-black/40 relative">
                          <img 
                            src={course.coverUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded">
                              {course.modules?.length || 0} Modules
                            </span>
                            <span className="text-[10px] text-white/60 font-mono">Academic Outline</span>
                          </div>
                        </div>
                        <h4 className="font-serif text-2xl group-hover:text-gold transition font-bold tracking-tight">
                          {course.title}
                        </h4>
                        <p className="text-white/60 text-sm font-light leading-relaxed line-clamp-3">
                          {course.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gold font-semibold uppercase tracking-wider group-hover:text-white transition">
                        <span>Access Syllabus Classes</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 border border-dashed border-white/15 rounded-xl text-white/50 text-sm">
                    Loading curriculum catalog folders...
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* STANDARDS / WHY SYSTEM SECTION */}
          <section id="standards" className="py-24 sm:py-32 relative overflow-hidden scroll-mt-20">
            {/* Background texture matching live site */}
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: `url("https://static.prod-images.emergentagent.com/jobs/1d22ebcf-31f2-41fb-901b-e279db58d55d/images/95e4bd82cbe6f15747cc07d15bb029c3477da682c514643d7a234314fd3fe8c6.png")`,
              backgroundSize: 'cover',
              mixBlendMode: 'luminosity'
            }}></div>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative text-left">
              <div className="grid grid-cols-12 gap-6 mb-20">
                <div className="col-span-12 lg:col-span-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4 font-semibold">Our Standards</div>
                  <h2 className="font-serif font-light text-4xl sm:text-6xl tracking-tight leading-tight">
                    Why Intentional Living.
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    num: "01",
                    title: "Scripture First",
                    body: "Every course begins and ends in the text. We read what God said, in the language He said it."
                  },
                  {
                    num: "02",
                    title: "Hebraic Heritage",
                    body: "We recover the Jewish foundations of the gospel — the calendar, the language, the worldview."
                  },
                  {
                    num: "03",
                    title: "Live Faculty Access",
                    body: "Direct mentorship from Pastor Ken and dedicated faculty. Not a lecture library — a school."
                  },
                  {
                    num: "04",
                    title: "Forged for Ministry",
                    body: "Theology that sends. Every cohort produces preachers, teachers, and disciples — not consumers."
                  }
                ].map(item => (
                  <div key={item.num} className="border-t border-gold/30 pt-8 space-y-4">
                    <div className="font-mono text-gold text-sm tracking-widest">{item.num} /</div>
                    <h3 className="font-serif text-2xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="text-white/60 font-light text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* EVENTS / CALENDAR HIGHLIGHT GATHERINGS SECTION */}
          <section id="events" className="py-24 sm:py-32 border-t border-white/10 bg-ink-light scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-left">
              <div className="flex flex-wrap items-end justify-between mb-16 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4 font-semibold">Gatherings</div>
                  <h2 className="font-serif font-light text-4xl sm:text-6xl tracking-tight">Upcoming Events</h2>
                </div>
                <button 
                  onClick={() => handleEnterPortal("events")}
                  className="text-sm font-semibold text-white/70 hover:text-gold border-b border-white/20 pb-1 transition"
                  data-testid="events-view-all"
                >
                  View full calendar →
                </button>
              </div>

              {/* Dyn events list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.length > 0 ? (
                  events.slice(0, 3).map(ev => (
                    <div 
                      key={ev.id}
                      onClick={() => handleEnterPortal("events")}
                      className="group bg-ink rounded-xl border border-white/10 hover:border-gold/30 p-5 space-y-4 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-black/40">
                          <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-102 transition" />
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-gold font-mono uppercase tracking-wider">
                          <span>{ev.date}</span>
                          <span>•</span>
                          <span>{ev.time}</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold group-hover:text-gold transition leading-tight">{ev.title}</h4>
                        <p className="text-white/60 text-xs font-light leading-relaxed line-clamp-2">{ev.description}</p>
                      </div>
                      <div className="pt-2 text-[10px] uppercase font-mono text-white/40 tracking-wider">
                        Location: {ev.location}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 border border-dashed border-white/15 rounded-xl text-white/50 text-sm">
                    Loading upcoming congregation events...
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ABOUT & MEMBERSHIP CALL TO ACTION */}
          <section id="about" className="relative py-32 border-t border-white/10 overflow-hidden scroll-mt-20">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("https://static.prod-images.emergentagent.com/jobs/1d22ebcf-31f2-41fb-901b-e279db58d55d/images/95e4bd82cbe6f15747cc07d15bb029c3477da682c514643d7a234314fd3fe8c6.png")`,
              backgroundSize: 'cover'
            }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40"></div>
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-12 gap-6 text-left">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <h2 className="font-serif font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1]">
                  Begin your <em className="text-gold not-italic font-serif">journey.</em>
                </h2>
                <p className="text-xl text-white/70 font-light max-w-2xl leading-relaxed">
                  Membership is curated. Once your enrollment is confirmed, you receive lifetime access to your cohort, all live sessions, and the full Pastor Ken sermon archive.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <button 
                    onClick={() => handleEnterPortal("sermons")}
                    className="bg-gold text-black px-10 py-5 text-lg font-medium hover:bg-gold-hover transition-colors shadow-lg"
                    data-testid="cta-enter-portal"
                  >
                    Enter Member Portal
                  </button>
                  <a 
                    href="mailto:hello@pastorken.edu" 
                    className="border border-white/20 text-white px-10 py-5 text-lg font-medium hover:bg-white hover:text-black transition-all"
                    data-testid="cta-request-access"
                  >
                    Request Access
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      )}


      {/* 4. INTERACTIVE PORTAL WORKSPACE (Dynamic Route Switching Layout) */}
      {viewMode === "portal" && (
        <div className="flex-1 pt-24 pb-12 font-sans max-w-7xl mx-auto px-6 lg:px-8 w-full">
          
          {/* Internal Portals System Health Info top */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs uppercase font-mono tracking-wider text-stone-400">
                Connected to Pastor Ken Studies Server
              </span>
            </div>
            <div className="hidden lg:flex items-center space-x-2 italic text-gold text-xs font-serif">
              <Quote size={12} />
              <span>&quot;Rightly dividing the word of truth.&quot; — 2 Timothy 2:15</span>
            </div>
          </div>

          {/* Tab directory selector, mobile only */}
          <div className="lg:hidden mb-6 text-left">
            <label className="text-xs uppercase font-mono tracking-wider text-stone-400 block mb-1">Select Study Panel</label>
            <select
              id="mobile-tab-selector"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as ActiveTabType)}
              className="w-full bg-ink-light border border-white/10 rounded-lg p-3 text-sm font-semibold text-white focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="sermons">Sermons & Outlines</option>
              <option value="books">Theological Ebooks</option>
              <option value="academy">Faith Academy</option>
              <option value="events">Events Calendar</option>
              <option value="resources">Handout Materials</option>
              <option value="live">Live Sanctuary</option>
              <option value="admin">Pastor Login Panel</option>
            </select>
          </div>

          {/* Dynamically Render Switched Components */}
          <div id="dynamic-portal-content" className="animate-fade-in duration-300">
            {activeTab === "sermons" && <SermonHub onSelectSermon={handleSelectSermonInHub} />}
            {activeTab === "books" && <TheologicalLibrary />}
            {activeTab === "academy" && <FaithAcademy />}
            {activeTab === "events" && <EventCalendar />}
            {activeTab === "resources" && <ResourceHub />}
            {activeTab === "live" && <LiveBroadcast />}
            {activeTab === "admin" && <AdminPanel />}
          </div>

        </div>
      )}


      {/* 5. FOOTER SECTION */}
      <footer className="border-t border-white/10 bg-black mt-16 text-left" data-testid="site-footer">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-gold/40 flex items-center justify-center bg-black/40">
                <span className="font-serif text-gold text-xl leading-none">ה</span>
              </div>
              <div className="font-serif text-xl tracking-wide">Intentional Living University</div>
            </div>
            <p className="text-white/60 max-w-sm font-light leading-relaxed text-sm">
              A global school of Hebraic studies, biblical languages, and ministry training led by Pastor Ken. Rooted in scripture. Forged in intention. Supporting local regional ministries since 2026.
            </p>
            <div className="text-[10px] text-white/40 font-mono flex items-center space-x-1">
              <Shield size={12} className="text-gold" />
              <span>Secure Server Active • Port 3000 Ingress</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-6 font-semibold">Campus Map</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <button onClick={handleExitPortal} className="hover:text-gold transition">
                  Welcome Main Campus
                </button>
              </li>
              <li>
                <button onClick={() => handleEnterPortal("sermons")} className="hover:text-gold transition flex items-center gap-1.5">
                  <span>Sermons Library</span>
                  <ExternalLink size={10} className="opacity-55" />
                </button>
              </li>
              <li>
                <button onClick={() => handleEnterPortal("books")} className="hover:text-gold transition flex items-center gap-1.5">
                  <span>Theological Books</span>
                  <ExternalLink size={10} className="opacity-55" />
                </button>
              </li>
              <li>
                <button onClick={() => handleEnterPortal("academy")} className="hover:text-gold transition flex items-center gap-1.5">
                  <span>Faith Academy Courses</span>
                  <ExternalLink size={10} className="opacity-55" />
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-6 font-semibold">Coordinates Contact</div>
            <ul className="space-y-3 text-sm text-white/70 font-mono">
              <li>hello@pastorken.edu</li>
              <li>Nairobi · Online Worldwide</li>
              <li className="pt-2">
                <button 
                  onClick={() => alert("Connecting helper support widget...")}
                  className="py-1.5 px-3 bg-white/5 hover:bg-white/15 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Contact Coordinator
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 gap-4">
            <div>
              © {new Date().getFullYear()} Intentional Living University · Pastor Ken studies.
            </div>
            <div className="font-mono text-white/20">
              בְּרֵאשִׁית ברא
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
