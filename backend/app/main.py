"""FastAPI application entrypoint."""
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from .config import settings
from .database import Base, engine
from .routers import trips, auth

app = FastAPI(
    title="Travel Itinerary Planner with Local Insights",
    version="1.0.0",
    description="Groq-powered prompt-chained itinerary planner (research -> itinerary -> budget).",
)

allow_all = settings.cors_origins.strip() == "*"
origins = ["*"] if allow_all else [
    o.strip() for o in settings.cors_origins.split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Browsers reject wildcard origins combined with credentials, so only
    # enable credentials when explicit origins are configured.
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Wait for MySQL to accept connections, then create tables."""
    last_err = None
    for _ in range(30):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as e:  # DB not ready yet (common in Docker)
            last_err = e
            time.sleep(2)
    raise RuntimeError(f"Database not reachable after retries: {last_err}")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "model": settings.groq_model}


app.include_router(auth.router)
app.include_router(trips.router)

# Serve the built React frontend if it was bundled into the image (single-service
# deploys like Railway/Render). API routes above take precedence over this mount.
# Skipped locally where the frontend is served by its own nginx container.
import os
from fastapi.staticfiles import StaticFiles

_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="frontend")
