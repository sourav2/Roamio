import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import RightSidePanel from '../components/RightSidePanel';
import DestinationMap from '../components/destination/DestinationMap';
import DestinationInfoCards from '../components/destination/DestinationInfoCards';
import ExperienceCard from '../components/destination/ExperienceCard';
import ExperienceDetailModal from '../components/destination/ExperienceDetailModal';
import DaySelectionModal from '../components/destination/DaySelectionModal';
import { getDestinationById } from '../data/destinationsData';
import { forceUnlockScroll } from '../components/ui/Modal';
import { travelApi } from '../services/api';
import { geocodingService } from '../services/maps/geocodingService';

/**
 * Format a destination object into standard structure required by DestinationDetailPage
 */
function formatDestinationData(dest) {
  if (!dest) return null;
  const coords = dest.coords || dest.coordinates || null;
  const name = dest.name || 'Destination';
  const location = dest.location || dest.region || '';
  const subtitle = dest.distance_km != null
    ? `${dest.distance_km} km away · ${location || name}`
    : (location ? `Located in ${location}` : 'Featured Destination');

  const budgetVal = typeof dest.budget === 'number' && dest.budget > 0
    ? `₹${dest.budget.toLocaleString('en-IN')} est. per person`
    : '₹5,000 est. per person';

  const durationVal = typeof dest.duration === 'number' && dest.duration > 0
    ? `${dest.duration} days recommended`
    : '2–3 days recommended';

  return {
    id: dest.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: name,
    origin: dest.location || null,
    region: dest.region || dest.location || '',
    travelTime: dest.duration ? `${dest.duration} Days` : 'Flexible',
    travelTimeShort: subtitle,
    recommendedDuration: durationVal,
    budget: budgetVal,
    weather: dest.weather || 'Pleasant',
    interests: dest.category || 'Scenic · Nature · Culture',
    coordinates: coords,
    mapZoom: 12,
    nearbyPlaces: Array.isArray(dest.nearbyPlaces) ? dest.nearbyPlaces : [],
  };
}

/**
 * Normalize an attraction returned from GET /api/nearby-attractions into place card format
 */
function normalizeAttractionToPlace(item, destName) {
  const id = item.id || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `place-${Math.random()}`);
  const costStr = typeof item.local_cost === 'number' && item.local_cost > 0
    ? `₹${item.local_cost.toLocaleString('en-IN')} estimated`
    : 'Free';
  const durationStr = item.visit_duration || '2–3 Hours';

  return {
    id,
    name: item.name,
    description: item.summary || item.description || `Popular attraction in ${destName}.`,
    intro: item.description || item.summary || `Explore the scenic atmosphere of ${item.name}.`,
    category: (item.highlights && item.highlights[0]) || item.type || 'Attraction',
    categoryColor: '#10B981',
    image: item.image_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
    coords: item.coords || [item.lat, item.lon],
    distance: item.distance || 'Nearby',
    timeAndCost: `${durationStr} · ${costStr}`,
    estimatedCost: costStr,
    costBasis: 'Per Person',
    bestTime: item.best_time || 'October – May',
    typicalDuration: durationStr,
    topAttractions: Array.isArray(item.highlights) && item.highlights.length > 0
      ? item.highlights.map((h) => ({ title: h, description: `Experience ${h.toLowerCase()} at ${item.name}.` }))
      : [
          { title: 'Scenic Exploration', description: `Enjoy the surroundings of ${item.name}.` },
          { title: 'Photography', description: 'Capture panoramic perspectives.' },
        ],
    experiences: Array.isArray(item.nearby_activities) && item.nearby_activities.length > 0
      ? item.nearby_activities
      : ['Sightseeing Walk', 'Scenic Views', 'Photography', 'Local Cuisine'],
    gallery: [
      item.image_url,
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    ].filter(Boolean),
  };
}

/**
 * DestinationDetailPage Component
 * 
 * Dynamic destination overview and experience selection page:
 * - Top Header: DashboardHeader
 * - Destination Header: Dynamic title, location & travel time
 * - Overview Section: Topographic Leaflet map + 5 compact info cards
 * - Suggested Destinations: Real attractions discovered around the selected destination
 * - Experience Detail Modal: Learn-more dialog with rich attractions, duration, cost, and gallery
 * - Day Selection Modal: "Select the Day to add the destination" popup
 * - Right Side Panel: Synchronized Day selection & itinerary items
 */
export default function DestinationDetailPage({
  destinationId = null,
  selectedDestination = null,
  onNavigateHome,
  onSearch,
  onReviewPlan,
  onViewAll,
  filterState,
  tripDuration: propTripDuration,
  travellerCount: propTravellerCount,
  destinationsByDay: controlledDestinationsByDay,
  setDestinationsByDay: controlledSetDestinationsByDay,
  onAddDestination: controlledOnAddDestination,
  onRemoveDestination: controlledOnRemoveDestination,
  selectedDay: controlledSelectedDay,
  onSelectDay: controlledOnSelectDay,
}) {
  const [destData, setDestData] = useState(() => {
    if (selectedDestination) {
      return formatDestinationData(selectedDestination);
    }
    if (destinationId) {
      try {
        const cached = sessionStorage.getItem('roamio_selected_destination');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id === destinationId || parsed.name.toLowerCase() === destinationId.toLowerCase())) {
            return formatDestinationData(parsed);
          }
        }
      } catch (e) {}

      const staticData = getDestinationById(destinationId);
      if (staticData) return staticData;

      const formattedName = destinationId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return formatDestinationData({
        id: destinationId,
        name: formattedName,
      });
    }
    return null;
  });

  const [nearbyPlaces, setNearbyPlaces] = useState(() => {
    if (destData && Array.isArray(destData.nearbyPlaces) && destData.nearbyPlaces.length > 0) {
      return destData.nearbyPlaces;
    }
    return [];
  });
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  // Synchronize destination resolution and nearby attractions discovery
  useEffect(() => {
    let isMounted = true;

    let currentDest = null;
    if (selectedDestination) {
      currentDest = formatDestinationData(selectedDestination);
    } else if (destinationId) {
      try {
        const cached = sessionStorage.getItem('roamio_selected_destination');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id === destinationId || parsed.name.toLowerCase() === destinationId.toLowerCase())) {
            currentDest = formatDestinationData(parsed);
          }
        }
      } catch (e) {}

      if (!currentDest) {
        const staticData = getDestinationById(destinationId);
        if (staticData) {
          currentDest = staticData;
        } else {
          const formattedName = destinationId
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          currentDest = formatDestinationData({
            id: destinationId,
            name: formattedName,
          });
        }
      }
    }

    if (!currentDest) {
      setDestData(null);
      setNearbyPlaces([]);
      return;
    }

    setDestData(currentDest);
    setNearbyPlaces(Array.isArray(currentDest.nearbyPlaces) && currentDest.nearbyPlaces.length > 0 ? currentDest.nearbyPlaces : []);

    // Fetch dynamic nearby attractions around the destination
    const resolveAndFetch = async () => {
      setIsLoadingPlaces(true);
      let coords = currentDest.coordinates;

      if (!coords || !Array.isArray(coords) || coords.length < 2) {
        try {
          coords = await geocodingService.getCoordinates(currentDest.name);
          if (coords && isMounted) {
            currentDest.coordinates = coords;
            setDestData((prev) => prev ? { ...prev, coordinates: coords } : prev);
          }
        } catch (e) {
          console.warn('[DestinationDetail] Could not geocode destination coordinates:', e);
        }
      }

      try {
        const lat = coords ? coords[0] : null;
        const lon = coords ? coords[1] : null;
        console.log(`[DestinationDetail] Fetching attractions for '${currentDest.name}' (${lat}, ${lon})`);
        const rawAttractions = await travelApi.fetchNearbyAttractions(currentDest.name, lat, lon);

        if (isMounted) {
          if (Array.isArray(rawAttractions) && rawAttractions.length > 0) {
            const normalized = rawAttractions.map((item) =>
              normalizeAttractionToPlace(item, currentDest.name)
            );
            console.log(`[DestinationDetail] Loaded ${normalized.length} attractions for '${currentDest.name}':`, normalized);
            setNearbyPlaces(normalized);
            setDestData((prev) => prev ? { ...prev, nearbyPlaces: normalized } : prev);
          } else if (currentDest.nearbyPlaces && currentDest.nearbyPlaces.length > 0) {
            setNearbyPlaces(currentDest.nearbyPlaces);
          } else {
            setNearbyPlaces([]);
          }
          setIsLoadingPlaces(false);
        }
      } catch (err) {
        console.error('[DestinationDetail] Error discovering attractions:', err);
        if (isMounted) {
          if (currentDest.nearbyPlaces && currentDest.nearbyPlaces.length > 0) {
            setNearbyPlaces(currentDest.nearbyPlaces);
          } else {
            setNearbyPlaces([]);
          }
          setIsLoadingPlaces(false);
        }
      }
    };

    resolveAndFetch();

    return () => {
      isMounted = false;
    };
  }, [destinationId, selectedDestination]);

  const tripDuration = propTripDuration ?? filterState?.duration ?? 5;
  const travellerCount = propTravellerCount ?? filterState?.travellerCount ?? 1;

  const [internalSelectedDay, setInternalSelectedDay] = useState(1);
  const selectedDay = controlledSelectedDay !== undefined ? controlledSelectedDay : internalSelectedDay;
  const handleSelectDay = (d) => {
    if (controlledOnSelectDay) controlledOnSelectDay(d);
    setInternalSelectedDay(d);
  };

  const [internalDestinationsByDay, setInternalDestinationsByDay] = useState({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const destinationsByDay = controlledDestinationsByDay !== undefined ? controlledDestinationsByDay : internalDestinationsByDay;
  const setDestinationsByDay = controlledSetDestinationsByDay || setInternalDestinationsByDay;

  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDaySelectionOpen, setIsDaySelectionOpen] = useState(false);
  const [daySelectionPlace, setDaySelectionPlace] = useState(null);

  // Guarantee page scroll is restored whenever all modals on this page are closed
  useEffect(() => {
    if (!isModalOpen && !isDaySelectionOpen) {
      if (typeof document !== 'undefined') {
        if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
        }
        if (document.documentElement.style.overflow === 'hidden') {
          document.documentElement.style.overflow = '';
        }
      }
    }
  }, [isModalOpen, isDaySelectionOpen]);

  // Page unmount cleanup
  useEffect(() => {
    return () => {
      forceUnlockScroll();
    };
  }, []);

  // Quick-Add on Card: Directly adds/toggles place on current active day
  const handleQuickAddToTrip = (place) => {
    setDestinationsByDay((prev) => {
      const currentList = prev[selectedDay] || [];
      const alreadyInDay = currentList.some((item) => item.id === place.id);

      if (alreadyInDay) {
        return {
          ...prev,
          [selectedDay]: currentList.filter((item) => item.id !== place.id),
        };
      }

      return {
        ...prev,
        [selectedDay]: [
          ...currentList,
          {
            id: place.id,
            name: place.name,
            subtitle: place.description || place.intro,
            timeAndCost: place.timeAndCost || '3 Hours · ₹500 estimated',
            image: place.image,
          },
        ],
      };
    });
  };

  // Trigger Day Selection Modal from inside Experience Detail Modal
  const handleOpenDaySelection = (place) => {
    setDaySelectionPlace(place);
    setIsDaySelectionOpen(true);
  };

  // Add destination to chosen day from DaySelectionModal
  const handleAddDestinationToDay = (day, placeToAdd) => {
    handleSelectDay(day);
    if (controlledOnAddDestination) {
      controlledOnAddDestination(day, placeToAdd);
      return;
    }
    setDestinationsByDay((prev) => {
      const currentList = prev[day] || [];
      const alreadyIn = currentList.some((item) => item.id === placeToAdd.id);
      if (alreadyIn) return prev;
      return {
        ...prev,
        [day]: [
          ...currentList,
          {
            id: placeToAdd.id,
            name: placeToAdd.name,
            subtitle: placeToAdd.description || placeToAdd.intro,
            timeAndCost: placeToAdd.timeAndCost || '3 Hours · ₹500 estimated',
            image: placeToAdd.image,
          },
        ],
      };
    });
  };

  const handleRemoveFromDay = (day, destId) => {
    if (controlledOnRemoveDestination) {
      controlledOnRemoveDestination(day, destId);
      return;
    }
    setDestinationsByDay((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((item) => item.id !== destId),
    }));
  };

  // Clean empty state if no destination was supplied or resolved
  if (!destData) {
    return (
      <div className="min-h-screen bg-roamio-bg-app flex flex-col font-roamio-body text-roamio-text-primary">
        <DashboardHeader
          onNavigateHome={onNavigateHome}
          onSearch={onSearch}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-roamio-border-light rounded-roamio-3 p-8 max-w-md shadow-2xs">
            <h2 className="text-xl font-bold text-roamio-text-primary mb-2">Destination Not Found</h2>
            <p className="roamio-body-xs text-roamio-text-secondary mb-6">
              The requested destination could not be loaded or has not been selected yet. Try exploring destinations from the search dashboard.
            </p>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-5 py-2.5 bg-roamio-btn-primary text-white rounded-roamio-1 text-sm font-semibold hover:bg-roamio-btn-primary-hover transition cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Ensure map coordinates exist
  const mapCoordinates = destData.coordinates || [20.5937, 78.9629];
  const mapDest = { ...destData, coordinates: mapCoordinates, nearbyPlaces };

  return (
    <div className="min-h-screen bg-roamio-bg-app flex flex-col font-roamio-body text-roamio-text-primary selection:bg-roamio-semantic-success-bg selection:text-roamio-primary-accent">
      {/* 1. REUSED ROAMIO DASHBOARD HEADER */}
      <DashboardHeader
        onNavigateHome={onNavigateHome}
        onSearch={onSearch}
        onProfileClick={() => console.log('[DestinationDetail] Profile clicked')}
      />

      {/* 2. MAIN CONTENT & RIGHT PANEL (12-Column Desktop Grid with Roamio 16px Gutter) */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-roamio-4 sm:px-roamio-6 py-roamio-5">
        <div className="flex flex-col xl:flex-row gap-roamio-4 items-start w-full">
          
          {/* MAIN DESTINATION SECTION */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-roamio-4">
            
            {/* DESTINATION HEADING (Unboxed / No card treatment) */}
            <div className="text-left py-1">
              <h1 className="font-roamio-display text-3xl sm:text-4xl font-bold text-roamio-text-primary tracking-tight">
                {destData.name}
              </h1>
              <p className="roamio-body-xs font-medium text-roamio-text-secondary mt-1">
                {destData.travelTimeShort}
              </p>
            </div>

            {/* MAIN DESTINATION OVERVIEW (Map + 5 Compact Info Sections) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-roamio-4 items-stretch">
              {/* Destination Map */}
              <div className="lg:col-span-8 xl:col-span-8 w-full min-w-0 flex flex-col h-full">
                <DestinationMap destination={mapDest} className="w-full h-full" />
              </div>

              {/* Destination Information Column Beside Map */}
              <div className="lg:col-span-4 xl:col-span-4 w-full min-w-0 flex flex-col justify-between h-full">
                <DestinationInfoCards destination={destData} className="h-full" />
              </div>
            </div>

            {/* SUGGESTED DESTINATIONS / EXPERIENCES SECTION */}
            <section className="space-y-roamio-3 text-left pt-2">
              <div className="flex items-center justify-between">
                <h3 className="roamio-h5 font-bold text-roamio-text-primary">
                  Suggested Destinations
                </h3>
                <button
                  type="button"
                  onClick={onViewAll}
                  className="roamio-body-xs font-bold text-roamio-primary-accent hover:underline cursor-pointer transition select-none"
                >
                  View All
                </button>
              </div>

              {/* 4-Column × 2-Row Experience Cards Grid */}
              {isLoadingPlaces ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-white border border-roamio-border-light rounded-roamio-2 shadow-2xs">
                  <div className="w-8 h-8 border-3 border-roamio-primary-accent border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="roamio-body-sm font-semibold text-roamio-text-primary">Discovering experiences...</p>
                  <p className="roamio-body-xs text-roamio-text-secondary mt-0.5">Fetching local attractions for {destData.name}</p>
                </div>
              ) : nearbyPlaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-roamio-3">
                  {nearbyPlaces.map((place) => {
                    const isAdded = Object.values(destinationsByDay).some((dayList) =>
                      (dayList || []).some((item) => item.id === place.id)
                    );
                    return (
                      <ExperienceCard
                        key={place.id}
                        place={place}
                        isAdded={isAdded}
                        onAddToTrip={() => handleOpenDaySelection(place)}
                        onCardClick={() => {
                          setSelectedExperience(place);
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 px-4 flex flex-col items-center justify-center text-center bg-white border border-roamio-border-light rounded-roamio-2 shadow-2xs">
                  <p className="roamio-body-sm font-bold text-roamio-text-primary">No nearby experiences discovered yet for {destData.name}.</p>
                  <p className="roamio-body-xs text-roamio-text-secondary mt-1">Try another destination or explore more regional attractions.</p>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT SIDE PANEL (Reused from Results Dashboard) */}
          <RightSidePanel
            tripDuration={tripDuration}
            travellerCount={travellerCount}
            className="w-full xl:w-[360px] 2xl:w-[380px] shrink-0"
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            destinationsByDay={destinationsByDay}
            onRemoveDestination={handleRemoveFromDay}
            onReviewPlan={onReviewPlan}
            onAddMoreDestinations={() => console.log('[DestinationDetail] Add more destinations clicked')}
          />

        </div>
      </main>

      {/* EXPERIENCE DETAIL MODAL (Learn more & add to trip) */}
      <ExperienceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        place={selectedExperience}
        destination={destData}
        isAdded={
          selectedExperience
            ? Object.values(destinationsByDay).some((dayList) =>
                (dayList || []).some((item) => item.id === selectedExperience.id)
              )
            : false
        }
        onAddToTrip={() => handleOpenDaySelection(selectedExperience)}
      />

      {/* DAY SELECTION MODAL ("Select the Day to add the destination" popup) */}
      <DaySelectionModal
        isOpen={isDaySelectionOpen}
        onClose={() => setIsDaySelectionOpen(false)}
        place={daySelectionPlace}
        tripDuration={tripDuration}
        travellerCount={travellerCount}
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
        destinationsByDay={destinationsByDay}
        onAddDestination={handleAddDestinationToDay}
        onRemoveDestination={handleRemoveFromDay}
        onReviewPlan={onReviewPlan}
        onAddMoreDestinations={() => {
          setIsDaySelectionOpen(false);
          setIsModalOpen(false);
          forceUnlockScroll();
        }}
      />
    </div>
  );
}
