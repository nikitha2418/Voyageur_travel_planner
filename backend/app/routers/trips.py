"""Trip endpoints: generate (LLM chain), list, get, edit/save, delete."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Trip
from ..schemas import TripCreate, TripUpdate, TripOut, TripSummary
from .. import llm

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/generate", response_model=TripOut, status_code=201)
def generate_trip(payload: TripCreate, db: Session = Depends(get_db)):
    """Run the prompt chain, persist the result, and return the new trip."""
    try:
        chain = llm.generate_trip(
            destination=payload.destination,
            interests=payload.interests,
            num_days=payload.num_days,
            budget=payload.budget,
            currency=payload.currency,
        )
    except llm.LLMError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:  # network / provider errors
        raise HTTPException(status_code=502, detail=f"LLM request failed: {e}")

    trip = Trip(
        title=llm.make_title(payload.destination, payload.num_days, payload.interests),
        destination=payload.destination,
        budget=payload.budget,
        currency=payload.currency,
        num_days=payload.num_days,
        interests=payload.interests,
        research=chain["research"],
        itinerary=chain["itinerary"],
        budget_analysis=chain["budget_analysis"],
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip.to_dict()


@router.get("", response_model=list[TripSummary])
def list_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).order_by(Trip.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "destination": t.destination,
            "budget": t.budget,
            "currency": t.currency,
            "num_days": t.num_days,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in trips
    ]


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip.to_dict()


@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, payload: TripUpdate, db: Session = Depends(get_db)):
    """Edit/save a trip (title, itinerary, research, budget, notes)."""
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip.to_dict()


@router.delete("/{trip_id}", status_code=204)
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return None
