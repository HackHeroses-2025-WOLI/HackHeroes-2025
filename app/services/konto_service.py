"""Konto service for business logic."""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.models import Konto
from app.schemas.konto import KontoCreate, KontoUpdate
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import UserAlreadyExistsException, InvalidCredentialsException


class KontoService:
    """Service for konto-related operations."""
    
    @staticmethod
    def get_konto_by_email(db: Session, email: str) -> Optional[Konto]:
        """Get konto by email."""
        return db.query(Konto).filter(Konto.login_email == email.lower()).first()
    
    @staticmethod
    def get_all_konta(db: Session, skip: int = 0, limit: int = 100) -> List[Konto]:
        """Get all konta with pagination."""
        return db.query(Konto).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_konto(db: Session, konto_data: KontoCreate) -> Konto:
        """Create a new konto."""
        # Check if konto already exists
        existing_konto = KontoService.get_konto_by_email(db, konto_data.login_email)
        if existing_konto:
            raise UserAlreadyExistsException(konto_data.login_email)
        
        # Hash password
        hashed_password = get_password_hash(konto_data.haslo)
        
        # Create new konto
        new_konto = Konto(
            login_email=konto_data.login_email.lower(),
            imie_nazwisko=konto_data.imie_nazwisko,
            nr_tel=konto_data.nr_tel,
            hash_hasla=hashed_password,
            miejscowosc=konto_data.miejscowosc,
            typ_dostepnosci=konto_data.typ_dostepnosci,
            dostepnosc_json=konto_data.dostepnosc_json,
            rozwiazane_sprawy=0,
            rozwiazane_sprawy_ten_rok=0
        )
        
        db.add(new_konto)
        db.commit()
        db.refresh(new_konto)
        
        return new_konto
    
    @staticmethod
    def authenticate_konto(db: Session, email: str, password: str) -> Konto:
        """Authenticate a konto with email and password."""
        konto = KontoService.get_konto_by_email(db, email)
        
        if not konto:
            raise InvalidCredentialsException()
        
        if not verify_password(password, konto.hash_hasla):
            raise InvalidCredentialsException()
        
        return konto
    
    @staticmethod
    def update_konto(db: Session, email: str, konto_data: KontoUpdate) -> Optional[Konto]:
        """Update konto information."""
        konto = KontoService.get_konto_by_email(db, email)
        if not konto:
            return None
        
        # Update fields if provided
        if konto_data.imie_nazwisko is not None:
            konto.imie_nazwisko = konto_data.imie_nazwisko
        if konto_data.nr_tel is not None:
            konto.nr_tel = konto_data.nr_tel
        if konto_data.miejscowosc is not None:
            konto.miejscowosc = konto_data.miejscowosc
        if konto_data.typ_dostepnosci is not None:
            konto.typ_dostepnosci = konto_data.typ_dostepnosci
        if konto_data.dostepnosc_json is not None:
            konto.dostepnosc_json = konto_data.dostepnosc_json
        if konto_data.haslo is not None:
            konto.hash_hasla = get_password_hash(konto_data.haslo)
        
        db.commit()
        db.refresh(konto)
        
        return konto
    
    @staticmethod
    def delete_konto(db: Session, email: str) -> bool:
        """Delete a konto."""
        konto = KontoService.get_konto_by_email(db, email)
        if not konto:
            return False
        
        db.delete(konto)
        db.commit()
        return True
    
    @staticmethod
    def increment_resolved_cases(db: Session, email: str, year_only: bool = False) -> Optional[Konto]:
        """Increment resolved cases counter."""
        konto = KontoService.get_konto_by_email(db, email)
        if not konto:
            return None
        
        konto.rozwiazane_sprawy_ten_rok += 1
        if not year_only:
            konto.rozwiazane_sprawy += 1
        
        db.commit()
        db.refresh(konto)
        return konto
