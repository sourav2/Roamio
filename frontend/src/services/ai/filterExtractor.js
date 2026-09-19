import {
  MAX_TRAVEL_TIME_OPTIONS,
  TRAVEL_MODE_OPTIONS,
  ACCOMMODATION_OPTIONS,
  CROWD_LEVEL_OPTIONS,
  TRIP_TYPE_OPTIONS,
} from '../../config/filterConfig.js';
import { parser } from './parser.js';

/**
 * Valid canonical trip type labels from filterConfig.js:
 * ['Adventure', 'Relaxation', 'Spiritual', 'Nature', 'Culture', 'Romantic', 'Family', 'Food']
 */
export const VALID_TRIP_TYPE_LABELS = TRIP_TYPE_OPTIONS.map((t) => t.label);

/**
 * Mapping between canonical display labels and internal filter IDs:
 * e.g. 'Adventure' -> 'adventure'
 */
export const TRIP_TYPE_LABEL_TO_ID = TRIP_TYPE_OPTIONS.reduce((acc, curr) => {
  acc[curr.label.toLowerCase()] = curr.id;
  return acc;
}, {});

export const WORD_TO_NUMBER = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

// Recognized Regions / Broad Destinations (NEVER a starting origin location)
export const KNOWN_REGIONS = [
  'South India',
  'North India',
  'East India',
  'West India',
  'Northeast India',
  'Central India',
  'North East',
  'Northeast',
];

// Recognized Specific Destinations
export const KNOWN_DESTINATIONS = [
  'South India',
  'North India',
  'Northeast India',
  'Andaman',
  'Darjeeling',
  'Meghalaya',
  'Goa',
  'Manali',
  'Ladakh',
  'Sikkim',
  'Kerala',
  'Kashmir',
  'Shillong',
  'Ooty',
  'Coorg',
  'Purulia',
  'Mandarmoni',
  'Kalimpong',
  'Dooars',
  'Digha',
  'Munnar',
  'Alleppey',
  'Hampi',
  'Wayanad',
  'Rishikesh',
  'Jim Corbett',
  'Kasol',
  'Bir Billing',
  'Jaipur',
  'Udaipur',
  'Varkala',
  'Kodaikanal',
  'Gokarna',
];

// Disallowed standalone location tokens (directions or meaningless prepositions)
export const INVALID_LOCATION_TOKENS = new Set([
  'south', 'north', 'east', 'west',
  'by south', 'by north', 'by east', 'by west',
  'near', 'nearby', 'around', 'from', 'to', 'in', 'at', 'the', 'some', 'place', 'places'
]);

/**
 * Strict System Prompt for Natural Language -> Structured Roamio Filter Extraction
 */
export const SYSTEM_PROMPT_FILTER_EXTRACTION = `You are the Roamio AI Preference Extraction Engine.
Your sole job is to analyze user travel queries and extract structured preferences into a strict JSON schema.

ALLOWED VALUES:
- "location": Origin/starting city only (e.g. "Kolkata", "Mumbai", "Delhi") or null
- "destination": Explicit target destination or region (e.g. "South India", "Darjeeling", "Andaman", "Goa") or null
- "travellers": Total count of travellers as an integer (e.g. 1, 2, 3, 4) or null
- "duration_days": Number of days as an integer (e.g. 3, 5, 7) or null
- "budget_per_person": Maximum budget amount as an integer number (e.g. 8000, 10000, 25000) or null
- "max_travel_time": One of ["2 h", "3 h", "4 h", "5 h", "6 h+"] or null
- "travel_mode": One of ["Car", "Train", "Bus", "Flight"] or null
- "trip_type": An array of matched trip types from ["Adventure", "Relaxation", "Spiritual", "Nature", "Culture", "Romantic", "Family", "Food"] or null
- "accommodation": One of ["Budget", "Comfortable", "Luxury"] or null
- "crowd_level": One of ["Low", "Moderate", "High"] or null

CRITICAL LOCATION VS DESTINATION RULES:
1. "location" is strictly the user's starting origin city when explicitly provided (e.g. "from Delhi", "starting from Mumbai", "near Delhi", "nearby Kolkata").
2. "destination" is the target destination or region the user wants to visit (e.g. "in South India", "trip to Andaman", "visit Goa").
3. Regions such as "South India", "North India", "Northeast India", "East India", "West India" are DESTINATIONS, NEVER starting locations.
4. Words such as "South", "North", "East", "West" or "by South" must NEVER be assigned to "location".
5. For "Find some good places in South India": destination is "South India", location is null.
6. For "Find adventure places near Delhi": location is "Delhi", destination is null.
7. For "Find adventure places from Delhi in South India": location is "Delhi", destination is "South India".
8. Never guess or hallucinate a starting location. If no origin is explicitly stated, location MUST be null.

CRITICAL NUMBER & WORD CONVERSION RULES:
1. Convert written word numbers to integers:
   "one" -> 1, "two" -> 2, "three" -> 3, "four" -> 4, "five" -> 5,
   "six" -> 6, "seven" -> 7, "eight" -> 8, "nine" -> 9, "ten" -> 10.
2. "five days" -> duration_days: 5. "three people" -> travellers: 3. "two travellers" -> travellers: 2.
3. If user says "weekend", do NOT guess duration_days unless a specific number of days is stated.

OTHER MAPPING RULES:
1. "quiet", "peaceful", "calm", "secluded", "away from crowd" -> crowd_level: "Low".
2. "popular", "famous", "happening", "buzzing", "vibrant" -> crowd_level: "High".
3. "adventure", "trekking", "rafting", "thrill" -> trip_type: ["Adventure"].
4. "chill", "relaxing", "spa", "peace" -> trip_type: ["Relaxation"].
5. "romantic", "couple", "honeymoon" -> trip_type: ["Romantic"].
6. "family", "kids" -> trip_type: ["Family"].
7. "spiritual", "temple", "pilgrimage" -> trip_type: ["Spiritual"].
8. "nature", "scenic", "mountains", "waterfalls", "greenery" -> trip_type: ["Nature"].
9. "culture", "heritage", "historical" -> trip_type: ["Culture"].
10. "food", "cuisine", "street food", "culinary" -> trip_type: ["Food"].
11. ABSOLUTE RULE: Never guess, hallucinate, or extrapolate values not mentioned in the query. Unstated values MUST be null.
12. If query is vague like "Find me something", "show destinations", or "explore", ALL fields must be null.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "location": string | null,
  "destination": string | null,
  "travellers": number | null,
  "duration_days": number | null,
  "budget_per_person": number | null,
  "max_travel_time": string | null,
  "travel_mode": string | null,
  "trip_type": string[] | null,
  "accommodation": string | null,
  "crowd_level": string | null
}`;

/**
 * Clean natural-language search prefixes/modifiers from extracted destination names.
 * Ensures destination contains the canonical geographic entity (e.g. "Himachal Pradesh")
 * rather than search phrases (e.g. "nearby Himachal Pradesh", "places near Goa", "around Kerala").
 */
export function normalizeDestinationEntity(dest) {
  if (!dest || typeof dest !== 'string') return null;
  let cleaned = dest.trim();

  // Strip natural language modifiers, prepositions, and queries from destination prefix
  // e.g. "nearby ", "near ", "around ", "close to ", "places near ", "destinations near ", "destinations around ", "places around ", "in ", "to ", "visit "
  const prefixRegex = /^(?:destinations?\s+(?:in|near|around|to|close\s+to)|places?\s+(?:in|near|around|to|close\s+to)|trip\s+(?:in|near|around|to)|nearby|near|around|close\s+to|in|to|visit)\s+/i;

  let prev = '';
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(prefixRegex, '').trim();
  }

  // Also clean trailing filler words like " places", " destinations", " spots"
  cleaned = cleaned.replace(/\s+(?:places?|destinations?|spots?)$/i, '').trim();

  // If the query was purely words like "nearby", return null
  if (/^(?:nearby|near|around|close\s+to|places?|destinations?)$/i.test(cleaned)) {
    return null;
  }

  // Preserve canonical case for known regions/destinations if matching case-insensitively
  const known = [...KNOWN_REGIONS, ...KNOWN_DESTINATIONS].find(
    (k) => k.toLowerCase() === cleaned.toLowerCase()
  );
  if (known) {
    return known;
  }

  return cleaned || null;
}

/**
 * Validate and sanitize extracted preference data against schema and filterConfig.
 * Ensures no free-form or malformed data compromises the application state.
 */
export function validateExtractedPreferences(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createEmptyPreferences();
  }

  const sanitized = createEmptyPreferences();

  // 1. location
  if (typeof raw.location === 'string' && raw.location.trim()) {
    let loc = normalizeDestinationEntity(raw.location.trim()) || raw.location.trim();
    // Clean any leading prepositions like "by "
    loc = loc.replace(/^by\s+/i, '').trim();

    const locLower = loc.toLowerCase();
    const isRegion = KNOWN_REGIONS.some(
      (r) => r.toLowerCase() === locLower || locLower.includes(r.toLowerCase())
    );

    if (INVALID_LOCATION_TOKENS.has(locLower) || isRegion) {
      // If it's a valid region like "South India", reassign to destination if destination is not yet set
      if (isRegion && !sanitized.destination) {
        const matchedRegion = KNOWN_REGIONS.find(
          (r) => r.toLowerCase() === locLower || locLower.includes(r.toLowerCase())
        );
        sanitized.destination = matchedRegion || loc;
      }
      sanitized.location = null;
    } else {
      sanitized.location = loc;
    }
  }

  // 2. destination
  if (typeof raw.destination === 'string' && raw.destination.trim()) {
    const cleaned = normalizeDestinationEntity(raw.destination.trim());
    sanitized.destination = cleaned || raw.destination.trim();
  }

  // 3. travellers
  if (typeof raw.travellers === 'number' && !isNaN(raw.travellers) && raw.travellers > 0) {
    sanitized.travellers = Math.round(raw.travellers);
  } else if (typeof raw.travellers === 'string') {
    const lowerTrav = raw.travellers.toLowerCase().trim();
    if (WORD_TO_NUMBER[lowerTrav]) {
      sanitized.travellers = WORD_TO_NUMBER[lowerTrav];
    } else {
      const parsed = parseInt(raw.travellers.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) sanitized.travellers = parsed;
    }
  }

  // 4. duration_days
  if (typeof raw.duration_days === 'number' && !isNaN(raw.duration_days) && raw.duration_days > 0) {
    sanitized.duration_days = Math.round(raw.duration_days);
  } else if (typeof raw.duration_days === 'string') {
    const lowerDur = raw.duration_days.toLowerCase().trim();
    if (WORD_TO_NUMBER[lowerDur]) {
      sanitized.duration_days = WORD_TO_NUMBER[lowerDur];
    } else {
      const parsed = parseInt(raw.duration_days.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) sanitized.duration_days = parsed;
    }
  }

  // 5. budget_per_person
  if (typeof raw.budget_per_person === 'number' && !isNaN(raw.budget_per_person) && raw.budget_per_person > 0) {
    sanitized.budget_per_person = Math.round(raw.budget_per_person);
  } else if (typeof raw.budget_per_person === 'string') {
    const parsed = parseInt(raw.budget_per_person.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) sanitized.budget_per_person = parsed;
  }

  // 6. max_travel_time
  if (typeof raw.max_travel_time === 'string') {
    const matched = MAX_TRAVEL_TIME_OPTIONS.find(
      (opt) => opt.toLowerCase() === raw.max_travel_time.trim().toLowerCase()
    );
    if (matched && matched !== 'Any') {
      sanitized.max_travel_time = matched;
    }
  }

  // 7. travel_mode
  if (typeof raw.travel_mode === 'string') {
    const matched = TRAVEL_MODE_OPTIONS.find(
      (opt) => opt.toLowerCase() === raw.travel_mode.trim().toLowerCase()
    );
    if (matched && matched !== 'Any') {
      sanitized.travel_mode = matched;
    }
  }

  // 8. trip_type
  if (Array.isArray(raw.trip_type)) {
    const validTypes = [];
    raw.trip_type.forEach((item) => {
      if (typeof item === 'string') {
        const found = VALID_TRIP_TYPE_LABELS.find(
          (label) => label.toLowerCase() === item.trim().toLowerCase()
        );
        if (found && !validTypes.includes(found)) {
          validTypes.push(found);
        }
      }
    });
    sanitized.trip_type = validTypes.length > 0 ? validTypes : null;
  }

  // 9. accommodation
  if (typeof raw.accommodation === 'string') {
    const matched = ACCOMMODATION_OPTIONS.find(
      (opt) => opt.toLowerCase() === raw.accommodation.trim().toLowerCase()
    );
    if (matched) {
      sanitized.accommodation = matched;
    }
  }

  // 10. crowd_level
  if (typeof raw.crowd_level === 'string') {
    const matched = CROWD_LEVEL_OPTIONS.find(
      (opt) => opt.toLowerCase() === raw.crowd_level.trim().toLowerCase()
    );
    if (matched && matched !== 'Any') {
      sanitized.crowd_level = matched;
    }
  }

  return sanitized;
}

/**
 * Returns an empty preferences object with all keys set to null
 */
export function createEmptyPreferences() {
  return {
    location: null,
    destination: null,
    travellers: null,
    duration_days: null,
    budget_per_person: null,
    max_travel_time: null,
    travel_mode: null,
    trip_type: null,
    accommodation: null,
    crowd_level: null,
  };
}

/**
 * Robust Local Rule-Based Fallback Extractor
 * Used if Gemini API is unreachable, offline, or returns a network error.
 */
export function extractPreferencesLocalFallback(query) {
  if (!query || typeof query !== 'string') return createEmptyPreferences();
  const q = query.trim();
  const lower = q.toLowerCase();

  const prefs = createEmptyPreferences();

  // Duration: "5 days", "five days", "3-day", "3 days", "for 4 days"
  const durationMatch = lower.match(/(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:-| )?days?/i);
  if (durationMatch) {
    const val = durationMatch[1].toLowerCase();
    prefs.duration_days = WORD_TO_NUMBER[val] || parseInt(val, 10);
  }

  // Budget: "under 10,000", "under ₹10000", "budget 8000", "below 15000", "₹10,000", "10000 rupees"
  const budgetMatch = lower.match(/(?:under|below|budget of|less than|max)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i)
    || lower.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i)
    || lower.match(/([\d,]+)\s*(?:rupees|inr)/i);
  if (budgetMatch) {
    const num = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(num) && num > 0) prefs.budget_per_person = num;
  }

  // Target Destination / Region: "nearby [City]", "places near [City]", "trip around [City]", "close to [City]", "in [City]", "to [City]"
  const destMatch = q.match(/\b(?:destinations?\s+(?:in|near|around|to|close\s+to)|places?\s+(?:in|near|around|to|close\s+to)|trip\s+(?:in|near|around|to)|nearby|near|around|close\s+to|in|to|visit)\s+([a-zA-Z\s]+?)(?:,|\.|\s+from\b|\s+starting\s+from\b|\s+under\b|\s+for\b|\s+with\b|\s+by\b|$)/i);
  if (destMatch && destMatch[1]) {
    let candidate = normalizeDestinationEntity(destMatch[1]);
    if (candidate) {
      const candidateLower = candidate.toLowerCase();
      if (!INVALID_LOCATION_TOKENS.has(candidateLower) && candidate.length > 1) {
        const matchedRegion = KNOWN_REGIONS.find((r) => r.toLowerCase() === candidateLower);
        prefs.destination = matchedRegion || candidate;
      }
    }
  }

  // Starting Location: "from [City]", "starting from [City]", "departing from [City]"
  const startLocMatch = q.match(/\b(?:from|starting\s+from|departing\s+from)\s+([a-zA-Z\s]+?)(?:,|\.|\s+in\b|\s+to\b|\s+under\b|\s+for\b|\s+with\b|\s+by\b|$)/i);
  if (startLocMatch && startLocMatch[1]) {
    let candidate = normalizeDestinationEntity(startLocMatch[1]) || startLocMatch[1].trim();
    candidate = candidate.replace(/^by\s+/i, '').trim();

    const candidateLower = candidate.toLowerCase();
    const isRegion = KNOWN_REGIONS.some(
      (r) => r.toLowerCase() === candidateLower || candidateLower.includes(r.toLowerCase())
    );

    if (!INVALID_LOCATION_TOKENS.has(candidateLower) && !isRegion && candidate.length > 1) {
      prefs.location = candidate;
    }
  }

  // Specific Destination from Known Database if destination is still null
  if (!prefs.destination) {
    for (const dest of KNOWN_DESTINATIONS) {
      const regex = new RegExp(`\\b${dest}\\b`, 'i');
      if (regex.test(q)) {
        if (!prefs.location || prefs.location.toLowerCase() !== dest.toLowerCase()) {
          prefs.destination = dest;
          break;
        }
      }
    }
  }

  // Safeguard: If location is a known broad region like "South India", move it to destination
  if (prefs.location) {
    const locLower = prefs.location.toLowerCase();
    const isRegion = KNOWN_REGIONS.some((r) => r.toLowerCase() === locLower);
    if (isRegion) {
      if (!prefs.destination) {
        const matched = KNOWN_REGIONS.find((r) => r.toLowerCase() === locLower);
        prefs.destination = matched || prefs.location;
      }
      prefs.location = null;
    }
  }

  // Travel Mode: "by train", "by car", "by bus", "by flight"
  for (const mode of ['Train', 'Car', 'Bus', 'Flight']) {
    if (new RegExp(`\\b(?:by|via)\\s+${mode}\\b|\\b${mode}\\b`, 'i').test(lower)) {
      prefs.travel_mode = mode;
      break;
    }
  }

  // Crowd Level: "quiet", "peaceful", "calm", "secluded" -> Low
  if (/quiet|peaceful|calm|secluded|less crowd/i.test(lower)) {
    prefs.crowd_level = 'Low';
  } else if (/buzzing|popular|famous/i.test(lower)) {
    prefs.crowd_level = 'High';
  }

  // Trip Types
  const matchedTripTypes = [];
  if (/adventure|trekking|rafting|thrill|hiking/i.test(lower)) matchedTripTypes.push('Adventure');
  if (/relaxation|relaxing|chill|peace|retreat/i.test(lower)) matchedTripTypes.push('Relaxation');
  if (/nature|scenic|mountain|hills|waterfall/i.test(lower)) matchedTripTypes.push('Nature');
  if (/romantic|couple|honeymoon/i.test(lower)) matchedTripTypes.push('Romantic');
  if (/family|kids/i.test(lower)) matchedTripTypes.push('Family');
  if (/spiritual|temple|pilgrimage/i.test(lower)) matchedTripTypes.push('Spiritual');
  if (/culture|heritage|historic/i.test(lower)) matchedTripTypes.push('Culture');
  if (/food|culinary|cuisine/i.test(lower)) matchedTripTypes.push('Food');

  if (matchedTripTypes.length > 0) {
    prefs.trip_type = matchedTripTypes;
  }

  // Travellers: "2 travellers", "for three people", "for 4 people", "solo", "couple"
  if (/solo|alone/i.test(lower)) {
    prefs.travellers = 1;
  } else if (/\bcouple\b/i.test(lower)) {
    prefs.travellers = 2;
  } else {
    const travMatch = lower.match(/(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:travellers?|travelers?|people|persons?|guests?|adults?)/i);
    if (travMatch) {
      const val = travMatch[1].toLowerCase();
      prefs.travellers = WORD_TO_NUMBER[val] || parseInt(val, 10);
    }
  }

  return prefs;
}

/**
 * Apply only non-null validated preferences onto the existing Roamio filter state.
 * Leaves all unstated filters untouched.
 */
export function applyPreferencesToFilterState(preferences, currentFilterState = {}) {
  if (!preferences) return currentFilterState;

  const updated = { ...currentFilterState };

  // Explicit new destination or location resets stale counterpart unless explicitly provided in query
  if (preferences.destination !== null && preferences.destination !== undefined) {
    const normExtracted = normalizeDestinationEntity(preferences.destination) || preferences.destination;
    const existingDest = currentFilterState.destination;

    // If the user already selected a canonical Destination from the dropdown,
    // do not overwrite it with the raw voice-search phrase if it refers to the same entity
    if (
      existingDest &&
      typeof existingDest === 'string' &&
      normExtracted &&
      (existingDest.trim().toLowerCase() === normExtracted.toLowerCase() ||
       normExtracted.toLowerCase().includes(existingDest.trim().toLowerCase()) ||
       existingDest.trim().toLowerCase().includes(normExtracted.toLowerCase()))
    ) {
      updated.destination = existingDest;
    } else {
      updated.destination = normExtracted;
    }

    // When a new destination is explicitly specified without an explicit origin in the new query,
    // clear the old location so a previous origin (e.g. Goa) does not leak into the new destination (e.g. Kerala).
    if (preferences.location === null || preferences.location === undefined) {
      updated.location = null;
    }
  }

  if (preferences.location !== null && preferences.location !== undefined) {
    updated.location = preferences.location;
    // When a new origin/location is explicitly specified without an explicit destination in the new query,
    // clear the old destination.
    if (preferences.destination === null || preferences.destination === undefined) {
      updated.destination = null;
    }
  }

  if (preferences.location && preferences.destination) {
    updated.location = preferences.location;
    updated.destination = preferences.destination;
  }

  if (preferences.region !== undefined) {
    updated.region = preferences.region;
  }

  if (preferences.travellers !== null && preferences.travellers !== undefined) {
    updated.travellerCount = preferences.travellers;
    updated.travellers = `${preferences.travellers} ${preferences.travellers === 1 ? 'Traveller' : 'Travellers'}`;
  }

  if (preferences.duration_days !== null && preferences.duration_days !== undefined) {
    updated.duration = preferences.duration_days;
  }

  if (preferences.budget_per_person !== null && preferences.budget_per_person !== undefined) {
    updated.budget = preferences.budget_per_person;
  }

  if (preferences.max_travel_time !== null && preferences.max_travel_time !== undefined) {
    updated.maxTravelTime = preferences.max_travel_time;
  }

  if (preferences.travel_mode !== null && preferences.travel_mode !== undefined) {
    updated.travelMode = preferences.travel_mode;
  }

  if (preferences.trip_type !== null && Array.isArray(preferences.trip_type)) {
    // Convert canonical labels ('Adventure', 'Relaxation') to internal IDs ('adventure', 'relaxation')
    const mappedIds = preferences.trip_type
      .map((label) => TRIP_TYPE_LABEL_TO_ID[label.toLowerCase()])
      .filter(Boolean);
    if (mappedIds.length > 0) {
      updated.selectedTripTypes = mappedIds;
      updated.tripTypes = mappedIds;
    }
  }

  if (preferences.accommodation !== null && preferences.accommodation !== undefined) {
    updated.accommodationType = preferences.accommodation;
  }

  if (preferences.crowd_level !== null && preferences.crowd_level !== undefined) {
    updated.crowdLevel = preferences.crowd_level;
  }

  return updated;
}
