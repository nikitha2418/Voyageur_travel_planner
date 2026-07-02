from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app import llm
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                       poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)


def override_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_db


def fake_generate_trip(destination, interests, num_days, budget, currency):
    return {
        "research": {"overview": f"{destination} is lovely"},
        "itinerary": {"days": [{"day": 1, "theme": "Arrival",
            "activities": [{"time": "Morning", "title": "Walk", "est_cost": 0}]}]},
        "budget_analysis": {"grand_total": 800, "within_budget": True, "remaining_or_over": 400},
    }


llm.generate_trip = fake_generate_trip

client = TestClient(app)  # not a context manager -> skips MySQL startup

assert client.get("/api/health").status_code == 200

r = client.post("/api/trips/generate", json={
    "destination": "Kyoto", "budget": 1200, "currency": "USD",
    "num_days": 3, "interests": ["food", "temples"]})
assert r.status_code == 201, r.text
trip = r.json()
tid = trip["id"]
assert trip["title"] == "3-Day Kyoto Food Trip"
assert trip["itinerary"]["days"][0]["theme"] == "Arrival"
print("generate OK -> id", tid, "|", trip["title"])

lst = client.get("/api/trips").json()
assert len(lst) == 1 and lst[0]["id"] == tid
print("list OK ->", len(lst), "trip(s)")

got = client.get(f"/api/trips/{tid}").json()
assert got["destination"] == "Kyoto"
print("get OK")

up = client.put(f"/api/trips/{tid}", json={"title": "My Kyoto Foodie Trip",
    "notes": "add a cooking class"}).json()
assert up["title"] == "My Kyoto Foodie Trip" and up["notes"] == "add a cooking class"
print("edit OK ->", up["title"])

bad = client.post("/api/trips/generate", json={"destination": "X", "budget": -5,
    "num_days": 2, "interests": []})
assert bad.status_code == 422
print("validation OK -> 422 on bad input")

assert client.delete(f"/api/trips/{tid}").status_code == 204
assert client.get(f"/api/trips/{tid}").status_code == 404
print("delete OK -> 404 after delete")
print("PHASE3_OK")
