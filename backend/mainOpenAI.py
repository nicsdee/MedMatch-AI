from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date, Float, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

# Load environment variables from .env file
load_dotenv()

# ============ DATABASE SETUP ============
DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============ OPENAI SETUP ============
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# ============ DATABASE MODELS ============

class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    skills = Column(ARRAY(String))
    license_number = Column(String(100))
    license_valid = Column(Boolean, default=True)
    available = Column(Boolean, default=True)
    experience_years = Column(Integer)
    email = Column(String(255), unique=True, nullable=False)

class Facility(Base):
    __tablename__ = "facilities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    email = Column(String(255), unique=True, nullable=False)

class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, nullable=False)
    role = Column(String(100), nullable=False)
    shift_date = Column(Date, nullable=False)
    required_skills = Column(ARRAY(String))
    urgency = Column(String(50), default="medium")
    description = Column(Text)
    status = Column(String(50), default="open")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, nullable=False)
    provider_id = Column(Integer, nullable=False)
    match_score = Column(Float)
    match_reason = Column(Text)
    status = Column(String(50), default="pending")

# ============ PYDANTIC SCHEMAS ============

class ShiftCreate(BaseModel):
    facility_id: int
    role: str
    shift_date: str
    required_skills: List[str]
    urgency: str = "medium"
    description: str = ""

# ============ DATABASE DEPENDENCY ============

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ FASTAPI APP ============

app = FastAPI(title="MedMatch AI", description="Healthcare Provider-Facility Matching for ShiftNex")

# ============ CORS MIDDLEWARE ============
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.137.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ ENDPOINTS ============

@app.get("/")
def root():
    return {
        "message": "MedMatch AI API is running",
        "what_it_does": "Matches healthcare providers with hospital shifts using AI-powered intelligent scoring",
        "status": "ready"
    }

@app.get("/providers")
def get_providers(db: Session = Depends(get_db)):
    """Get all healthcare providers"""
    providers = db.query(Provider).all()
    return providers

@app.get("/providers/available/{role}")
def get_available_providers(role: str, db: Session = Depends(get_db)):
    """Get available providers by role"""
    providers = db.query(Provider).filter(
        Provider.role == role,
        Provider.available == True
    ).all()
    return providers

@app.get("/facilities")
def get_facilities(db: Session = Depends(get_db)):
    """Get all facilities"""
    facilities = db.query(Facility).all()
    return facilities

@app.post("/shifts")
def create_shift(shift: ShiftCreate, db: Session = Depends(get_db)):
    """Create a new shift requirement"""
    new_shift = Shift(
        facility_id=shift.facility_id,
        role=shift.role,
        shift_date=date.fromisoformat(shift.shift_date),
        required_skills=shift.required_skills,
        urgency=shift.urgency,
        description=shift.description,
        status="open"
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return {"message": "Shift created", "shift_id": new_shift.id}

@app.get("/shifts/open")
def get_open_shifts(db: Session = Depends(get_db)):
    """Get all open shifts"""
    shifts = db.query(Shift).filter(Shift.status == "open").all()
    return shifts

@app.get("/shifts/matched")
def get_matched_shifts(db: Session = Depends(get_db)):
    """Get all shifts that are filled (matched/accepted)"""
    shifts = db.query(Shift).filter(Shift.status != "open").all()
    
    result = []
    for shift in shifts:
        match = db.query(Match).filter(
            Match.shift_id == shift.id,
            Match.status == "accepted"
        ).first()
        
        provider_info = None
        if match:
            provider = db.query(Provider).filter(Provider.id == match.provider_id).first()
            provider_info = {
                "id": provider.id if provider else None,
                "name": provider.name if provider else None,
                "role": provider.role if provider else None
            }
        
        shift_data = {
            "id": shift.id,
            "role": shift.role,
            "facility_id": shift.facility_id,
            "shift_date": shift.shift_date,
            "required_skills": shift.required_skills,
            "urgency": shift.urgency,
            "status": shift.status,
            "description": shift.description,
            "match": {
                "provider_id": match.provider_id if match else None,
                "provider_name": provider_info["name"] if provider_info else None,
                "match_score": match.match_score if match else None,
                "match_reason": match.match_reason if match else None
            } if match else None
        }
        result.append(shift_data)
    
    return result

# ============ PURE AI-POWERED MATCHING ENDPOINT ============
@app.post("/match/{shift_id}")
def match_providers(shift_id: int, db: Session = Depends(get_db)):
    """Match providers to a shift using OpenAI's natural intelligence"""
    
    # Get the shift
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    # Get ALL available providers
    providers = db.query(Provider).filter(
        Provider.available == True
    ).all()
    
    if not providers:
        return {
            "shift_id": shift_id,
            "shift_role": shift.role,
            "matches": [],
            "total_matches": 0,
            "message": "No available providers found. Please add providers to enable matching."
        }
    
    # Prepare provider data for AI
    provider_data = []
    for p in providers:
        provider_data.append({
            "id": p.id,
            "name": p.name,
            "role": p.role,
            "skills": p.skills or [],
            "experience_years": p.experience_years or 0,
            "license_number": p.license_number
        })
    
    # Natural prompt - let AI use its intelligence
    prompt = f"""You are an expert healthcare staffing recruiter. Use your knowledge of healthcare roles, skills, and experience to evaluate these providers.

SHIFT NEEDS:
- Role: {shift.role}
- Required Skills: {shift.required_skills or []}
- Urgency: {shift.urgency}
- Description: {shift.description or "No additional details"}

AVAILABLE PROVIDERS:
{json.dumps(provider_data, indent=2)}

Your task:
1. Draw on your understanding of healthcare roles (e.g., you know that "ICU Nurse" and "Critical Care Nurse" are similar)
2. Use your knowledge of which skills are most important for each role
3. Consider experience level appropriately
4. Determine who would be the BEST fit for this shift

Return the TOP 5 matches with:
- A score (0-100) that reflects your professional assessment
- A detailed, unique reason explaining why each provider is a good/poor fit

Be honest and specific. Mention relevant skills, experience, and role relevance.

Return ONLY valid JSON:
{{"matches": [
    {{"provider_id": 1, "score": 94, "reason": "Dr. Sarah is an exceptional fit. Her 12 years of ICU experience and ventilator management expertise make her ideal for this critical care shift."}}
]}}"""

    try:
        print(f"🤖 OpenAI analyzing {len(providers)} providers for {shift.role} role...")
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert healthcare staffing recruiter with deep knowledge of medical roles, skills, and qualifications. Use your expertise to evaluate matches naturally. Be specific and detailed. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        result = json.loads(response.choices[0].message.content)
        matches = result.get("matches", [])
        
        # Process scores to 0-1 range for consistency
        for match in matches:
            if "score" in match:
                score = match["score"]
                if isinstance(score, (int, float)):
                    if score > 1:
                        match["score"] = round(score / 100, 2)
                    else:
                        match["score"] = round(score, 2)
        
        print(f"✅ OpenAI returned {len(matches)} intelligent matches")
        
        # Fallback if OpenAI returns nothing
        if not matches and providers:
            matches = simple_fallback_matching(shift, providers)
        
    except Exception as e:
        print(f"❌ OpenAI error: {e}")
        matches = simple_fallback_matching(shift, providers)
    
    # Save matches to database
    for match_data in matches[:5]:
        existing = db.query(Match).filter(
            Match.shift_id == shift_id,
            Match.provider_id == match_data["provider_id"]
        ).first()
        
        if not existing:
            new_match = Match(
                shift_id=shift_id,
                provider_id=match_data["provider_id"],
                match_score=match_data["score"],
                match_reason=match_data["reason"],
                status="pending"
            )
            db.add(new_match)
    
    db.commit()
    
    return {
        "shift_id": shift_id,
        "shift_role": shift.role,
        "matches": matches[:5],
        "total_matches": len(matches),
        "message": f"✅ AI found {len(matches)} potential matches for this shift."
    }


def simple_fallback_matching(shift, providers):
    """Simple fallback when OpenAI is unavailable"""
    matches = []
    required_skills = set([skill.lower() for skill in (shift.required_skills or [])])
    
    for provider in providers:
        provider_skills = set([skill.lower() for skill in (provider.skills or [])])
        
        # Calculate match percentage
        if required_skills:
            matched = required_skills.intersection(provider_skills)
            skill_percentage = len(matched) / len(required_skills) * 100
        else:
            skill_percentage = 50
        
        # Role bonus
        if provider.role.lower() == shift.role.lower():
            skill_percentage = min(95, skill_percentage + 20)
        elif any(word in provider.role.lower() for word in shift.role.lower().split()):
            skill_percentage = min(90, skill_percentage + 10)
        
        # Experience bonus
        if provider.experience_years >= 10:
            skill_percentage = min(98, skill_percentage + 10)
        elif provider.experience_years >= 5:
            skill_percentage = min(95, skill_percentage + 5)
        
        score = round(skill_percentage / 100, 2)
        
        matches.append({
            "provider_id": provider.id,
            "score": score,
            "reason": f"{provider.name} has {provider.experience_years} years of experience as {provider.role}. Skills: {', '.join(provider.skills[:3])}..."
        })
    
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:5]


@app.get("/matches/{shift_id}")
def get_matches(shift_id: int, db: Session = Depends(get_db)):
    """Get all matches for a shift"""
    matches = db.query(Match).filter(Match.shift_id == shift_id).all()
    return matches

@app.get("/matches")
def get_all_matches(db: Session = Depends(get_db)):
    """Get all matches (for assignments tracking in Providers page)"""
    matches = db.query(Match).all()
    
    result = []
    for match in matches:
        provider = db.query(Provider).filter(Provider.id == match.provider_id).first()
        
        match_data = {
            "id": match.id,
            "shift_id": match.shift_id,
            "provider_id": match.provider_id,
            "provider_name": provider.name if provider else None,
            "provider_role": provider.role if provider else None,
            "match_score": match.match_score,
            "match_reason": match.match_reason,
            "status": match.status,
        }
        result.append(match_data)
    
    return result

@app.put("/matches/{match_id}/accept")
def accept_match(match_id: int, db: Session = Depends(get_db)):
    """Accept a match and assign the provider"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.status = "accepted"
    
    shift = db.query(Shift).filter(Shift.id == match.shift_id).first()
    if shift:
        shift.status = "filled"
    
    provider = db.query(Provider).filter(Provider.id == match.provider_id).first()
    if provider:
        provider.available = False
    
    db.commit()
    
    return {"message": "Match accepted", "assignment_confirmed": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)