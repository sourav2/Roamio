/**
 * Roamio Map Chip Collision & Dynamic Screen-Space Label Placement
 * 
 * Implements intelligent screen-space collision detection and radial offset distribution
 * for Leaflet map destination chips and place markers.
 * 
 * Guarantees:
 * 1. Geographic anchoring at exact coordinates with subtle leader lines when offset.
 * 2. Radial candidate search minimizing overlap area and distance from anchor.
 * 3. Dynamic recalculation on zoom, pan, and resize events.
 * 4. Interactive hover elevation and click foregrounding with highest z-index.
 * 5. Interactive preview card with smooth hover states and clickable navigation to destination detail.
 * 6. Reusable across DiscoveryMap, DestinationMap, and custom travel views.
 */

import L from 'leaflet';

/**
 * Estimate rendered width and height of a map chip based on label length and content
 */
export function estimateChipDimensions(item, isCenter = false) {
  const name = item.name || item.title || 'Destination';
  const charWidth = isCenter ? 7.6 : 6.8;
  const maxTextWidth = isCenter ? 170 : 150;
  const textWidth = Math.min(name.length * charWidth, maxTextWidth);

  // Dot + Gap
  const dotWidth = isCenter ? 16 : 14;
  
  // Extra distance badge if present
  let badgeWidth = 0;
  if (item.distance) {
    badgeWidth = Math.min(String(item.distance).length * 5.5 + 6, 45);
  }

  // Padding
  const horizontalPadding = isCenter ? 24 : 18;
  const totalWidth = Math.min(Math.round(horizontalPadding + dotWidth + textWidth + badgeWidth), isCenter ? 210 : 190);
  const totalHeight = isCenter ? 32 : 26;

  return { width: totalWidth, height: totalHeight };
}

/**
 * Calculate optimal screen-space offsets for a collection of map items to prevent overlap
 * 
 * @param {L.Map} map - Leaflet map instance
 * @param {Array<object>} items - Array of destination/place items with coords [lat, lon]
 * @param {object} options - Configuration options
 * @returns {Map<string, {x: number, y: number, isOffset: boolean}>} Map of item id -> offset
 */
export function calculateChipOffsets(map, items = [], options = {}) {
  const offsetResults = new Map();
  if (!map || !Array.isArray(items) || items.length === 0) {
    return offsetResults;
  }

  const mapSize = map.getSize();
  const mapWidth = mapSize.x;
  const mapHeight = mapSize.y;

  // 1. Prepare items with screen pixel coordinates and estimated dimensions
  const preparedItems = [];
  items.forEach((item, index) => {
    if (!item || !Array.isArray(item.coords) || item.coords.length !== 2 || isNaN(item.coords[0]) || isNaN(item.coords[1])) {
      return;
    }

    const id = String(item.id || `item_${index}`);
    const latLng = L.latLng(item.coords[0], item.coords[1]);
    const screenPoint = map.latLngToContainerPoint(latLng);
    const isCenter = Boolean(item.isCenter || item.isStart);
    const size = estimateChipDimensions(item, isCenter);

    preparedItems.push({
      id,
      item,
      coords: item.coords,
      screenPoint,
      size,
      isCenter,
      priority: isCenter ? 100 : (item.priority || (100 - index)),
    });
  });

  // Sort by priority descending (centers/origins first, then higher rank)
  preparedItems.sort((a, b) => b.priority - a.priority);

  const placedBoxes = [];
  const paddingMargin = options.paddingMargin || 4;

  // 2. Candidate directions: 16 radial directions covering full 360 degrees
  const angleSteps = [
    0,                // Right
    Math.PI / 4,      // Lower-Right
    Math.PI / 2,      // Bottom
    (3 * Math.PI) / 4,// Lower-Left
    Math.PI,          // Left
    -(3 * Math.PI) / 4,// Upper-Left
    -Math.PI / 2,     // Top
    -Math.PI / 4,     // Upper-Right
    Math.PI / 8,      // Intermediate angles
    (3 * Math.PI) / 8,
    (5 * Math.PI) / 8,
    (7 * Math.PI) / 8,
    -(7 * Math.PI) / 8,
    -(5 * Math.PI) / 8,
    -(3 * Math.PI) / 8,
    -Math.PI / 8,
  ];

  const ringMultipliers = [1.0, 1.45, 1.9, 2.4, 3.0];

  // Helper: check overlap between candidate box and all placed boxes
  const calculateTotalOverlap = (candidateBox) => {
    let totalOverlapArea = 0;
    for (const box of placedBoxes) {
      const xOverlap = Math.max(0, Math.min(candidateBox.x2, box.x2) - Math.max(candidateBox.x1, box.x1));
      const yOverlap = Math.max(0, Math.min(candidateBox.y2, box.y2) - Math.max(candidateBox.y1, box.y1));
      if (xOverlap > 0 && yOverlap > 0) {
        totalOverlapArea += xOverlap * yOverlap;
      }
    }
    return totalOverlapArea;
  };

  // 3. Position each item
  preparedItems.forEach((pItem) => {
    const { id, screenPoint, size } = pItem;
    const w = size.width;
    const h = size.height;
    const halfW = w / 2;
    const halfH = h / 2;

    // Test Candidate 0: Centered exactly at natural coordinate
    const naturalBox = {
      x1: screenPoint.x - halfW - paddingMargin,
      y1: screenPoint.y - halfH - paddingMargin,
      x2: screenPoint.x + halfW + paddingMargin,
      y2: screenPoint.y + halfH + paddingMargin,
    };

    const naturalOverlap = calculateTotalOverlap(naturalBox);

    if (naturalOverlap === 0) {
      // Perfect fit with zero collision! Keep offset at [0, 0]
      placedBoxes.push(naturalBox);
      offsetResults.set(id, { x: 0, y: 0, isOffset: false });
      return;
    }

    // Natural position has collision; search radial candidate positions
    let bestCandidate = { x: 0, y: 0 };
    let minCost = Infinity;
    let foundZeroOverlap = false;

    const baseStepX = halfW + 12;
    const baseStepY = halfH + 10;

    for (const mult of ringMultipliers) {
      if (foundZeroOverlap) break;

      for (const angle of angleSteps) {
        const dx = Math.round(Math.cos(angle) * baseStepX * mult);
        const dy = Math.round(Math.sin(angle) * baseStepY * mult);

        const candidateBox = {
          x1: screenPoint.x + dx - halfW - paddingMargin,
          y1: screenPoint.y + dy - halfH - paddingMargin,
          x2: screenPoint.x + dx + halfW + paddingMargin,
          y2: screenPoint.y + dy + halfH + paddingMargin,
        };

        const overlapArea = calculateTotalOverlap(candidateBox);
        const distFromAnchor = Math.hypot(dx, dy);

        // Viewport boundary penalty
        let viewportPenalty = 0;
        if (candidateBox.x1 < 10 || candidateBox.x2 > mapWidth - 10) {
          viewportPenalty += 20000;
        }
        if (candidateBox.y1 < 10 || candidateBox.y2 > mapHeight - 10) {
          viewportPenalty += 20000;
        }

        // Slight natural vertical bias
        const verticalBias = Math.abs(dy) > Math.abs(dx) ? 0 : 5;

        const totalCost = overlapArea * 1000 + distFromAnchor * 0.8 + viewportPenalty + verticalBias;

        if (overlapArea === 0 && viewportPenalty === 0) {
          // Found collision-free candidate in current ring
          bestCandidate = { x: dx, y: dy };
          foundZeroOverlap = true;
          minCost = totalCost;
          break;
        }

        if (totalCost < minCost) {
          minCost = totalCost;
          bestCandidate = { x: dx, y: dy };
        }
      }
    }

    // Place winning candidate
    const finalBox = {
      x1: screenPoint.x + bestCandidate.x - halfW - paddingMargin,
      y1: screenPoint.y + bestCandidate.y - halfH - paddingMargin,
      x2: screenPoint.x + bestCandidate.x + halfW + paddingMargin,
      y2: screenPoint.y + bestCandidate.y + halfH + paddingMargin,
    };
    placedBoxes.push(finalBox);

    const isSignificantlyOffset = Math.hypot(bestCandidate.x, bestCandidate.y) > 6;
    offsetResults.set(id, {
      x: bestCandidate.x,
      y: bestCandidate.y,
      isOffset: isSignificantlyOffset,
    });
  });

  return offsetResults;
}

/**
 * Generate High-Fidelity HTML for a Leaflet Map Chip with Anchor, Leader Line, and Clickable Preview Tooltip
 */
export function buildMapChipHtml({
  item,
  offset = { x: 0, y: 0, isOffset: false },
  isCenter = false,
  isOrigin = false,
  isSelected = false,
}) {
  const id = String(item.id || '');
  const name = item.name || item.title || 'Destination';
  const color = item.color || item.categoryColor || (isOrigin ? '#176B53' : (isCenter ? '#46B392' : '#2F9E6F'));
  const dx = offset.x || 0;
  const dy = offset.y || 0;
  const isOffset = offset.isOffset;

  // Origin point special styling
  if (isOrigin) {
    return `
      <div class="roamio-map-origin-wrapper" data-chip-id="${id}" style="position:relative; width:0; height:0; pointer-events:auto;">
        <div style="position:absolute; left:-14px; top:-14px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--roamio-primary-accent, #176B53); border:3px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.35); cursor:pointer;">
          <div style="width:8px; height:8px; border-radius:50%; background:#FFFFFF;"></div>
        </div>
      </div>
    `;
  }

  // Leader line SVG connecting anchor [0, 0] to chip center [dx, dy]
  const leaderSvg = `
    <svg class="roamio-map-leader-svg" style="position:absolute; left:0; top:0; width:1px; height:1px; overflow:visible; pointer-events:none; z-index:5; ${isOffset ? 'display:block;' : 'display:none;'}">
      <line class="roamio-leader-line-el" x1="0" y1="0" x2="${dx}" y2="${dy}" stroke="var(--roamio-primary-accent, #176B53)" stroke-width="1.5" stroke-dasharray="3, 3" opacity="0.65" />
    </svg>
  `;

  // Anchor dot at exact geographic coordinate
  const anchorDot = `
    <div class="roamio-map-anchor-dot" style="position:absolute; left:-4px; top:-4px; width:8px; height:8px; border-radius:50%; background:${color}; border:1.5px solid #FFFFFF; box-shadow:0 1px 3px rgba(0,0,0,0.3); pointer-events:none; z-index:10;"></div>
  `;

  // Chip Pill styling
  const pillPadding = isCenter ? '4px 10px' : '3px 8px 3px 6px';
  const pillRadius = 'var(--roamio-radius-1, 4px)';
  const fontSize = isCenter ? '12px' : '10.5px';
  const fontWeight = isCenter ? '700' : '600';
  const dotSize = isCenter ? '8px' : '7px';
  const maxPillWidth = isCenter ? '200px' : '180px';
  const borderStyle = isSelected
    ? '2px solid #FFFFFF'
    : '1px solid rgba(255,255,255,0.22)';
  const shadowStyle = isSelected
    ? '0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px var(--roamio-primary-accent, #176B53)'
    : '0 2px 6px rgba(0,0,0,0.25)';

  const distanceHtml = item.distance
    ? `<span style="font-size:9px; color:rgba(255,255,255,0.75); white-space:nowrap; margin-left:2px; flex-shrink:0;">${item.distance}</span>`
    : '';

  // Destination/Place Preview Card HTML for Tooltip
  const descriptionText = item.description || item.intro || (item.category ? `${item.category} Destination` : '');
  const imageHtml = item.image
    ? `<div style="width:100%; height:74px; border-radius:5px; overflow:hidden; margin-bottom:7px; background:#e2e8f0; pointer-events:none;">
         <img src="${item.image}" alt="${name}" style="width:100%; height:100%; object-fit:cover;" />
       </div>`
    : '';

  const metaDetails = [
    item.travelTime || item.travelTimeShort,
    item.budget ? (typeof item.budget === 'number' ? `₹${item.budget.toLocaleString('en-IN')}` : item.budget) : (item.timeAndCost || item.estimatedCost),
    item.weather,
  ].filter(Boolean);

  const previewCardHtml = `
    <div class="roamio-map-chip-preview-card" style="display:none; position:absolute; left:50%; bottom:calc(100% + 8px); transform:translateX(-50%); width:220px; background:#FFFFFF; border-radius:8px; border:1px solid #DEDEDE; box-shadow:0 8px 24px rgba(0,0,0,0.18); padding:9px 10px; z-index:1200; pointer-events:auto; text-align:left; font-family:'Inter', sans-serif; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;">
      ${imageHtml}
      <div style="font-size:12.5px; font-weight:700; color:#1C2420; line-height:16px; margin-bottom:2px; pointer-events:none;">${name}</div>
      ${descriptionText ? `<div style="font-size:10.5px; color:#5B6660; line-height:14px; margin-bottom:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; pointer-events:none;">${descriptionText}</div>` : ''}
      ${metaDetails.length > 0 ? `
        <div style="display:flex; flex-wrap:wrap; gap:4px; font-size:9.5px; font-weight:600; color:var(--roamio-primary-accent, #176B53); padding-top:4px; border-top:1px solid #F0EFEA; pointer-events:none;">
          ${metaDetails.map(m => `<span style="background:#EDF3EF; padding:2px 6px; border-radius:3px;">${m}</span>`).join('')}
        </div>
      ` : ''}
      <div style="margin-top:6px; padding-top:5px; border-top:1px solid #F0EFEA; font-size:10px; font-weight:700; color:var(--roamio-primary-accent, #176B53); display:flex; align-items:center; justify-content:space-between; pointer-events:none;">
        <span>Explore Destination</span>
        <span style="font-size:12px; font-weight:bold;">&rarr;</span>
      </div>
    </div>
  `;

  return `
    <div class="roamio-map-chip-wrapper ${isSelected ? 'is-selected' : ''}" data-chip-id="${id}" style="position:relative; width:0; height:0; pointer-events:auto;">
      ${anchorDot}
      ${leaderSvg}
      <div class="roamio-map-chip-pill-container" style="position:absolute; left:0; top:0; transform:translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)); transition:transform 0.18s ease-out; z-index:50;">
        <div class="roamio-map-chip-pill" style="display:inline-flex; align-items:center; gap:5px; background:var(--roamio-primary-accent, #176B53); color:#FFFFFF; padding:${pillPadding}; border-radius:${pillRadius}; border:${borderStyle}; box-shadow:${shadowStyle}; width:max-content; max-width:${maxPillWidth}; cursor:pointer; font-family:'Inter', sans-serif; transition:all 0.15s ease;">
          <span style="display:inline-block; width:${dotSize}; height:${dotSize}; border-radius:50%; background:${color}; flex-shrink:0;"></span>
          <span style="font-size:${fontSize}; font-weight:${fontWeight}; color:#FFFFFF; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:14px;">${name}</span>
          ${distanceHtml}
        </div>
        ${previewCardHtml}
      </div>
    </div>
  `;
}

/**
 * Controller class to manage interactive, collision-aware map chips on a Leaflet map
 */
export class MapChipController {
  constructor(map, options = {}) {
    this.map = map;
    this.options = options;
    this.layerGroup = L.layerGroup().addTo(map);
    this.markers = new Map(); // id -> { marker, item, isCenter, isOrigin }
    this.activeSelectedId = null;
    this.items = [];
    this.onSelect = options.onSelect || null;
    this.onPreviewClick = options.onPreviewClick || options.onSelect || null;
    this.onChipClick = options.onChipClick || null;
    this.onHover = options.onHover || null;

    this.handleMapMove = this.handleMapMove.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);

    this.map.on('moveend zoomend resize', this.handleMapMove);
    this.map.on('click', this.handleMapClick);
  }

  setItems(items = []) {
    this.items = items;
    this.layerGroup.clearLayers();
    this.markers.clear();

    if (!items || items.length === 0) return;

    // Calculate initial offsets
    const offsets = calculateChipOffsets(this.map, items, this.options);

    items.forEach((item, idx) => {
      if (!item.coords || !Array.isArray(item.coords) || item.coords.length !== 2) return;
      const id = String(item.id || `item_${idx}`);
      const offset = offsets.get(id) || { x: 0, y: 0, isOffset: false };
      const isCenter = Boolean(item.isCenter);
      const isOrigin = Boolean(item.isOrigin || item.isStart);
      const isSelected = this.activeSelectedId === id;

      const html = buildMapChipHtml({
        item,
        offset,
        isCenter,
        isOrigin,
        isSelected,
      });

      const icon = L.divIcon({
        html,
        className: 'roamio-map-chip-leaflet-icon',
        iconSize: [0, 0],
      });

      const marker = L.marker(item.coords, {
        icon,
        zIndexOffset: isSelected ? 1000 : 50,
      }).addTo(this.layerGroup);

      this.bindMarkerEvents(marker, item, id);
      this.markers.set(id, { marker, item, isCenter, isOrigin });
    });
  }

  bindMarkerEvents(marker, item, id) {
    const el = marker.getElement();
    if (!el) {
      // If DOM element not immediately ready, hook once added
      marker.once('add', () => this.bindMarkerEvents(marker, item, id));
      return;
    }

    const pill = el.querySelector('.roamio-map-chip-pill');
    const preview = el.querySelector('.roamio-map-chip-preview-card');

    if (!pill) return;

    let hideTimer = null;

    const showCard = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (this.activeSelectedId !== id) {
        marker.setZIndexOffset(600);
        pill.style.background = 'var(--roamio-primary-accent-hover, #00513D)';
        pill.style.boxShadow = '0 4px 10px rgba(0,0,0,0.35)';
      }
      if (preview) {
        preview.style.display = 'block';
      }
      if (this.onHover) this.onHover(item);
    };

    const hideCard = () => {
      if (this.activeSelectedId === id) return; // Keep visible if chip is actively selected
      hideTimer = setTimeout(() => {
        marker.setZIndexOffset(50);
        pill.style.background = 'var(--roamio-primary-accent, #176B53)';
        pill.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
        if (preview) {
          preview.style.display = 'none';
        }
      }, 100);
    };

    // 1. Mouse Enter & Leave on Pill
    pill.addEventListener('mouseenter', showCard);
    pill.addEventListener('mouseleave', hideCard);

    // 2. Mouse Enter & Leave & Click on Preview Card
    if (preview) {
      preview.addEventListener('mouseenter', () => {
        showCard();
        preview.style.transform = 'translateX(-50%) translateY(-2px)';
        preview.style.boxShadow = '0 12px 28px rgba(0,0,0,0.24)';
        preview.style.borderColor = 'var(--roamio-primary-accent, #176B53)';
      });

      preview.addEventListener('mouseleave', () => {
        preview.style.transform = 'translateX(-50%)';
        preview.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
        preview.style.borderColor = '#DEDEDE';
        hideCard();
      });

      // Clicking preview card triggers destination detail navigation
      preview.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('[MapChip] Preview card clicked -> navigating to destination detail for:', item.name || item.id);
        if (this.onPreviewClick) {
          this.onPreviewClick(item);
        } else if (this.onSelect) {
          this.onSelect(item);
        }
      });
    }

    // 3. Click on Pill foregrounds / selects the chip
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectChip(id);
      if (this.onChipClick) {
        this.onChipClick(item);
      }
    });
  }

  selectChip(id) {
    // Reset previous selection
    if (this.activeSelectedId && this.activeSelectedId !== id) {
      const prevEntry = this.markers.get(this.activeSelectedId);
      if (prevEntry) {
        prevEntry.marker.setZIndexOffset(50);
        const prevEl = prevEntry.marker.getElement();
        if (prevEl) {
          const prevPill = prevEl.querySelector('.roamio-map-chip-pill');
          const prevPreview = prevEl.querySelector('.roamio-map-chip-preview-card');
          if (prevPill) {
            prevPill.style.background = 'var(--roamio-primary-accent, #176B53)';
            prevPill.style.border = '1px solid rgba(255,255,255,0.22)';
            prevPill.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
          }
          if (prevPreview) prevPreview.style.display = 'none';
        }
      }
    }

    this.activeSelectedId = id;

    // Apply active foregrounding to current selection
    const currEntry = this.markers.get(id);
    if (currEntry) {
      currEntry.marker.setZIndexOffset(1000); // Highest z-index
      const currEl = currEntry.marker.getElement();
      if (currEl) {
        const currPill = currEl.querySelector('.roamio-map-chip-pill');
        const currPreview = currEl.querySelector('.roamio-map-chip-preview-card');
        if (currPill) {
          currPill.style.background = 'var(--roamio-primary-accent-hover, #00513D)';
          currPill.style.border = '2px solid #FFFFFF';
          currPill.style.boxShadow = '0 6px 16px rgba(0,0,0,0.45), 0 0 0 2px var(--roamio-primary-accent, #176B53)';
        }
        if (currPreview) {
          currPreview.style.display = 'block';
        }
      }
    }
  }

  deselectAll() {
    if (!this.activeSelectedId) return;
    const prevEntry = this.markers.get(this.activeSelectedId);
    if (prevEntry) {
      prevEntry.marker.setZIndexOffset(50);
      const prevEl = prevEntry.marker.getElement();
      if (prevEl) {
        const prevPill = prevEl.querySelector('.roamio-map-chip-pill');
        const prevPreview = prevEl.querySelector('.roamio-map-chip-preview-card');
        if (prevPill) {
          prevPill.style.background = 'var(--roamio-primary-accent, #176B53)';
          prevPill.style.border = '1px solid rgba(255,255,255,0.22)';
          prevPill.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
        }
        if (prevPreview) prevPreview.style.display = 'none';
      }
    }
    this.activeSelectedId = null;
  }

  handleMapClick() {
    this.deselectAll();
  }

  handleMapMove() {
    if (!this.items || this.items.length === 0) return;

    // Recompute offsets dynamically for new zoom/pan state
    const offsets = calculateChipOffsets(this.map, this.items, this.options);

    this.markers.forEach((entry, id) => {
      const offset = offsets.get(id) || { x: 0, y: 0, isOffset: false };
      const el = entry.marker.getElement();
      if (!el) return;

      const pillContainer = el.querySelector('.roamio-map-chip-pill-container');
      const leaderSvg = el.querySelector('.roamio-map-leader-svg');
      const leaderLine = el.querySelector('.roamio-leader-line-el');

      if (pillContainer) {
        pillContainer.style.transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`;
      }

      if (leaderSvg && leaderLine) {
        if (offset.isOffset) {
          leaderSvg.style.display = 'block';
          leaderLine.setAttribute('x2', offset.x);
          leaderLine.setAttribute('y2', offset.y);
        } else {
          leaderSvg.style.display = 'none';
        }
      }
    });
  }

  destroy() {
    this.map.off('moveend zoomend resize', this.handleMapMove);
    this.map.off('click', this.handleMapClick);
    this.layerGroup.clearLayers();
    this.map.removeLayer(this.layerGroup);
    this.markers.clear();
    this.items = [];
  }
}
