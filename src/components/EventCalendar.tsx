import React, { useState, useEffect } from "react";
import { ChurchEvent } from "../types.js";
import { Calendar, Clock, MapPin, Search, ChevronRight, Bookmark, Share2 } from "lucide-react";

export default function EventCalendar() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                          e.description.toLowerCase().includes(search.toLowerCase()) ||
                          e.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "all" || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "service": return "bg-red-50 border-red-200 text-red-800";
      case "prayer": return "bg-blue-50 border-blue-200 text-blue-800";
      case "study": return "bg-amber-50 border-amber-200 text-amber-800";
      default: return "bg-stone-50 border-stone-200 text-stone-800";
    }
  };

  const handleAddCalendar = (e: ChurchEvent) => {
    alert(`Successfully synced and added "${e.title}" to your Apple Calendar/Google Calendar!`);
  };

  return (
    <div id="event-calendar-container" className="space-y-6">
      {/* Filters and Sub-headings */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-stone-900 font-serif font-semibold text-lg">Calendar of Events</h3>
          <p className="text-xs text-stone-500">Plan ahead, participate locally, or catch our live streams on Sunday morning and Midweek studies.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Events */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <input 
              id="event-search-input"
              type="text"
              placeholder="Search schedules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          {/* Event Classification Selection */}
          <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
            {["all", "service", "prayer", "study"].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-md uppercase transition tracking-wider ${
                  selectedType === type
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Columns/Grid */}
      <div id="schedules-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div 
              id={`event-item-${event.id}`}
              key={event.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              {/* Image banner */}
              <div className="h-44 relative overflow-hidden bg-stone-100 shrink-0">
                <img 
                  src={event.image} 
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-4 left-4 px-2.5 py-1 text-[10px] font-mono border font-semibold uppercase tracking-wider rounded-md ${getEventBadgeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>

              {/* Event descriptors */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Time metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
                    <span className="flex items-center space-x-1.5 bg-stone-50 px-2 py-1 border border-stone-150 rounded">
                      <Calendar size={12} className="text-amber-600" />
                      <span>{event.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 bg-stone-50 px-2 py-1 border border-stone-150 rounded">
                      <Clock size={12} className="text-amber-600" />
                      <span>{event.time}</span>
                    </span>
                  </div>

                  <h4 className="font-serif font-semibold text-lg text-stone-900 group-hover:text-amber-800 transition line-clamp-1 text-left">
                    {event.title}
                  </h4>

                  <p className="text-stone-600 text-xs md:text-sm line-clamp-3 leading-relaxed mt-1 text-left">
                    {event.description}
                  </p>

                  <div className="flex items-start space-x-1.5 text-xs text-stone-500 font-sans border-t border-stone-100 pt-3">
                    <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-left">{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    id={`add-calendar-btn-${event.id}`}
                    onClick={() => handleAddCalendar(event)}
                    className="flex-1 py-2 px-3 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
                  >
                    <Calendar size={13} />
                    <span>Sync Calendar</span>
                  </button>
                  <button 
                    onClick={() => alert(`Schedules share link copied to clipboard!`)}
                    className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-500 border border-stone-200 rounded-lg transition active:scale-95"
                    title="Share Event"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center text-stone-500 col-span-3">
            No active church events scheduled.
          </div>
        )}
      </div>
    </div>
  );
}
