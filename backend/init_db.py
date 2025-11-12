"""Initialize database tables."""
from app.db.database import engine, Base
from app.db.models import User, Konto, Zgloszenie, TypDostepnosci, TypZgloszenia


def init_db():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nTables created:")
    print("  - users (legacy)")
    print("  - konta")
    print("  - zgloszenia")
    print("  - typ_dostepnosci")
    print("  - typ_zgloszenia")


if __name__ == "__main__":
    init_db()
