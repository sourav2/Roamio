import React, { useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, Plus, Search } from 'lucide-react';
import roamioLogo from '../assets/images/roamio-logo.png';
import ItineraryCard from '../components/ItineraryCard';

export default function RoamioMyItinerariesPage({
  savedTrips = [],
  onDeleteTrip,
  onContinuePlanning,
  onCreateTrip,
  onBack,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return savedTrips;

    return savedTrips.filter((trip) => {
      const searchableValues = [
        trip.title,
        trip.trip_name,
        trip.destination,
        trip.start_location,
        ...(trip.route || []),
      ];
      return searchableValues.some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [savedTrips, searchQuery]);

  return (
    <div className="min-h-screen bg-roamio-bg-app font-roamio-body text-roamio-text-primary">
      <header className="border-b border-roamio-border-light bg-roamio-bg-secondary">
        <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onCreateTrip}
            className="flex shrink-0 items-center gap-2.5 text-left text-roamio-text-primary"
            aria-label="Roamio Home"
          >
            <img
              src={roamioLogo}
              alt="Roamio AI"
              className="h-12 w-12 rounded-roamio-1 object-contain"
            />
            <span className="roamio-h4">Roamio AI</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-roamio-text-tertiary" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Itineraries..."
                aria-label="Search Itineraries"
                className="h-9 w-44 rounded-roamio-2 border border-roamio-border-light bg-white pl-9 pr-3 text-xs text-roamio-text-primary outline-none transition focus:border-roamio-primary-accent focus:ring-1 focus:ring-roamio-primary-accent sm:w-52"
              />
            </label>
            <button
              type="button"
              onClick={onCreateTrip}
              className="inline-flex h-9 items-center gap-1.5 rounded-roamio-2 border border-roamio-primary-accent bg-white px-3 text-xs font-medium text-roamio-primary-accent transition hover:bg-roamio-semantic-success-bg"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Trip</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1720px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="mb-7">
          <button
            type="button"
            onClick={onBack}
            className="mb-1 inline-flex items-center gap-2 text-roamio-text-secondary transition hover:text-roamio-primary-accent"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="roamio-h2 text-roamio-text-primary">My Itineraries</span>
          </button>
          <p className="ml-6 text-xs text-roamio-text-secondary">
            Your saved trips, ready to pick up whenever you're ready.
          </p>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <ItineraryCard
                key={trip.id}
                itinerary={trip}
                onDelete={onDeleteTrip ? () => onDeleteTrip(trip.id) : null}
                onContinuePlanning={onContinuePlanning}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-roamio-2 border border-dashed border-roamio-border-light bg-white px-6 text-center">
            {searchQuery ? (
              <>
                <Search className="mb-3 h-8 w-8 text-roamio-text-tertiary" />
                <h2 className="roamio-h6 text-roamio-text-primary">No itineraries found</h2>
                <p className="mt-1 text-xs text-roamio-text-secondary">Try a different itinerary, destination, or route.</p>
              </>
            ) : (
              <>
                <Bookmark className="mb-3 h-8 w-8 text-roamio-text-tertiary" />
                <h2 className="roamio-h6 text-roamio-text-primary">No saved itineraries yet</h2>
                <p className="mt-1 text-xs text-roamio-text-secondary">Create a trip and save your plan to see it here.</p>
                <button
                  type="button"
                  onClick={onCreateTrip}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-roamio-2 bg-roamio-primary-accent px-3 py-2 text-xs font-medium text-white transition hover:bg-roamio-primary-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Trip
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
