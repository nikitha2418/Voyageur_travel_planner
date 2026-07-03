"""SQLAlchemy ORM models."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)

    # --- User inputs ---
    destination = Column(String(200), nullable=False)
    budget = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    num_days = Column(Integer, nullable=False, default=3)
    interests = Column(JSON, nullable=False, default=list)  # list[str]

    # --- LLM prompt-chain outputs ---
    research = Column(JSON, nullable=True)          # destination research / local insights
    itinerary = Column(JSON, nullable=True)         # day-by-day plan
    budget_analysis = Column(JSON, nullable=True)   # budget check result

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "destination": self.destination,
            "budget": self.budget,
            "currency": self.currency,
            "num_days": self.num_days,
            "interests": self.interests or [],
            "research": self.research,
            "itinerary": self.itinerary,
            "budget_analysis": self.budget_analysis,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
