import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import roamioLogo from '../assets/images/Roamio-Logo.png';
import { SearchInput } from './ui';

/**
 * Roamio Results Dashboard Header
 * 
 * Strict Roamio Design System Token Compliance & Figma Alignment:
 * - Left: Roamio logo + "Roamio AI" display branding
 * - Center: Persistent AI search input using shared SearchInput with voice dictation
 * - Right: Profile / Account icon
 */
export default function DashboardHeader({
  onSearch,
  onNavigateHome,
  onNavigateSaved,
  className = "",
}) {
  const [query, setQuery] = useState('');

  const handleSearch = (searchTerm) => {
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header className={`w-full bg-roamio-bg-secondary border-b border-roamio-border-light px-roamio-6 py-roamio-3 ${className}`.trim()}>
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-roamio-4">
        
        {/* LEFT: Branding */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 hover:opacity-90 transition cursor-pointer select-none shrink-0"
          aria-label="Roamio Home"
        >
          <img
            src={roamioLogo}
            alt="Roamio Logo"
            className="w-12 h-12 rounded-roamio-1 object-contain"
          />
          <span className="roamio-h4 text-roamio-text-primary">
            Roamio AI
          </span>
        </button>

        {/* CENTER: Persistent AI Search Bar with Voice Dictation */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={handleSearch}
            placeholder="Ask anything... (e.g. 2-day adventure trip near Kolkata under ₹8000)"
            inputClassName="bg-white shadow-2xs"
            showSearchIcon={true}
          />
        </div>

        {/* RIGHT: Saved itineraries */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNavigateSaved}
            className="inline-flex h-[46px] items-center gap-3 rounded-roamio-1 border border-roamio-btn-light bg-roamio-btn-light px-4 py-2 text-white shadow-roamio-xs transition hover:bg-roamio-btn-light-hover hover:border-roamio-btn-light-hover cursor-pointer select-none font-roamio-body roamio-body-sm-medium"
          >
            <Bookmark className="h-4 w-4 shrink-0 text-white" />
            <span className="roamio-body-sm-medium text-white">My Itineraries</span>
          </button>
        </div>

      </div>
    </header>
  );
}
