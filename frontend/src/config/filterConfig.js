import { 
  Flame, 
  Waves, 
  Castle, 
  TreePine, 
  Landmark, 
  Heart, 
  Users, 
  Utensils 
} from 'lucide-react';

/**
 * Roamio Shared Filter Configuration
 * Single source of truth for filter options, labels, and defaults.
 */

export const MAX_TRAVEL_TIME_OPTIONS = ['Any', '2 h', '3 h', '4 h', '5 h', '6 h+'];

export const TRAVEL_MODE_OPTIONS = ['Any', 'Car', 'Train', 'Bus', 'Flight'];

export const ACCOMMODATION_OPTIONS = ['Budget', 'Comfortable', 'Luxury'];

export const CROWD_LEVEL_OPTIONS = ['Any', 'Low', 'Moderate', 'High'];

export const TRIP_TYPE_OPTIONS = [
  { id: 'adventure', label: 'Adventure', icon: Flame },
  { id: 'relaxation', label: 'Relaxation', icon: Waves },
  { id: 'spiritual', label: 'Spiritual', icon: Castle },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'culture', label: 'Culture', icon: Landmark },
  { id: 'romantic', label: 'Romantic', icon: Heart },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'food', label: 'Food', icon: Utensils },
];

export const DEFAULT_FILTER_STATE = {
  location: 'Kolkata',
  selectedLocation: {
    name: 'Kolkata',
    fullName: 'Kolkata, West Bengal, India',
    coords: [22.5726, 88.3639],
  },
  destination: '',
  selectedDestination: null,
  travellers: '1 Traveller',
  travellerCount: 1,
  duration: 5,
  budget: 3000,
  maxTravelTime: 'Any',
  travelMode: 'Any',
  selectedTripTypes: ['adventure', 'relaxation'],
  accommodationType: 'Budget',
  crowdLevel: 'Moderate',
};
