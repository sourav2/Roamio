import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, Bookmark } from 'lucide-react';
import roamioLogo from '../assets/images/roamio-logo.png';
import { Button, SearchInput } from '../components/ui';
import ManualPreferencesDrawer from '../components/ManualPreferencesDrawer';

/**
 * Roamio Default Entry Point Page
 * 
 * Strict visual match to authoritative Figma reference:
 * - Clean App Background (#FFFFFF)
 * - Top Header: Left "Roamio AI" branding + Right "Set preferences manually" trigger
 * - Centered Hero Experience:
 *   - AI-powered travel discovery badge (Secondary Accent #EBBA58)
 *   - H1: "Find your next escape.\nWe'll help you plan the rest." (Fraunces Display)
 *   - Subtitle: "Tell Roamio what you're looking for, and we'll find destinations that fit your time, budget, and travel style."
 *   - Search Field: Pill shape, natural language placeholder, microphone icon
 *   - Explore Button: Primary Accent #164A3A, Inter Medium 16px/22px
 * - Right Slide-Over: ManualPreferencesDrawer integration
 */
export default function HomePage({ setCurrentPage, onSearchQuery, filterState, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreferencesDrawerOpen, setIsPreferencesDrawerOpen] = useState(false);

  const handleExplore = (queryOrEvent) => {
    if (queryOrEvent && typeof queryOrEvent.preventDefault === 'function') {
      queryOrEvent.preventDefault();
    }
    const query = (typeof queryOrEvent === 'string' ? queryOrEvent : searchQuery).trim();
    if (onSearchQuery && query) {
      onSearchQuery(query);
    } else if (onSearchQuery) {
      onSearchQuery('Explore destinations');
    } else {
      setCurrentPage('results');
    }
  };

  const handleManualPreferencesClick = () => {
    setIsPreferencesDrawerOpen(true);
  };

  const handlePreferencesSearch = (prefs) => {
    console.log('[Roamio] Manual preferences submitted:', prefs);
    setIsPreferencesDrawerOpen(false);
    if (onFilterChange && prefs) {
      onFilterChange(prefs);
    }
    if (onSearchQuery) {
      onSearchQuery('Explore destinations');
    } else {
      setCurrentPage('results');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-roamio-body selection:bg-roamio-semantic-success-bg selection:text-roamio-primary-accent">

      {/* 1. TOP HEADER */}
      <header className="w-full px-6 sm:px-10 lg:px-16 py-6 flex items-center justify-between z-10">
        {/* Left: Roamio AI Branding / Logo */}
        <div
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="h-12 w-12 overflow-hidden rounded-xl shrink-0 flex items-center justify-start">
            <img
              src={roamioLogo}
              alt="Roamio AI Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <span className="roamio-h4 text-roamio-text-primary">
            Roamio AI
          </span>
        </div>

        {/* Right: Header actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleManualPreferencesClick}
            className="flex items-center gap-2 roamio-body-sm-medium text-roamio-text-primary hover:text-roamio-primary-accent transition-colors duration-150 cursor-pointer select-none"
          >
            <SlidersHorizontal className="h-4 w-4 text-roamio-text-primary shrink-0" />
            <span>Set preferences manually</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('saved')}
            className="inline-flex h-[46px] items-center gap-3 rounded-roamio-1 border border-roamio-btn-light bg-roamio-btn-light px-4 py-2 text-white shadow-roamio-xs transition hover:bg-roamio-btn-light-hover hover:border-roamio-btn-light-hover cursor-pointer select-none font-roamio-body roamio-body-sm-medium"
          >
            <Bookmark className="h-4 w-4 shrink-0 text-white" />
            <span className="roamio-body-sm-medium text-white">My Itineraries</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION (Vertically & Horizontally Centered) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto w-full -mt-10 sm:-mt-14 pb-8">

        {/* AI-powered travel discovery badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-roamio-accent-secondary text-roamio-text-primary roamio-body-xs shadow-2xs select-none mb-6">
          <Sparkles className="h-3.5 w-3.5 text-roamio-text-primary shrink-0" />
          <span>AI-powered travel discovery</span>
        </div>

        {/* Main H1 Headline (strictly 2 lines matching Figma reference) */}
        <h1 className="roamio-h2 text-roamio-text-highlight max-w-4xl">
          Find your next escape.<br />
          We'll help you plan the rest.
        </h1>

        {/* Supporting description (single line on desktop matching reference) */}
        <p className="roamio-body-sm text-roamio-text-secondary mt-3.5 max-w-3xl">
          Tell Roamio what you're looking for, and we'll find destinations that fit your time, budget, and travel style.
        </p>

        {/* Natural-language travel search field */}
        <div className="w-full max-w-2xl mt-8">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleExplore}
            placeholder='Try "3 days, under ₹10,000, adventure near Kolkata"'
            showSearchIcon={false}
          />
        </div>

        {/* Explore destinations button */}
        <Button
          variant="primary"
          onClick={handleExplore}
          className="mt-5"
        >
          Explore destinations
        </Button>

      </main>

      {/* Visual bottom balancing spacer */}
      <div className="h-6 sm:h-10"></div>

      {/* Manual Preferences Slide-Over Drawer */}
      <ManualPreferencesDrawer
        isOpen={isPreferencesDrawerOpen}
        onClose={() => setIsPreferencesDrawerOpen(false)}
        onSearch={handlePreferencesSearch}
        initialValues={filterState}
      />
    </div>
  );
}
