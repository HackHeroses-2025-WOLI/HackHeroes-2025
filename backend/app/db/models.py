"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class User(Base):
    """User model for authentication (deprecated - migrating to Konta)."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class TypDostepnosci(Base):
    """Typ dostępności (accessibility type)."""
    __tablename__ = "typ_dostepnosci"
    
    id = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String, unique=True, nullable=False)
    opis = Column(String)
    
    # Relationships
    konta = relationship("Konto", back_populates="typ_dostepnosci_rel")
    
    def __repr__(self):
        return f"<TypDostepnosci(id={self.id}, nazwa='{self.nazwa}')>"


class TypZgloszenia(Base):
    """Typ zgłoszenia (report type)."""
    __tablename__ = "typ_zgloszenia"
    
    id = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String, unique=True, nullable=False)
    opis = Column(String)
    
    # Relationships
    zgloszenia = relationship("Zgloszenie", back_populates="typ_zgloszenia_rel")
    
    def __repr__(self):
        return f"<TypZgloszenia(id={self.id}, nazwa='{self.nazwa}')>"


class Konto(Base):
    """Konto użytkownika (user account)."""
    __tablename__ = "konta"
    
    # Primary Key
    login_email = Column(String, primary_key=True, index=True)
    
    # User Information
    imie_nazwisko = Column(String, nullable=False)
    nr_tel = Column(String(9), nullable=True)
    hash_hasla = Column(String, nullable=False)
    
    # Location
    miejscowosc = Column(String, nullable=True)
    
    # Statistics
    rozwiazane_sprawy = Column(Integer, default=0, nullable=False)
    rozwiazane_sprawy_ten_rok = Column(Integer, default=0, nullable=False)
    
    # Foreign Keys
    aktywne_zgloszenie = Column(Integer, ForeignKey("zgloszenia.id"), nullable=True)
    typ_dostepnosci = Column(Integer, ForeignKey("typ_dostepnosci.id"), nullable=False)
    
    # JSON field for additional accessibility settings
    dostepnosc_json = Column(Text, nullable=True)  # JSON string
    
    # Relationships
    typ_dostepnosci_rel = relationship("TypDostepnosci", back_populates="konta")
    aktywne_zgloszenie_rel = relationship("Zgloszenie", foreign_keys=[aktywne_zgloszenie], post_update=True)
    zgloszenia_created = relationship("Zgloszenie", back_populates="reporter", foreign_keys="Zgloszenie.login_email_reporter")
    
    def __repr__(self):
        return f"<Konto(login_email='{self.login_email}', imie_nazwisko='{self.imie_nazwisko}')>"


class Zgloszenie(Base):
    """Zgłoszenie problemu (problem report)."""
    __tablename__ = "zgloszenia"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Basic Information
    imie_nazwisko = Column(String, nullable=False)
    nr_tel = Column(String(9), nullable=False)
    wiek = Column(Integer, nullable=False)
    adres = Column(String, nullable=False)
    miejscowosc = Column(String, nullable=False)
    problem = Column(Text, nullable=False)
    
    # Contact & Status
    czy_do_kontaktu = Column(Boolean, default=True, nullable=False)
    
    # Foreign Keys
    typ_zgloszenia_id = Column(Integer, ForeignKey("typ_zgloszenia.id"), nullable=False)
    login_email_reporter = Column(String, ForeignKey("konta.login_email"), nullable=True)
    
    # Details
    zgloszenie_szczegoly = Column(Text, nullable=True)  # JSON or detailed text
    data_zgloszenia = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    typ_zgloszenia_rel = relationship("TypZgloszenia", back_populates="zgloszenia")
    reporter = relationship("Konto", back_populates="zgloszenia_created", foreign_keys=[login_email_reporter])
    
    def __repr__(self):
        return f"<Zgloszenie(id={self.id}, problem='{self.problem[:30]}...')>"
