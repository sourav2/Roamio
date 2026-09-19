import os
import json
import ssl
import urllib.request
import urllib.parse
import re
from app.prompts.travel_prompts import SYSTEM_PROMPT_ITINERARY, SYSTEM_PROMPT_SEARCH_EXTRACTION
from app.utils.logger import get_logger

logger = get_logger("app.services.gemini_service")

def _clean_geographic_entity(val: str | None) -> str | None:
    if not val or not isinstance(val, str):
        return None
    cleaned = val.strip()
    prefix_pattern = r'^(?:destinations?\s+(?:in|near|around|to|close\s+to)|places?\s+(?:in|near|around|to|close\s+to)|trip\s+(?:in|near|around|to)|nearby|near|around|close\s+to|in|to|visit)\s+'
    prev = ''
    while cleaned != prev:
        prev = cleaned
        cleaned = re.sub(prefix_pattern, '', cleaned, flags=re.I).strip()

    cleaned = re.sub(r'\s+(?:places?|destinations?|spots?)$', '', cleaned, flags=re.I).strip()
    if re.match(r'^(?:nearby|near|around|close\s+to|places?|destinations?)$', cleaned, re.I):
        return None
    return cleaned.title() if cleaned else None

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            # Try VITE_GEMINI_API_KEY as fallback
            self.api_key = os.getenv("VITE_GEMINI_API_KEY")
        
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
    async def generate_itinerary(
        self, 
        dest: str, 
        days: int, 
        budget: float, 
        comfort: str, 
        transport: str, 
        place_types: list,
        real_places: list = None
    ) -> dict | None:
        """
        Generates structured JSON itinerary based on user preferences using Gemini 1.5 Flash.
        """
        if not self.api_key:
            logger.warning("Gemini Service initialized without an API key. Skipping Gemini generation.")
            return None

        logger.info(f"Gemini Service: Generating itinerary for destination: '{dest}'")
        
        places_context = ""
        if real_places:
            places_context = "\n".join([f"- Name: {p['name']}. Summary: {p['summary']}" for p in real_places[:6]])
        else:
            places_context = "No nearby places context available."

        user_content = f"""
        Generate a {days}-day itinerary for {dest}.
        Number of travelers: 2
        Total Budget: {budget}
        Comfort Level: {comfort}
        Transport Preference: {transport}
        Interests: {", ".join(place_types)}
        
        Here are the REAL-WORLD attractions in/near {dest} that you MUST include and cluster:
        {places_context}
        
        Do not invent other cities or geographic locations outside {dest} and its surroundings.
        """

        # Construct payload for Gemini API
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": user_content
                        }
                    ]
                }
            ],
            "systemInstruction": {
                "parts": [
                    {
                        "text": SYSTEM_PROMPT_ITINERARY
                    }
                ]
            },
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.url,
                data=req_data,
                headers={
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            
            # Disable SSL verification for development environments (following local patterns)
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            logger.info("Sending request to Gemini API...")
            with urllib.request.urlopen(req, context=ctx, timeout=45) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                
                # Extract text from response
                candidates = resp_data.get("candidates", [])
                if not candidates:
                    logger.error(f"Gemini API returned no candidates: {resp_data}")
                    return None
                
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if not text_content:
                    logger.error(f"Gemini API returned empty text: {resp_data}")
                    return None
                
                # Clean potential markdown wrapping
                cleaned_text = text_content.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                cleaned_text = cleaned_text.strip()
                
                itinerary_data = json.loads(cleaned_text)
                logger.info("Successfully received and parsed Gemini API itinerary response.")
                return itinerary_data
                
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}", exc_info=True)
            return None

    async def extract_search_preferences(self, query: str) -> dict:
        """
        Extracts structured travel preferences from natural language query using Gemini 2.5 Flash.
        """
        if not self.api_key:
            logger.warning("Gemini Service initialized without an API key.")
            raise ValueError("GEMINI_API_KEY is not configured on the backend.")

        logger.info(f"Gemini Service: Extracting travel preferences for query: '{query}'")

        user_content = f'User Travel Query: "{query.strip()}"\nExtract structured preferences into JSON:'

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": user_content
                        }
                    ]
                }
            ],
            "systemInstruction": {
                "parts": [
                    {
                        "text": SYSTEM_PROMPT_SEARCH_EXTRACTION
                    }
                ]
            },
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.url,
                data=req_data,
                headers={
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            logger.info("Sending natural-language extraction request to Gemini API...")
            with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                
                candidates = resp_data.get("candidates", [])
                if not candidates:
                    logger.error(f"Gemini API returned no candidates: {resp_data}")
                    raise ValueError("No candidates returned from Gemini API")
                
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if not text_content:
                    logger.error(f"Gemini API returned empty text: {resp_data}")
                    raise ValueError("Empty text returned from Gemini API")
                
                cleaned_text = text_content.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                cleaned_text = cleaned_text.strip()
                
                extracted_data = json.loads(cleaned_text)
                if isinstance(extracted_data, dict):
                    if extracted_data.get("destination"):
                        extracted_data["destination"] = _clean_geographic_entity(extracted_data["destination"])
                    if extracted_data.get("region"):
                        extracted_data["region"] = _clean_geographic_entity(extracted_data["region"])
                    if extracted_data.get("location"):
                        extracted_data["location"] = _clean_geographic_entity(extracted_data["location"])
                logger.info(f"Successfully extracted search preferences from Gemini: {extracted_data}")
                return extracted_data
                
        except Exception as e:
            logger.error(f"Gemini search preference extraction failed: {e}", exc_info=True)
            logger.info(f"Falling back to resilient rule-based preference extraction for query: '{query}'")
            return self._fallback_extract_preferences(query)

    def _fallback_extract_preferences(self, query: str) -> dict:
        import re
        q = query.strip()
        lower = q.lower()

        word_to_num = {
            "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
            "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
        }

        known_regions = [
            "South India", "North India", "East India", "West India",
            "Northeast India", "Western Ghats", "Eastern Ghats", "Himalayas"
        ]

        destination = None
        region = None
        location = None

        # Check for destination patterns: "nearby X", "places near X", "close to X", "around X", "in X", "to X", "visit X", etc.
        dest_match = re.search(
            r'\b(?:destinations?\s+(?:in|to|at|near|around|close\s+to)|places?\s+(?:in|to|at|near|around|close\s+to)|trip\s+(?:in|to|around|near)|nearby|close\s+to|around|in|to|visit)\s+([a-zA-Z\s]+?)(?:\s+(?:for|from|with|and|\d|$)|$)',
            q,
            re.I
        )
        if dest_match:
            cand = dest_match.group(1).strip()
            cleaned_cand = _clean_geographic_entity(cand)
            if cleaned_cand:
                destination = cleaned_cand

        # Check for explicit origin patterns: "from X", "starting at X", "starting from X"
        loc_match = re.search(r'\b(?:from|starting\s+(?:at|from))\s+([a-zA-Z\s]+?)(?:\s+(?:for|in|to|with|and|\d|$)|$)', q, re.I)
        if loc_match:
            cand = loc_match.group(1).strip()
            cleaned_cand = _clean_geographic_entity(cand)
            if cleaned_cand:
                location = cleaned_cand

        # If neither pattern matched, clean up query and extract entity
        if not destination and not location:
            clean_q = re.sub(r'^(?:find|show|give|search|explore|good|best|some|top|places?|destinations?|a\s+place|\s)+', '', lower, flags=re.I).strip()
            cleaned_dest = _clean_geographic_entity(clean_q)
            if cleaned_dest:
                destination = cleaned_dest

        destination = _clean_geographic_entity(destination)
        location = _clean_geographic_entity(location)

        # Normalize region
        if destination:
            for kr in known_regions:
                if kr.lower() == destination.lower():
                    destination = kr
                    region = kr
                    break

        if location:
            for kr in known_regions:
                if kr.lower() == location.lower():
                    destination = kr
                    region = kr
                    location = None
                    break

        # Travellers
        travellers = None
        if re.search(r'\bsolo\b', lower):
            travellers = 1
        elif re.search(r'\bcouple\b', lower):
            travellers = 2
        else:
            t_match = re.search(r'(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:travellers?|travelers?|people|persons?|guests?|adults?)', lower)
            if t_match:
                val = t_match.group(1).lower()
                travellers = word_to_num.get(val, int(val) if val.isdigit() else 2)

        # Duration
        duration = None
        if re.search(r'\bweekend\b', lower):
            duration = 2
        else:
            d_match = re.search(r'(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:days?|nights?|d\b)', lower)
            if d_match:
                val = d_match.group(1).lower()
                duration = word_to_num.get(val, int(val) if val.isdigit() else 2)

        # Budget
        budget = None
        b_match = re.search(r'(?:under|below|within|budget\s+(?:of)?|₹|rs\.?|inr)\s*(\d+[\d,]*)(?:\s*(?:k|thousand))?', lower)
        if b_match:
            raw_b = b_match.group(1).replace(',', '')
            val = float(raw_b)
            if 'k' in b_match.group(0).lower() or 'thousand' in b_match.group(0).lower():
                val *= 1000
            budget = val

        # Preferences (strictly explicit)
        preferences = []
        if re.search(r'\badventure\b', lower):
            preferences.append("adventure")
        if re.search(r'\b(?:quiet|peaceful|secluded)\b', lower):
            preferences.append("quiet")
        if re.search(r'\b(?:relaxing|relaxation)\b', lower):
            preferences.append("relaxation")
        if re.search(r'\bnature\b', lower):
            preferences.append("nature")
        if re.search(r'\bspiritual\b', lower):
            preferences.append("spiritual")
        if re.search(r'\bromantic\b', lower):
            preferences.append("romantic")

        return {
            "intent": "discover_destinations",
            "destination": destination,
            "region": region,
            "location": location,
            "duration": duration,
            "travellers": travellers,
            "budget": budget,
            "travel_mode": None,
            "preferences": preferences
        }

