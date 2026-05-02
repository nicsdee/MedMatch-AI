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

# Load environment variables from .env file
load_dotenv()

# ============ DATABASE SETUP ============
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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
        "what_it_does": "Matches healthcare providers with hospital shifts using intelligent scoring",
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

@app.post("/match/{shift_id}")
def match_providers(shift_id: int, db: Session = Depends(get_db)):
    """Match providers to a shift using intelligent scoring"""
    
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    providers = db.query(Provider).filter(
        Provider.role == shift.role,
        Provider.available == True
    ).all()
    
    if not providers:
        return {"matches": [], "message": "No available providers found for this role"}
    
    matches = []
    required_skills = set([skill.lower() for skill in (shift.required_skills or [])])
    
    for provider in providers:
        provider_skills = set([skill.lower() for skill in (provider.skills or [])])
        
        if required_skills:
            matched_skills = required_skills.intersection(provider_skills)
            skill_score = len(matched_skills) / len(required_skills)
        else:
            skill_score = 0.5
            matched_skills = set()
        
        experience_score = min(1.0, provider.experience_years / 20)
        final_score = (skill_score * 0.7) + (experience_score * 0.3)
        final_score = round(final_score, 2)
        
        if skill_score >= 0.8:
            reason = f"Excellent match! {provider.name} has {provider.experience_years} years of experience and matches {len(matched_skills)} of {len(required_skills)} required skills"
        elif skill_score >= 0.5:
            reason = f"Good match. {provider.name} has {provider.experience_years} years experience and matches {len(matched_skills)} of {len(required_skills)} required skills"
        else:
            reason = f"Potential match. {provider.name} has {provider.experience_years} years experience but limited skill overlap"
        
        matches.append({
            "provider_id": provider.id,
            "score": final_score,
            "reason": reason,
            "matched_skills": list(matched_skills),
            "experience_years": provider.experience_years
        })
        
        new_match = Match(
            shift_id=shift_id,
            provider_id=provider.id,
            match_score=final_score,
            match_reason=reason,
            status="pending"
        )
        db.add(new_match)
    
    matches.sort(key=lambda x: x["score"], reverse=True)
    db.commit()
    top_matches = matches[:5]
    
    return {
        "shift_id": shift_id,
        "shift_role": shift.role,
        "matches": top_matches,
        "total_matches": len(matches),
        "message": f"Found {len(matches)} potential matches. Top {len(top_matches)} shown."
    }

@app.get("/matches/{shift_id}")
def get_matches(shift_id: int, db: Session = Depends(get_db)):
    """Get all matches for a shift"""
    matches = db.query(Match).filter(Match.shift_id == shift_id).all()
    return matches

# ============ NEW ENDPOINT - GET ALL MATCHES ============
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
# ============ END NEW ENDPOINT ============

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