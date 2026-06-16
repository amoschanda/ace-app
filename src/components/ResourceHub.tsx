import React, { useState, useEffect } from "react";
import { StudyResource } from "../types.js";
import { Search, Download, FileText, FolderOpen, Tag, Info } from "lucide-react";

export default function ResourceHub() {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("/api/resources")
      .then(res => res.json())
      .then(data => setResources(data));
  }, []);

  const categories = ["All", ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                          r.description.toLowerCase().includes(search.toLowerCase()) ||
                          r.fileType.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="resource-hub-container" className="space-y-6">
      {/* Search and Category bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-stone-900 font-serif font-semibold text-lg">Study Handouts & Resources</h3>
          <p className="text-xs text-stone-500">Download study sheets, lecture guidelines, templates, and worksheets directly to your computer.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search outlines */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <input 
              id="resource-search-input"
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          {/* Categories Selector */}
          <div className="relative">
            <select
              id="resource-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-amber-600 transition cursor-pointer text-stone-700"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
              <Tag size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Worksheets */}
      <div id="resources-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length > 0 ? (
          filteredResources.map(res => (
            <div 
              id={`resource-item-${res.id}`}
              key={res.id}
              className="bg-white rounded-xl border border-stone-200 p-5 flex items-start space-x-4 hover:border-amber-400 transition group"
            >
              <div className="p-3 bg-stone-100 group-hover:bg-amber-50 group-hover:text-amber-700 text-stone-600 rounded-lg transition shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex-1 space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-150 rounded text-[10px] font-mono font-medium">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {res.fileType} • {res.fileSize}
                  </span>
                </div>
                <h4 className="font-serif font-semibold text-stone-900 group-hover:text-amber-800 transition text-sm md:text-base leading-tight">
                  {res.title}
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {res.description}
                </p>

                <div className="pt-2">
                  <a
                    id={`download-resource-btn-${res.id}`}
                    href={res.downloadUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Successfully simulated download of study companion "${res.title}"!`);
                    }}
                    className="inline-flex items-center space-x-1.5 py-1.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition active:scale-95"
                  >
                    <Download size={12} />
                    <span>Download Resource</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center text-stone-500 col-span-2">
            No companion resources found matching criteria.
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-start space-x-3 text-stone-600 text-xs text-left max-w-xl mx-auto">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Note about file availability:</strong> All published handouts are encrypted and secured under modern SSL layers. If you require specialized formats (such as raw PPTX or Keynote slides), contact Pastor Ken directly through the email administration channel.
        </p>
      </div>
    </div>
  );
}
