# backend/app/database.py
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _database_url() -> str:
    """Return the database URL from the environment, falling back to local SQLite.

    Some hosts (older Heroku/Render setups) hand out ``postgres://`` URLs, which
    SQLAlchemy 1.4+ no longer accepts, so normalise them to ``postgresql://``.
    """
    # The default SQLite file sits in backend/, wherever the server was started from.
    default = "sqlite:///" + (Path(__file__).resolve().parent.parent / "warehouse.db").as_posix()
    url = os.getenv("DATABASE_URL", default)
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


SQLALCHEMY_DATABASE_URL = _database_url()

engine_args: dict = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # SQLite connections are shared across FastAPI's worker threads.
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # Recover from connections the server closed while the app was idle
    # (free-tier Postgres hosts do this often).
    engine_args["pool_pre_ping"] = True

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
