"""SQLAlchemy engine, session factory, and Base declarative class."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

# pool_pre_ping avoids stale connections when MySQL closes idle sockets.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=280,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
