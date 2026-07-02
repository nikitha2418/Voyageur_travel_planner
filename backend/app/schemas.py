"""Pydantic request/response schemas."""
from typing import Any, Optional
from pydantic import BaseModel, Field


class TripCreate(BaseModel):
    destination: str = Field(..., min_length=2, max_length=200)
    budget: float = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=10)
    num_days: int = Field(..., ge=1, le=30)
    interests: list[str] = Field(default_factory=list)


class TripUpdate(BaseModel):
    """Fields a user may edit/save after generation. All optional."""
    title: Optional[str] = None
    itinerary: Optional[Any] = None
    research: Optional[Any] = None
    budget_analysis: Optional[Any] = None
    notes: Optional[str] = None


class TripOut(BaseModel):
    id: int
    title: str
    destination: str
    budget: float
    currency: str
    num_days: int
    interests: list[str]
    research: Optional[Any] = None
    itinerary: Optional[Any] = None
    budget_analysis: Optional[Any] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class TripSummary(BaseModel):
    id: int
    title: str
    destination: str
    budget: float
    currency: str
    num_days: int
    created_at: Optional[str] = None
