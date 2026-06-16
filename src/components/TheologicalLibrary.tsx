import React, { useState, useEffect } from "react";
import { Book } from "../types.js";
import { Search, BookOpen, Download, Bookmark, Layers, FileText } from "lucide-react";

export default function TheologicalLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => {
    fetch("/api/books")
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const categories = ["All Categories", ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.author.toLowerCase().includes(search.toLowerCase()) ||
                          b.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All Categories" || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="theology-library-layout" className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-stone-900 font-serif font-semibold text-lg">Theological Library</h3>
          <p className="text-xs text-stone-500">Access theological handbooks, study manuals, and spiritual guides published by Pastor Ken.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
            <input 
              id="library-search-input"
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-600 transition"
            />
          </div>
          {/* Category Dropdown */}
          <div className="relative">
            <select
              id="library-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-amber-600 transition cursor-pointer text-stone-700"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
              <Layers size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div id="library-book-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div 
              id={`book-item-${book.id}`}
              key={book.id} 
              className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow group"
            >
              {/* Book Cover */}
              <div className="w-full sm:w-32 h-44 bg-stone-100 rounded-xl overflow-hidden shadow-sm shrink-0 relative">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-amber-600 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition">
                  <Bookmark size={12} />
                </div>
              </div>

              {/* Book Info */}
              <div className="flex flex-col justify-between flex-1 py-1 space-y-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-stone-50 text-stone-600 text-[10px] font-mono rounded border border-stone-200">
                      {book.category}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono flex items-center space-x-1">
                      <FileText size={10} />
                      <span>{book.pages} pages</span>
                    </span>
                  </div>
                  <h4 className="font-serif font-semibold text-lg text-stone-900 group-hover:text-amber-700 transition">
                    {book.title}
                  </h4>
                  <span className="text-xs text-stone-500 font-mono">By {book.author}</span>
                  <p className="text-stone-600 text-xs md:text-sm line-clamp-3 leading-relaxed mt-2">
                    {book.description}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <a 
                    id={`download-book-btn-${book.id}`}
                    href={book.downloadUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Successfully simulated download of ${book.title}!`);
                    }}
                    className="flex-1 py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </a>
                  <button 
                    id={`read-preview-btn-${book.id}`}
                    onClick={() => alert(`Opening digital reader preview for ${book.title}...`)}
                    className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg transition active:scale-95"
                    title="Read Preview"
                  >
                    <BookOpen size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center text-stone-500 col-span-2">
            No theological books found matching search filters.
          </div>
        )}
      </div>
    </div>
  );
}
