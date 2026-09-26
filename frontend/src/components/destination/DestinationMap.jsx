import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass } from 'lucide-react';
import { MapChipController } from '../../services/maps/mapChipCollision';

const CATEGORY_LEGEND = [
  { name: 'Viewpoints', color: '#2F9E6F' },
  { name: 'Nature & Parks', color: '#10B981' },
  { name: 'Cultural / Spiritual', color: '#F59E0B' },
  { name: 'Activities', color: '#EF4444' },
  { name: 'Heritage', color: '#8B5CF6' },
];

/**
 * DestinationMap Component
 * 
 * High-fidelity destination-focused topographic Leaflet map matching Figma reference:
 * - Esri World Topo Map cartographic tiles
 * - Collision-aware town center pin & place markers with radial offset placement
 * - Dashed route connectors to nearby attractions
 * - Top-left category legend overlay
 * - Top-right compass rose
 * - Bottom-left West Bengal inset locator
 * - Bottom-right zoom controls and scale bar
 */
export default function DestinationMap({
  destination,
  className = '',
  onSelect = null,
  onHover = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const chipControllerRef = useRef(null);
  const routeLayerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !destination) return;

    // Initialize Leaflet map if needed
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: destination.coordinates,
        zoom: destination.mapZoom || 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 15,
        opacity: 0.92,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      chipControllerRef.current = new MapChipController(map, {
        onPreviewClick: onSelect,
        onSelect,
        onHover,
      });

      mapInstanceRef.current = map;
    }

    if (chipControllerRef.current) {
      chipControllerRef.current.onPreviewClick = onSelect;
      chipControllerRef.current.onSelect = onSelect;
      chipControllerRef.current.onHover = onHover;
    }

    const map = mapInstanceRef.current;
    map.setView(destination.coordinates, destination.mapZoom || 12);

    // Invalidate map size after DOM layout stabilization
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const routeLayer = routeLayerGroupRef.current;
    if (routeLayer) {
      routeLayer.clearLayers();
    }

    const centerCoords = destination.coordinates;
    const places = Array.isArray(destination.nearbyPlaces) ? destination.nearbyPlaces : [];

    // 1. Draw dashed connecting route lines from center to places
    if (routeLayer && centerCoords) {
      places.forEach((place) => {
        if (!place.coords) return;
        const midLat = (centerCoords[0] + place.coords[0]) / 2 + (Math.random() - 0.5) * 0.008;
        const midLon = (centerCoords[1] + place.coords[1]) / 2 + (Math.random() - 0.5) * 0.008;

        L.polyline([centerCoords, [midLat, midLon], place.coords], {
          color: '#46B392',
          weight: 2,
          opacity: 0.75,
          dashArray: '4, 6',
          lineCap: 'round',
        }).addTo(routeLayer);
      });
    }

    // 2. Prepare items for collision-aware chip controller
    const chipItems = [];
    if (centerCoords) {
      chipItems.push({
        id: destination.id ? `dest_center_${destination.id}` : 'destination_center',
        name: destination.name,
        coords: centerCoords,
        isCenter: true,
        priority: 100,
        color: '#46B392',
        region: destination.region,
        weather: destination.weather,
        budget: destination.budget,
      });
    }

    places.forEach((place, idx) => {
      if (!place.coords) return;
      chipItems.push({
        id: place.id || `place_${idx}`,
        name: place.name,
        coords: place.coords,
        categoryColor: place.categoryColor || '#10B981',
        distance: place.distance,
        description: place.description || place.intro,
        category: place.category,
        timeAndCost: place.timeAndCost || place.estimatedCost,
        image: place.image,
        priority: 60 + (places.length - idx),
        ...place,
      });
    });

    if (chipControllerRef.current) {
      chipControllerRef.current.setItems(chipItems);
    }

    // ResizeObserver to ensure Leaflet recalculates dimensions when container stretches
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          if (chipControllerRef.current) {
            chipControllerRef.current.handleMapMove();
          }
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };

  }, [destination, onSelect, onHover]);

  return (
    <div className={`relative w-full h-full min-h-[380px] overflow-hidden bg-[#EDF3EF] ${className}`.trim()}>
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

      {/* Top-Left Category Legend Overlay matching Figma */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xs rounded-roamio-2 border border-roamio-border-light px-3 py-2.5 shadow-2xs pointer-events-auto">
        <div className="space-y-1.5 text-left">
          {CATEGORY_LEGEND.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-medium text-roamio-text-secondary leading-none">
                {item.name}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-0.5 border-t border-roamio-border-light/60">
            <span className="w-2.5 border-t-2 border-dashed border-roamio-btn-light shrink-0" />
            <span className="text-[11px] font-medium text-roamio-text-secondary leading-none">
              Road / Route
            </span>
          </div>
        </div>
      </div>

      {/* Top-Right Compass Rose */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-xs rounded-full p-1.5 border border-roamio-border-light shadow-2xs flex items-center justify-center">
        <Compass className="h-5 w-5 text-roamio-primary-accent" />
      </div>

      {/* Bottom-Left Inset Locator Visual matching Figma */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs rounded-roamio-2 border border-roamio-border-light p-1.5 shadow-2xs hidden sm:flex flex-col items-center">
        <div className="w-14 h-14 bg-roamio-bg-secondary rounded-roamio-1 border border-roamio-border-light flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-[8px] font-bold text-roamio-primary-accent tracking-tighter uppercase truncate max-w-[50px] text-center">
            {destination.region || destination.name || 'Region'}
          </span>
          <span className="w-2 h-2 rounded-full bg-roamio-btn-light mt-1 animate-ping absolute" />
          <span className="w-2 h-2 rounded-full bg-roamio-primary-accent mt-1" />
        </div>
      </div>
    </div>
  );
}
