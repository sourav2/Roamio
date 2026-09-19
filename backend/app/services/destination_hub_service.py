import math
import re
from typing import List, Optional, Dict, Any
from app.utils.logger import get_logger
from app.services.attraction_service import calculate_haversine_distance

logger = get_logger("app.services.destination_hub_service")

DESTINATION_HUBS: List[Dict[str, Any]] = [
    # ==========================================
    # EASTERN INDIA / BENGAL & NEIGHBOURING HUBS
    # ==========================================
    {
        "id": "darjeeling",
        "name": "Darjeeling",
        "description": "Queen of the Hills, tea gardens and Himalayan sunrise.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "North Bengal",
        "coords": [27.0410, 88.2663],
        "category": "Hills & Mountains",
        "trip_types": ["adventure", "nature", "culture", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7500,
        "weather": "Cool & Misty"
    },
    {
        "id": "kalimpong",
        "name": "Kalimpong",
        "description": "Himalayan views, historic monasteries, and tranquil nature trails.",
        "image": "https://images.unsplash.com/photo-1561361513-2d000a50f0db?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "North Bengal",
        "coords": [27.0667, 88.4667],
        "category": "Hills & Culture",
        "trip_types": ["nature", "culture", "relaxation", "spiritual"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Pleasant & Misty"
    },
    {
        "id": "digha",
        "name": "Digha",
        "description": "Casuarina coastal promenade with buzzing seafood and calm waves.",
        "image": "https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "Coastal Bengal",
        "coords": [21.6266, 87.5074],
        "category": "Beach & Coast",
        "trip_types": ["family", "relaxation", "food"],
        "rating": 4.5,
        "ideal_duration": 2,
        "budget": 5000,
        "weather": "Breezy & Sunny"
    },
    {
        "id": "mandarmoni",
        "name": "Mandarmoni",
        "description": "Driveable beach resort with seaside water sports and seafood.",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "Coastal Bengal",
        "coords": [21.6667, 87.7000],
        "category": "Beach & Resort",
        "trip_types": ["relaxation", "food", "romantic", "family"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 6000,
        "weather": "Sunny & Breezy"
    },
    {
        "id": "purulia",
        "name": "Purulia",
        "description": "Rugged hills, hidden waterfalls, and tribal folklore.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "Purulia",
        "coords": [23.3321, 86.3652],
        "category": "Hills & Nature",
        "trip_types": ["adventure", "nature", "culture"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 4500,
        "weather": "Sunny & Pleasant"
    },
    {
        "id": "sundarbans",
        "name": "Sundarbans",
        "description": "World's largest mangrove forest and Royal Bengal Tiger reserve.",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "South 24 Parganas",
        "coords": [21.9497, 88.8999],
        "category": "Wildlife & Mangroves",
        "trip_types": ["nature", "adventure", "family"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 6500,
        "weather": "Humid & Tropical"
    },
    {
        "id": "shantiniketan",
        "name": "Shantiniketan",
        "description": "Tagore's university town, vibrant Baul music, and terracotta arts.",
        "image": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "Birbhum",
        "coords": [23.6800, 87.6800],
        "category": "Heritage & Culture",
        "trip_types": ["culture", "relaxation", "family", "spiritual"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 4000,
        "weather": "Sunny & Warm"
    },
    {
        "id": "dooars",
        "name": "Dooars",
        "description": "Dense elephant reserves, sprawling tea estates, and wild rivers.",
        "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "Dooars Foothills",
        "coords": [26.7500, 89.0000],
        "category": "Wildlife & Forest",
        "trip_types": ["adventure", "nature", "family"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 6500,
        "weather": "Lush & Tropical"
    },
    {
        "id": "kurseong",
        "name": "Kurseong",
        "description": "Land of white orchids, historic tea estates, and misty valley viewpoints.",
        "image": "https://images.unsplash.com/photo-1594488587837-97529698a0ae?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "North Bengal",
        "coords": [26.8812, 88.2778],
        "category": "Hills & Tea",
        "trip_types": ["nature", "relaxation", "culture"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 5500,
        "weather": "Cool & Misty"
    },
    {
        "id": "mirik",
        "name": "Mirik",
        "description": "Serene Sumendu Lake, pine forest walks, and orange orchards.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "West Bengal",
        "region": "North Bengal",
        "coords": [26.8900, 88.1700],
        "category": "Hills & Lakes",
        "trip_types": ["relaxation", "nature", "family"],
        "rating": 4.5,
        "ideal_duration": 2,
        "budget": 5000,
        "weather": "Pleasant Highland"
    },
    {
        "id": "gangtok",
        "name": "Gangtok",
        "description": "Vibrant mountain capital, Buddhist monasteries, and Kanchenjunga views.",
        "image": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&auto=format&fit=crop",
        "state": "Sikkim",
        "region": "Sikkim",
        "coords": [27.3389, 88.6065],
        "category": "Hills & Culture",
        "trip_types": ["adventure", "nature", "culture", "spiritual"],
        "rating": 4.8,
        "ideal_duration": 4,
        "budget": 8500,
        "weather": "Chilly & Scenic"
    },
    {
        "id": "pelling",
        "name": "Pelling",
        "description": "Glass skywalk, ancient Pemayangtse monastery, and Rabdentse ruins.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Sikkim",
        "region": "West Sikkim",
        "coords": [27.3167, 88.2333],
        "category": "Hills & Heritage",
        "trip_types": ["nature", "culture", "adventure"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7500,
        "weather": "Crisp Mountain Air"
    },

    # ==========================================
    # NORTHERN & RAJASTHAN DESTINATION HUBS
    # ==========================================
    {
        "id": "pushkar",
        "name": "Pushkar",
        "description": "Sacred desert lake, Brahma temple, and colorful handicraft bazaars.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Ajmer Region",
        "coords": [26.4894, 74.5511],
        "category": "Spiritual & Desert",
        "trip_types": ["culture", "spiritual", "relaxation", "photography"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 5000,
        "weather": "Warm & Sunny"
    },
    {
        "id": "ajmer",
        "name": "Ajmer",
        "description": "Historic Dargah Sharif, Taragarh Fort, and Ana Sagar Lake.",
        "image": "https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Central Rajasthan",
        "coords": [26.4499, 74.6399],
        "category": "Heritage & Spiritual",
        "trip_types": ["culture", "spiritual", "family"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 4500,
        "weather": "Sunny & Dry"
    },
    {
        "id": "ranthambore",
        "name": "Ranthambore",
        "description": "Historic hilltop fort and famous Royal Bengal Tiger jungle safaris.",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Sawai Madhopur",
        "coords": [26.0173, 76.5026],
        "category": "Wildlife & Safari",
        "trip_types": ["adventure", "nature", "family"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 8500,
        "weather": "Warm & Sunny"
    },
    {
        "id": "udaipur",
        "name": "Udaipur",
        "description": "City of Lakes, grand royal palaces, and romantic boat cruises.",
        "image": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Mewar",
        "coords": [24.5854, 73.7125],
        "category": "Palaces & Lakes",
        "trip_types": ["romantic", "culture", "luxury", "family"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 9000,
        "weather": "Pleasant & Sunny"
    },
    {
        "id": "jodhpur",
        "name": "Jodhpur",
        "description": "The Blue City, Mehrangarh Fort, and vibrant Thar desert heritage.",
        "image": "https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Marwar",
        "coords": [26.2389, 73.0243],
        "category": "Heritage & Forts",
        "trip_types": ["culture", "adventure", "photography"],
        "rating": 4.8,
        "ideal_duration": 2,
        "budget": 6500,
        "weather": "Warm & Clear"
    },
    {
        "id": "mount-abu",
        "name": "Mount Abu",
        "description": "Only hill station in Rajasthan, Nakki Lake, and intricate Dilwara Temples.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Sirohi",
        "coords": [24.5926, 72.7156],
        "category": "Hills & Temples",
        "trip_types": ["nature", "relaxation", "spiritual", "family"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 6000,
        "weather": "Cool & Pleasant"
    },
    {
        "id": "bikaner",
        "name": "Bikaner",
        "description": "Junagarh Fort, camel breeding farm, and rich Rajasthani cuisines.",
        "image": "https://images.unsplash.com/photo-1545641203-7d072a14e3b2?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "North Rajasthan",
        "coords": [28.0229, 73.3119],
        "category": "Desert & Heritage",
        "trip_types": ["culture", "food", "family"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 5500,
        "weather": "Desert Warm"
    },
    {
        "id": "chittorgarh",
        "name": "Chittorgarh",
        "description": "India's largest historical fort complex and Rajput valor tales.",
        "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Mewar",
        "coords": [24.8887, 74.6269],
        "category": "Heritage & Forts",
        "trip_types": ["culture", "photography", "family"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 4500,
        "weather": "Sunny"
    },
    {
        "id": "jaipur",
        "name": "Jaipur",
        "description": "The Pink City, Hawa Mahal, Amer Fort, and royal heritage bazaars.",
        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Eastern Rajasthan",
        "coords": [26.9124, 75.7873],
        "category": "Heritage & Culture",
        "trip_types": ["culture", "shopping", "family", "food"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Warm & Sunny"
    },
    {
        "id": "rishikesh",
        "name": "Rishikesh",
        "description": "White water river rafting on the Ganges, bungee jumping, and cliffside yoga.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Uttarakhand",
        "region": "Garhwal Himalayas",
        "coords": [30.0869, 78.2676],
        "category": "Adventure & Yoga",
        "trip_types": ["adventure", "spiritual", "nature", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 6500,
        "weather": "Pleasant & Crisp"
    },
    {
        "id": "manali",
        "name": "Manali",
        "description": "Snow-capped Himalayan peaks, Solang Valley paragliding, and river crossing.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Kullu Valley",
        "coords": [32.2396, 77.1887],
        "category": "Snow & Mountains",
        "trip_types": ["adventure", "nature", "romantic"],
        "rating": 4.8,
        "ideal_duration": 4,
        "budget": 9500,
        "weather": "Cool Mountain Air"
    },
    {
        "id": "shimla",
        "name": "Shimla",
        "description": "Historic Mall Road, British colonial architecture, and pine-clad hills.",
        "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Himachal Hills",
        "coords": [31.1048, 77.1734],
        "category": "Colonial & Hills",
        "trip_types": ["family", "nature", "romantic"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7500,
        "weather": "Chilly & Pleasant"
    },
    {
        "id": "jim-corbett",
        "name": "Jim Corbett",
        "description": "India's oldest national park, open jeep tiger safaris, and riverside camps.",
        "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
        "state": "Uttarakhand",
        "region": "Nainital District",
        "coords": [29.5300, 78.7747],
        "category": "Wildlife Safari",
        "trip_types": ["adventure", "nature", "family"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 8000,
        "weather": "Fresh & Forested"
    },
    {
        "id": "agra",
        "name": "Agra",
        "description": "Home of the iconic Taj Mahal, Agra Fort, and rich Mughal architectural monuments.",
        "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop",
        "state": "Uttar Pradesh",
        "region": "Braj Region",
        "coords": [27.1767, 78.0081],
        "category": "Monuments & Heritage",
        "trip_types": ["culture", "romantic", "family"],
        "rating": 4.8,
        "ideal_duration": 2,
        "budget": 4500,
        "weather": "Sunny & Warm"
    },

    # ==========================================
    # SOUTHERN INDIA DESTINATION HUBS
    # ==========================================
    {
        "id": "coorg",
        "name": "Coorg (Kodagu)",
        "description": "Aromatic coffee plantations, misty hills, and scenic trekking waterfalls.",
        "image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop",
        "state": "Karnataka",
        "region": "Western Ghats",
        "coords": [12.3375, 75.8069],
        "category": "Coffee & Hills",
        "trip_types": ["nature", "relaxation", "adventure", "romantic"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7500,
        "weather": "Pleasant & Breezy"
    },
    {
        "id": "munnar",
        "name": "Munnar",
        "description": "Emerald green tea hills, misty mountain peaks, and cool waterfalls.",
        "image": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop",
        "state": "Kerala",
        "region": "Idukki Hills",
        "coords": [10.0889, 77.0595],
        "category": "Tea Hills & Mist",
        "trip_types": ["nature", "relaxation", "romantic", "adventure"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 8500,
        "weather": "Misty & Cool"
    },
    {
        "id": "alleppey",
        "name": "Alleppey (Alappuzha)",
        "description": "Tranquil Kerala backwaters, palm-fringed lagoons, and luxury houseboats.",
        "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop",
        "state": "Kerala",
        "region": "Coastal Backwaters",
        "coords": [9.4981, 76.3388],
        "category": "Backwaters & Houseboats",
        "trip_types": ["relaxation", "romantic", "family", "food"],
        "rating": 4.8,
        "ideal_duration": 2,
        "budget": 9000,
        "weather": "Warm & Tropical"
    },
    {
        "id": "ooty",
        "name": "Ooty (Udhagamandalam)",
        "description": "Nilgiri toy train, panoramic tea gardens, and colonial mountain charm.",
        "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=600&auto=format&fit=crop",
        "state": "Tamil Nadu",
        "region": "Nilgiri Hills",
        "coords": [11.4102, 76.6950],
        "category": "Hills & Toy Train",
        "trip_types": ["nature", "family", "romantic", "relaxation"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Crisp Highland"
    },
    {
        "id": "wayanad",
        "name": "Wayanad",
        "description": "Verdant spice plantations, ancient caves, and forested trekking paths.",
        "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop",
        "state": "Kerala",
        "region": "North Kerala",
        "coords": [11.6854, 76.1320],
        "category": "Forests & Caves",
        "trip_types": ["nature", "adventure", "relaxation"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 6500,
        "weather": "Tropical Mild"
    },
    {
        "id": "hampi",
        "name": "Hampi",
        "description": "Dramatic boulder-strewn landscapes and ancient UNESCO Vijayanagara ruins.",
        "image": "https://images.unsplash.com/photo-1600100397608-f010e08e1f57?q=80&w=600&auto=format&fit=crop",
        "state": "Karnataka",
        "region": "Central Karnataka",
        "coords": [15.3350, 76.4600],
        "category": "UNESCO Ruins & Rocks",
        "trip_types": ["culture", "adventure", "spiritual", "photography"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 6000,
        "weather": "Sunny & Warm"
    },
    {
        "id": "mysore",
        "name": "Mysore (Mysuru)",
        "description": "Illuminated royal palace, Chamundi hills, and silk & sandalwood heritage.",
        "image": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&auto=format&fit=crop",
        "state": "Karnataka",
        "region": "South Karnataka",
        "coords": [12.2958, 76.6394],
        "category": "Palaces & Culture",
        "trip_types": ["culture", "family", "heritage"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 5000,
        "weather": "Pleasant"
    },
    {
        "id": "thekkady",
        "name": "Thekkady",
        "description": "Periyar tiger reserve boat safari, spice plantations, and elephant trails.",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
        "state": "Kerala",
        "region": "Cardamom Hills",
        "coords": [9.6031, 77.1615],
        "category": "Wildlife & Spices",
        "trip_types": ["nature", "wildlife", "family"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 6500,
        "weather": "Fresh & Forested"
    },
    {
        "id": "gokarna",
        "name": "Gokarna",
        "description": "Om Beach, cliff hiking trails, serene coastal temples, and sunsets.",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
        "state": "Karnataka",
        "region": "Uttara Kannada",
        "coords": [14.5479, 74.3188],
        "category": "Beaches & Temples",
        "trip_types": ["relaxation", "nature", "adventure", "spiritual"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 5500,
        "weather": "Coastal Breeze"
    },

    # ==========================================
    # WESTERN INDIA DESTINATION HUBS
    # ==========================================
    {
        "id": "lonavala",
        "name": "Lonavala & Khandala",
        "description": "Lush green Sahyadri hills, monsoon waterfalls, and Bhushi dam.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Maharashtra",
        "region": "Sahyadris",
        "coords": [18.7557, 73.4091],
        "category": "Hills & Waterfalls",
        "trip_types": ["nature", "relaxation", "family", "adventure"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 4500,
        "weather": "Misty & Green"
    },
    {
        "id": "alibaug",
        "name": "Alibaug",
        "description": "Kolaba sea fort, sandy beaches, water sports, and coconut groves.",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
        "state": "Maharashtra",
        "region": "Konkan Coast",
        "coords": [18.6414, 72.8722],
        "category": "Coast & Forts",
        "trip_types": ["relaxation", "family", "food", "adventure"],
        "rating": 4.5,
        "ideal_duration": 2,
        "budget": 5000,
        "weather": "Coastal Warm"
    },
    {
        "id": "mahabaleshwar",
        "name": "Mahabaleshwar",
        "description": "Strawberry farms, Arthur's Seat viewpoint, and Venna lake boating.",
        "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
        "state": "Maharashtra",
        "region": "Satara",
        "coords": [17.9237, 73.6586],
        "category": "Hills & Berries",
        "trip_types": ["nature", "romantic", "family"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Cool & Misty"
    },
    {
        "id": "goa",
        "name": "Goa",
        "description": "Sun-kissed beaches, vibrant nightlife, water sports, and Portuguese forts.",
        "image": "https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop",
        "state": "Goa",
        "region": "Goa Coast",
        "coords": [15.2993, 74.1240],
        "category": "Beach & Nightlife",
        "trip_types": ["relaxation", "adventure", "food", "romantic"],
        "rating": 4.9,
        "ideal_duration": 4,
        "budget": 10000,
        "weather": "Sunny & Coastal"
    },

    # ==========================================
    # NORTH-EASTERN & ISLAND DESTINATION HUBS
    # ==========================================
    {
        "id": "shillong",
        "name": "Shillong",
        "description": "Scotland of the East, pine hills, lively music, and crystal waterfalls.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Meghalaya",
        "region": "Khasi Hills",
        "coords": [25.5788, 91.8831],
        "category": "Hills & Waterfalls",
        "trip_types": ["nature", "culture", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Cool & Pine"
    },
    {
        "id": "cherrapunji",
        "name": "Cherrapunji (Sohra)",
        "description": "Living root bridges, dramatic gorge waterfalls, and limestone caves.",
        "image": "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?q=80&w=600&auto=format&fit=crop",
        "state": "Meghalaya",
        "region": "East Khasi Hills",
        "coords": [25.2702, 91.7323],
        "category": "Canyons & Waterfalls",
        "trip_types": ["adventure", "nature", "trekking"],
        "rating": 4.9,
        "ideal_duration": 2,
        "budget": 6500,
        "weather": "Misty Clouds"
    },
    {
        "id": "havelock-island",
        "name": "Havelock Island",
        "description": "Radhanagar Beach, turquoise waters, scuba diving, and sea kayaking.",
        "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
        "state": "Andaman & Nicobar",
        "region": "Andaman Islands",
        "coords": [11.9761, 92.9876],
        "category": "Islands & Coral",
        "trip_types": ["adventure", "nature", "relaxation", "romantic"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 9500,
        "weather": "Tropical & Sunny"
    },
]

def discover_destination_hubs(
    origin_coords: Optional[tuple[float, float]] = None,
    origin_name: Optional[str] = None,
    target_destination: Optional[str] = None,
    target_region: Optional[str] = None,
    duration: Optional[int] = None,
    budget: Optional[float] = None,
    trip_types: Optional[List[str]] = None,
    preferences: Optional[List[str]] = None,
    limit: int = 12
) -> List[Dict[str, Any]]:
    """
    Discovers destination-level entities (cities, hill stations, districts, coastal towns)
    around an origin or within a target destination/region.
    Strictly avoids returning individual attractions for Level 1 discovery.
    """
    logger.info(
        f"discover_destination_hubs: origin='{origin_name}' ({origin_coords}), "
        f"target_dest='{target_destination}', target_region='{target_region}', duration={duration}"
    )

    clean_origin = (origin_name or "").strip().lower()
    clean_dest = (target_destination or "").strip().lower()
    clean_region = (target_region or "").strip().lower()

    if clean_dest in ("any", "any destination", "none", "null"):
        clean_dest = ""
    if clean_origin in ("any", "any location", "none", "null"):
        clean_origin = ""

    selected_types = set([t.lower().strip() for t in (trip_types or []) + (preferences or []) if t])
    max_budget = budget if budget and budget > 0 else 100000.0
    trip_duration = duration if duration and duration > 0 else 3

    candidates = []

    for hub in DESTINATION_HUBS:
        hub_name_low = hub["name"].lower()
        hub_id_low = hub["id"].lower()
        hub_state_low = hub.get("state", "").lower()
        hub_region_low = hub.get("region", "").lower()
        hub_coords = hub.get("coords", [0.0, 0.0])

        # Distance calculation
        dist_km = None
        if origin_coords:
            dist_km = calculate_haversine_distance(
                origin_coords[0], origin_coords[1], hub_coords[0], hub_coords[1]
            )

        # 1. If a specific destination was targeted (e.g. Darjeeling)
        if clean_dest:
            is_direct_match = (
                clean_dest in hub_name_low or hub_name_low in clean_dest
                or clean_dest in hub_id_low or hub_id_low in clean_dest
                or clean_dest in hub_region_low or clean_dest in hub_state_low
            )
            if not is_direct_match:
                continue

        # 2. If a specific region was targeted (e.g. Western Ghats, North Bengal, Rajasthan)
        elif clean_region:
            is_region_match = (
                clean_region in hub_region_low or clean_region in hub_state_low
                or (clean_region == "western ghats" and hub_state_low in ("kerala", "karnataka", "maharashtra", "tamil nadu"))
                or (clean_region == "south india" and hub_state_low in ("kerala", "karnataka", "tamil nadu", "andhra pradesh", "telangana"))
                or (clean_region == "north india" and hub_state_low in ("rajasthan", "uttarakhand", "himachal pradesh", "delhi", "uttar pradesh"))
                or (clean_region == "east india" and hub_state_low in ("west bengal", "odisha", "bihar", "sikkim"))
            )
            if not is_region_match:
                continue

        # 3. Location-only search: Exclude the exact origin city if it matches the destination name
        if clean_origin and not clean_dest and not clean_region:
            if hub_name_low == clean_origin or hub_id_low == clean_origin:
                if dist_km is not None and dist_km < 15.0:
                    continue

        # Calculate recommendation match score
        score = 100.0

        # Proximity score (closer hubs get higher accessibility score)
        if dist_km is not None:
            if dist_km <= 200:
                score += 150 - (dist_km * 0.2)
            elif dist_km <= 400:
                score += 110 - ((dist_km - 200) * 0.15)
            elif dist_km <= 650:
                score += 80 - ((dist_km - 400) * 0.1)
            elif dist_km <= 900:
                score += 50 - ((dist_km - 650) * 0.08)
            else:
                score += max(0, 20 - ((dist_km - 900) * 0.02))

            # Duration synergy: for 2-day trips, heavily boost <=350km hubs
            if trip_duration <= 2 and dist_km <= 300:
                score += 40
            elif trip_duration >= 4 and dist_km >= 300:
                score += 25
        else:
            score += hub.get("rating", 4.5) * 10

        # Trip types match
        hub_types = [t.lower() for t in hub.get("trip_types", [])]
        matched_types = selected_types.intersection(set(hub_types))
        score += len(matched_types) * 20

        # Budget match
        hub_budget = hub.get("budget", 5000)
        if hub_budget <= max_budget:
            score += 15
        elif hub_budget <= max_budget * 1.3:
            score += 5

        candidates.append({
            "hub": hub,
            "dist_km": dist_km,
            "score": score
        })

    # Sort candidates by recommendation score descending
    candidates.sort(key=lambda x: x["score"], reverse=True)

    results = []
    seen_ids = set()

    for item in candidates[:limit]:
        h = item["hub"]
        if h["id"] in seen_ids:
            continue
        seen_ids.add(h["id"])

        dist_val = round(item["dist_km"], 1) if item["dist_km"] is not None else None
        
        # Build normalized Level 1 destination card object
        results.append({
            "id": h["id"],
            "name": h["name"],
            "description": h["description"],
            "image": h["image"],
            "location": origin_name or h.get("state", "India"),
            "region": h.get("region", h.get("state", "")),
            "state": h.get("state", ""),
            "coords": h["coords"],
            "category": h.get("category", "Destination Hub"),
            "rating": h.get("rating", 4.7),
            "duration": h.get("ideal_duration", trip_duration),
            "budget": h.get("budget", 6000),
            "distance_km": dist_val,
            "weather": h.get("weather", "Pleasant")
        })

    logger.info(f"discover_destination_hubs returning {len(results)} destination hubs for origin='{origin_name}'")
    return results
