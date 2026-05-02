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

# ============ CORS MIDDLEWARE (Allow frontend to connect) ============
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
        "what_it_does": "Matches healthcare providers with hospital shifts using AI",
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

@app.post("/match/{shift_id}")
def match_providers(shift_id: int, db: Session = Depends(get_db)):
    """Use AI to match providers to a shift"""
    
    # Get the shift
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    # Get available providers with matching role
    providers = db.query(Provider).filter(
        Provider.role == shift.role,
        Provider.available == True
    ).all()
    
    if not providers:
        return {"matches": [], "message": "No available providers found"}
    
    # Prepare provider data for AI
    provider_list = []
    for p in providers:
        provider_list.append({
            "id": p.id,
            "name": p.name,
            "skills": p.skills or [],
            "experience": p.experience_years or 0
        })
    
    # Call OpenAI API for intelligent matching
    prompt = f"""
    You are a healthcare staffing AI matching system for ShiftNex.
    
    SHIFT REQUIREMENT:
    Role: {shift.role}
    Required Skills: {shift.required_skills or []}
    Description: {shift.description or "No additional description"}
    Urgency: {shift.urgency}
    
    AVAILABLE PROVIDERS:
    {provider_list}
    
    Task: Rank these providers from best match to worst match.
    
    Return ONLY valid JSON in this format:
    {{"matches": [
        {{"provider_id": 1, "score": 0.95, "reason": "Has all required skills + 5 years experience"}},
        {{"provider_id": 2, "score": 0.70, "reason": "Missing one required skill"}}
    ]}}
    """
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    import json
    result = json.loads(response.choices[0].message.content)
    
    # Save matches to database
    for match_data in result.get("matches", []):
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
        "matches": result.get("matches", []),
        "total_matches": len(result.get("matches", []))
    }

@app.get("/matches/{shift_id}")
def get_matches(shift_id: int, db: Session = Depends(get_db)):
    """Get all matches for a shift"""
    matches = db.query(Match).filter(Match.shift_id == shift_id).all()
    return matches

@app.put("/matches/{match_id}/accept")
def accept_match(match_id: int, db: Session = Depends(get_db)):
    """Accept a match and assign the provider"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.status = "accepted"
    
    # Update shift status to filled
    shift = db.query(Shift).filter(Shift.id == match.shift_id).first()
    if shift:
        shift.status = "filled"
    
    # Mark provider as unavailable
    provider = db.query(Provider).filter(Provider.id == match.provider_id).first()
    if provider:
        provider.available = False
    
    db.commit()
    
    return {"message": "Match accepted", "assignment_confirmed": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)