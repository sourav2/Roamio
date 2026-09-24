import React from 'react';
import { Route, Clock, Wallet, Sun } from 'lucide-react';
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
      <DiscoveryMap startLocation={startCity} destinations={destinations} />

      {/* 4. SUGGESTED DESTINATIONS */}
      <div className="space-y-roamio-3 text-left pt-roamio-1">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="roamio-h5 font-bold text-roamio-text-primary">
            Suggested Destinations
          </h3>
          <span className="roamio-body-xs text-roamio-text-tertiary font-medium">
            {isLoading ? 'Searching...' : `${destinations.length} items found`}
          </span>
        </div>

        {/* 3-Column Cards Grid on Desktop with Loading and Empty States */}
        {isLoading ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center bg-white border border-roamio-border-light rounded-roamio-2 shadow-2xs">
            <div className="w-8 h-8 border-3 border-roamio-primary-accent border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="roamio-body-sm font-semibold text-roamio-text-primary">Discovering destinations...</p>
            <p className="roamio-body-xs text-roamio-text-secondary mt-0.5">Fetching location-aware recommendations</p>
          </div>
        ) : destinations.length > 0 ? (
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
        {destinations.length > 0 && !isLoading && (
          <div className="pt-roamio-1">
            <button
              type="button"
              onClick={onViewAll}
              className="roamio-body-xs font-bold text-roamio-primary-accent hover:underline transition cursor-pointer select-none"
            >
              View All
            </button>
          </div>
        )}

      </div>

    </section>
  );
}
