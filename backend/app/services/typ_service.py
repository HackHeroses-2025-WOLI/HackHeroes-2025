"""Typ Dostępności and Typ Zgłoszenia services."""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.models import TypDostepnosci, TypZgloszenia
from app.schemas.typ_dostepnosci import TypDostepnosciCreate
from app.schemas.typ_zgloszenia import TypZgloszeniaCreate


class TypDostepnosciService:
    """Service for typ dostępności operations."""
    
    @staticmethod
    def get_all(db: Session) -> List[TypDostepnosci]:
        """Get all typy dostępności."""
        return db.query(TypDostepnosci).all()
    
    @staticmethod
    def get_by_id(db: Session, typ_id: int) -> Optional[TypDostepnosci]:
        """Get typ dostępności by ID."""
        return db.query(TypDostepnosci).filter(TypDostepnosci.id == typ_id).first()
    
    @staticmethod
    def create(db: Session, typ_data: TypDostepnosciCreate) -> TypDostepnosci:
        """Create new typ dostępności."""
        new_typ = TypDostepnosci(
            nazwa=typ_data.nazwa,
            opis=typ_data.opis
        )
        db.add(new_typ)
        db.commit()
        db.refresh(new_typ)
        return new_typ


class TypZgloszeniaService:
    """Service for typ zgłoszenia operations."""
    
    @staticmethod
    def get_all(db: Session) -> List[TypZgloszenia]:
        """Get all typy zgłoszeń."""
        return db.query(TypZgloszenia).all()
    
    @staticmethod
    def get_by_id(db: Session, typ_id: int) -> Optional[TypZgloszenia]:
        """Get typ zgłoszenia by ID."""
        return db.query(TypZgloszenia).filter(TypZgloszenia.id == typ_id).first()
    
    @staticmethod
    def create(db: Session, typ_data: TypZgloszeniaCreate) -> TypZgloszenia:
        """Create new typ zgłoszenia."""
        new_typ = TypZgloszenia(
            nazwa=typ_data.nazwa,
            opis=typ_data.opis
        )
        db.add(new_typ)
        db.commit()
        db.refresh(new_typ)
        return new_typ
