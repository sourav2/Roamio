import math
import re
from typing import List, Optional, Dict, Any
from app.utils.logger import get_logger
from app.services.attraction_service import calculate_haversine_distance

logger = get_logger("app.services.destination_hub_service")

DESTINATION_HUBS: List[Dict[str, Any]] = [
    # ==========================================
    # HIMACHAL PRADESH DESTINATION HUBS
    # ==========================================
    {
        "id": "manali",
        "name": "Manali",
        "description": "Snow-capped Himalayan peaks, Solang Valley adventure sports, and Old Manali pine trails.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Kullu Valley",
        "coords": [32.2396, 77.1887],
        "category": "Snow & Mountains",
        "trip_types": ["adventure", "nature", "romantic", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 4,
        "budget": 9500,
        "weather": "Cool Mountain Air"
    },
    {
        "id": "shimla",
        "name": "Shimla",
        "description": "Historic Mall Road, British colonial architecture, Christ Church, and pine-clad hills.",
        "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Shimla Hills",
        "coords": [31.1048, 77.1734],
        "category": "Colonial & Hills",
        "trip_types": ["family", "culture", "romantic", "relaxation"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7500,
        "weather": "Chilly & Pleasant"
    },
    {
        "id": "dharamshala",
        "name": "Dharamshala & McLeodGanj",
        "description": "Seat of the Dalai Lama, Tibetan monasteries, Bhagsu falls, and panoramic Triund mountain ridge.",
        "image": "https://images.unsplash.com/photo-1594488587837-97529698a0ae?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Kangra Valley",
        "coords": [32.2190, 76.3234],
        "category": "Tibetan Culture & Hills",
        "trip_types": ["culture", "spiritual", "nature", "adventure", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 6500,
        "weather": "Pleasant & Crisp"
    },
    {
        "id": "kasol",
        "name": "Kasol & Parvati Valley",
        "description": "Hippie riverside cafes, rushing Parvati river, Tosh village, and Kheerganga hot springs trek.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Parvati Valley",
        "coords": [32.0100, 77.3150],
        "category": "Riverside & Treks",
        "trip_types": ["adventure", "nature", "relaxation", "youth"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 5500,
        "weather": "Cool Alpine"
    },
    {
        "id": "spiti-valley",
        "name": "Spiti Valley (Kaza)",
        "description": "Trans-Himalayan high-altitude desert, thousand-year-old Key Gompa, and turquoise Chandratal lake.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Spiti Valley",
        "coords": [32.2276, 78.0710],
        "category": "Trans-Himalaya & Monasteries",
        "trip_types": ["adventure", "culture", "photography", "nature", "roadtrip"],
        "rating": 4.9,
        "ideal_duration": 6,
        "budget": 11000,
        "weather": "Cold Desert"
    },
    {
        "id": "dalhousie",
        "name": "Dalhousie & Khajjiar",
        "description": "Mini Switzerland of India, rolling green meadows, deodar forests, and colonial charm.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Chamba",
        "coords": [32.5387, 75.9710],
        "category": "Meadows & Pines",
        "trip_types": ["nature", "family", "romantic", "relaxation"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Crisp Mountain Breeze"
    },
    {
        "id": "jibhi",
        "name": "Jibhi & Tirthan Valley",
        "description": "Great Himalayan National Park gateway, crystal trout streams, Chehni Kothi tower, and Serolsar lake.",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Tirthan Valley",
        "coords": [31.6360, 77.3490],
        "category": "Offbeat Valleys & Streams",
        "trip_types": ["nature", "relaxation", "adventure", "offbeat"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 6000,
        "weather": "Pristine Alpine"
    },
    {
        "id": "bir-billing",
        "name": "Bir Billing",
        "description": "World's top paragliding takeoff site, Tibetan craft monasteries, tea gardens, and sunset gliders.",
        "image": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Kangra",
        "coords": [32.0494, 76.7188],
        "category": "Aero Sports & Monasteries",
        "trip_types": ["adventure", "nature", "spiritual", "photography"],
        "rating": 4.8,
        "ideal_duration": 2,
        "budget": 6500,
        "weather": "Pleasant & Breezy"
    },
    {
        "id": "kinnaur",
        "name": "Kinnaur (Kalpa & Sangla)",
        "description": "Sacred Kinner Kailash mountain views, Baspa river valley, apple orchards, and Chitkul border village.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Kinnaur",
        "coords": [31.5369, 78.2562],
        "category": "Apple Orchards & Peaks",
        "trip_types": ["nature", "adventure", "culture", "offbeat"],
        "rating": 4.8,
        "ideal_duration": 4,
        "budget": 8500,
        "weather": "Chilly & Fresh"
    },
    {
        "id": "kullu",
        "name": "Kullu & Naggar",
        "description": "Ancient Naggar Castle, Nicholas Roerich heritage estate, white water Beas rafting, and shawl crafts.",
        "image": "https://images.unsplash.com/photo-1561361513-2d000a50f0db?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Kullu Valley",
        "coords": [31.9579, 77.1095],
        "category": "Heritage & Rafting",
        "trip_types": ["culture", "adventure", "nature", "family"],
        "rating": 4.6,
        "ideal_duration": 3,
        "budget": 6000,
        "weather": "Pleasant Valley"
    },
    {
        "id": "kufri",
        "name": "Kufri & Mashobra",
        "description": "Dense cedar woodlands, snow viewpoints, Himalayan Nature Park, and peaceful mountain walking trails.",
        "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Shimla District",
        "coords": [31.0978, 77.2678],
        "category": "Cedar Woods & Snow",
        "trip_types": ["nature", "family", "relaxation"],
        "rating": 4.6,
        "ideal_duration": 2,
        "budget": 6000,
        "weather": "Crisp & Chilly"
    },
    {
        "id": "lahaul",
        "name": "Lahaul Valley (Sissu & Keylong)",
        "description": "Beyond the Atal Tunnel: towering waterfalls, Chandra river banks, Sissu lake, and raw glacial peaks.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Himachal Pradesh",
        "region": "Lahaul & Spiti",
        "coords": [32.4833, 77.1167],
        "category": "Glacial Valleys & Waterfalls",
        "trip_types": ["adventure", "nature", "roadtrip"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 8000,
        "weather": "Alpine Crisp"
    },

    # ==========================================
    # UTTARAKHAND DESTINATION HUBS
    # ==========================================
    {
        "id": "rishikesh",
        "name": "Rishikesh",
        "description": "Yoga capital of the world, white water Ganges river rafting, suspension bridges, and evening aartis.",
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
        "id": "nainital",
        "name": "Nainital",
        "description": "Emerald Naini Lake boating, Naina Devi shrine, Snow View point, and misty oak woodlands.",
        "image": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=600&auto=format&fit=crop",
        "state": "Uttarakhand",
        "region": "Kumaon Hills",
        "coords": [29.3803, 79.4636],
        "category": "Lakes & Hills",
        "trip_types": ["family", "nature", "romantic", "relaxation"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Cool & Misty"
    },
    {
        "id": "mussoorie",
        "name": "Mussoorie",
        "description": "Queen of the Hills, Kempty falls, Mall Road heritage, Lal Tibba, and Doon Valley vistas.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Uttarakhand",
        "region": "Garhwal",
        "coords": [30.4598, 78.0644],
        "category": "Colonial Hills & Waterfalls",
        "trip_types": ["family", "romantic", "nature", "relaxation"],
        "rating": 4.7,
        "ideal_duration": 3,
        "budget": 7500,
        "weather": "Crisp Highland"
    },
    {
        "id": "auli",
        "name": "Auli",
        "description": "Premier Himalayan ski resort, scenic cable car ropeway, and panoramic Nanda Devi views.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Uttarakhand",
        "region": "Chamoli",
        "coords": [30.5300, 79.5600],
        "category": "Skiing & Peaks",
        "trip_types": ["adventure", "snow", "nature", "romantic"],
        "rating": 4.9,
        "ideal_duration": 4,
        "budget": 9500,
        "weather": "Cold & Snowy"
    },
    {
        "id": "jim-corbett",
        "name": "Jim Corbett",
        "description": "India's oldest national park, open jeep tiger safaris, and riverside forest camps.",
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
        "id": "chopta",
        "name": "Chopta & Tungnath",
        "description": "Mini Switzerland of Uttarakhand, high alpine bugyals, Tungnath temple trek, and Chandrashila summit.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Uttarakhand",
        "region": "Rudraprayag",
        "coords": [30.4855, 79.1764],
        "category": "Alpine Meadows & Treks",
        "trip_types": ["adventure", "nature", "spiritual", "trekking"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 6500,
        "weather": "Chilly Alpine"
    },

    # ==========================================
    # EASTERN INDIA / BENGAL & NEIGHBOURING HUBS
    # ==========================================
    {
        "id": "darjeeling",
        "name": "Darjeeling",
        "description": "Queen of the Hills, tea gardens, Tiger Hill sunrise, and UNESCO toy train.",
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
        "description": "Himalayan views, historic monasteries, cactus nurseries, and tranquil nature trails.",
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
        "description": "Rugged hills, hidden waterfalls, Ayodhya hills, and tribal folklore.",
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
        "description": "World's largest mangrove forest, creek boat safaris, and Royal Bengal Tiger reserve.",
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
        "description": "Tagore's university town, vibrant Baul music, Sonajhuri forest haat, and terracotta arts.",
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
        "description": "Dense elephant & rhino reserves, sprawling tea estates, and wild foothill rivers.",
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

    # ==========================================
    # SIKKIM DESTINATION HUBS
    # ==========================================
    {
        "id": "gangtok",
        "name": "Gangtok",
        "description": "Vibrant mountain capital, Buddhist monasteries, Tsomgo lake, and Kanchenjunga views.",
        "image": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&auto=format&fit=crop",
        "state": "Sikkim",
        "region": "East Sikkim",
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
        "description": "Glass skywalk, ancient Pemayangtse monastery, Kanchenjunga waterfalls, and Rabdentse ruins.",
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
    {
        "id": "lachung",
        "name": "Lachung & Yumthang Valley",
        "description": "Valley of Flowers of Sikkim, rhododendron sanctuaries, hot springs, and Zero Point snows.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Sikkim",
        "region": "North Sikkim",
        "coords": [27.6891, 88.7430],
        "category": "Snow Valleys & Flowers",
        "trip_types": ["adventure", "nature", "snow"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 9000,
        "weather": "Freezing Alpine"
    },

    # ==========================================
    # MEGHALAYA & NORTHEAST HUBS
    # ==========================================
    {
        "id": "shillong",
        "name": "Shillong",
        "description": "Scotland of the East, pine hills, lively music, Umiam lake, and crystal waterfalls.",
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
        "description": "Double decker living root bridges, dramatic gorge waterfalls, and limestone caves.",
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
        "id": "dawki",
        "name": "Dawki & Shnongpdeng",
        "description": "Crystal-clear glass water boat rides on Umngot river, riverside cliff camping, and kayaking.",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
        "state": "Meghalaya",
        "region": "West Jaintia Hills",
        "coords": [25.1878, 92.0186],
        "category": "Crystal Rivers & Camping",
        "trip_types": ["adventure", "nature", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 2,
        "budget": 6000,
        "weather": "Pleasant Waterside"
    },
    {
        "id": "jowai",
        "name": "Jowai & Krang Shuri",
        "description": "Emerald Krang Shuri falls, ancient Nartiang monoliths, and scenic Jaintia hill plateaus.",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
        "state": "Meghalaya",
        "region": "Jaintia Hills",
        "coords": [25.4486, 92.2039],
        "category": "Emerald Waterfalls & Monoliths",
        "trip_types": ["nature", "culture", "adventure"],
        "rating": 4.7,
        "ideal_duration": 2,
        "budget": 5500,
        "weather": "Fresh & Breezy"
    },
    {
        "id": "kaziranga",
        "name": "Kaziranga",
        "description": "UNESCO World Heritage park, home to the world's largest population of great one-horned rhinos.",
        "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
        "state": "Assam",
        "region": "Golaghat & Nagaon",
        "coords": [26.5775, 93.1711],
        "category": "Rhino Wildlife Safari",
        "trip_types": ["adventure", "nature", "family"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 8500,
        "weather": "Tropical Greens"
    },
    {
        "id": "tawang",
        "name": "Tawang",
        "description": "Ancient Tawang monastery, high Sela Pass snows, Madhuri lake, and Arunachal Himalayan splendor.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Arunachal Pradesh",
        "region": "Tawang",
        "coords": [27.5861, 91.8594],
        "category": "Monasteries & Snow Passes",
        "trip_types": ["adventure", "culture", "spiritual", "nature"],
        "rating": 4.9,
        "ideal_duration": 5,
        "budget": 11000,
        "weather": "Cold Mountain Air"
    },

    # ==========================================
    # RAJASTHAN DESTINATION HUBS
    # ==========================================
    {
        "id": "jaipur",
        "name": "Jaipur",
        "description": "The Pink City, Amer Fort, Hawa Mahal, City Palace, and vibrant heritage craft bazaars.",
        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Eastern Rajasthan",
        "coords": [26.9124, 75.7873],
        "category": "Heritage & Forts",
        "trip_types": ["culture", "shopping", "family", "food"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Warm & Sunny"
    },
    {
        "id": "udaipur",
        "name": "Udaipur",
        "description": "City of Lakes, grand royal palaces, romantic boat cruises on Lake Pichola, and Mewar heritage.",
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
        "description": "The Blue City, towering Mehrangarh Fort, Jaswant Thada marble cenotaphs, and Thar culture.",
        "image": "https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Marwar",
        "coords": [26.2389, 73.0243],
        "category": "Forts & Desert Culture",
        "trip_types": ["culture", "adventure", "photography"],
        "rating": 4.8,
        "ideal_duration": 2,
        "budget": 6500,
        "weather": "Warm & Clear"
    },
    {
        "id": "jaisalmer",
        "name": "Jaisalmer",
        "description": "The Golden City, living sand fort, Sam desert dunes, camel safaris, and starlit desert camps.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Thar Desert",
        "coords": [26.9157, 70.9083],
        "category": "Desert Dunes & Forts",
        "trip_types": ["adventure", "culture", "romantic", "photography"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 8500,
        "weather": "Desert Warm"
    },
    {
        "id": "pushkar",
        "name": "Pushkar",
        "description": "Sacred desert lake, Brahma temple, colorful bazaars, and sunset sand dune trails.",
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
        "id": "ranthambore",
        "name": "Ranthambore",
        "description": "Historic hilltop fort and famous Royal Bengal Tiger jungle safaris in dry deciduous forests.",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
        "state": "Rajasthan",
        "region": "Sawai Madhopur",
        "coords": [26.0173, 76.5026],
        "category": "Wildlife Safari",
        "trip_types": ["adventure", "nature", "family"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 8500,
        "weather": "Warm & Sunny"
    },
    {
        "id": "mount-abu",
        "name": "Mount Abu",
        "description": "Only hill station in Rajasthan, Nakki Lake, and exquisite marble Dilwara Jain temples.",
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
        "description": "Junagarh Fort, camel breeding farm, Karni Mata temple, and savory Rajasthani cuisine.",
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

    # ==========================================
    # SOUTHERN INDIA DESTINATION HUBS
    # ==========================================
    {
        "id": "munnar",
        "name": "Munnar",
        "description": "Emerald green tea hills, misty mountain peaks, Lockhart estate, and cool waterfalls.",
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
        "description": "Tranquil Kerala backwaters, palm-fringed lagoons, and luxury overnight houseboats.",
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
        "id": "wayanad",
        "name": "Wayanad",
        "description": "Verdant spice plantations, ancient Edakkal caves, Chembra peak, and forested trekking paths.",
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
        "id": "varkala",
        "name": "Varkala",
        "description": "Dramatic red ocean cliffs, Arabian sea beach, seaside cafes, and Janardhana Swamy temple.",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
        "state": "Kerala",
        "region": "South Kerala Coast",
        "coords": [8.7379, 76.7163],
        "category": "Cliffs & Beaches",
        "trip_types": ["relaxation", "romantic", "nature", "spiritual"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Breezy & Coastal"
    },
    {
        "id": "thekkady",
        "name": "Thekkady (Periyar)",
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
        "id": "coorg",
        "name": "Coorg (Kodagu)",
        "description": "Aromatic coffee plantations, misty hills, Abbey falls, and scenic Western Ghats trekking.",
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
        "id": "chikmagalur",
        "name": "Chikmagalur",
        "description": "Birthplace of Indian coffee, Mullayanagiri highest peak trek, Hebbe falls, and lush estates.",
        "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=600&auto=format&fit=crop",
        "state": "Karnataka",
        "region": "Chikmagalur Hills",
        "coords": [13.3161, 75.7720],
        "category": "Coffee Estates & Peaks",
        "trip_types": ["nature", "adventure", "relaxation"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Cool & Misty"
    },
    {
        "id": "hampi",
        "name": "Hampi",
        "description": "Dramatic boulder-strewn landscapes and ancient UNESCO Vijayanagara empire ruins.",
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
        "id": "gokarna",
        "name": "Gokarna",
        "description": "Om Beach, cliff hiking trails, serene coastal temples, and pristine Arabian sea sunsets.",
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
    {
        "id": "ooty",
        "name": "Ooty & Nilgiris",
        "description": "Nilgiri mountain toy train, panoramic tea gardens, Pykara lake, and colonial charm.",
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
        "id": "kodaikanal",
        "name": "Kodaikanal",
        "description": "Princess of Hill Stations, star-shaped lake, Coaker's walk cliff views, and pine forest paths.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Tamil Nadu",
        "region": "Dindigul",
        "coords": [10.2381, 77.4892],
        "category": "Lakes & Misty Cliffs",
        "trip_types": ["nature", "romantic", "relaxation", "family"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 7000,
        "weather": "Cool & Foggy"
    },

    # ==========================================
    # KASHMIR & LADAKH HUBS
    # ==========================================
    {
        "id": "srinagar",
        "name": "Srinagar",
        "description": "Paradise on Earth, Dal Lake shikara rides, historic Mughal gardens, and cedar houseboats.",
        "image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
        "state": "Jammu & Kashmir",
        "region": "Kashmir Valley",
        "coords": [34.0837, 74.7973],
        "category": "Lakes & Mughal Gardens",
        "trip_types": ["romantic", "family", "culture", "nature"],
        "rating": 4.9,
        "ideal_duration": 4,
        "budget": 9500,
        "weather": "Cool & Crisp"
    },
    {
        "id": "gulmarg",
        "name": "Gulmarg",
        "description": "Meadow of Flowers, world's highest gondola cable car, Apharwat peak snows, and skiing.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Jammu & Kashmir",
        "region": "Baramulla",
        "coords": [34.0484, 74.3805],
        "category": "Snow Meadows & Cable Car",
        "trip_types": ["adventure", "snow", "romantic", "nature"],
        "rating": 4.9,
        "ideal_duration": 3,
        "budget": 10500,
        "weather": "Snow & Alpine"
    },
    {
        "id": "pahalgam",
        "name": "Pahalgam",
        "description": "Valley of Shepherds, Betaab valley river meadows, Aru valley trails, and Lidder trout stream.",
        "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        "state": "Jammu & Kashmir",
        "region": "Anantnag",
        "coords": [34.0161, 75.1950],
        "category": "River Valleys & Pine Meadows",
        "trip_types": ["nature", "romantic", "relaxation", "adventure"],
        "rating": 4.8,
        "ideal_duration": 3,
        "budget": 8500,
        "weather": "Pleasant Highland"
    },
    {
        "id": "leh-ladakh",
        "name": "Leh Ladakh",
        "description": "Land of High Passes, azure Pangong Lake, Nubra sand dunes, Khardung La, and ancient monasteries.",
        "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        "state": "Ladakh",
        "region": "Ladakh",
        "coords": [34.1526, 77.5771],
        "category": "High Passes & Monasteries",
        "trip_types": ["adventure", "culture", "photography", "roadtrip"],
        "rating": 4.9,
        "ideal_duration": 6,
        "budget": 13000,
        "weather": "Cold High Desert"
    },

    # ==========================================
    # WESTERN INDIA DESTINATION HUBS
    # ==========================================
    {
        "id": "lonavala",
        "name": "Lonavala & Khandala",
        "description": "Lush green Sahyadri hills, monsoon waterfalls, Karla caves, and Bhushi dam viewpoints.",
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
        "description": "Kolaba sea fort, sandy beaches, water sports, and coconut groves along the Konkan coast.",
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
        "name": "Mahabaleshwar & Panchgani",
        "description": "Strawberry farms, Arthur's Seat canyon view, Venna lake boating, and Pratapgad fort.",
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
        "description": "Sun-kissed beaches, coastal water sports, Portuguese colonial forts, and lively cafes.",
        "image": "https://images.unsplash.com/photo-1512400329929-f4104ecd552d?q=80&w=600&auto=format&fit=crop",
        "state": "Goa",
        "region": "Goa Coast",
        "coords": [15.2993, 74.1240],
        "category": "Beach & Heritage",
        "trip_types": ["relaxation", "adventure", "food", "romantic"],
        "rating": 4.9,
        "ideal_duration": 4,
        "budget": 10000,
        "weather": "Sunny & Coastal"
    }
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

        # 1. If a specific destination was targeted (e.g. Darjeeling, Himachal Pradesh, Kerala, etc.)
        if clean_dest:
            is_direct_match = (
                clean_dest in hub_name_low or hub_name_low in clean_dest
                or clean_dest in hub_id_low or hub_id_low in clean_dest
                or clean_dest in hub_region_low or hub_region_low in clean_dest
                or clean_dest in hub_state_low or hub_state_low in clean_dest
                or (clean_dest in ("himachal", "himachal pradesh", "hp") and hub_state_low == "himachal pradesh")
                or (clean_dest in ("uttarakhand", "uk", "uttaranchal") and hub_state_low == "uttarakhand")
                or (clean_dest in ("kashmir", "jammu and kashmir", "j&k", "jammu & kashmir") and hub_state_low in ("jammu & kashmir", "jammu and kashmir"))
                or (clean_dest in ("ladakh", "leh ladakh") and hub_state_low == "ladakh")
                or (clean_dest in ("bengal", "west bengal", "wb") and hub_state_low == "west bengal")
                or (clean_dest in ("rajasthan", "raj") and hub_state_low == "rajasthan")
                or (clean_dest in ("kerala", "gods own country") and hub_state_low == "kerala")
                or (clean_dest in ("karnataka") and hub_state_low == "karnataka")
                or (clean_dest in ("tamil nadu", "tn") and hub_state_low == "tamil nadu")
                or (clean_dest in ("meghalaya") and hub_state_low == "meghalaya")
                or (clean_dest in ("sikkim") and hub_state_low == "sikkim")
                or (clean_dest in ("maharashtra", "mh") and hub_state_low == "maharashtra")
                or (clean_dest in ("goa") and hub_state_low == "goa")
                or (clean_dest in ("madhya pradesh", "mp") and hub_state_low == "madhya pradesh")
                or (clean_dest in ("assam") and hub_state_low == "assam")
                or (clean_dest in ("himalayas", "himalayan") and hub_state_low in ("himachal pradesh", "uttarakhand", "sikkim", "jammu & kashmir", "ladakh"))
            )
            if not is_direct_match:
                continue

        # 2. If a specific region was targeted (e.g. Western Ghats, North Bengal, Rajasthan)
        elif clean_region:
            is_region_match = (
                clean_region in hub_region_low or clean_region in hub_state_low
                or (clean_region in ("himachal", "himachal pradesh", "hp") and hub_state_low == "himachal pradesh")
                or (clean_region in ("uttarakhand", "uk", "uttaranchal") and hub_state_low == "uttarakhand")
                or (clean_region in ("western ghats", "ghats") and hub_state_low in ("kerala", "karnataka", "maharashtra", "tamil nadu"))
                or (clean_region == "south india" and hub_state_low in ("kerala", "karnataka", "tamil nadu", "andhra pradesh", "telangana"))
                or (clean_region == "north india" and hub_state_low in ("rajasthan", "uttarakhand", "himachal pradesh", "delhi", "uttar pradesh", "jammu & kashmir", "ladakh"))
                or (clean_region == "east india" and hub_state_low in ("west bengal", "odisha", "bihar", "sikkim", "assam", "meghalaya"))
                or (clean_region in ("northeast", "northeast india") and hub_state_low in ("meghalaya", "assam", "sikkim", "arunachal pradesh", "nagaland"))
                or (clean_region in ("himalayas", "himalayan") and hub_state_low in ("himachal pradesh", "uttarakhand", "sikkim", "jammu & kashmir", "ladakh"))
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

        # Duration match
        hub_ideal_dur = hub.get("ideal_duration", 3)
        if abs(hub_ideal_dur - trip_duration) <= 1:
            score += 15

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

    logger.info(f"discover_destination_hubs returning {len(results)} destination hubs for origin='{origin_name}', target='{target_destination or target_region}'")
    return results
