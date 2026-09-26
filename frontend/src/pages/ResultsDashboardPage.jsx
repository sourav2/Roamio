import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import FiltersPanel from '../components/FiltersPanel';
import MiddleDiscoverySection from '../components/discovery/MiddleDiscoverySection';
import RightSidePanel from '../components/RightSidePanel';
import { DEFAULT_FILTER_STATE } from '../config/filterConfig';
import { fetchRecommendedDestinations, getDiscoveryMetrics } from '../services/recommendationService';
import { TimeoutWarningBanner } from '../components/skeleton/DashboardSkeleton';

/**
 * Roamio Results Dashboard Page
 * 
 * Desktop 3-Column Architecture:
 * ┌───────────────────────────────────────────────────────────────┐
 * │                         HEADER                                │
 * ├───────────────┬───────────────────────────────┬───────────────┤
 * │               │                               │               │
 * │ LEFT FILTERS  │     MIDDLE DISCOVERY          │ RIGHT PANEL   │
 * │               │                               │               │
 * │               │ Destination Summary           │ Itinerary /   │
 * │               │ Metrics                       │ Budget        │
 * │               │ Map                           │               │
 * │               │ Suggested Destinations        │               │
 * │               └───────────────────────────────┴───────────────┘
 */
export default function ResultsDashboardPage({
  setCurrentPage,
  onNavigateSaved,
  onSavePlan,
  onSearchQuery,
  onNavigateToDestination,
  filterState: controlledFilterState,
  onFilterChange,
  destinationsByDay,
  onRemoveDestination,
  selectedDay,
  onSelectDay,
}) {
  const [internalFilterState, setInternalFilterState] = useState(DEFAULT_FILTER_STATE);
  const activeFilters = controlledFilterState || internalFilterState;

  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Monitor loading duration for optional timeout alert banner matching Figma
  useEffect(() => {
    let timer = null;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 4500);
    } else {
      setShowTimeoutWarning(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  const handleFilterUpdate = (updated) => {
    setInternalFilterState((prev) => ({ ...prev, ...updated }));
    if (onFilterChange) onFilterChange(updated);
  };

  const executeSearch = (filtersToUse = activeFilters) => {
    // 1. Check if an input has unselected typed text currently pending
    const isLocationPending = Boolean(filtersToUse.locationTyped && !filtersToUse.location);
    const isDestinationPending = Boolean(
      filtersToUse.destinationTyped &&
      filtersToUse.destinationTyped.trim().toLowerCase() !== 'any destination' &&
      !filtersToUse.destination
    );

    if (isLocationPending || isDestinationPending) {
      console.log('[ResultsDashboard] Skipping recommendation fetch: unselected text pending in inputs');
      return;
    }

    // 2. Must have at least a location, destination, or region
    const hasOrigin = Boolean(filtersToUse.location && filtersToUse.location.trim());
    const hasDest = Boolean(filtersToUse.destination && filtersToUse.destination.trim() && filtersToUse.destination.trim().toLowerCase() !== 'any destination');
    const hasRegion = Boolean(filtersToUse.region && filtersToUse.region.trim());

    if (!hasOrigin && !hasDest && !hasRegion) {
      console.log('[ResultsDashboard] Skipping recommendation fetch: no location or destination provided');
      return;
    }

    setIsLoading(true);
    setShowTimeoutWarning(false);

    fetchRecommendedDestinations(filtersToUse)
      .then((results) => {
        setDestinations(results || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[ResultsDashboard] Error fetching backend recommendations:', err);
        setDestinations([]);
        setIsLoading(false);
      });
  };

  // Initial mount search only
  useEffect(() => {
    executeSearch(activeFilters);
  }, []);

  const discoveryMetrics = getDiscoveryMetrics(activeFilters, destinations);

  return (
    <div className="min-h-screen bg-roamio-bg-app flex flex-col font-roamio-body text-roamio-text-primary">
      
      {/* 1. DASHBOARD HEADER */}
      <DashboardHeader
        onNavigateHome={() => setCurrentPage && setCurrentPage('home')}
        onSearch={async (q) => {
          console.log('[ResultsDashboard] AI Search submitted:', q);
          if (onSearchQuery) {
            await onSearchQuery(q);
            executeSearch(activeFilters);
          }
        }}
        onNavigateSaved={onNavigateSaved}
      />

      {/* 2. MAIN 3-COLUMN DASHBOARD CONTENT */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-roamio-4 sm:px-roamio-6 py-roamio-5">
        
        {/* Optional Timeout Warning Alert (Figma Reference Top Banner) */}
        {isLoading && showTimeoutWarning && (
          <div className="mb-4">
            <TimeoutWarningBanner onCancel={() => setIsLoading(false)} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-roamio-4 items-start w-full">
          
          {/* COLUMN 1: LEFT FILTERS PANEL */}
          <FiltersPanel
            title="Filters"
            submitLabel="Find Destination"
            isCard={true}
            initialValues={activeFilters}
            onChange={handleFilterUpdate}
            onReset={handleFilterUpdate}
            className="w-full lg:w-[320px] xl:w-[340px] shrink-0"
            onSubmit={(filters) => {
              console.log('[ResultsDashboard] Find Destination clicked:', filters);
              handleFilterUpdate(filters);
              executeSearch(filters);
            }}
          />

          {/* COLUMN 2: MIDDLE DISCOVERY SECTION */}
          <MiddleDiscoverySection
            startCity={activeFilters.location || null}
            destinationTitle={activeFilters.destination}
            travellerCount={activeFilters.travellerCount}
            duration={activeFilters.duration}
            budget={activeFilters.budget}
            destinations={destinations}
            metrics={discoveryMetrics}
            isLoading={isLoading}
            className="flex-1 w-full min-w-0"
            onDestinationSelect={(dest) => {
              if (onNavigateToDestination) {
                onNavigateToDestination(dest);
              }
            }}
            onViewAll={() => console.log('[ResultsDashboard] View all clicked')}
          />

          {/* COLUMN 3: RIGHT ITINERARY / BUDGET PANEL */}
          <RightSidePanel
            tripDuration={activeFilters.duration}
            travellerCount={activeFilters.travellerCount}
            selectedDay={selectedDay}
            onSelectDay={onSelectDay}
            destinationsByDay={destinationsByDay}
            onRemoveDestination={onRemoveDestination}
            isLoading={isLoading}
            className="w-full lg:w-[360px] xl:w-[380px] shrink-0"
            onReviewPlan={() => onSavePlan?.({
              filters: activeFilters,
              destinationsByDay,
            })}
            onViewBreakdown={() => console.log('[ResultsDashboard] View breakdown clicked')}
            onAddMoreDestinations={() => console.log('[ResultsDashboard] Add more destinations clicked')}
          />

        </div>
      </main>

    </div>
  );
}
