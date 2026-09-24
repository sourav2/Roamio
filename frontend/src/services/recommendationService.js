import { Route, Clock, Wallet, Sun } from 'lucide-react';
import { envConfig } from './envConfig.js';
const fallbackImg = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop';

/**
 * Curated Destination Database
 * Rich metadata for regional discovery and AI recommendation matching.
 */
export const ALL_DESTINATIONS = [
  // West Bengal / East (Origin: Kolkata)
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    description: 'Queen of the Hills, tea gardens and Himalayan sunrise.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'North Bengal',
    duration: 3,
    budget: 7500,
    travelModes: ['Train', 'Car', 'Flight'],
    travelTime: '11-13 Hours',
    tripTypes: ['adventure', 'nature', 'culture', 'relaxation'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [27.0410, 88.2663],
    weather: 'Cool & Misty',
  },
  {
    id: 'purulia',
    name: 'Purulia',
    description: 'Rugged hills, hidden waterfalls, and tribal folklore.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'Purulia',
    duration: 2,
    budget: 4500,
    travelModes: ['Train', 'Car'],
    travelTime: '5-6 Hours',
    tripTypes: ['adventure', 'nature', 'culture'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [23.3321, 86.3652],
    weather: 'Sunny & Pleasant',
  },
  {
    id: 'mandarmoni',
    name: 'Mandarmoni',
    description: 'Driveable beach resort with seaside water sports and seafood.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'Coastal Bengal',
    duration: 2,
    budget: 6000,
    travelModes: ['Car', 'Bus'],
    travelTime: '3-4 Hours',
    tripTypes: ['relaxation', 'food', 'romantic', 'family'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [21.6667, 87.7000],
    weather: 'Sunny & Breezy',
  },
  {
    id: 'kalimpong',
    name: 'Kalimpong',
    description: 'Himalayan views, historic monasteries, and tranquil nature trails.',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0db?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'North Bengal',
    duration: 3,
    budget: 7000,
    travelModes: ['Train', 'Car'],
    travelTime: '12 Hours',
    tripTypes: ['nature', 'culture', 'relaxation', 'spiritual'],
    crowdLevel: 'Low',
    accommodation: 'Comfortable',
    coords: [27.0667, 88.4667],
    weather: 'Mild & Crisp',
  },
  {
    id: 'dooars',
    name: 'Dooars',
    description: 'Dense elephant reserves, sprawling tea estates, and wild rivers.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'Dooars Foothills',
    duration: 3,
    budget: 6500,
    travelModes: ['Train', 'Car'],
    travelTime: '12-14 Hours',
    tripTypes: ['adventure', 'nature', 'family'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [26.7500, 89.0000],
    weather: 'Lush & Tropical',
  },
  {
    id: 'digha',
    name: 'Digha',
    description: 'Casuarina coastal promenade with buzzing street food and calm waves.',
    image: 'https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'Coastal Bengal',
    duration: 2,
    budget: 5000,
    travelModes: ['Train', 'Bus', 'Car'],
    travelTime: '4 Hours',
    tripTypes: ['family', 'relaxation', 'food'],
    crowdLevel: 'High',
    accommodation: 'Budget',
    coords: [21.6266, 87.5074],
    weather: 'Coastal Warm',
  },

  // Andaman & Nicobar Islands (Origin: Andaman / Port Blair)
  {
    id: 'havelock-island',
    name: 'Havelock Island (Swaraj Dweep)',
    description: 'Radhanagar Beach, turquoise waters, scuba diving, and sea kayaking.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop',
    location: 'Andaman',
    region: 'Andaman Islands',
    duration: 3,
    budget: 9500,
    travelModes: ['Flight', 'Car'],
    travelTime: '2-3 Hours Ferry',
    tripTypes: ['adventure', 'nature', 'relaxation', 'romantic'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [11.9761, 92.9876],
    weather: 'Tropical & Sunny',
  },
  {
    id: 'neil-island',
    name: 'Neil Island (Shaheed Dweep)',
    description: 'Secluded pristine shores, natural coral bridge, and peaceful sunset points.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    location: 'Andaman',
    region: 'Andaman Islands',
    duration: 2,
    budget: 7500,
    travelModes: ['Flight', 'Car'],
    travelTime: '1.5 Hours Ferry',
    tripTypes: ['relaxation', 'nature', 'romantic'],
    crowdLevel: 'Low',
    accommodation: 'Comfortable',
    coords: [11.8324, 93.0531],
    weather: 'Breezy Tropical',
  },
  {
    id: 'port-blair',
    name: 'Port Blair',
    description: 'Historic Cellular Jail, light & sound show, and coral reef excursions.',
    image: 'https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop',
    location: 'Andaman',
    region: 'Andaman Islands',
    duration: 3,
    budget: 8000,
    travelModes: ['Flight', 'Bus'],
    travelTime: 'Direct Entry',
    tripTypes: ['culture', 'family', 'nature'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [11.6234, 92.7265],
    weather: 'Tropical Warm',
  },
  {
    id: 'baratang-island',
    name: 'Baratang Island',
    description: 'Limestone caves, mangrove safari creek, and mud volcanoes.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
    location: 'Andaman',
    region: 'Andaman Islands',
    duration: 2,
    budget: 6000,
    travelModes: ['Car', 'Bus'],
    travelTime: '3-4 Hours Road',
    tripTypes: ['adventure', 'nature'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [12.1158, 92.7758],
    weather: 'Lush Tropical',
  },
  {
    id: 'elephant-beach',
    name: 'Elephant Beach',
    description: 'Water sports hub with vibrant coral reefs, sea walking, and speedboats.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    location: 'Andaman',
    region: 'Andaman Islands',
    duration: 2,
    budget: 7000,
    travelModes: ['Car', 'Flight'],
    travelTime: '30 min Boat',
    tripTypes: ['adventure', 'nature'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [11.9900, 92.9500],
    weather: 'Sunny Waves',
  },
  {
    id: 'ross-smith-island',
    name: 'Ross & Smith Islands',
    description: 'Twin islands connected by an ethereal natural white sandbar strip.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
    location: 'Andaman',
    region: 'Andaman Islands',
    duration: 3,
    budget: 8500,
    travelModes: ['Car', 'Flight'],
    travelTime: 'North Island Trek',
    tripTypes: ['nature', 'relaxation', 'adventure'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [13.3100, 93.0400],
    weather: 'Quiet Seas',
  },

  // South India Destinations (Region: South India)
  {
    id: 'munnar',
    name: 'Munnar',
    description: 'Emerald green tea hills, misty mountain peaks, and cool waterfalls.',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop',
    location: 'Kochi',
    region: 'South India',
    duration: 3,
    budget: 8500,
    travelModes: ['Car', 'Bus', 'Flight'],
    travelTime: '4 Hours',
    tripTypes: ['nature', 'relaxation', 'romantic', 'adventure'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [10.0889, 77.0595],
    weather: 'Misty & Cool',
  },
  {
    id: 'coorg',
    name: 'Coorg (Kodagu)',
    description: 'Aromatic coffee plantations, misty hills, and scenic trekking waterfalls.',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
    location: 'Bangalore',
    region: 'South India',
    duration: 3,
    budget: 7500,
    travelModes: ['Car', 'Bus'],
    travelTime: '5 Hours',
    tripTypes: ['nature', 'relaxation', 'adventure', 'romantic'],
    crowdLevel: 'Low',
    accommodation: 'Comfortable',
    coords: [12.3375, 75.8069],
    weather: 'Pleasant & Breezy',
  },
  {
    id: 'alleppey',
    name: 'Alleppey (Alappuzha)',
    description: 'Tranquil Kerala backwaters, palm-fringed lagoons, and traditional houseboats.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop',
    location: 'Kochi',
    region: 'South India',
    duration: 2,
    budget: 9000,
    travelModes: ['Train', 'Car', 'Flight'],
    travelTime: '2 Hours',
    tripTypes: ['relaxation', 'romantic', 'family', 'food'],
    crowdLevel: 'Moderate',
    accommodation: 'Luxury',
    coords: [9.4981, 76.3388],
    weather: 'Warm & Tropical',
  },
  {
    id: 'ooty',
    name: 'Ooty (Udhagamandalam)',
    description: 'Nilgiri toy train, panoramic tea gardens, and colonial mountain charm.',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=600&auto=format&fit=crop',
    location: 'Coimbatore',
    region: 'South India',
    duration: 3,
    budget: 7000,
    travelModes: ['Train', 'Car', 'Bus'],
    travelTime: '3 Hours',
    tripTypes: ['nature', 'family', 'romantic', 'relaxation'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [11.4102, 76.6950],
    weather: 'Crisp Highland',
  },
  {
    id: 'hampi',
    name: 'Hampi',
    description: 'Dramatic boulder-strewn landscapes and ancient UNESCO Vijayanagara ruins.',
    image: 'https://images.unsplash.com/photo-1600100397608-f010e08e1f57?q=80&w=600&auto=format&fit=crop',
    location: 'Bangalore',
    region: 'South India',
    duration: 3,
    budget: 6000,
    travelModes: ['Train', 'Car'],
    travelTime: '6 Hours',
    tripTypes: ['culture', 'adventure', 'nature', 'spiritual'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [15.3350, 76.4600],
    weather: 'Sunny & Warm',
  },
  {
    id: 'wayanad',
    name: 'Wayanad',
    description: 'Verdant spice plantations, ancient caves, and forested trekking paths.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop',
    location: 'Kozhikode',
    region: 'South India',
    duration: 3,
    budget: 6500,
    travelModes: ['Car', 'Bus'],
    travelTime: '3 Hours',
    tripTypes: ['nature', 'adventure', 'relaxation'],
    crowdLevel: 'Low',
    accommodation: 'Comfortable',
    coords: [11.6854, 76.1320],
    weather: 'Tropical Mild',
  },

  // North India / Near Delhi Destinations (Origin: Delhi)
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    description: 'White water river rafting on the Ganges, bungee jumping, and cliffside yoga.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    location: 'Delhi',
    region: 'North India',
    duration: 3,
    budget: 6500,
    travelModes: ['Train', 'Car', 'Bus'],
    travelTime: '4-5 Hours',
    tripTypes: ['adventure', 'spiritual', 'nature'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [30.0869, 78.2676],
    weather: 'Pleasant & Crisp',
  },
  {
    id: 'manali',
    name: 'Manali',
    description: 'Snow-capped Himalayan peaks, Solang Valley paragliding, and river crossing.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
    location: 'Delhi',
    region: 'North India',
    duration: 5,
    budget: 9500,
    travelModes: ['Bus', 'Car', 'Flight'],
    travelTime: '10-12 Hours',
    tripTypes: ['adventure', 'nature', 'romantic'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [32.2396, 77.1887],
    weather: 'Cool Mountain Air',
  },
  {
    id: 'jim-corbett',
    name: 'Jim Corbett National Park',
    description: 'Thrilling open-jeep tiger safari, wilderness riverside camps, and nature trails.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
    location: 'Delhi',
    region: 'North India',
    duration: 3,
    budget: 8000,
    travelModes: ['Train', 'Car'],
    travelTime: '5 Hours',
    tripTypes: ['adventure', 'nature', 'family'],
    crowdLevel: 'Low',
    accommodation: 'Comfortable',
    coords: [29.5300, 78.7747],
    weather: 'Fresh & Forested',
  },
  {
    id: 'kasol',
    name: 'Kasol & Kheerganga',
    description: 'Parvati Valley pine forest trek, natural thermal springs, and mountain cafes.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
    location: 'Delhi',
    region: 'North India',
    duration: 4,
    budget: 7000,
    travelModes: ['Bus', 'Car'],
    travelTime: '11 Hours',
    tripTypes: ['adventure', 'nature', 'relaxation'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [32.0100, 77.3150],
    weather: 'Chilly Highland',
  },
  {
    id: 'bir-billing',
    name: 'Bir Billing',
    description: 'World-famous tandem paragliding take-off site and tranquil Tibetan monasteries.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop',
    location: 'Delhi',
    region: 'North India',
    duration: 3,
    budget: 7500,
    travelModes: ['Bus', 'Train', 'Car'],
    travelTime: '10 Hours',
    tripTypes: ['adventure', 'nature', 'spiritual'],
    crowdLevel: 'Low',
    accommodation: 'Budget',
    coords: [32.0500, 76.7200],
    weather: 'Clear Skies',
  },

  // Additional Regional Destination Hubs
  {
    id: 'sundarbans',
    name: 'Sundarbans',
    description: 'World\'s largest mangrove forest and Royal Bengal Tiger reserve.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'South 24 Parganas',
    duration: 2,
    budget: 6500,
    travelModes: ['Car', 'Train'],
    travelTime: '3 Hours',
    tripTypes: ['nature', 'adventure', 'family'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [21.9497, 88.8999],
    weather: 'Humid & Tropical',
  },
  {
    id: 'shantiniketan',
    name: 'Shantiniketan',
    description: 'Tagore\'s university town, vibrant Baul music, and terracotta arts.',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&auto=format&fit=crop',
    location: 'Kolkata',
    region: 'Birbhum',
    duration: 2,
    budget: 4000,
    travelModes: ['Train', 'Car'],
    travelTime: '3 Hours',
    tripTypes: ['culture', 'relaxation', 'family', 'spiritual'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [23.6800, 87.6800],
    weather: 'Sunny & Pleasant',
  },
  {
    id: 'pushkar',
    name: 'Pushkar',
    description: 'Sacred desert lake, Brahma temple, and colorful handicraft bazaars.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    location: 'Jaipur',
    region: 'Rajasthan',
    duration: 2,
    budget: 5000,
    travelModes: ['Car', 'Bus'],
    travelTime: '2.5 Hours',
    tripTypes: ['culture', 'spiritual', 'relaxation'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [26.4894, 74.5511],
    weather: 'Warm & Sunny',
  },
  {
    id: 'ranthambore',
    name: 'Ranthambore',
    description: 'Historic hilltop fort and famous Royal Bengal Tiger jungle safaris.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop',
    location: 'Jaipur',
    region: 'Rajasthan',
    duration: 3,
    budget: 8500,
    travelModes: ['Train', 'Car'],
    travelTime: '3.5 Hours',
    tripTypes: ['adventure', 'nature', 'family'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [26.0173, 76.5026],
    weather: 'Warm & Sunny',
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    description: 'City of Lakes, grand royal palaces, and romantic boat cruises.',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&auto=format&fit=crop',
    location: 'Jaipur',
    region: 'Rajasthan',
    duration: 3,
    budget: 9000,
    travelModes: ['Train', 'Car', 'Flight'],
    travelTime: '6.5 Hours',
    tripTypes: ['romantic', 'culture', 'luxury', 'family'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [24.5854, 73.7125],
    weather: 'Pleasant & Sunny',
  },
  {
    id: 'jodhpur',
    name: 'Jodhpur',
    description: 'The Blue City, Mehrangarh Fort, and vibrant Thar desert heritage.',
    image: 'https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop',
    location: 'Jaipur',
    region: 'Rajasthan',
    duration: 2,
    budget: 6500,
    travelModes: ['Train', 'Car'],
    travelTime: '5.5 Hours',
    tripTypes: ['culture', 'adventure', 'photography'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [26.2389, 73.0243],
    weather: 'Warm & Clear',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    description: 'The Pink City, Hawa Mahal, Amer Fort, and royal heritage bazaars.',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600&auto=format&fit=crop',
    location: 'Delhi',
    region: 'Rajasthan',
    duration: 3,
    budget: 7000,
    travelModes: ['Train', 'Car', 'Bus'],
    travelTime: '4.5 Hours',
    tripTypes: ['culture', 'shopping', 'family', 'food'],
    crowdLevel: 'High',
    accommodation: 'Comfortable',
    coords: [26.9124, 75.7873],
    weather: 'Warm & Sunny',
  },
  {
    id: 'lonavala',
    name: 'Lonavala & Khandala',
    description: 'Lush green Sahyadri hills, monsoon waterfalls, and Bhushi dam.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    location: 'Mumbai',
    region: 'Maharashtra',
    duration: 2,
    budget: 4500,
    travelModes: ['Train', 'Car'],
    travelTime: '2 Hours',
    tripTypes: ['nature', 'relaxation', 'family', 'adventure'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [18.7557, 73.4091],
    weather: 'Misty & Green',
  },
  {
    id: 'alibaug',
    name: 'Alibaug',
    description: 'Kolaba sea fort, sandy beaches, water sports, and coconut groves.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    location: 'Mumbai',
    region: 'Maharashtra',
    duration: 2,
    budget: 5000,
    travelModes: ['Car', 'Bus'],
    travelTime: '2.5 Hours',
    tripTypes: ['relaxation', 'family', 'food', 'adventure'],
    crowdLevel: 'Moderate',
    accommodation: 'Comfortable',
    coords: [18.6414, 72.8722],
    weather: 'Coastal Warm',
  },
  {
    id: 'goa',
    name: 'Goa',
    description: 'Sun-kissed beaches, vibrant nightlife, water sports, and Portuguese forts.',
    image: 'https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop',
    location: 'Mumbai',
    region: 'Goa',
    duration: 4,
    budget: 10000,
    travelModes: ['Flight', 'Train', 'Car'],
    travelTime: '1.5 Hours Flight / 10 Hours Road',
    tripTypes: ['relaxation', 'adventure', 'food', 'romantic'],
    crowdLevel: 'High',
    accommodation: 'Comfortable',
    coords: [15.2993, 74.1240],
    weather: 'Sunny & Coastal',
  },
];

/**
 * Intelligent Destination Recommendation Engine
 * Filters and ranks destinations based on current structured Roamio filter preferences.
 */
export function getRecommendedDestinations(filters = {}) {
  const loc = (filters.location || '').trim().toLowerCase();
  const rawDest = (filters.destination || '').trim().toLowerCase();
  const dest = (rawDest === 'any destination' || rawDest === 'any') ? '' : rawDest;
  const selectedTypes = (filters.selectedTripTypes || filters.tripTypes || []).map((t) => t.toLowerCase());
  const maxBudget = typeof filters.budget === 'number' && filters.budget > 0 ? filters.budget : 10000;
  const travelMode = (filters.travelMode || '').trim().toLowerCase();
  const crowd = (filters.crowdLevel || '').trim().toLowerCase();
  const duration = typeof filters.duration === 'number' ? filters.duration : 3;

  // Filter and score each destination
  const scored = ALL_DESTINATIONS.map((item) => {
    let score = 0;
    const itemLoc = item.location.toLowerCase();
    const itemName = item.name.toLowerCase();
    const itemRegion = (item.region || '').toLowerCase();

    // 1. Destination / Location Direct Match (Highest weight)
    if (dest) {
      if (itemName.includes(dest) || dest.includes(itemName) || itemRegion.includes(dest) || itemLoc.includes(dest)) {
        score += 250;
      }
    }

    if (loc && loc !== 'any') {
      if (itemLoc.includes(loc) || loc.includes(itemLoc) || itemRegion.includes(loc) || itemName.includes(loc)) {
        score += 200;
      }
    }

    // 2. Trip Type Match (Crucial preference)
    if (selectedTypes.length > 0) {
      const matchCount = item.tripTypes.filter((t) => selectedTypes.includes(t.toLowerCase())).length;
      score += matchCount * 40;
    }

    // 3. Crowd Level Preference
    if (crowd && crowd !== 'any') {
      if (item.crowdLevel.toLowerCase() === crowd) {
        score += 35;
      }
    }

    // 4. Budget Compatibility
    if (item.budget <= maxBudget) {
      score += 25;
    } else if (item.budget <= maxBudget * 1.25) {
      score += 10;
    }

    // 5. Travel Mode Match
    if (travelMode && travelMode !== 'any') {
      if (item.travelModes.some((m) => m.toLowerCase() === travelMode)) {
        score += 30;
      }
    }

    // 6. Duration Match
    if (Math.abs(item.duration - duration) <= 1) {
      score += 15;
    }

    return { ...item, matchScore: score };
  });

  // Sort descending by match score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // If specific destination was targeted, filter to that pool first
  if (dest) {
    const isGhats = dest.includes('western ghat');
    const destMatches = scored.filter((item) => {
      const l = item.location.toLowerCase();
      const n = item.name.toLowerCase();
      const r = item.region.toLowerCase();
      const matchGhats = isGhats && (r.includes('south india') || ['kochi', 'bangalore', 'coimbatore'].some(c => l.includes(c)));
      return n.includes(dest) || dest.includes(n) || r.includes(dest) || l.includes(dest) || matchGhats;
    });

    if (destMatches.length > 0) {
      return destMatches.slice(0, 6);
    }
  }

  // Otherwise if specific location was targeted
  if (loc) {
    const locMatches = scored.filter((item) => {
      const l = item.location.toLowerCase();
      const r = item.region.toLowerCase();
      return l.includes(loc) || loc.includes(l) || r.includes(loc);
    });

    if (locMatches.length >= 3) {
      return locMatches.slice(0, 6);
    }
  }

  return scored.slice(0, 6);
}

/**
 * Dynamic Destination Recommendation Client
 * Calls backend POST /api/search/recommendations with structured filter context.
 */
export async function fetchRecommendedDestinations(filters = {}) {
  const payload = {
    location: (filters.location && typeof filters.location === 'string' && filters.location.trim() && filters.location.trim().toLowerCase() !== 'any' && filters.location.trim().toLowerCase() !== 'any location')
      ? filters.location.trim()
      : null,
    destination: (filters.destination && typeof filters.destination === 'string' && filters.destination.trim() && filters.destination.trim().toLowerCase() !== 'any' && filters.destination.trim().toLowerCase() !== 'any destination')
      ? filters.destination.trim()
      : null,
    region: filters.region && typeof filters.region === 'string' && filters.region.trim() ? filters.region.trim() : null,
    duration: typeof filters.duration === 'number' ? filters.duration : null,
    travellers: typeof (filters.travellers ?? filters.travellerCount) === 'number' ? (filters.travellers ?? filters.travellerCount) : null,
    budget: typeof filters.budget === 'number' && filters.budget > 0 ? filters.budget : null,
    trip_types: Array.isArray(filters.selectedTripTypes || filters.tripTypes)
      ? (filters.selectedTripTypes || filters.tripTypes)
      : [],
    preferences: Array.isArray(filters.preferences)
      ? filters.preferences
      : [],
  };

  console.log('[recommendationService] Fetching dynamic recommendations from backend with payload:', payload);

  try {
    const response = await fetch('/api/search/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response || !response.ok) {
      const errText = response ? await response.text() : 'No response';
      throw new Error(`Recommendation request failed (${response ? response.status : 'Network error'}): ${errText}`);
    }

    const data = await response.json();
    console.log(`[recommendationService] Received ${data.length} recommendations from backend:`, data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[recommendationService] Failed to fetch backend recommendations:', error);
    return [];
  }
}

/**
 * Generate Discovery Metrics matching the active filter and destination state
 */
export function getDiscoveryMetrics(filters = {}, destinations = []) {
  const destList = Array.isArray(destinations) ? destinations : [];

  // 1. Distance Metric: compute from actual destinations' distance_km
  const distances = destList
    .map((d) => d.distance_km)
    .filter((d) => typeof d === 'number' && !isNaN(d));

  let distVal = 'N/A';
  if (distances.length > 0) {
    const minD = Math.round(Math.min(...distances));
    const maxD = Math.round(Math.max(...distances));
    distVal = minD === maxD ? `${minD} km` : `${minD}–${maxD} km`;
  } else if (!filters.location && (filters.destination || filters.region)) {
    distVal = 'Regional Cluster';
  } else if (filters.location && destList.length > 0) {
    distVal = 'Nearby';
  }

  // 2. Travel Time Metric: derived from distance or duration
  let timeVal = 'N/A';
  if (distances.length > 0) {
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    const estHours = Math.max(1, Math.round(avgDist / 45));
    timeVal = estHours <= 1 ? 'Within 1h' : `${estHours}h – ${estHours + 2}h`;
  } else if (filters.duration) {
    timeVal = `${filters.duration} Days Trip`;
  } else if (destList.length > 0) {
    timeVal = 'Flexible';
  }

  // 3. Budget Metric: derived from actual returned destination budgets or filter budget
  const budgets = destList
    .map((d) => d.budget)
    .filter((b) => typeof b === 'number' && !isNaN(b) && b > 0);

  let budgetVal = 'N/A';
  if (budgets.length > 0) {
    const minB = Math.min(...budgets);
    const maxB = Math.max(...budgets);
    budgetVal = minB === maxB ? `₹${minB.toLocaleString('en-IN')}` : `₹${minB.toLocaleString('en-IN')} – ₹${maxB.toLocaleString('en-IN')}`;
  } else if (filters.budget) {
    budgetVal = `₹${Number(filters.budget).toLocaleString('en-IN')}`;
  }

  // 4. Weather / Vibe Metric: derived from returned categories or weather
  let weatherVal = 'N/A';
  if (destList.length > 0) {
    const firstWithWeather = destList.find((d) => d.weather);
    if (firstWithWeather) {
      weatherVal = firstWithWeather.weather;
    } else {
      const topCategory = destList[0].category || 'Scenic';
      weatherVal = topCategory;
    }
  }

  return [
    {
      id: 'distance',
      label: 'Avg. Distance',
      value: distVal,
      icon: Route,
    },
    {
      id: 'time',
      label: 'Travel Time',
      value: timeVal,
      icon: Clock,
    },
    {
      id: 'budget',
      label: 'Budget Avg.',
      value: budgetVal,
      icon: Wallet,
    },
    {
      id: 'weather',
      label: 'Weather',
      value: weatherVal,
      icon: Sun,
    },
  ];
}
