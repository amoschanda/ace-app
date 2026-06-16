import React, { useState, useEffect } from "react";
import { Sermon } from "../types.js";
import { Play, Video, ChevronRight, BookOpen, Music, Search, Calendar, User } from "lucide-react";

interface SermonHubProps {
  onSelectSermon: (sermon: Sermon) => void;
}

export default function SermonHub({ onSelectSermon }: SermonHubProps) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("All Series");
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/sermons")
      .then(res => res.json())
      .then(data => {
        setSermons(data);
        if (data.length > 0) {
          setActiveSermon(data[0]);
        }
      });
  }, []);

  const seriesOptions = ["All Series", ...Array.from(new Set(sermons.map(s => s.series)))];

  const filteredSermons = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase()) ||
                          s.speaker.toLowerCase().includes(search.toLowerCase());
    const matchesSeries = selectedSeries === "All Series" || s.series === selectedSeries;
    return matchesSearch && matchesSeries;
  });

  return (
    <div id="sermon-hub-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 columns - Active Sermon Player & Details */}
      <div className="lg:col-span-2 space-y-6">
        {activeSermon ? (
          <div id={`active-sermon-${activeSermon.id}`} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            {/* Player Area */}
            {activeSermon.videoUrl ? (
              <div className="aspect-video bg-black relative">
                <video 
                  id="active-sermon-video"
                  src={activeSermon.videoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1438243447756-33fcb71e1a3c?auto=format&fit=crop&q=80&w=800"
                />
              </div>
            ) : (
              <div className="bg-stone-900 text-stone-100 p-8 h-48 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="p-4 bg-amber-500/20 text-amber-400 rounded-full">
                    <Music size={32} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono tracking-wider text-stone-400">{activeSermon.series}</span>
                    <h3 className="text-xl font-medium text-white tracking-tight leading-snug">{activeSermon.title}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Stream Player (if audioUrl exists and is playing / not playing video) */}
            {activeSermon.audioUrl && (
              <div className="bg-stone-50 border-y border-stone-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-transform active:scale-95"
                  >
                    <Play size={16} />
                  </button>
                  <div>
                    <span className="text-xs text-stone-500 font-mono">Audio Broadcast</span>
                    <audio 
                      id="active-sermon-audio"
                      src={activeSermon.audioUrl} 
                      controls 
                      className="h-8 max-w-xs md:max-w-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sermon Metadata */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full uppercase tracking-wider border border-amber-200">
                    {activeSermon.series}
                  </span>
                  <h2 className="text-2xl font-serif font-semibold text-stone-900 mt-2 tracking-tight">
                    {activeSermon.title}
                  </h2>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div className="flex items-center space-x-1.5 border-r border-stone-300 pr-3">
                    <User size={14} />
                    <span>{activeSermon.speaker}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={14} />
                    <span>{activeSermon.date}</span>
                  </div>
                </div>
              </div>

              <p className="text-stone-600 leading-relaxed font-sans text-sm md:text-base">
                {activeSermon.description}
              </p>

              {/* Study Transcripts & Notes Section */}
              <div id="study-notes-transcript" className="border-t border-stone-200 pt-6">
                <div className="flex items-center space-x-2 text-stone-900 font-serif font-semibold text-lg mb-4">
                  <BookOpen size={20} className="text-amber-600" />
                  <h4>Sermon transcript & Study Outlines</h4>
                </div>
                <div className="bg-stone-50 rounded-xl p-5 md:p-6 border border-stone-200 prose prose-amber max-w-none">
                  <div className="text-stone-700 whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {activeSermon.notes ? activeSermon.notes : "No study outlines published for this sermon. Use the Study Resources hub to check for companion handouts."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
            Select a sermon to begin listening and reading notes.
          </div>
        )}
      </div>

      {/* Right Column - Directory / Filter Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h3 className="text-stone-900 font-serif font-semibold text-lg">Sermon Outlines Library</h3>

          {/* Search Outlines */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <input 
              id="sermon-search-input"
              type="text"
              placeholder="Search sermons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          {/* Series Filter */}
          <div className="space-y-1">
            <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block mb-1">Series Filter</label>
            <div className="flex flex-wrap gap-2">
              {seriesOptions.map(series => (
                <button
                  key={series}
                  onClick={() => setSelectedSeries(series)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedSeries === series 
                    ? "bg-amber-600 text-white" 
                    : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {series}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sermon Index Cards */}
        <div id="sermon-list-container" className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredSermons.length > 0 ? (
            filteredSermons.map(sermon => (
              <div 
                id={`sermon-card-${sermon.id}`}
                key={sermon.id}
                onClick={() => {
                  setActiveSermon(sermon);
                  setIsPlaying(false);
                  onSelectSermon(sermon);
                }}
                className={`p-4 rounded-xl border transition cursor-pointer text-left flex items-start justify-between group ${
                  activeSermon?.id === sermon.id
                  ? "bg-stone-800 text-stone-100 border-stone-800 shadow"
                  : "bg-white text-stone-800 border-stone-200 hover:bg-stone-50 hover:border-amber-400"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] py-0.5 px-2 rounded font-mono uppercase tracking-wider ${
                      activeSermon?.id === sermon.id
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-stone-50 text-stone-600 border border-stone-200"
                    }`}>
                      {sermon.series}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">{sermon.date}</span>
                  </div>
                  <h4 className="font-medium text-sm leading-snug pr-2 group-hover:text-amber-500 transition-colors">
                    {sermon.title}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${activeSermon?.id === sermon.id ? "text-stone-300" : "text-stone-500"}`}>
                    {sermon.description}
                  </p>
                </div>
                <div className={`p-1.5 rounded-lg shrink-0 mt-3 ${
                  activeSermon?.id === sermon.id
                  ? "bg-stone-700 text-amber-400"
                  : "bg-stone-50 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600"
                } transition`}>
                  {sermon.videoUrl ? <Video size={16} /> : <Play size={16} />}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-8 text-center text-stone-400 text-sm">
              No matching sermons found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
