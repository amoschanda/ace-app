import React, { useState, useEffect, useRef } from "react";
import { Play, Send, Heart, Eye, Users, ShieldAlert, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  isPastor?: boolean;
}

interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  votes: number;
}

export default function LiveBroadcast() {
  const [likes, setLikes] = useState(48);
  const [chatMessage, setChatMessage] = useState("");
  const [spectators, setSpectators] = useState(112);
  const [isLive, setIsLive] = useState(true);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", name: "Brother Thomas", message: "Greetings from London, UK! Ready for the Word.", timestamp: "10:02 AM" },
    { id: "2", name: "Sister Maria", message: "Amen! The Lord is indeed faithful in times of testing.", timestamp: "10:03 AM" },
    { id: "3", name: "Pastor Ken", message: "Welcome saints! Prepare your hearts today. Open Ephesians 6.", isPastor: true, timestamp: "10:04 AM" },
    { id: "4", name: "David M.", message: "This series on Nehemiah has blessed my business administration.", timestamp: "10:05 AM" },
    { id: "5", name: "Grace O.", message: "Thank you Pastor Ken, we are watching with the whole family.", timestamp: "10:06 AM" }
  ]);

  const [prayers, setPrayers] = useState<PrayerRequest[]>([
    { id: "p1", name: "Sister Sarah", request: "Healing prayer for my mother dealing with severe lung recovery.", votes: 12 },
    { id: "p2", name: "Brother Michael", request: "Guidance on opening our regional Bible study cell group.", votes: 8 }
  ]);

  const [inputPrayerName, setInputPrayerName] = useState("");
  const [inputPrayerRequest, setInputPrayerRequest] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Simulate incoming community chat messages
  useEffect(() => {
    const names = ["Elijah K.", "Miriam G.", "Hannah S.", "Joseph T.", "Andrew P.", "Ruth V."];
    const phrasings = [
      "Hallelujah, praise the King!",
      "My strength is in the Lord today.",
      "Greetings the saints from Dublin!",
      "Putting on the breastplate of righteousness!",
      "Beautiful service, wonderful worship.",
      "Praying for families starting new semesters today."
    ];

    const timer = setInterval(() => {
      const randName = names[Math.floor(Math.random() * names.length)];
      const randPhrase = phrasings[Math.floor(Math.random() * phrasings.length)];
      setChatMessages(prev => [
        ...prev,
        {
          id: "sim-" + Date.now(),
          name: randName,
          message: randPhrase,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setSpectators(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: "user-" + Date.now(),
        name: "Me (Member)",
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatMessage("");
  };

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrayerName.trim() || !inputPrayerRequest.trim()) return;

    setPrayers(prev => [
      ...prev,
      {
        id: "prayer-" + Date.now(),
        name: inputPrayerName,
        request: inputPrayerRequest,
        votes: 1
      }
    ]);
    setInputPrayerName("");
    setInputPrayerRequest("");
    alert("Hallelujah! Your prayer request has been placed on the Interactive Congregation Prayer Wall!");
  };

  const handleVotePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));
  };

  return (
    <div id="live-broadcast-layout" className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Dynamic Video Broadcast & Outline Panel (Left 3 Columns) */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
          {/* Header metadata bar */}
          <div className="p-4 bg-stone-950 text-stone-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500">LIVE</span>
              <h2 className="text-sm font-semibold text-white tracking-tight leading-none truncate md:max-w-md">
                Sunday Morning Communion & Sermon Broadcast
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-stone-400">
              <span className="flex items-center space-x-1">
                <Users size={12} className="text-amber-500" />
                <span>{spectators} watching</span>
              </span>
            </div>
          </div>

          {/* Video stream container */}
          <div className="aspect-video bg-black relative">
            <video 
              id="live-broacast-video-player"
              src="https://www.w3schools.com/html/mov_bbb.mp4" 
              controls 
              autoPlay
              muted
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1438243447756-33fcb71e1a3c?auto=format&fit=crop&q=80&w=800"
            />
          </div>

          {/* User interaction toolbar */}
          <div className="p-4 bg-stone-900 border-t border-stone-850 flex items-center justify-between text-stone-300">
            <p className="text-xs font-sans text-stone-400">Speaker: <strong className="text-stone-200">Pastor Ken</strong> • Sermon focus: <span className="text-amber-400">Nehemiah & Ephesians Series</span></p>
            <div className="flex items-center space-x-3">
              <button 
                id="live-heart-button"
                onClick={() => setLikes(likes + 1)}
                className="flex items-center space-x-1 bg-stone-800 hover:bg-stone-750 text-xs px-3 py-1.5 rounded-full border border-stone-700 transition"
              >
                <Heart size={14} className="text-red-500 fill-red-500" />
                <span>{likes}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sermon Live Interactive notes */}
        <div id="live-sermon-notes-board" className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-stone-900 font-serif font-black text-lg border-b border-stone-155 pb-3">
            <Sparkles size={18} className="text-amber-500" />
            <h3>Sermon Study outline (Live Updates)</h3>
          </div>
          <div className="prose prose-stone max-w-none text-left space-y-4 text-sm text-stone-700 leading-relaxed">
            <p className="font-semibold text-stone-900">Current Theme: Facing Sanballats with Prayer and Persistence (Nehemiah 4)</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>The Constructive Mindset:</strong> Nehemiah did not enter arguments. He secured the materials, prioritized the builders, and built guards.</li>
              <li><strong>The Altar & Assembly:</strong> Prayer is the shield, but active collaboration to support weak points is the muscle (Nehemiah 4:14).</li>
              <li><strong>Sanballat Metaphors today:</strong> Distractions that attempt to pull us off the wall we are building. Resist by telling them: <em>\"I am doing a great work, and I cannot come down.\" (Nehemiah 6:3)</em></li>
            </ul>
          </div>
        </div>

        {/* Dynamic Prayer Wall */}
        <div id="prayer-wall" className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="font-serif font-black text-lg text-stone-900 border-b border-stone-100 pb-3 text-left">
            Interactive Congregation Prayer Wall
          </h3>
          <p className="text-xs text-stone-500 mb-4 text-left">Post urgent prayer requests. As other members view the wall, they can check \"Agree in Prayer\" to join forces.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Form */}
            <form onSubmit={handleAddPrayer} className="md:col-span-1 bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-bold text-stone-800 text-left">Submit Prayer Request</p>
                <div>
                  <input 
                    id="prayer-sender-name"
                    type="text" 
                    placeholder="Your Name (e.g. Sarah K.)"
                    value={inputPrayerName}
                    onChange={(e) => setInputPrayerName(e.target.value)}
                    required
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                  />
                </div>
                <div>
                  <textarea 
                    id="prayer-sender-request"
                    placeholder="Describe your request..."
                    value={inputPrayerRequest}
                    onChange={(e) => setInputPrayerRequest(e.target.value)}
                    required
                    rows={4}
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                  />
                </div>
              </div>
              <button 
                id="submit-prayer-request-btn"
                type="submit"
                className="w-full mt-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>Post on Wall</span>
              </button>
            </form>

            {/* Current Requests */}
            <div id="prayer-cards-list" className="md:col-span-2 space-y-3 overflow-y-auto max-h-72 pr-1">
              {prayers.map(p => (
                <div key={p.id} className="p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-400 transition flex items-start justify-between text-left">
                  <div className="space-y-1.5 pr-4">
                    <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      Prayer Request
                    </span>
                    <h5 className="text-xs font-bold text-stone-900">{p.name}</h5>
                    <p className="text-xs text-stone-700 leading-relaxed">{p.request}</p>
                  </div>
                  <button 
                    id={`agree-prayer-btn-${p.id}`}
                    onClick={() => handleVotePrayer(p.id)}
                    className="py-1.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[10px] font-bold text-stone-700 rounded-lg transition shrink-0 flex items-center space-x-1"
                  >
                    <span>Agree ({p.votes})</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Congregational Chat Sidebar (Right Column) */}
      <div id="live-chat-sidebar" className="xl:col-span-1 bg-stone-950 border border-stone-900 rounded-2xl flex flex-col justify-between h-[600px] overflow-hidden shadow-xl">
        {/* Chat Header */}
        <div className="p-4 bg-stone-900 border-b border-stone-850 flex items-center justify-between text-stone-100 shrink-0">
          <span className="text-xs font-mono font-bold text-stone-100 flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span>CONGREGATION CHAT</span>
          </span>
          <span className="text-[10px] text-stone-400 font-mono">Real-time</span>
        </div>

        {/* Chat message display area */}
        <div id="live-chat-messages-container" className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[460px]">
          {chatMessages.map(msg => (
            <div key={msg.id} className="text-left space-y-0.5 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className={`font-bold ${
                  msg.isPastor ? "text-amber-400" : "text-stone-300"
                }`}>
                  {msg.name}
                </span>
                {msg.isPastor && (
                  <span className="text-[9px] uppercase font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded">
                    Staff
                  </span>
                )}
                <span className="text-[9px] text-stone-500 font-mono">{msg.timestamp}</span>
              </div>
              <p className="text-stone-400 leading-relaxed break-words bg-stone-900 p-2 rounded-lg border border-stone-850 mt-1 max-w-full">
                {msg.message}
              </p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendChat} className="p-3 bg-stone-900 border-t border-stone-850 flex items-stretch space-x-2 shrink-0">
          <input 
            id="live-chat-message-input"
            type="text"
            placeholder="Type your message of faith..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            className="flex-1 bg-stone-950 border border-stone-800 text-stone-100 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
          />
          <button 
            id="send-chat-message-btn"
            type="submit"
            className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition active:scale-95 flex items-center justify-center shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
