import React from 'react';
import { Route, Clock, Wallet, Sun, Compass } from 'lucide-react';
import DiscoveryMap from './DiscoveryMap';
import meghalayaImg from '../../assets/images/Meghalaya.jpg';

const DISCOVERY_METRICS = [
  {
    id: 'distance',
    label: 'Avg. Distance',
    value: '150–700 km',
    icon: Route,
  },
  {
    id: 'time',
    label: 'Travel Time',
    value: '3h – 16h',
    icon: Clock,
  },
  {
    id: 'budget',
    label: 'Budget Avg.',
    value: '₹5k – 25k',
    icon: Wallet,
  },
  {
    id: 'weather',
    label: 'Weather',
    value: 'Varied',
    icon: Sun,
  },
];

const SUGGESTED_DESTINATIONS = [
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    description: 'Mountains · Trekking · Tea',
    image: 'https://images.unsplash.com/photo-1559139413-869fe2c7e1b4?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'purulia',
    name: 'Purulia',
    description: 'Hills · Tribal Culture · Lakes',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'mandarmoni',
    name: 'Mandarmoni',
    description: 'Beach · Water Sports · Seafood',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'kalimpong',
    name: 'Kalimpong',
    description: 'Monasteries · Himalayan Views · Nature',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0db?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'dooars',
    name: 'Dooars',
    description: 'Wildlife · Forests · Tea Estates',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'digha',
    name: 'Digha',
    description: 'Beaches · Coastal Walks · Seafood',
    image: 'https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop',
  },
];

/**
 * Reusable Discovery Destination Card
 * 
 * Strict Figma Reference Alignment:
 * - Card shape: rounded-roamio-2 (8px), 1px border light (#DEDEDE), white card background
 * - Top image banner: flush cutout treatment with rounded-t-roamio-2, aspect-[16/9] landscape ratio
 * - Content area: compact padding (px-3 pt-2.5 pb-3)
 * - Typography: Title (Body MD Medium 16/22 #1C2420), Secondary Attributes (Body SM Medium 14/20 #5B6660)
 */
function DestinationCard({ destination, onSelect }) {
  // Resolve concise destination characteristics / attributes formatted with " · "
  const attributesText = (() => {
    if (Array.isArray(destination.attributes) && destination.attributes.length > 0) {
      return destination.attributes.join(' · ');
    }
    if (typeof destination.attributes === 'string' && destination.attributes.trim()) {
      return destination.attributes.trim();
    }
    if (typeof destination.interests === 'string' && destination.interests.trim()) {
      return destination.interests.trim();
    }
    if (Array.isArray(destination.interests) && destination.interests.length > 0) {
      return destination.interests.join(' · ');
    }
    if (typeof destination.description === 'string' && destination.description.includes(' · ')) {
      return destination.description;
    }
    if (Array.isArray(destination.tripTypes) && destination.tripTypes.length > 0) {
      return destination.tripTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 3).join(' · ');
    }
    if (Array.isArray(destination.trip_types) && destination.trip_types.length > 0) {
      return destination.trip_types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 3).join(' · ');
    }
    if (typeof destination.category === 'string' && destination.category.trim()) {
      return destination.category;
    }
    if (typeof destination.description === 'string' && destination.description.trim()) {
      return destination.description.trim();
    }
    return 'Scenic · Nature · Culture';
  })();

  return (
    <div 
      onClick={() => onSelect && onSelect(destination)}
      className="group bg-white border border-roamio-border-light rounded-roamio-2 overflow-hidden shadow-2xs hover:shadow-roamio-sm transition-all duration-200 cursor-pointer text-left flex flex-col"
    >
      <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-roamio-bg-secondary">
        <img
          src={destination.image || meghalayaImg}
          alt={destination.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = meghalayaImg;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="px-roamio-3 pt-2.5 pb-3 flex-1 flex flex-col justify-start">
        <h4 className="roamio-body-md-medium text-roamio-text-primary group-hover:text-roamio-primary-accent transition-colors">
          {destination.name}
        </h4>
        <p className="roamio-body-sm-medium text-roamio-text-secondary mt-1 leading-normal">
          {attributesText}
        </p>
      </div>
    </div>
  );
}

/**
 * MiddleDiscoverySection component
 * 
 * Contains:
 * 1. Destination Summary
 * 2. Discovery Metrics (4 compact metric cards)
 * 3. Discovery Map (reusing Leaflet + Esri Topo)
 * 4. Suggested Destinations (3-column grid of 6 cards + View All)
 */
export default function MiddleDiscoverySection({
  startCity = null,
  destinationTitle = null,
  travellerCount = null,
  duration = null,
  budget = null,
  metrics = DISCOVERY_METRICS,
  destinations = [],
  isLoading = false,
  onDestinationSelect,
  onViewAll,
  className = "",
}) {
  const displayTitle = destinationTitle && destinationTitle !== 'Any Destination'
    ? `Discover Destinations in ${destinationTitle}`
    : startCity
      ? `Discover Nearby Destinations from ${startCity}`
      : `Discover Recommended Destinations`;

  const subtitleLead = destinationTitle && destinationTitle !== 'Any Destination'
    ? `Focus: ${destinationTitle}`
    : startCity
      ? `Start: ${startCity}`
      : `All Destinations`;

  if (isLoading) {
    return (
      <section className={`flex-1 flex flex-col gap-roamio-4 min-w-0 ${className}`.trim()}>
        {/* 1. AI SYNTHESIS LOADING CARD (Matching Figma Reference) */}
        <div className="w-full flex flex-col items-center justify-center p-6 sm:p-7 bg-[#F4FAF7] border border-[#73C2A6] rounded-roamio-2 text-center shadow-2xs">
          <div className="relative mb-3 flex h-13 w-13 items-center justify-center rounded-full bg-roamio-primary-accent text-white shadow-md">
            <Compass className="h-6.5 w-6.5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h3 className="roamio-body-md font-bold text-roamio-primary-accent mb-1">
            Synthesizing Your Custom Trip
          </h3>
          <p className="roamio-body-xs font-semibold text-roamio-btn-light">
            Finding destinations......
          </p>
        </div>

        {/* 2. DISCOVERY METRICS SKELETON (4 Columns matching Figma) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 text-left">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="h-3 w-16 bg-[#DFE5E2] rounded-full roamio-shimmer" />
              <div className="h-5 w-20 bg-[#DFE5E2] rounded-full roamio-shimmer" />
            </div>
          ))}
        </div>

        {/* 3. DISCOVERY MAP SKELETON (Left to Right continuous shimmer) */}
        <div className="relative w-full h-[400px] sm:h-[440px] rounded-roamio-3 overflow-hidden border border-roamio-border-light bg-[#DFE5E2] roamio-map-shimmer">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <Compass className="h-12 w-12 text-[#176B53]" />
          </div>
        </div>

        {/* 4. SUGGESTED DESTINATIONS SKELETON (3-Column x 2-Row Card Grid matching Figma) */}
        <div className="space-y-roamio-3 text-left pt-roamio-1">
          <div className="h-4 w-36 bg-[#DFE5E2] rounded-full roamio-shimmer mb-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-roamio-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E7EB] rounded-roamio-2 p-4 h-[105px] flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="h-3.5 w-24 bg-[#DFE5E2] rounded-full roamio-shimmer" />
                  <div className="h-4 w-32 bg-[#CBD5E1] rounded-full roamio-shimmer" />
                </div>
                <div className="flex justify-end">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#DFE5E2] roamio-shimmer" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-3.5 w-28 bg-[#DFE5E2] rounded-full roamio-shimmer mt-2" />
        </div>
      </section>
    );
  }

  return (
    <section className={`flex-1 flex flex-col gap-roamio-4 min-w-0 ${className}`.trim()}>
      
      {/* 1. DESTINATION SUMMARY */}
      <div className="text-left">
        <h2 className="roamio-h5 font-bold text-roamio-text-primary">
          {displayTitle}
        </h2>
        <p className="roamio-body-xs text-roamio-text-secondary mt-0.5">
          {subtitleLead}
          {travellerCount ? ` · ${travellerCount} ${travellerCount === 1 ? 'Traveller' : 'Travellers'}` : ''}
          {duration ? ` · ${duration} Days` : ''}
          {budget ? ` · ₹${Number(budget).toLocaleString('en-IN')}` : ''}
        </p>
      </div>

      {/* 2. DISCOVERY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-roamio-border-light text-left py-1">
        {metrics.map(({ id, label, value, icon: Icon }, idx) => (
          <div
            key={id}
            className={`flex items-center gap-roamio-3 py-1 sm:py-0 ${idx === 0 ? 'sm:pr-roamio-4' : idx === metrics.length - 1 ? 'sm:pl-roamio-4' : 'sm:px-roamio-4'}`}
          >
            {Icon && (
              <Icon size={20} className="w-5 h-5 text-roamio-primary-accent shrink-0" />
            )}
            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-roamio-text-tertiary uppercase tracking-wider truncate">
                {label}
              </span>
              <span className="roamio-body-sm font-bold text-roamio-text-primary truncate block mt-0.5">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. DISCOVERY MAP */}
      <DiscoveryMap startLocation={startCity} destinations={destinations} onSelect={onDestinationSelect} />

      {/* 4. SUGGESTED DESTINATIONS */}
      <div className="space-y-roamio-3 text-left pt-roamio-1">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="roamio-h5 font-bold text-roamio-text-primary">
            Suggested Destinations
          </h3>
          <span className="roamio-body-xs text-roamio-text-tertiary font-medium">
            {`${destinations.length} items found`}
          </span>
        </div>

        {/* 3-Column Cards Grid on Desktop */}
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-roamio-2">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={onDestinationSelect}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center bg-white border border-roamio-border-light rounded-roamio-2 shadow-2xs">
            <p className="roamio-body-sm font-bold text-roamio-text-primary">No destinations found for your current search.</p>
            <p className="roamio-body-xs text-roamio-text-secondary mt-1 max-w-md">
              Try broadening your location, adjusting your filters, or searching for another region.
            </p>
          </div>
        )}

        {/* View All Link */}
        {destinations.length > 0 && (
          <div className="pt-roamio-1">
            <button
              type="button"
              onClick={onViewAll}
              className="roamio-body-md-medium text-roamio-primary-accent hover:underline transition cursor-pointer select-none"
            >
              View All
            </button>
          </div>
        )}

      </div>

    </section>
  );
}
