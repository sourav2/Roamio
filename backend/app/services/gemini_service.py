import os
import json
import ssl
import urllib.request
import urllib.parse
import re
from app.prompts.travel_prompts import SYSTEM_PROMPT_CHAT, SYSTEM_PROMPT_ITINERARY, SYSTEM_PROMPT_SEARCH_EXTRACTION
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
        self.api_key = (
            os.getenv("GEMINI_API_KEY") or 
            os.getenv("GOOGLE_API_KEY") or 
            os.getenv("VITE_GEMINI_API_KEY")
        )
        if self.api_key:
            logger.info("Gemini AI active (Gemini 2.5 Flash initialized with GEMINI_API_KEY).")
            self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        else:
            logger.warning("GEMINI_API_KEY is missing. Using fallback mock travel engine.")
            self.url = None

    async def get_chat_response(self, messages: list) -> str:
        """
        Sends the message history to Gemini 2.5 Flash, or returns a conversational mock reply if API key is missing/fails.
        """
        logger.info(f"Gemini Service: Received chat request with {len(messages)} messages.")
        if self.api_key and self.url:
            try:
                contents = []
                for msg in messages:
                    role = msg.get("role", "user")
                    gemini_role = "model" if role in ("assistant", "model") else "user"
                    contents.append({
                        "role": gemini_role,
                        "parts": [{"text": str(msg.get("content", ""))}]
                    })
                
                payload = {
                    "contents": contents,
                    "systemInstruction": {
                        "parts": [{"text": SYSTEM_PROMPT_CHAT}]
                    },
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1000
                    }
                }

                req_data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    self.url,
                    data=req_data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE

                with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
                    resp_data = json.loads(response.read().decode("utf-8"))
                    candidates = resp_data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text_content:
                            logger.info("Successfully received Gemini chat response.")
                            return text_content.strip()
            except Exception as e:
                logger.error(f"Gemini chat API call failed: {e}. Falling back to mock chat response.", exc_info=True)

        last_message = messages[-1]["content"] if messages else ""
        return self._generate_mock_chat_response(last_message, messages)

    def _generate_mock_chat_response(self, last_message: str, messages: list) -> str:
        q_lower = (last_message or "").lower()
        if "budget" in q_lower or "cost" in q_lower or "price" in q_lower:
            return "I can help customize your budget! Roamio allows you to set your budget per person and choose between Budget, Moderate, and Luxury tiers. Where would you like to travel?"
        elif "hotel" in q_lower or "stay" in q_lower:
            return "We recommend verified stays ranging from boutique homestays to premium luxury resorts tailored to your travel route. Which destination are you planning for?"
        elif "route" in q_lower or "distance" in q_lower or "how to reach" in q_lower:
            return "Roamio automatically computes the fastest road and scenic transit routes between your origin and destination stops. You can view the dynamic map on the Planner page!"
        elif "meghalaya" in q_lower or "shillong" in q_lower:
            return "Meghalaya is a stunning destination! Popular spots include Umiam Lake, Elephant Falls, Cherrapunji's living root bridges, and Dawki's crystal clear river. Would you like a 3-day or 5-day itinerary?"
        elif "himachal" in q_lower or "manali" in q_lower or "shimla" in q_lower:
            return "Himachal Pradesh offers incredible mountain landscapes! Manali and Shimla are top destination hubs with snow viewpoints, paragliding in Solang, and Mall Road heritage. How many days are you planning?"
        else:
            return "Hello! I am Roamio's AI travel consultant. Tell me where you'd like to go, your preferred travel duration, budget, or travel style, and I'll help plan your complete itinerary!"

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
        Generates structured JSON itinerary based on user preferences using Gemini 2.5 Flash.
        """
        if not self.api_key or not self.url:
            logger.warning("Gemini Service initialized without an API key. Skipping Gemini generation.")
            return None

        logger.info(f"Gemini Service: Generating itinerary for destination: '{dest}'")
        
        places_context = ""
        if real_places:
            places_context = "\n".join([f"- Name: {p.get('name')}. Summary: {p.get('summary', '')}" for p in real_places[:8]])
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
            
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            logger.info("Sending request to Gemini API...")
            with urllib.request.urlopen(req, context=ctx, timeout=45) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                
                candidates = resp_data.get("candidates", [])
                if not candidates:
                    logger.error(f"Gemini API returned no candidates: {resp_data}")
                    return None
                
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if not text_content:
                    logger.error(f"Gemini API returned empty text: {resp_data}")
                    return None
                
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
        if not self.api_key or not self.url:
            logger.info(f"GEMINI_API_KEY not set. Using resilient rule-based preference extraction for query: '{query}'")
            return self._fallback_extract_preferences(query)

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
                    return self._fallback_extract_preferences(query)
                
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if not text_content:
                    logger.error(f"Gemini API returned empty text: {resp_data}")
                    return self._fallback_extract_preferences(query)
                
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

        loc_match = re.search(r'\b(?:from|starting\s+(?:at|from))\s+([a-zA-Z\s]+?)(?:\s+(?:for|in|to|with|and|\d|$)|$)', q, re.I)
        if loc_match:
            cand = loc_match.group(1).strip()
            cleaned_cand = _clean_geographic_entity(cand)
            if cleaned_cand:
                location = cleaned_cand

        if not destination and not location:
            clean_q = re.sub(r'^(?:find|show|give|search|explore|good|best|some|top|places?|destinations?|a\s+place|\s)+', '', lower, flags=re.I).strip()
            cleaned_dest = _clean_geographic_entity(clean_q)
            if cleaned_dest:
                destination = cleaned_dest

        destination = _clean_geographic_entity(destination)
        location = _clean_geographic_entity(location)

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

        duration = None
        if re.search(r'\bweekend\b', lower):
            duration = 2
        else:
            d_match = re.search(r'(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:days?|nights?|d\b)', lower)
            if d_match:
                val = d_match.group(1).lower()
                duration = word_to_num.get(val, int(val) if val.isdigit() else 2)

        budget = None
        b_match = re.search(r'(?:under|below|within|budget\s+(?:of)?|₹|rs\.?|inr)\s*(\d+[\d,]*)(?:\s*(?:k|thousand))?', lower)
        if b_match:
            raw_b = b_match.group(1).replace(',', '')
            val = float(raw_b)
            if 'k' in b_match.group(0).lower() or 'thousand' in b_match.group(0).lower():
                val *= 1000
            budget = val

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
