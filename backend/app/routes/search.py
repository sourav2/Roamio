import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.gemini_service import GeminiService
from app.services.destination_hub_service import discover_destination_hubs
from app.services.attraction_service import discover_nearby_attractions, calculate_haversine_distance
from app.services.geocoding_service import geocode_location
from app.utils.logger import get_logger

logger = get_logger("app.routes.search")
router = APIRouter()

class SearchPreferencesRequest(BaseModel):
    query: str = Field(..., description="Natural-language travel search query")

class SearchRecommendationsRequest(BaseModel):
    location: Optional[str] = None
    destination: Optional[str] = None
    region: Optional[str] = None
    duration: Optional[int] = None
    travellers: Optional[int] = None
    budget: Optional[float] = None
    trip_types: Optional[List[str]] = Field(default_factory=list)
    preferences: Optional[List[str]] = Field(default_factory=list)

def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[-\s]+', '-', text)

def get_gemini_service():
    return GeminiService()

@router.post("/search/extract-preferences")
async def extract_preferences_endpoint(
    request: SearchPreferencesRequest,
    service: GeminiService = Depends(get_gemini_service)
):
    logger.info(f"POST /api/search/extract-preferences endpoint called with query: '{request.query}'")
    try:
        if not request.query or not request.query.strip():
            return {
                "intent": "general_search",
                "destination": None,
                "region": None,
                "location": None,
                "duration": None,
                "travellers": None,
                "budget": None,
                "travel_mode": None,
                "preferences": []
            }
        
        extracted = await service.extract_search_preferences(request.query)
        return extracted
    except Exception as e:
        logger.error(f"Failed to extract preferences for query '{request.query}': {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to extract travel preferences: {str(e)}")

@router.post("/search/recommendations")
async def search_recommendations_endpoint(request: SearchRecommendationsRequest):
    """
    Level 1 Discovery Recommendation Endpoint ("WHERE SHOULD I GO?").
    Discovers and recommends Destination Hubs / Regions / Cities rather than individual local attractions.
    When a location is provided (e.g. Kolkata, Jaipur, Bangalore, Delhi), returns surrounding destination hubs
    ranked by proximity, trip duration, budget, and trip type preferences.
    """
    logger.info(
        f"POST /api/search/recommendations called: location='{request.location}', "
        f"destination='{request.destination}', region='{request.region}', "
        f"duration={request.duration}, budget={request.budget}"
    )

    # 1. Resolve Origin and Target Destination
    origin_name = request.location.strip() if request.location and request.location.strip() else None
    dest_name = request.destination.strip() if request.destination and request.destination.strip() else None
    region_name = request.region.strip() if request.region and request.region.strip() else None

    # Filter out placeholder strings
    if dest_name and dest_name.lower() in ("any", "any destination", "none", "null"):
        dest_name = None
    if origin_name and origin_name.lower() in ("any", "any location", "none", "null"):
        origin_name = None

    if not origin_name and not dest_name and not region_name:
        logger.warning("Neither location, destination, nor region was provided. Returning empty recommendations.")
        return []

    # 2. Geocode Origin if provided
    origin_coords = None
    if origin_name:
        origin_coords = geocode_location(origin_name)
        if origin_coords:
            logger.info(f"Resolved origin '{origin_name}' coordinates: {origin_coords}")
        else:
            logger.warning(f"Could not resolve coordinates for origin '{origin_name}'")

    # 3. Discover Destination Hubs (Level 1 hierarchy)
    hubs = discover_destination_hubs(
        origin_coords=origin_coords,
        origin_name=origin_name,
        target_destination=dest_name,
        target_region=region_name,
        duration=request.duration,
        budget=request.budget,
        trip_types=request.trip_types,
        preferences=request.preferences,
        limit=12
    )

    if hubs:
        logger.info(f"Returning {len(hubs)} destination hubs for query (origin='{origin_name}', dest='{dest_name}')")
        return hubs

    # 4. Fallback for custom or international targets: Use geocoding and attraction discovery
    target_query = dest_name or region_name or origin_name
    target_coords = geocode_location(target_query) if target_query else None
    lat_for_search = target_coords[0] if target_coords else None
    lon_for_search = target_coords[1] if target_coords else None

    place_types = list(set([t.lower() for t in (request.trip_types or []) + (request.preferences or []) if t]))

    try:
        raw_places = await discover_nearby_attractions(
            dest=target_query,
            lat=lat_for_search,
            lon=lon_for_search,
            place_types=place_types
        )
    except Exception as e:
        logger.error(f"Error calling discover_nearby_attractions for '{target_query}': {e}", exc_info=True)
        raw_places = []

    if not raw_places:
        return []

    results = []
    seen_ids = set()
    est_duration = request.duration if request.duration else 2
    base_budget = request.budget if request.budget and request.budget > 0 else 5000.0
    item_budget = int(min(base_budget, 8000.0))

    for p in raw_places[:12]:
        name = p.get("name", "").strip()
        if not name:
            continue
        dest_id = _slugify(name)
        if dest_id in seen_ids:
            continue
        seen_ids.add(dest_id)

        p_lat = p.get("lat")
        p_lon = p.get("lon")
        dist_from_origin = None
        if origin_coords and p_lat is not None and p_lon is not None:
            dist_from_origin = calculate_haversine_distance(
                origin_coords[0], origin_coords[1], float(p_lat), float(p_lon)
            )

        results.append({
            "id": dest_id,
            "name": name,
            "description": p.get("summary") or p.get("description") or f"Destination in {target_query}.",
            "image": p.get("image_url") or "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
            "location": origin_name or target_query,
            "region": p.get("sub_region") or target_query,
            "coords": [float(p_lat), float(p_lon)] if p_lat and p_lon else [0.0, 0.0],
            "category": p.get("type") or "Destination Hub",
            "rating": round(float(p.get("rating", 4.5)), 1),
            "duration": est_duration,
            "budget": item_budget,
            "distance_km": round(dist_from_origin, 1) if dist_from_origin is not None else None,
            "weather": "Pleasant"
        })

    logger.info(f"Returning {len(results)} fallback recommendations for '{target_query}'")
    return results


