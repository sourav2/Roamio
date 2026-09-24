import React, { useState } from 'react';
import { Bookmark, Compass } from 'lucide-react';
import ItineraryCard from '../components/ItineraryCard';

export default function SavedTripsPage({ savedTrips, onDeleteTrip, onSelectTrip, onContinuePlanning, setCurrentPage }) {
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  const handleSelect = (trip) => {
    setSelectedTripDetails(trip);
  };

  const handleCloseDetails = () => {
    setSelectedTripDetails(null);
  };

  const handleLoadInWorkspace = (trip) => {
    if (onContinuePlanning) {
      onContinuePlanning(trip);
      return;
    }
    onSelectTrip(trip);
    setCurrentPage('results');
  };

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-travel-accent-gray pb-5">
        <h1 className="font-display text-2xl font-extrabold text-travel-text-primary">Saved Journeys</h1>
        <p className="text-2xs text-travel-text-muted mt-1.5">Your catalog of curated travel schedules, budget plans, and routing choices.</p>
      </div>

      {savedTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-travel-accent-gray rounded-2xl bg-travel-bg-white p-8 max-w-md mx-auto">
          <Bookmark className="h-12 w-12 text-travel-text-muted opacity-40 mb-4" />
          <h3 className="text-sm font-bold text-travel-text-primary mb-1.5">No Saved Trips Yet</h3>
          <p className="text-2xs text-travel-text-muted mb-6 leading-relaxed">
            Generate custom travel guides using the AI Planner and tap "Save Trip" to store them in your collection.
          </p>
          <button
            onClick={() => setCurrentPage('planner')}
            className="btn-premium btn-premium-primary"
          >
            Start Planning
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* List Section */}
          <div className="lg:col-span-1 space-y-4">
            <span className="text-3xs font-bold uppercase tracking-wider text-travel-text-muted block px-1">
              Active Saved Plans ({savedTrips.length})
            </span>
            <div className="space-y-3">
              {savedTrips.map((trip) => (
                <ItineraryCard
                  key={trip.id}
                  itinerary={trip}
                  onCardClick={handleSelect}
                  onDelete={(selectedTrip) => {
                    if (selectedTripDetails?.id === selectedTrip.id) setSelectedTripDetails(null);
                    onDeleteTrip(selectedTrip.id);
                  }}
                  onContinuePlanning={handleLoadInWorkspace}
                />
              ))}
            </div>
          </div>

          {/* Details Preview Section */}
          <div className="lg:col-span-2">
            {selectedTripDetails ? (
              <div className="space-y-6">
                <ItineraryCard
                  itinerary={selectedTripDetails}
                  onContinuePlanning={handleLoadInWorkspace}
                />

                <div className="rounded-2xl border border-travel-accent-gray bg-travel-bg-white p-6 shadow-premium space-y-6">
                
                {/* Preview Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-travel-accent-gray pb-5">
                  <div>
                    <span className="text-3xs font-bold uppercase tracking-wider text-travel-button-dark bg-travel-accent-gray px-2.5 py-1 rounded">
                      Collection Preview
                    </span>
                    <h2 className="text-lg font-bold text-travel-text-primary mt-2">
                      Trip to {selectedTripDetails.destination}
                    </h2>
                    <p className="text-2xs text-travel-text-muted mt-0.5">
                      Curated itinerary breakdown and daily routes.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadInWorkspace(selectedTripDetails)}
                      className="btn-premium btn-premium-primary"
                    >
                      Load in AI Workspace
                    </button>
                    <button
                      onClick={handleCloseDetails}
                      className="btn-premium btn-premium-secondary"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>

                {/* Regional overview list */}
                <div className="space-y-4">
                  <h3 className="text-2xs font-bold uppercase tracking-wider text-travel-text-muted">
                    Regions Covered ({selectedTripDetails.regions?.length || 0})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTripDetails.regions?.map((reg, idx) => (
                      <div key={idx} className="rounded-xl border border-travel-accent-gray p-4 bg-travel-bg-gray">
                        <h4 className="text-2xs font-bold text-travel-text-primary mb-1">
                          {reg.region_name}
                        </h4>
                        <p className="text-3xs text-travel-text-muted leading-relaxed mb-3">
                          {reg.quick_summary}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-3xs text-travel-text-secondary border-t border-travel-accent-gray/60 pt-2">
                          <div>
                            <span className="font-semibold block text-travel-text-muted">Transport</span>
                            <span className="capitalize">{reg.transport}</span>
                          </div>
                          <div>
                            <span className="font-semibold block text-travel-text-muted">Stay Type</span>
                            <span className="capitalize">{reg.hotel_type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-travel-accent-gray bg-travel-bg-white rounded-2xl p-8">
                <Compass className="h-10 w-10 text-travel-text-muted opacity-40 mb-3 animate-spin-slow" />
                <h3 className="text-xs font-bold text-travel-text-primary mb-1">Select a Trip</h3>
                <p className="text-2xs text-travel-text-muted max-w-xs">
                  Click any plan in your saved collections on the left sidebar to preview its details.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
