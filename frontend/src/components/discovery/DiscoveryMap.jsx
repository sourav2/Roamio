import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass } from 'lucide-react';
import { LOCAL_PRESETS, geocodingService } from '../../services/maps/geocodingService';
import { MapChipController } from '../../services/maps/mapChipCollision';

/**
 * DiscoveryMap component reusing Leaflet and Esri topographic layers.
 * Shows regional discovery destinations with connecting routes, collision-aware chips, and custom legend.
 */
export default function DiscoveryMap({
  startLocation = null,
  startCoords = null,
  destinations = [],
  className = '',
  onSelect = null,
  onHover = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const chipControllerRef = useRef(null);
  const routeLayerGroupRef = useRef(null);
  const [asyncStartCoords, setAsyncStartCoords] = useState(null);

  // Synchronous resolution of origin coordinates using explicit startCoords or existing LOCAL_PRESETS
  const getResolvedCoords = (loc, explicitCoords) => {
    if (Array.isArray(explicitCoords) && explicitCoords.length === 2 && typeof explicitCoords[0] === 'number' && !isNaN(explicitCoords[0])) {
      return explicitCoords;
    }
    if (!loc || typeof loc !== 'string' || !loc.trim()) {
      return null;
    }
    const clean = loc.trim().toLowerCase();
    for (const [key, val] of Object.entries(LOCAL_PRESETS)) {
      if (clean === key || clean.includes(key) || key.includes(clean)) {
        return val;
      }
    }
    return null;
  };

  const syncCoords = getResolvedCoords(startLocation, startCoords);

  // If an explicit startLocation was provided but not found in LOCAL_PRESETS, resolve via geocodingService
  useEffect(() => {
    if (!startLocation || startCoords || syncCoords) {
      setAsyncStartCoords(null);
      return;
    }
    let isMounted = true;
    geocodingService.getCoordinates(startLocation)
      .then((coords) => {
        if (isMounted && Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0])) {
          setAsyncStartCoords(coords);
        }
      })
      .catch((err) => {
        console.warn(`[DiscoveryMap] Failed to resolve coordinates for "${startLocation}":`, err);
      });
    return () => {
      isMounted = false;
    };
  }, [startLocation, startCoords, syncCoords]);

  const effectiveStartCoords = syncCoords || asyncStartCoords;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map once if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Center overview of India
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      // Esri World Topo Map for beautiful cartographic landcover matching Figma
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 14,
        opacity: 0.9,
      }).addTo(map);

      // Add zoom control to bottom right
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
    const routeLayer = routeLayerGroupRef.current;
    if (routeLayer) {
      routeLayer.clearLayers();
    }

    const activeDestinations = Array.isArray(destinations) && destinations.length > 0
      ? destinations
      : [];

    // 1. Draw dashed suggested routes ONLY IF an explicit starting origin exists and has valid coordinates
    if (effectiveStartCoords && routeLayer) {
      activeDestinations.forEach((dest) => {
        if (!dest.coords || dest.isStart) return;

        // Curved intermediate point for organic aesthetic
        const midLat = (effectiveStartCoords[0] + dest.coords[0]) / 2 + (Math.random() - 0.5) * 0.15;
        const midLon = (effectiveStartCoords[1] + dest.coords[1]) / 2 + (Math.random() - 0.5) * 0.15;
        const curvePoints = [effectiveStartCoords, [midLat, midLon], dest.coords];

        L.polyline(curvePoints, {
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
    if (effectiveStartCoords) {
      chipItems.push({
        id: 'user_origin',
        name: startLocation || 'Your Location',
        coords: effectiveStartCoords,
        isOrigin: true,
        isStart: true,
      });
    }

    activeDestinations.forEach((dest, idx) => {
      if (!dest.coords || dest.isStart) return;
      chipItems.push({
        id: dest.id || `dest_${idx}`,
        name: dest.name,
        coords: dest.coords,
        color: dest.color || '#2F9E6F',
        description: dest.description || dest.interests,
        travelTime: dest.travelTime,
        budget: dest.budget,
        weather: dest.weather,
        image: dest.image,
        priority: 50 + (activeDestinations.length - idx),
        ...dest,
      });
    });

    if (chipControllerRef.current) {
      chipControllerRef.current.setItems(chipItems);
    }

    // 3. Dynamically fit map bounds to frame active markers
    const boundsCoords = [];
    if (effectiveStartCoords) {
      boundsCoords.push(effectiveStartCoords);
    }
    activeDestinations.forEach((dest) => {
      if (Array.isArray(dest.coords) && dest.coords.length === 2 && !isNaN(dest.coords[0])) {
        boundsCoords.push(dest.coords);
      }
    });

    if (boundsCoords.length > 1) {
      const bounds = L.latLngBounds(boundsCoords);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 11 });
    } else if (boundsCoords.length === 1) {
      map.setView(boundsCoords[0], 9);
    }

    // Delay slight recalculation after fitBounds animation
    const recheckTimer = setTimeout(() => {
      if (chipControllerRef.current) {
        chipControllerRef.current.handleMapMove();
      }
    }, 250);

    return () => {
      clearTimeout(recheckTimer);
    };

  }, [effectiveStartCoords, startLocation, destinations, onSelect, onHover]);

  return (
    <div className={`relative w-full h-[400px] sm:h-[440px] rounded-roamio-3 overflow-hidden border border-roamio-border-light bg-[#F0EFEA] ${className}`.trim()}>
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Floating Legend (Matching Figma reference top-left) */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-roamio-border-light rounded-roamio-2 p-2.5 shadow-roamio-sm text-left pointer-events-auto max-w-[170px]">
        <div className="space-y-1.5 text-[10.5px] font-medium text-roamio-text-primary">
          {effectiveStartCoords && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#176B53] border border-white shadow-2xs shrink-0" />
              <span>Your Location</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F9E6F] shrink-0" />
            <span>Hill Station</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0" />
            <span>Adventure / Nature</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
            <span>Cultural / Sightseeing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
            <span>Beach</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <span>Wildlife / Nature</span>
          </div>
          {effectiveStartCoords && (
            <div className="flex items-center gap-2 pt-0.5 border-t border-roamio-border-light text-[10px] text-roamio-text-secondary">
              <span className="w-3.5 border-t-2 border-dashed border-[#46B392] shrink-0" />
              <span>Suggested Route</span>
            </div>
          )}
        </div>
      </div>

      {/* North Indicator (Matching Figma reference top-right) */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs border border-roamio-border-light rounded-roamio-1 p-1.5 shadow-2xs flex flex-col items-center pointer-events-none">
        <span className="text-[9px] font-bold text-roamio-text-primary">N</span>
        <Compass className="h-3.5 w-3.5 text-roamio-text-secondary" />
      </div>

      {/* Scale Bar (Matching Figma bottom-left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-xs px-2 py-1 rounded-roamio-1 border border-roamio-border-light text-[9px] font-semibold text-roamio-text-secondary flex items-center gap-2 shadow-2xs pointer-events-none">
        <span>0</span>
        <div className="w-12 h-1 border-b-2 border-l-2 border-r-2 border-roamio-text-primary" />
        <span>200km</span>
      </div>

    </div>
  );
}
