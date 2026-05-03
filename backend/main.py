from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date, Float, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============ DATABASE SETUP ============
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============ DATABASE MODELS ============

class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    skills = Column(JSON)
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
    required_skills = Column(JSON)
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
        "https://medmatch-api.onrender.com",
        "https://medmatch-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ CREATE TABLES ON STARTUP (MOVED HERE - AFTER app IS CREATED) ============

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database connected and tables created")

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
    providers = db.query(Provider).all()
    return providers

@app.get("/providers/available/{role}")
def get_available_providers(role: str, db: Session = Depends(get_db)):
    providers = db.query(Provider).filter(
        Provider.role == role,
        Provider.available == True
    ).all()
    return providers

@app.get("/facilities")
def get_facilities(db: Session = Depends(get_db)):
    facilities = db.query(Facility).all()
    return facilities

@app.post("/shifts")
def create_shift(shift: ShiftCreate, db: Session = Depends(get_db)):
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
    shifts = db.query(Shift).filter(Shift.status == "open").all()
    return shifts

@app.get("/shifts/matched")
def get_matched_shifts(db: Session = Depends(get_db)):
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

# ============ INTELLIGENT MATCHING ============

@app.post("/match/{shift_id}")
def match_providers(shift_id: int, db: Session = Depends(get_db)):
    """Match providers using intelligent scoring - Professional explanations"""
    
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    providers = db.query(Provider).filter(Provider.available == True).all()
    
    if not providers:
        return {
            "shift_id": shift_id,
            "shift_role": shift.role,
            "matches": [],
            "total_matches": 0,
            "message": "No available providers found."
        }
    
    required_skills = set([skill.lower() for skill in (shift.required_skills or [])])
    matches = []
    
    for provider in providers:
        provider_skills = set([skill.lower() for skill in (provider.skills or [])])
        
        if required_skills:
            matched_skills = required_skills.intersection(provider_skills)
            match_percent = int(len(matched_skills) / len(required_skills) * 100) if required_skills else 50
        else:
            match_percent = 50
            matched_skills = set()
        
        if provider.role == shift.role:
            match_percent = min(95, match_percent + 25)
        elif any(word in provider.role.lower() for word in shift.role.lower().split()):
            match_percent = min(95, match_percent + 15)
        
        exp = provider.experience_years or 0
        
        if exp >= 10:
            match_percent = min(98, match_percent + 15)
            exp_text = "extensive"
        elif exp >= 5:
            match_percent = min(95, match_percent + 10)
            exp_text = "solid"
        elif exp >= 2:
            match_percent = min(90, match_percent + 5)
            exp_text = "developing"
        else:
            exp_text = "emerging"
        
        if match_percent >= 85:
            quality = "Exceptional"
            recommendation = "This provider would be an outstanding addition to your team."
        elif match_percent >= 70:
            quality = "Strong"
            recommendation = "Highly recommended for this position."
        elif match_percent >= 55:
            quality = "Good"
            recommendation = "Would be a solid fit for this role."
        elif match_percent >= 40:
            quality = "Promising"
            recommendation = "Worth considering for this position."
        else:
            quality = "Potential"
            recommendation = "May be suitable if no other options are available."
        
        reason = f"{quality} match: {provider.name} brings {exp_text} {exp}+ years of experience as {provider.role}. "
        
        if matched_skills:
            skill_list = list(matched_skills)[:3]
            reason += f"Key strengths include {', '.join(skill_list)}. "
        else:
            reason += f"Their background provides transferable healthcare skills. "
        
        if provider.role == shift.role:
            reason += f"Their direct experience in {shift.role} aligns perfectly with your requirements. "
        
        reason += recommendation
        
        matches.append({
            "provider_id": provider.id,
            "score": round(match_percent / 100, 2),
            "reason": reason,
            "experience_years": exp
        })
        
        new_match = Match(
            shift_id=shift_id,
            provider_id=provider.id,
            match_score=round(match_percent / 100, 2),
            match_reason=reason,
            status="pending"
        )
        db.add(new_match)
    
    matches.sort(key=lambda x: x["score"], reverse=True)
    top_matches = matches[:5]
    db.commit()
    
    return {
        "shift_id": shift_id,
        "shift_role": shift.role,
        "matches": top_matches,
        "total_matches": len(matches),
        "message": f"✅ Found {len(matches)} matches for this shift"
    }

@app.get("/matches/{shift_id}")
def get_matches(shift_id: int, db: Session = Depends(get_db)):
    matches = db.query(Match).filter(Match.shift_id == shift_id).all()
    return matches

@app.get("/matches")
def get_all_matches(db: Session = Depends(get_db)):
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