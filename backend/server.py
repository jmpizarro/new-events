from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pymongo import MongoClient
import uuid
import os
import json
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client['valencia_events']
events_collection = db['events']
summaries_collection = db['summaries']
admin_collection = db['admin']

# FastAPI app setup
app = FastAPI(title="Valencia Events API", version="1.0.0")
security = HTTPBearer()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Location(BaseModel):
    name: str
    address: str
    district: str

class Source(BaseModel):
    url: str
    mainUrl: str
    provider: str

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    date: str
    location: Location
    description: str
    imageUrl: str
    source: Source
    created_at: datetime = Field(default_factory=datetime.now)

class EventSummary(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    summary: str
    start_date: str
    end_date: str
    event_types: List[str]
    created_at: datetime = Field(default_factory=datetime.now)

class AdminConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    city: str = "Valencia"
    categories: List[str] = ["music", "literature", "food", "culture", "festivals"]
    openai_api_key: str = ""
    valencia_events_prompt: str = ""
    valencia_summary_prompt: str = ""
    updated_at: datetime = Field(default_factory=datetime.now)

class AdminLogin(BaseModel):
    username: str
    password: str

class GenerateEventsRequest(BaseModel):
    start_date: str
    end_date: str

# Mock data for initial setup
MOCK_EVENTS = [
    {
        "id": str(uuid.uuid4()),
        "title": "Valencia Jazz Festival",
        "date": "2025-07-15",
        "location": {
            "name": "Palau de la Música",
            "address": "Carrer de la Música, 5, 46008 Valencia",
            "district": "Ciutat Vella"
        },
        "description": "Experience the finest jazz performances from local and international artists. This festival blends traditional and contemporary jazz styles. Perfect for music lovers seeking cultural enrichment.",
        "imageUrl": "https://images.unsplash.com/photo-1658329717628-4c051a4c6820?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxWYWxlbmNpYSUyMGNpdHlzY2FwZXxlbnwwfHx8Ymx1ZXwxNzUyNDMwMDU0fDA&ixlib=rb-4.1.0&q=85",
        "source": {
            "url": "https://visitvalencia.com/events/valencia-jazz-festival",
            "mainUrl": "https://visitvalencia.com",
            "provider": "Visit Valencia"
        },
        "created_at": datetime.now()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Fira del Llibre Ruzafa",
        "date": "2025-07-18",
        "location": {
            "name": "Ruzafa Market",
            "address": "Carrer de Ruzafa, 46006 Valencia",
            "district": "Ruzafa"
        },
        "description": "Discover the rich literary traditions of Valencia at this vibrant book fair. Meet local authors and explore Valencian literature. Perfect for book lovers and cultural enthusiasts.",
        "imageUrl": "https://images.unsplash.com/photo-1704468251489-f9dd54f7c85d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxWYWxlbmNpYSUyMGNpdHlzY2FwZXxlbnwwfHx8Ymx1ZXwxNzUyNDMwMDU0fDA&ixlib=rb-4.1.0&q=85",
        "source": {
            "url": "https://visitvalencia.com/events/fira-del-llibre-ruzafa",
            "mainUrl": "https://visitvalencia.com",
            "provider": "Visit Valencia"
        },
        "created_at": datetime.now()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Valencia Beer Festival",
        "date": "2025-07-21",
        "location": {
            "name": "Carrer de la Ribera",
            "address": "Carrer de la Ribera, 46001 Valencia",
            "district": "Ciutat Vella"
        },
        "description": "Experience the best of local and international brews at the Valencia Beer Festival. This event features tastings, food pairings, and live music. Perfect for beer lovers and socializing.",
        "imageUrl": "https://images.unsplash.com/photo-1661030190165-5359ce7080bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxWYWxlbmNpYSUyMGNpdHlzY2FwZXxlbnwwfHx8Ymx1ZXwxNzUyNDMwMDU0fDA&ixlib=rb-4.1.0&q=85",
        "source": {
            "url": "https://visitvalencia.com/events/valencia-beer-festival",
            "mainUrl": "https://visitvalencia.com",
            "provider": "Visit Valencia"
        },
        "created_at": datetime.now()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Gastronomy Festival",
        "date": "2025-07-25",
        "location": {
            "name": "Mercado Central",
            "address": "Plaça del Mercat, 46001 Valencia",
            "district": "Ciutat Vella"
        },
        "description": "Savor the authentic flavors of Valencia at this culinary celebration. Experience traditional dishes prepared by renowned local chefs. Perfect for food enthusiasts and cultural discovery.",
        "imageUrl": "https://images.unsplash.com/photo-1654079829969-eab18faf843d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxjdWx0dXJhbCUyMGZlc3RpdmFsfGVufDB8fHxibHVlfDE3NTI0MzAwNjF8MA&ixlib=rb-4.1.0&q=85",
        "source": {
            "url": "https://visitvalencia.com/events/gastronomy-festival",
            "mainUrl": "https://visitvalencia.com",
            "provider": "Visit Valencia"
        },
        "created_at": datetime.now()
    }
]

MOCK_SUMMARY = {
    "id": str(uuid.uuid4()),
    "summary": "Valencia comes alive this week with vibrant cultural celebrations. The Valencia Jazz Festival at the Palau de la Música offers a stellar lineup of local and international artists, blending rhythms and styles that resonate with the city's musical heritage. Meanwhile, the Fira del Llibre in Ruzafa showcases the rich literary traditions of Valencian authors, inviting book lovers to engage with local literature. Don't miss the Gastronomy Festival at the Mercado Central, where foodies can savor dishes that are 'més dolç que la sucar' and celebrate the region's culinary prowess. This week, immerse yourself in the soul of Valencia, where every event embodies the city's spirit and identity.",
    "start_date": "2025-07-15",
    "end_date": "2025-07-25",
    "event_types": ["music", "literature", "food", "culture"],
    "created_at": datetime.now()
}

# Initialize mock data
def initialize_mock_data():
    try:
        # Clear existing data
        events_collection.delete_many({})
        summaries_collection.delete_many({})
        
        # Insert mock events
        for event in MOCK_EVENTS:
            events_collection.insert_one(event)
        
        # Insert mock summary
        summaries_collection.insert_one(MOCK_SUMMARY)
        
        # Initialize admin config if not exists
        if not admin_collection.find_one():
            admin_config = {
                "id": str(uuid.uuid4()),
                "city": "Valencia",
                "categories": ["music", "literature", "food", "culture", "festivals"],
                "openai_api_key": "",
                "valencia_events_prompt": """You are an expert Valencia event researcher with API access to official tourism sources, municipal calendars, and verified event platforms. Your specialty is identifying authentic local experiences while filtering out tourist traps.

Compile a comprehensive list of genuine local events, minimum 2 events or more per day (if there are) in Valencia between {{start_date}} and {{end_date}} inclusive. Your response must be a perfect JSON array where each event contains:

- title: Official event name (exact match to source)
- date: YYYY-MM-DD (must match source)
- location: {
  "name": "Venue name",
  "address": "Full address",
  "district": "Neighborhood/zone"
}
- description: 2-3 sentence engaging summary in this structure:
  "Experience [core activity]. [Unique detail]. Perfect for [audience]."
- imageUrl: source link to the original article main image
- source: {
  "url": "source link to the original article.", 
  "mainUrl": "Main url webpage of the source", 
  "provider": "Organization name"
}

Verification protocol:
1. Cross-check with at least 2 official sources
2. Prioritize in this order:
   a) valencia.es/agenda
   b) visitvalencia.com/events
   c) eventbrite.com (Valencia-filtered)
3. Reject any event without:
   - Exact address
   - Official organizer contact
   - Clear date/time

Formatting rules:
- All dates in ISO format
- No null fields - omit if unavailable
- Escape special JSON characters
- Indent with 2 spaces""",
                "valencia_summary_prompt": """You are Valencia's official cultural concierge, crafting concise weekly previews for discerning locals.

Create ONE compelling 80-100 word paragraph summarizing the most noteworthy events in Valencia between {{start_date}} and {{end_date}}. Focus on:

- Must-attend events (limit 3-4 highlights)
- Cultural significance
- Local flavor

**Structure:**
"Valencia comes alive this week with [theme]. [Specific event 1] at [venue] offers [unique detail], while [event 2] brings [cultural aspect] to [neighborhood]. Don't miss [event 3] for [audience appeal]. [Closing thought connecting to Valencian identity]."

**JSON Response Format:**
{
  "summary": "[Your crafted paragraph]",
  "start_date": "{{start_date}}",
  "end_date": "{{end_date}}",
  "event_types": "[an array of primary event types]"
}

**Rules:**
- Only use verified events from official sources
- Include 1 local idiom (e.g., 'més dolç que la sucar')
- Mention at least 1 neighborhood
- No bullet points or section breaks""",
                "updated_at": datetime.now()
            }
            admin_collection.insert_one(admin_config)
        
        print("Mock data initialized successfully")
    except Exception as e:
        print(f"Error initializing mock data: {e}")

# Initialize on startup
initialize_mock_data()

# Simple admin authentication (for demo purposes)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "valencia2025"

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != "admin_token_valencia":
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return credentials.credentials

# API Routes
@app.get("/api/events")
async def get_events():
    """Get all events"""
    try:
        events = list(events_collection.find({}, {"_id": 0}))
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@app.get("/api/events/{event_id}")
async def get_event(event_id: str):
    """Get a specific event"""
    try:
        event = events_collection.find_one({"id": event_id}, {"_id": 0})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching event: {str(e)}")

@app.get("/api/events/date/{date}")
async def get_events_by_date(date: str):
    """Get events for a specific date"""
    try:
        events = list(events_collection.find({"date": date}, {"_id": 0}))
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events by date: {str(e)}")

@app.get("/api/summaries")
async def get_summaries():
    """Get all event summaries"""
    try:
        summaries = list(summaries_collection.find({}, {"_id": 0}))
        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summaries: {str(e)}")

@app.get("/api/summaries/latest")
async def get_latest_summary():
    """Get the latest event summary"""
    try:
        summary = summaries_collection.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
        if not summary:
            raise HTTPException(status_code=404, detail="No summary found")
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching latest summary: {str(e)}")

@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin):
    """Admin login"""
    if login_data.username == ADMIN_USERNAME and login_data.password == ADMIN_PASSWORD:
        return {"token": "admin_token_valencia", "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/admin/config")
async def get_admin_config(token: str = Depends(verify_admin_token)):
    """Get admin configuration"""
    try:
        config = admin_collection.find_one({}, {"_id": 0})
        if not config:
            raise HTTPException(status_code=404, detail="Admin config not found")
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admin config: {str(e)}")

@app.put("/api/admin/config")
async def update_admin_config(config: AdminConfig, token: str = Depends(verify_admin_token)):
    """Update admin configuration"""
    try:
        config.updated_at = datetime.now()
        config_dict = config.dict()
        admin_collection.update_one({}, {"$set": config_dict}, upsert=True)
        return {"message": "Admin config updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating admin config: {str(e)}")

@app.post("/api/admin/generate-events")
async def generate_events(request: GenerateEventsRequest, token: str = Depends(verify_admin_token)):
    """Generate events using OpenAI"""
    try:
        # Get admin config
        config = admin_collection.find_one({}, {"_id": 0})
        if not config or not config.get("openai_api_key"):
            raise HTTPException(status_code=400, detail="OpenAI API key not configured")
        
        # Create OpenAI chat instance
        chat = LlmChat(
            api_key=config["openai_api_key"],
            session_id=f"valencia-events-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            system_message="You are an expert Valencia event researcher."
        ).with_model("openai", "gpt-4o")
        
        # Prepare the prompt
        prompt = config["valencia_events_prompt"].replace("{{start_date}}", request.start_date).replace("{{end_date}}", request.end_date)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the response as JSON
        try:
            events_data = json.loads(response)
            
            # Store events in database
            for event_data in events_data:
                event_data["id"] = str(uuid.uuid4())
                event_data["created_at"] = datetime.now()
                events_collection.insert_one(event_data)
            
            return {"message": f"Generated {len(events_data)} events successfully", "events": events_data}
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON response from OpenAI")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating events: {str(e)}")

@app.post("/api/admin/generate-summary")
async def generate_summary(request: GenerateEventsRequest, token: str = Depends(verify_admin_token)):
    """Generate event summary using OpenAI"""
    try:
        # Get admin config
        config = admin_collection.find_one({}, {"_id": 0})
        if not config or not config.get("openai_api_key"):
            raise HTTPException(status_code=400, detail="OpenAI API key not configured")
        
        # Create OpenAI chat instance
        chat = LlmChat(
            api_key=config["openai_api_key"],
            session_id=f"valencia-summary-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            system_message="You are Valencia's official cultural concierge."
        ).with_model("openai", "gpt-4o")
        
        # Prepare the prompt
        prompt = config["valencia_summary_prompt"].replace("{{start_date}}", request.start_date).replace("{{end_date}}", request.end_date)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the response as JSON
        try:
            summary_data = json.loads(response)
            summary_data["id"] = str(uuid.uuid4())
            summary_data["created_at"] = datetime.now()
            
            # Store summary in database
            summaries_collection.insert_one(summary_data)
            
            return {"message": "Generated summary successfully", "summary": summary_data}
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON response from OpenAI")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)