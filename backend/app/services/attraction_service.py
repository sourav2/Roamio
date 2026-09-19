import os
import json
import urllib.request
import urllib.parse
import ssl
import math
import asyncio
from app.utils.logger import get_logger
from app.services.image_service import fetch_travel_image

logger = get_logger("app.services.attractions")

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

PARENT_LOCATION_CACHE = {}
NOMINATIM_BLOCKED = False

# Authoritative, destination-scoped attractions database keyed by canonical destination slug
DESTINATION_ATTRACTIONS_DATABASE = {
    "darjeeling": [
        {"name": "Tiger Hill Sunrise View", "type": "Viewpoint", "lat": 26.9942, "lon": 88.2865},
        {"name": "Batasia Loop Toy Train", "type": "Scenic Railway", "lat": 27.0165, "lon": 88.2475},
        {"name": "Ghoom Monastery", "type": "Cultural / Spiritual", "lat": 27.0163, "lon": 88.2562},
        {"name": "Happy Valley Tea Estate", "type": "Tea Plantation", "lat": 27.0542, "lon": 88.2625},
        {"name": "Darjeeling Himalayan Railway", "type": "UNESCO Heritage", "lat": 27.0410, "lon": 88.2612},
        {"name": "Peace Pagoda Japanese Temple", "type": "Temple", "lat": 27.0289, "lon": 88.2575},
        {"name": "Padmaja Naidu Himalayan Zoo", "type": "Zoological Park", "lat": 27.0592, "lon": 88.2547},
        {"name": "Rock Garden Chunnu Summer Falls", "type": "Waterfall Garden", "lat": 27.0285, "lon": 88.2325},
        {"name": "Nightingale Park Views", "type": "Nature Park", "lat": 27.0485, "lon": 88.2655},
        {"name": "Observatory Hill Mahakal Temple", "type": "Temple Viewpoint", "lat": 27.0455, "lon": 88.2665},
        {"name": "Tenzing Rock Climbing", "type": "Adventure Spot", "lat": 27.0650, "lon": 88.2650},
        {"name": "Singalila National Park Base", "type": "National Park", "lat": 27.1333, "lon": 88.0667}
    ],
    "kalimpong": [
        {"name": "Morgan House Colonial Mansion", "type": "Colonial Heritage", "lat": 27.0515, "lon": 88.4682},
        {"name": "Deolo Hill & Park Viewpoint", "type": "Viewpoint", "lat": 27.0862, "lon": 88.4891},
        {"name": "Durpin Monastery Zang Dhok Palri", "type": "Monastery", "lat": 27.0450, "lon": 88.4610},
        {"name": "Pine View Cactus Nursery", "type": "Botanical Gardens", "lat": 27.0601, "lon": 88.4715},
        {"name": "Mangal Dham Temple", "type": "Spiritual Shrine", "lat": 27.0645, "lon": 88.4752},
        {"name": "Hanuman Tok Kalimpong", "type": "Hilltop Shrine", "lat": 27.0720, "lon": 88.4810},
        {"name": "Crockety Heritage Bungalow", "type": "Heritage Site", "lat": 27.0610, "lon": 88.4690}
    ],
    "digha": [
        {"name": "New Digha Sea Beach", "type": "Coastline Beach", "lat": 21.6215, "lon": 87.4985},
        {"name": "Marine Aquarium Regional Centre", "type": "Marine Centre", "lat": 21.6265, "lon": 87.5120},
        {"name": "Old Digha Rock Seawall", "type": "Seawall Promenade", "lat": 21.6280, "lon": 87.5210},
        {"name": "Amarabati Park Lake Boating", "type": "Recreational Park", "lat": 21.6240, "lon": 87.5050},
        {"name": "Digha Science Centre & Planetarium", "type": "Science Park", "lat": 21.6290, "lon": 87.5160},
        {"name": "Chandaneswar Shiv Temple", "type": "Historic Temple", "lat": 21.6150, "lon": 87.4650},
        {"name": "Talsari Red Crab Beach", "type": "Scenic Beach", "lat": 21.6050, "lon": 87.4520},
        {"name": "Udaipur Beach Border", "type": "Quiet Beach", "lat": 21.6180, "lon": 87.4850}
    ],
    "mandarmoni": [
        {"name": "Mandarmoni Main Beach", "type": "Driveable Beach", "lat": 21.6667, "lon": 87.7000},
        {"name": "Mohona Red Crab Estuary", "type": "River Estuary", "lat": 21.6780, "lon": 87.7320},
        {"name": "Tajpur Pine Forest Beach", "type": "Pine Coast", "lat": 21.6580, "lon": 87.6520},
        {"name": "Mandarmoni Watersports Hub", "type": "Watersports", "lat": 21.6640, "lon": 87.6950},
        {"name": "Shankarpur Fishing Harbour", "type": "Coastal Harbour", "lat": 21.6420, "lon": 87.5750}
    ],
    "purulia": [
        {"name": "Ayodhya Hills Upper Dam", "type": "Hilltop Reservoir", "lat": 23.2167, "lon": 86.1333},
        {"name": "Bamni Falls & Gorge", "type": "Waterfall", "lat": 23.2050, "lon": 86.1420},
        {"name": "Marble Lake Purulia", "type": "Scenic Quarry Lake", "lat": 23.2280, "lon": 86.1210},
        {"name": "Turga Falls Stream", "type": "Waterfall", "lat": 23.2110, "lon": 86.1280},
        {"name": "Joychandi Pahar Rock Peak", "type": "Rock Climbing Hill", "lat": 23.5510, "lon": 86.6620},
        {"name": "Khairabera Eco Lake Dam", "type": "Eco Lake Dam", "lat": 23.1890, "lon": 86.0450},
        {"name": "Pakhi Pahar Rock Sculptures", "type": "Sculpted Hills", "lat": 23.2450, "lon": 86.1550},
        {"name": "Charrah Terracotta Jain Temples", "type": "Ancient Heritage", "lat": 23.3750, "lon": 86.4120}
    ],
    "sundarbans": [
        {"name": "Sajnekhali Bird Sanctuary Watchtower", "type": "Bird Sanctuary", "lat": 22.1280, "lon": 88.8250},
        {"name": "Sudhanyakhali Tiger Watchtower", "type": "Wildlife Watchtower", "lat": 22.1050, "lon": 88.8520},
        {"name": "Dobanki Canopy Walk Trail", "type": "Canopy Walk", "lat": 21.9850, "lon": 88.7520},
        {"name": "Netidhopani Historic Ruins", "type": "Historic Temple Watchtower", "lat": 21.9120, "lon": 88.7890},
        {"name": "Burir Dabri Mudwalk & Watchtower", "type": "Mangrove Mudwalk", "lat": 22.1850, "lon": 89.0250},
        {"name": "Pirkhali Island Creek Safari", "type": "Boat Creek Safari", "lat": 22.0520, "lon": 88.8120}
    ],
    "shantiniketan": [
        {"name": "Visva Bharati Tagore Ashram", "type": "UNESCO World Heritage", "lat": 23.6800, "lon": 87.6800},
        {"name": "Rabindra Bhavana Museum", "type": "Literary Museum", "lat": 23.6830, "lon": 87.6820},
        {"name": "Amar Kutir Handicraft Village", "type": "Artisan Craft Village", "lat": 23.6950, "lon": 87.6620},
        {"name": "Sonajhuri Haat Saturday Forest Market", "type": "Tribal Craft Market", "lat": 23.6920, "lon": 87.6580},
        {"name": "Kala Bhavana Art Complex", "type": "Fine Arts Campus", "lat": 23.6810, "lon": 87.6790},
        {"name": "Khowai River Canyon Trail", "type": "Red Earth Canyon", "lat": 23.6980, "lon": 87.6510},
        {"name": "Ballavpur Deer Wildlife Sanctuary", "type": "Deer Park Sanctuary", "lat": 23.7020, "lon": 87.6710}
    ],
    "dooars": [
        {"name": "Gorumara National Park Rhino Safari", "type": "National Park Safari", "lat": 26.7500, "lon": 88.8000},
        {"name": "Jaldapara Elephant Grassland Safari", "type": "Wildlife Sanctuary", "lat": 26.6900, "lon": 89.2800},
        {"name": "Buxa Fort Historic Ruins", "type": "Heritage Trek", "lat": 26.7560, "lon": 89.5850},
        {"name": "Jayanti Riverbed & Mahakal Cave", "type": "Riverbed & Caves", "lat": 26.7020, "lon": 89.6120},
        {"name": "Samsing & Suntalekhola Nature Camp", "type": "Foothills Camp", "lat": 27.0120, "lon": 88.7920},
        {"name": "Chapramari Wildlife Reserve", "type": "Forest Reserve", "lat": 26.8850, "lon": 88.8520},
        {"name": "Murti Riverfront Promenade", "type": "Scenic Riverfront", "lat": 26.8320, "lon": 88.8350},
        {"name": "Bindu Dam & Jaldhaka River Valley", "type": "Border River Dam", "lat": 27.0980, "lon": 88.8750}
    ],
    "kurseong": [
        {"name": "Eagle's Crag Viewpoint", "type": "Viewpoint", "lat": 26.8850, "lon": 88.2810},
        {"name": "Dow Hill Pine Forest & Museum", "type": "Forest Park", "lat": 26.8920, "lon": 88.2910},
        {"name": "Margaret's Hope Tea Estate", "type": "Tea Plantation", "lat": 26.8720, "lon": 88.2650},
        {"name": "Netaji Subhash Chandra Bose Museum", "type": "Heritage Museum", "lat": 26.8810, "lon": 88.2750},
        {"name": "Chimney Heritage Trail", "type": "Colonial Monument", "lat": 26.8950, "lon": 88.3120}
    ],
    "mirik": [
        {"name": "Sumendu Lake & Arch Bridge", "type": "Lake Boating", "lat": 26.8900, "lon": 88.1700},
        {"name": "Bokar Monastery Mirik", "type": "Tibetan Monastery", "lat": 26.8860, "lon": 88.1750},
        {"name": "Tingling View Point Tea Slopes", "type": "Viewpoint", "lat": 26.8750, "lon": 88.1920},
        {"name": "Orange Valley Mirik Orchards", "type": "Fruit Orchards", "lat": 26.8980, "lon": 88.1620},
        {"name": "Helipad Viewpoint Kanchenjunga", "type": "Mountain Vista", "lat": 26.8940, "lon": 88.1810}
    ],
    "gangtok": [
        {"name": "Rumtek Monastery Dharma Chakra", "type": "Monastery", "lat": 27.2785, "lon": 88.5992},
        {"name": "Tsomgo Changu Alpine Lake", "type": "Glacial Lake", "lat": 27.3756, "lon": 88.7619},
        {"name": "Nathula Pass Border View", "type": "Mountain Pass", "lat": 27.3865, "lon": 88.8309},
        {"name": "Ban Jhakri Falls & Shaman Park", "type": "Waterfall Park", "lat": 27.3420, "lon": 88.5950},
        {"name": "Gangtok Ropeway Cable Car", "type": "Cable Car", "lat": 27.3292, "lon": 88.6124},
        {"name": "Enchey Monastery", "type": "Historic Monastery", "lat": 27.3410, "lon": 88.6180},
        {"name": "Ganesh Tok & Tashi Viewpoint", "type": "Viewpoint", "lat": 27.3550, "lon": 88.6250},
        {"name": "Do Drul Chorten Stupa", "type": "Stupa Shrine", "lat": 27.3190, "lon": 88.6050}
    ],
    "pelling": [
        {"name": "Pemayangtse Ancient Monastery", "type": "Monastery", "lat": 27.3015, "lon": 88.2450},
        {"name": "Pelling Glass Skywalk & Chenrezig Statue", "type": "Skywalk Viewpoint", "lat": 27.3025, "lon": 88.2367},
        {"name": "Rabdentse Palace Royal Ruins", "type": "Historic Palace Ruins", "lat": 27.2980, "lon": 88.2410},
        {"name": "Khecheopalri Wish Fulfilling Lake", "type": "Sacred Lake", "lat": 27.3520, "lon": 88.1980},
        {"name": "Kanchenjunga Waterfalls", "type": "Waterfall", "lat": 27.3810, "lon": 88.1650},
        {"name": "Singshore Suspension Gorge Bridge", "type": "Suspension Bridge", "lat": 27.2750, "lon": 88.0850}
    ],
    "pushkar": [
        {"name": "Pushkar Sacred Lake & Ghats", "type": "Sacred Holy Lake", "lat": 26.4897, "lon": 74.5510},
        {"name": "Brahma Temple Pushkar", "type": "Historic Temple", "lat": 26.4880, "lon": 74.5525},
        {"name": "Savitri Devi Hilltop Temple", "type": "Hilltop Viewpoint", "lat": 26.4820, "lon": 74.5380},
        {"name": "Pushkar Desert Sand Dunes & Safari", "type": "Desert Dunes", "lat": 26.5050, "lon": 74.5350},
        {"name": "Varaha Temple Ancient Shrine", "type": "Temple", "lat": 26.4910, "lon": 74.5540},
        {"name": "Rangji Temple South Indian Architecture", "type": "Temple Heritage", "lat": 26.4890, "lon": 74.5560}
    ],
    "ranthambore": [
        {"name": "Ranthambore National Park Jungle Safari", "type": "Tiger Wildlife Reserve", "lat": 26.0173, "lon": 76.5026},
        {"name": "Ranthambore Fort UNESCO Heritage", "type": "Fortress", "lat": 26.0215, "lon": 76.4540},
        {"name": "Padam Talao Lake & Jogi Mahal", "type": "Scenic Jungle Lake", "lat": 26.0190, "lon": 76.4620},
        {"name": "Trinetra Ganesha Temple", "type": "Historic Fort Temple", "lat": 26.0220, "lon": 76.4550},
        {"name": "Kachida Valley Leopard & Bear Spot", "type": "Valley Reserve", "lat": 26.0450, "lon": 76.5210},
        {"name": "Surwal Lake Bird Watching", "type": "Seasonal Bird Lake", "lat": 26.0850, "lon": 76.5450}
    ],
    "udaipur": [
        {"name": "City Palace Udaipur & Museum", "type": "Royal Palace", "lat": 24.5764, "lon": 73.6835},
        {"name": "Lake Pichola Sunset Boat Cruise", "type": "Lake Cruise", "lat": 24.5750, "lon": 73.6780},
        {"name": "Jag Mandir Island Palace", "type": "Island Palace", "lat": 24.5680, "lon": 73.6760},
        {"name": "Saheliyon Ki Bari Fountains Garden", "type": "Royal Gardens", "lat": 24.6010, "lon": 73.6850},
        {"name": "Jagdish Temple Historic Carvings", "type": "Historic Temple", "lat": 24.5790, "lon": 73.6840},
        {"name": "Monsoon Palace Sajjangarh Peak", "type": "Hilltop Fortress", "lat": 24.5920, "lon": 73.6380},
        {"name": "Bagore Ki Haveli Folk Dance & Museum", "type": "Cultural Heritage", "lat": 24.5800, "lon": 73.6810},
        {"name": "Fateh Sagar Lake & Nehru Park", "type": "Lake Promenade", "lat": 24.6050, "lon": 73.6720}
    ],
    "jaipur": [
        {"name": "Amber Palace Fort & Courtyard", "type": "UNESCO Fortress Palace", "lat": 26.9855, "lon": 75.8513},
        {"name": "Hawa Mahal Palace of Winds", "type": "Heritage Landmark", "lat": 26.9239, "lon": 75.8267},
        {"name": "City Palace Jaipur & Chandra Mahal", "type": "Royal Palace Complex", "lat": 26.9258, "lon": 75.8237},
        {"name": "Jantar Mantar Astronomical Observatory", "type": "UNESCO Observatory", "lat": 26.9248, "lon": 75.8245},
        {"name": "Nahargarh Fort Sunset Ridge", "type": "Hill Fortress", "lat": 26.9375, "lon": 75.8155},
        {"name": "Jaigarh Fort & Cannon Museum", "type": "Military Fortress", "lat": 26.9850, "lon": 75.8450},
        {"name": "Albert Hall State Museum", "type": "Museum Heritage", "lat": 26.9116, "lon": 75.8195},
        {"name": "Jal Mahal Floating Palace", "type": "Water Palace", "lat": 26.9535, "lon": 75.8458}
    ],
    "jodhpur": [
        {"name": "Mehrangarh Fort Clifftop Fortress", "type": "Historic Fort", "lat": 26.2978, "lon": 73.0185},
        {"name": "Jaswant Thada Marble Cenotaphs", "type": "Royal Memorial", "lat": 26.3030, "lon": 73.0220},
        {"name": "Umaid Bhawan Palace & Heritage Museum", "type": "Royal Palace", "lat": 26.2810, "lon": 73.0470},
        {"name": "Mandore Gardens Historic Cenotaphs", "type": "Heritage Gardens", "lat": 26.3550, "lon": 73.0420},
        {"name": "Rao Jodha Desert Rock Park", "type": "Eco Desert Park", "lat": 26.2990, "lon": 73.0160},
        {"name": "Toorji Ka Jhalra Ancient Stepwell", "type": "Heritage Stepwell", "lat": 26.2965, "lon": 73.0240}
    ],
    "agra": [
        {"name": "Taj Mahal Monument of Love", "type": "UNESCO World Heritage", "lat": 27.1751, "lon": 78.0421},
        {"name": "Agra Fort Red Sandstone Fortress", "type": "UNESCO Fort", "lat": 27.1795, "lon": 78.0211},
        {"name": "Mehtab Bagh Sunset Taj View", "type": "Charbagh Garden", "lat": 27.1800, "lon": 78.0420},
        {"name": "Tomb of I'timad-ud-Daulah Baby Taj", "type": "Mughal Mausoleum", "lat": 27.1930, "lon": 78.0310},
        {"name": "Akbar's Tomb Sikandra", "type": "Historical Tomb", "lat": 27.2210, "lon": 77.9510},
        {"name": "Fatehpur Sikri Imperial City", "type": "UNESCO Royal City", "lat": 27.0945, "lon": 77.6675}
    ],
    "varanasi": [
        {"name": "Dashashwamedh Ghat Grand Aarti", "type": "Sacred Ghat", "lat": 25.3065, "lon": 83.0105},
        {"name": "Kashi Vishwanath Golden Temple", "type": "Jyotirlinga Temple", "lat": 25.3109, "lon": 83.0107},
        {"name": "Assi Ghat Morning Subah-e-Banaras", "type": "Cultural Ghat", "lat": 25.2890, "lon": 83.0060},
        {"name": "Manikarnika Sacred Burning Ghat", "type": "Historic Ghat", "lat": 25.3110, "lon": 83.0140},
        {"name": "Sarnath Dhamek Stupa & Deer Park", "type": "Buddhist Heritage", "lat": 25.3811, "lon": 83.0214},
        {"name": "Ramnagar Fort & Riverfront Palace", "type": "Historic Fort", "lat": 25.2690, "lon": 83.0250}
    ],
    "lucknow": [
        {"name": "Bara Imambara & Bhool Bhulaiya", "type": "Historic Monument", "lat": 26.8690, "lon": 80.9127},
        {"name": "Chota Imambara Palace of Lights", "type": "Heritage Monument", "lat": 26.8740, "lon": 80.9040},
        {"name": "Rumi Darwaza Turkish Gate", "type": "Historic Gateway", "lat": 26.8702, "lon": 80.9122},
        {"name": "The British Residency Ruins", "type": "Heritage Memorial", "lat": 26.8610, "lon": 80.9280},
        {"name": "Hazratganj Heritage Shopping", "type": "Colonial Promenade", "lat": 26.8520, "lon": 80.9460},
        {"name": "Ambedkar Memorial Park", "type": "Modern Monument", "lat": 26.8480, "lon": 80.9780}
    ],
    "rishikesh": [
        {"name": "Laxman Jhula & Ram Jhula Suspension Bridges", "type": "Iconic Bridge", "lat": 30.1340, "lon": 78.3280},
        {"name": "Triveni Ghat Evening Maha Aarti", "type": "Sacred Ghat", "lat": 30.1040, "lon": 78.2980},
        {"name": "Parmarth Niketan Ashram & Ghat", "type": "Spiritual Ashram", "lat": 30.1190, "lon": 78.3140},
        {"name": "The Beatles Ashram Chaurasi Kutia", "type": "Heritage Ashram", "lat": 30.1150, "lon": 78.3120},
        {"name": "Neer Garh Waterfall Trek", "type": "Waterfall", "lat": 30.1450, "lon": 78.3450},
        {"name": "Shivpuri White Water River Rafting", "type": "Adventure Rafting", "lat": 30.1410, "lon": 78.3910}
    ],
    "manali": [
        {"name": "Solang Valley Snow Sports", "type": "Adventure Valley", "lat": 32.3168, "lon": 77.1584},
        {"name": "Rohtang Pass Alpine Ridge", "type": "Mountain Pass", "lat": 32.3716, "lon": 77.2435},
        {"name": "Hadimba Devi Cedar Temple", "type": "Ancient Temple", "lat": 32.2471, "lon": 77.1795},
        {"name": "Old Manali Cafes & Apple Orchards", "type": "Heritage Village", "lat": 32.2560, "lon": 77.1750},
        {"name": "Jogini Waterfalls Trek", "type": "Waterfall Trek", "lat": 32.2625, "lon": 77.1950},
        {"name": "Vashisht Natural Hot Springs", "type": "Hot Springs", "lat": 32.2610, "lon": 77.1890}
    ],
    "shimla": [
        {"name": "Jakhoo Hill Hanuman Temple", "type": "Hilltop Temple", "lat": 31.1011, "lon": 77.1852},
        {"name": "Mall Road & Ridge Promenade", "type": "Shopping Promenade", "lat": 31.1044, "lon": 77.1741},
        {"name": "Christ Church Shimla", "type": "Colonial Church", "lat": 31.1051, "lon": 77.1752},
        {"name": "Viceregal Lodge Indian Institute of Advanced Study", "type": "Colonial Palace", "lat": 31.1027, "lon": 77.1415},
        {"name": "Kufri Adventure Park & Snow Point", "type": "Hill Station Point", "lat": 31.1002, "lon": 77.2662},
        {"name": "Green Valley Mashobra Cedar Forest", "type": "Nature Valley", "lat": 31.0967, "lon": 77.2284}
    ],
    "coorg": [
        {"name": "Abbey Falls Coffee Plantation Trail", "type": "Waterfall", "lat": 12.4542, "lon": 75.7185},
        {"name": "Raja's Seat Sunset Garden", "type": "Viewpoint Garden", "lat": 12.4180, "lon": 75.7360},
        {"name": "Namdroling Golden Temple Bylakuppe", "type": "Tibetan Monastery", "lat": 12.4520, "lon": 75.9680},
        {"name": "Dubare Elephant Camp River Crossing", "type": "Wildlife Camp", "lat": 12.3680, "lon": 75.9050},
        {"name": "Talakaveri Sacred River Origin", "type": "Holy Source Shrine", "lat": 12.3850, "lon": 75.4920},
        {"name": "Mandalpatti 4x4 Jeep Peak Viewpoint", "type": "Mountain Vista", "lat": 12.5120, "lon": 75.7280},
        {"name": "Brahmagiri Wildlife Peak Trek", "type": "Nature Trek", "lat": 12.0150, "lon": 75.9920}
    ],
    "munnar": [
        {"name": "Eravikulam National Park Nilgiri Tahr", "type": "National Park", "lat": 10.1520, "lon": 77.0620},
        {"name": "Tea Museum & Lockhart Tea Estate", "type": "Tea Plantation", "lat": 10.0889, "lon": 77.0595},
        {"name": "Mattupetty Dam & Speedboat Lake", "type": "Dam / Lake", "lat": 10.1080, "lon": 77.1250},
        {"name": "Echo Point & Kundala Lake", "type": "Scenic Lake", "lat": 10.1250, "lon": 77.1720},
        {"name": "Top Station Mountain Viewpoint", "type": "Viewpoint", "lat": 10.1220, "lon": 77.2450},
        {"name": "Attukad Multi-Tier Waterfalls", "type": "Waterfall", "lat": 10.0560, "lon": 77.0420},
        {"name": "Anamudi Peak Foothill Trails", "type": "Highest Peak Trail", "lat": 10.1700, "lon": 77.0650}
    ],
    "alleppey": [
        {"name": "Alleppey Backwaters Houseboat Cruise", "type": "Backwaters Canal", "lat": 9.4981, "lon": 76.3388},
        {"name": "Marari White Sand Beach", "type": "Tranquil Beach", "lat": 9.6015, "lon": 76.2995},
        {"name": "Alappuzha Lighthouse & Pier", "type": "Coastal Landmark", "lat": 9.4920, "lon": 76.3190},
        {"name": "Kuttanad Below-Sea-Level Paddy Fields", "type": "Agrarian Landscape", "lat": 9.4210, "lon": 76.4350},
        {"name": "Pathiramanal Bird Island Vembanad", "type": "Bird Sanctuary", "lat": 9.6150, "lon": 76.3880},
        {"name": "Punnamada Lake Kayaking & Snake Boat Hub", "type": "Lake Sports", "lat": 9.5120, "lon": 76.3560}
    ],
    "ooty": [
        {"name": "Ooty Botanical Gardens", "type": "Botanical Gardens", "lat": 11.4182, "lon": 76.7118},
        {"name": "Nilgiri Mountain Toy Train", "type": "UNESCO Heritage Railway", "lat": 11.3255, "lon": 76.8250},
        {"name": "Doddabetta Peak Viewpoint", "type": "Highest Peak Vista", "lat": 11.4010, "lon": 76.7360},
        {"name": "Ooty Lake & Boathouse", "type": "Lake Boating", "lat": 11.4080, "lon": 76.6920},
        {"name": "Rose Garden Ooty", "type": "Floral Gardens", "lat": 11.4090, "lon": 76.7180},
        {"name": "Pykara Lake & Waterfalls", "type": "Waterfall / Lake", "lat": 11.4520, "lon": 76.5980},
        {"name": "Avalanche Lake Forest Trail", "type": "Nature Reserve", "lat": 11.2950, "lon": 76.5920}
    ],
    "kodaikanal": [
        {"name": "Kodaikanal Star Lake & Promenade", "type": "Lake Boating", "lat": 10.2335, "lon": 77.4895},
        {"name": "Coaker's Walk Valley Vista", "type": "Paved Ridge Walk", "lat": 10.2325, "lon": 77.4935},
        {"name": "Pillar Rocks Vertical Cliffs", "type": "Rock Formation", "lat": 10.2180, "lon": 77.4690},
        {"name": "Bryant Park Botanical Gardens", "type": "Botanical Gardens", "lat": 10.2310, "lon": 77.4940},
        {"name": "Silver Cascade Waterfall", "type": "Waterfall", "lat": 10.2520, "lon": 77.5180},
        {"name": "Pine Forest Scenic Walk", "type": "Pine Forest", "lat": 10.2150, "lon": 77.4620},
        {"name": "Dolphin's Nose Mountain Cliff", "type": "Cliff Viewpoint", "lat": 10.2080, "lon": 77.5120}
    ],
    "wayanad": [
        {"name": "Edakkal Prehistoric Caves", "type": "Ancient Rock Art", "lat": 11.6275, "lon": 76.2345},
        {"name": "Banasura Sagar Earthen Dam", "type": "Earthen Dam / Lake", "lat": 11.6705, "lon": 75.9555},
        {"name": "Chembra Peak Heart Lake Trek", "type": "Mountain Peak Trek", "lat": 11.5125, "lon": 76.0872},
        {"name": "Soochipara 3-Tier Waterfalls", "type": "Waterfall", "lat": 11.5050, "lon": 76.1620},
        {"name": "Wayanad Wildlife Sanctuary Muthanga", "type": "Wildlife Reserve", "lat": 11.6720, "lon": 76.3650},
        {"name": "Pookode Freshwater Lake Boating", "type": "Natural Lake", "lat": 11.5420, "lon": 76.0250},
        {"name": "Phantom Rock Skull Formation", "type": "Geological Formation", "lat": 11.6420, "lon": 76.1950}
    ],
    "hampi": [
        {"name": "Virupaksha Temple Riverbank Complex", "type": "UNESCO Sacred Temple", "lat": 15.3350, "lon": 76.4600},
        {"name": "Vijaya Vittala Temple & Stone Chariot", "type": "UNESCO Heritage Monument", "lat": 15.3420, "lon": 76.4780},
        {"name": "Hampi Bazaar & Hemakuta Hill Sunset", "type": "Hilltop Ruins", "lat": 15.3330, "lon": 76.4580},
        {"name": "Lotus Mahal & Elephant Stables", "type": "Royal Enclosure", "lat": 15.3210, "lon": 76.4710},
        {"name": "Matanga Hill Sunrise Panorama", "type": "Highest Panorama", "lat": 15.3320, "lon": 76.4680},
        {"name": "Tungabhadra River Coracle Boat Ride", "type": "River Experience", "lat": 15.3380, "lon": 76.4620}
    ],
    "mysore": [
        {"name": "Mysore Royal Palace Illumination", "type": "Royal Palace", "lat": 12.3052, "lon": 76.6552},
        {"name": "Chamundi Hills Temple & Nandi Bull", "type": "Hilltop Shrine", "lat": 12.2745, "lon": 76.6710},
        {"name": "Brindavan Gardens & Musical Fountain", "type": "Terrace Gardens", "lat": 12.4220, "lon": 76.5720},
        {"name": "St. Philomena's Neo-Gothic Cathedral", "type": "Historic Cathedral", "lat": 12.3210, "lon": 76.6580},
        {"name": "Sri Chamarajendra Mysore Zoo", "type": "Zoological Park", "lat": 12.3020, "lon": 76.6650},
        {"name": "Jaganmohan Palace Art Gallery", "type": "Art Museum", "lat": 12.3080, "lon": 76.6510}
    ],
    "thekkady": [
        {"name": "Periyar National Park Lake Boating", "type": "Wildlife Reserve Lake", "lat": 9.5785, "lon": 77.1685},
        {"name": "Spice Plantation Guided Estate Tour", "type": "Spice Plantation", "lat": 9.6050, "lon": 77.1550},
        {"name": "Elephant Junction Thekkady", "type": "Elephant Sanctuary", "lat": 9.6150, "lon": 77.1420},
        {"name": "Kadathanadan Kalari Kshethram Martial Arts", "type": "Cultural Theatre", "lat": 9.6010, "lon": 77.1620},
        {"name": "Mangala Devi Kannagi Hilltop Temple", "type": "Ancient Temple", "lat": 9.5920, "lon": 77.2150}
    ],
    "gokarna": [
        {"name": "Om Beach Coastal Trail", "type": "Coastal Beach", "lat": 14.5185, "lon": 74.3165},
        {"name": "Kudle Beach Sunset Coast", "type": "Sunset Beach", "lat": 14.5290, "lon": 74.3140},
        {"name": "Mahabaleshwar Temple Gokarna", "type": "Atmalinga Temple", "lat": 14.5420, "lon": 74.3180},
        {"name": "Half Moon Beach Hike", "type": "Secluded Beach", "lat": 14.5110, "lon": 74.3280},
        {"name": "Paradise Beach Cliff Walk", "type": "Hidden Beach", "lat": 14.5050, "lon": 74.3320},
        {"name": "Mirjan Fort Laterite Ruins", "type": "Historic Fort", "lat": 14.4920, "lon": 74.4190}
    ],
    "goa": [
        {"name": "Baga Sandy Beach & Watersports", "type": "Beach", "lat": 15.5553, "lon": 73.7517},
        {"name": "Fort Aguada Lighthouse & Ramparts", "type": "Historic Fort", "lat": 15.4925, "lon": 73.7736},
        {"name": "Basilica of Bom Jesus UNESCO", "type": "Historical Church", "lat": 15.5009, "lon": 73.9116},
        {"name": "Dudhsagar Waterfall Jungle Trek", "type": "Waterfall", "lat": 15.3125, "lon": 74.3142},
        {"name": "Palolem Crescent Beach Shore", "type": "Beach", "lat": 15.0101, "lon": 74.0232},
        {"name": "Anjuna Flea Market & Curlies", "type": "Bazaar & Coast", "lat": 15.5802, "lon": 73.7432},
        {"name": "Chapora Fort Dil Chahta Hai Ramparts", "type": "Coastal Fort", "lat": 15.6060, "lon": 73.7360},
        {"name": "Mangueshi Temple Complex", "type": "Temple", "lat": 15.4439, "lon": 73.9683}
    ],
    "lonavala": [
        {"name": "Tiger's Leap Valley Viewpoint", "type": "Canyon Viewpoint", "lat": 18.7505, "lon": 73.4075},
        {"name": "Bhushi Dam Waterfall Steps", "type": "Water Dam", "lat": 18.7250, "lon": 73.4180},
        {"name": "Karla & Bhaja Buddhist Caves", "type": "Rock-cut Caves", "lat": 18.7820, "lon": 73.4710},
        {"name": "Rajmachi Fort Mountain Trek", "type": "Historic Fort", "lat": 18.8250, "lon": 73.3980},
        {"name": "Lion's Point Sunset Panorama", "type": "Cliff Viewpoint", "lat": 18.7350, "lon": 73.4120},
        {"name": "Lohagad Fort Clifftop Fortress", "type": "Hilltop Fort", "lat": 18.7050, "lon": 73.4790}
    ],
    "alibaug": [
        {"name": "Kolaba Fort Sea Fortress", "type": "Sea Fort", "lat": 18.6380, "lon": 72.8620},
        {"name": "Alibaug Sea Beach Promenade", "type": "Coastal Beach", "lat": 18.6420, "lon": 72.8710},
        {"name": "Varsoli Beach & Watersports", "type": "Beach", "lat": 18.6650, "lon": 72.8720},
        {"name": "Nagaon Beach Banana Rides", "type": "Water Activities", "lat": 18.5950, "lon": 72.8980},
        {"name": "Kihim Beach Casuarina Grove", "type": "Nature Beach", "lat": 18.7250, "lon": 72.8710},
        {"name": "Murud Janjira Sea Fortress", "type": "Island Fort", "lat": 18.3010, "lon": 72.9640}
    ],
    "mahabaleshwar": [
        {"name": "Arthur's Seat Queen of Viewpoints", "type": "Canyon Vista", "lat": 17.9625, "lon": 73.6125},
        {"name": "Elephant's Head Needle Point", "type": "Cliff Viewpoint", "lat": 17.9350, "lon": 73.6210},
        {"name": "Venna Lake Boating & Horse Riding", "type": "Lake Boating", "lat": 17.9250, "lon": 73.6620},
        {"name": "Mapro Garden Strawberry Estate", "type": "Agro Tourism", "lat": 17.9290, "lon": 73.7450},
        {"name": "Pratapgad Fort Maratha Fortress", "type": "Historic Fort", "lat": 17.9320, "lon": 73.5780},
        {"name": "Lingmala Waterfall Cascades", "type": "Waterfall", "lat": 17.9310, "lon": 73.6920}
    ],
    "shillong": [
        {"name": "Umiam Lake Water Sports Complex", "type": "Alpine Lake", "lat": 25.6548, "lon": 91.8984},
        {"name": "Elephant Falls Multi-Tier Cascades", "type": "Waterfall", "lat": 25.5392, "lon": 91.8239},
        {"name": "Laitlum Canyons Grand Vista", "type": "Canyon Viewpoint", "lat": 25.4514, "lon": 91.8951},
        {"name": "Don Bosco Indigenous Museum", "type": "Cultural Museum", "lat": 25.5925, "lon": 91.8847},
        {"name": "Shillong Peak Heights", "type": "Viewpoint", "lat": 25.5312, "lon": 91.8624},
        {"name": "Ward's Lake Botanical Gardens", "type": "City Lake Park", "lat": 25.5780, "lon": 91.8860},
        {"name": "Mawphlang Sacred Ancient Forest", "type": "Sacred Grove", "lat": 25.4542, "lon": 91.7589}
    ],
    "cherrapunji": [
        {"name": "Double Decker Living Root Bridge Nongriat", "type": "Bio-Engineering Bridge", "lat": 25.2785, "lon": 91.7336},
        {"name": "Nohkalikai Falls India's Tallest Plunge", "type": "Plunge Waterfall", "lat": 25.2750, "lon": 91.6850},
        {"name": "Mawsmai Cave Limestone Explorer", "type": "Limestone Cave", "lat": 25.2447, "lon": 91.7248},
        {"name": "Seven Sisters Nohsngithiang Falls", "type": "Waterfall", "lat": 25.2472, "lon": 91.7275},
        {"name": "Wei Sawdong Three-Tier Waterfall", "type": "Emerald Waterfall", "lat": 25.2950, "lon": 91.6880},
        {"name": "Arwah Cave Stalactite Trail", "type": "Fossil Cave", "lat": 25.2890, "lon": 91.7050}
    ],
    "delhi": [
        {"name": "India Gate & Kartavya Path", "type": "War Memorial", "lat": 28.6129, "lon": 77.2295},
        {"name": "Qutub Minar Complex UNESCO", "type": "UNESCO Heritage", "lat": 28.5245, "lon": 77.1855},
        {"name": "Red Fort Lal Qila", "type": "Mughal Fort", "lat": 28.6562, "lon": 77.2410},
        {"name": "Humayun's Tomb Charbagh", "type": "Mughal Mausoleum", "lat": 28.5878, "lon": 77.2507},
        {"name": "Lotus Temple Bahai House of Worship", "type": "Spiritual Temple", "lat": 28.5535, "lon": 77.2588},
        {"name": "Akshardham Temple Complex", "type": "Cultural Temple", "lat": 28.6127, "lon": 77.2773},
        {"name": "Hauz Khas Fort & Heritage Village", "type": "Heritage Village", "lat": 28.5494, "lon": 77.1942},
        {"name": "Jama Masjid Historic Mosque", "type": "Historic Mosque", "lat": 28.6507, "lon": 77.2334},
        {"name": "Chandni Chowk Old Delhi Bazaar", "type": "Heritage Bazaar", "lat": 28.6560, "lon": 77.2300},
        {"name": "Agrasen Ki Baoli Stepwell", "type": "Historic Stepwell", "lat": 28.6258, "lon": 77.2250}
    ],
    "kolkata": [
        {"name": "Victoria Memorial Hall & Gardens", "type": "Palace Museum", "lat": 22.5448, "lon": 88.3426},
        {"name": "Howrah Bridge Landmark", "type": "Historic Bridge", "lat": 22.5851, "lon": 88.3468},
        {"name": "Dakshineswar Kali Temple", "type": "Temple", "lat": 22.6548, "lon": 88.3576},
        {"name": "Indian Museum Kolkata", "type": "National Museum", "lat": 22.5579, "lon": 88.3511},
        {"name": "Eco-Tourism Park New Town", "type": "Nature Park", "lat": 22.5975, "lon": 88.4650},
        {"name": "Belur Math Universal Temple", "type": "Spiritual Shrine", "lat": 22.6322, "lon": 88.3559},
        {"name": "Princep Ghat Riverfront Promenade", "type": "River Promenade", "lat": 22.5542, "lon": 88.3325},
        {"name": "Marble Palace Mansion", "type": "Heritage Palace", "lat": 22.5828, "lon": 88.3601}
    ]
}

def _get_curated_destination_fallback(dest_name: str) -> list:
    """Finds curated fallback places matching the destination name strictly."""
    dest_clean = dest_name.lower().strip().replace("-", " ")
    for key, places in DESTINATION_ATTRACTIONS_DATABASE.items():
        key_clean = key.replace("-", " ")
        if key_clean == dest_clean or key_clean in dest_clean or dest_clean in key_clean:
            return places
    return []

async def get_parent_location_details(lat: float, lon: float) -> tuple[str, str]:
    if 8.0 <= lat <= 37.6 and 68.7 <= lon <= 97.2:
        state_presets = {
            "Meghalaya": (25.5379432, 91.2999102),
            "Kerala": (10.8505, 76.2711),
            "Rajasthan": (26.9124, 75.7873),
            "Goa": (15.2993, 74.1240),
            "Himachal Pradesh": (31.1048, 77.1734),
            "Nagaland": (26.1584, 94.5624),
            "Sikkim": (27.5330, 88.5122),
            "Delhi": (28.6139, 77.2090),
            "West Bengal": (22.5726, 88.3639),
            "Karnataka": (12.9716, 77.5946),
            "Maharashtra": (19.0760, 72.8777),
        }
        closest_state = ""
        min_dist = 200.0
        for state, coords in state_presets.items():
            dist = calculate_haversine_distance(lat, lon, coords[0], coords[1])
            if dist < min_dist:
                min_dist = dist
                closest_state = state
        if closest_state:
            return "", closest_state

    cache_key = (round(lat, 3), round(lon, 3))
    if cache_key in PARENT_LOCATION_CACHE:
        return PARENT_LOCATION_CACHE[cache_key]
        
    global NOMINATIM_BLOCKED
    if NOMINATIM_BLOCKED:
        return "", ""
        
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&accept-language=en"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "AntigravityTravelPlanner/1.0 (contact: support@antigravity.travel)"}
        )
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        def run_sync():
            with urllib.request.urlopen(req, context=ctx, timeout=3) as response:
                return json.loads(response.read().decode())
                
        data = await asyncio.get_event_loop().run_in_executor(None, run_sync)
        if data and "address" in data:
            addr = data["address"]
            state = addr.get("state") or addr.get("state_district") or ""
            district = addr.get("county") or addr.get("district") or addr.get("city") or addr.get("state_district") or ""
            res = (district, state)
            PARENT_LOCATION_CACHE[cache_key] = res
            return res
    except Exception as e:
        logger.error(f"Failed to reverse-geocode parent details for ({lat}, {lon}): {e}")
        status_code = getattr(e, "code", None)
        if status_code in (401, 403, 429):
            NOMINATIM_BLOCKED = True
        PARENT_LOCATION_CACHE[cache_key] = ("", "")
    return "", ""

async def discover_nearby_attractions(dest: str, lat: float = None, lon: float = None, place_types: list[str] = None) -> list[dict]:
    """
    Level 3 Attraction Discovery: Discovers real-world attractions strictly inside the selected destination boundary.
    Enforces geographic scoping so that places from outside the selected destination boundary are never returned.
    """
    logger.info(f"Discovering attractions strictly for destination '{dest}' (lat={lat}, lon={lon}, place_types={place_types})")

    if not dest or not dest.strip():
        return []

    dest = dest.strip()

    # If coordinates are missing, geocode destination center
    if lat is None or lon is None:
        from app.services.geocoding_service import geocode_location
        coords_res = geocode_location(dest)
        if not coords_res:
            logger.warning(f"Geocoding failed for destination '{dest}' during discovery.")
            curated = _get_curated_destination_fallback(dest)
            if curated:
                lat = curated[0]["lat"]
                lon = curated[0]["lon"]
            else:
                return []
        else:
            lat, lon = coords_res

    # Maximum geographic boundary radius (km) from destination center
    dest_lower = dest.lower()
    is_sprawling_region = any(k in dest_lower for k in ["sundarban", "dooars", "kaziranga", "corbett", "purulia", "wayanad", "coorg"])
    MAX_ALLOWED_RADIUS_KM = 60.0 if is_sprawling_region else 45.0

    try:
        district_dest, state_dest = await get_parent_location_details(lat, lon)
    except Exception:
        district_dest, state_dest = "", ""

    raw_places = []

    # 1. Seed authoritative destination-specific attractions from database
    curated_seeds = _get_curated_destination_fallback(dest)
    if curated_seeds:
        for p in curated_seeds:
            raw_places.append({
                "name": p["name"],
                "lat": p["lat"],
                "lon": p["lon"],
                "type": p["type"],
                "rating": 4.8,
                "image_url": None,
                "formatted_address": f"{p['name']}, {dest}, India"
            })

    google_key = os.getenv("GOOGLE_MAPS_API_KEY")

    vibe_queries = {
        "mountains": ["viewpoint", "mountain", "valley", "trekking", "hill station"],
        "beaches": ["beach", "seafront", "coast", "water sports", "sand"],
        "forests": ["forest", "waterfall", "nature reserve", "national park", "wildlife sanctuary"],
        "shopping": ["market", "bazaar", "shopping street", "mall"],
        "nightlife": ["pub", "bar", "night club", "cafe", "lounge"],
        "adventure": ["adventure camp", "trekking point", "hiking trail", "rafting", "climbing"],
        "spiritual": ["temple", "shrine", "monastery", "church", "cathedral", "mosque"]
    }

    if google_key:
        try:
            logger.info(f"Using Google Places API for attraction discovery in '{dest}'")
            search_queries = []
            if place_types:
                for pt in place_types:
                    pt_clean = pt.lower().strip()
                    if pt_clean in vibe_queries:
                        search_queries.extend([f"{q} in {dest}" for q in vibe_queries[pt_clean][:2]])
            if not search_queries:
                search_queries = [f"top attractions in {dest}", f"places to visit in {dest}"]
            
            search_queries = list(dict.fromkeys(search_queries))[:3]
            
            for query in search_queries:
                url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={urllib.parse.quote(query)}&location={lat},{lon}&radius=30000&key={google_key}"
                req = urllib.request.Request(url)
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                with urllib.request.urlopen(req, context=ctx, timeout=4) as response:
                    data = json.loads(response.read().decode())
                    if data and data.get("results"):
                        for item in data["results"][:6]:
                            name = item.get("name")
                            formatted_address = item.get("formatted_address", "")
                            geom = item.get("geometry", {}).get("location", {})
                            p_lat = float(geom.get("lat", lat))
                            p_lon = float(geom.get("lng", lon))

                            # Geographic boundary check
                            if calculate_haversine_distance(lat, lon, p_lat, p_lon) > MAX_ALLOWED_RADIUS_KM:
                                continue

                            photo_ref = None
                            if item.get("photos"):
                                photo_ref = item["photos"][0].get("photo_reference")
                            
                            img_url = None
                            if photo_ref:
                                img_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference={photo_ref}&key={google_key}"
                            
                            types = item.get("types", ["attraction"])
                            GOOD_TYPES = {
                                "tourist_attraction", "museum", "art_gallery", "park", "zoo",
                                "campground", "hindu_temple", "mosque", "church", "synagogue",
                                "place_of_worship", "natural_feature", "amusement_park"
                            }
                            if not any(t in GOOD_TYPES for t in types):
                                continue

                            att_type = types[0].replace("_", " ").title() if types else "Attraction"
                            raw_places.append({
                                "name": name,
                                "lat": p_lat,
                                "lon": p_lon,
                                "type": att_type,
                                "rating": item.get("rating", 4.5),
                                "image_url": img_url,
                                "formatted_address": formatted_address
                            })
        except Exception as e:
            logger.error(f"Google Places API fetch failed: {e}")

    # Query OSM Nominatim (strictly scoped to the destination)
    if not raw_places and not NOMINATIM_BLOCKED:
        logger.info(f"Using OSM Nominatim API for destination-scoped discovery in '{dest}'")
        search_queries = []
        if place_types:
            for pt in place_types:
                pt_clean = pt.lower().strip()
                if pt_clean in vibe_queries:
                    search_queries.extend([f"{q} in {dest}" for q in vibe_queries[pt_clean][:2]])
        
        if not search_queries:
            search_queries = [
                f"attractions in {dest}",
                f"places to visit in {dest}",
                f"tourism in {dest}",
                f"sights in {dest}"
            ]
        
        search_queries = list(dict.fromkeys(search_queries))[:4]
        
        async def fetch_nominatim_query(q_str: str) -> list:
            try:
                url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(q_str)}&format=json&limit=8&addressdetails=1"
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                )
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                def run_sync():
                    with urllib.request.urlopen(req, context=ctx, timeout=4) as response:
                        return json.loads(response.read().decode())
                
                data = await asyncio.get_event_loop().run_in_executor(None, run_sync)
                results = []
                if data:
                    for item in data:
                        name = item["display_name"].split(',')[0].strip()
                        if len(name) > 40 or not name:
                            continue
                        
                        p_lat = float(item["lat"])
                        p_lon = float(item["lon"])

                        # Strict Geographic Boundary Check
                        p_dist = calculate_haversine_distance(lat, lon, p_lat, p_lon)
                        if p_dist > MAX_ALLOWED_RADIUS_KM:
                            logger.info(f"Discarding Nominatim place '{name}' outside {MAX_ALLOWED_RADIUS_KM}km boundary of '{dest}' (dist={p_dist:.1f}km)")
                            continue

                        addr = item.get("address", {})
                        raw_type = item.get("type", "attraction").replace("_", " ").title()
                        sub_region = addr.get("suburb") or addr.get("town") or addr.get("village") or addr.get("city_district") or addr.get("neighbourhood") or addr.get("hamlet")
                        
                        results.append({
                            "name": name,
                            "lat": p_lat,
                            "lon": p_lon,
                            "type": raw_type,
                            "rating": 4.5,
                            "image_url": None,
                            "formatted_address": item["display_name"],
                            "sub_region": sub_region
                        })
                return results
            except Exception as e:
                logger.error(f"OSM Nominatim query '{q_str}' failed: {e}")
                return []

        tasks = [fetch_nominatim_query(q) for q in search_queries]
        results_lists = await asyncio.gather(*tasks)
        for res_list in results_lists:
            raw_places.extend(res_list)

    # Deduplicate candidate places by name
    seen = set()
    deduped = []
    for p in raw_places:
        n_clean = p["name"].lower().strip()
        if n_clean not in seen:
            seen.add(n_clean)
            deduped.append(p)

    # If online queries returned fewer than 6 spots, consult destination-specific curated database
    if len(deduped) < 6:
        logger.info(f"Fewer than 6 live spots discovered ({len(deduped)}). Checking curated knowledge base for '{dest}'.")
        matched_fallback = _get_curated_destination_fallback(dest)
        
        if matched_fallback:
            for p in matched_fallback:
                n_clean = p["name"].lower().strip()
                if n_clean not in seen:
                    # Enforce boundary check on fallback as well
                    p_dist = calculate_haversine_distance(lat, lon, p["lat"], p["lon"])
                    if p_dist <= MAX_ALLOWED_RADIUS_KM:
                        seen.add(n_clean)
                        deduped.append({
                            "name": p["name"],
                            "lat": p["lat"],
                            "lon": p["lon"],
                            "type": p["type"],
                            "rating": 4.7,
                            "image_url": None,
                            "formatted_address": f"{p['name']}, {dest}, India"
                        })

    if not deduped:
        logger.warning(f"No attractions found inside destination boundary for '{dest}'. Returning empty result set.")
        return []

    # Priority scoring and sorting
    def get_priority_score(place):
        name = place.get("name", "").lower()
        ptype = place.get("type", "").lower()
        
        blacklist_keywords = [
            "office", "police", "hospital", "clinic", "post office", "bank", "atm",
            "school", "college", "university", "road", "street", "highway", "lane",
            "station", "bus stop", "bus stand", "taxi stand", "shop", "store", "mart",
            "supermarket", "pharmacy", "repair", "garage", "apartment", "residency",
            "petrol pump", "fuel", "hotel", "hostel", "lodge", "parking", "restaurant",
            "cafe", "bar", "pub", "food court"
        ]

        if any(k in name for k in blacklist_keywords):
            return 99

        # Natural sights & UNESCO/monuments rank highest
        high_priority = [
            "viewpoint", "waterfall", "lake", "fort", "palace", "monastery", "temple",
            "sanctuary", "national park", "valley", "tea estate", "heritage", "museum", "caves"
        ]
        for idx, hp in enumerate(high_priority):
            if hp in name or hp in ptype:
                return idx

        return 20

    deduped.sort(key=get_priority_score)

    # Filter out blacklisted items
    final_candidates = [p for p in deduped if get_priority_score(p) < 90]
    if not final_candidates:
        final_candidates = deduped

    # Fetch images asynchronously
    async def fetch_image_async(name, p_type):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, fetch_travel_image, name, state_dest, p_type)

    image_tasks = []
    for p in final_candidates[:16]:
        img_url = p.get("image_url")
        if img_url:
            fut = asyncio.Future()
            fut.set_result(img_url)
            image_tasks.append(fut)
        else:
            image_tasks.append(fetch_image_async(p["name"], p["type"]))

    resolved_images = await asyncio.gather(*image_tasks)

    attractions = []
    for idx, p in enumerate(final_candidates[:16]):
        img_url = resolved_images[idx]
        dist = calculate_haversine_distance(lat, lon, p["lat"], p["lon"])

        # Final sanity distance check
        if dist > MAX_ALLOWED_RADIUS_KM:
            logger.warning(f"Excluding '{p['name']}' from final attractions for '{dest}' (distance={dist:.1f}km > {MAX_ALLOWED_RADIUS_KM}km)")
            continue

        drive_time_mins = round(dist * 2.2)
        if drive_time_mins < 10:
            drive_time_str = "5–10 mins drive"
        elif drive_time_mins < 60:
            drive_time_str = f"{drive_time_mins} mins drive"
        else:
            h_part = drive_time_mins // 60
            m_part = drive_time_mins % 60
            if m_part == 0:
                drive_time_str = f"{h_part} hr drive"
            else:
                drive_time_str = f"{h_part} hr {m_part} mins drive"

        p_type_lower = p["type"].lower()
        duration_str = "2 Hours"
        local_cost = 0.0

        if "museum" in p_type_lower or "gallery" in p_type_lower:
            duration_str = "2.5 Hours"
            local_cost = 50.0
        elif "fort" in p_type_lower or "palace" in p_type_lower:
            duration_str = "3 Hours"
            local_cost = 100.0
        elif "trek" in p_type_lower or "peak" in p_type_lower:
            duration_str = "4 Hours"
            local_cost = 0.0
        elif "lake" in p_type_lower or "boat" in p_type_lower:
            duration_str = "2 Hours"
            local_cost = 150.0

        attractions.append({
            "id": p["name"].lower().replace(" ", "-").replace("'", ""),
            "name": p["name"],
            "lat": p["lat"],
            "lon": p["lon"],
            "coords": [p["lat"], p["lon"]],
            "image_url": img_url,
            "type": p["type"],
            "summary": f"Scenic spot in {dest}. A popular attraction categorized as {p['type']}.",
            "visit_duration": duration_str,
            "local_cost": local_cost,
            "description": f"Enjoy exploring {p['name']}, a signature highlight located in {dest}.",
            "best_time": "October to May",
            "tips": "Visit during morning or late afternoon for the best experience and photography.",
            "distance": f"{round(dist, 1)} km from center",
            "drive_time": drive_time_str,
            "local_transport": "Auto rickshaw, taxi or rental",
            "highlights": [p["type"], "Sightseeing", "Photography"],
            "quick_facts": {"Type": p["type"], "Rating": f"{p['rating']} / 5.0"},
            "nearby_activities": ["Scenic Walks", "Photography", "Local Culture"],
            "sub_region": p.get("sub_region")
        })

    logger.info(f"Returning {len(attractions)} strictly destination-scoped attractions for '{dest}'")
    return attractions
