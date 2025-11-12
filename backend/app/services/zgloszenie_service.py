"""Zgłoszenie service for business logic."""
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.db.models import Zgloszenie
from app.schemas.zgloszenie import ZgloszenieCreate, ZgloszenieUpdate


class ZgloszenieService:
    """Service for zgłoszenie-related operations."""
    
    @staticmethod
    def get_zgloszenie_by_id(db: Session, zgloszenie_id: int) -> Optional[Zgloszenie]:
        """Get zgłoszenie by ID."""
        return db.query(Zgloszenie).filter(Zgloszenie.id == zgloszenie_id).first()
    
    @staticmethod
    def get_all_zgloszenia(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        typ_zgloszenia_id: Optional[int] = None,
        miejscowosc: Optional[str] = None
    ) -> List[Zgloszenie]:
        """Get all zgłoszenia with optional filters and pagination."""
        query = db.query(Zgloszenie)
        
        if typ_zgloszenia_id:
            query = query.filter(Zgloszenie.typ_zgloszenia_id == typ_zgloszenia_id)
        
        if miejscowosc:
            query = query.filter(Zgloszenie.miejscowosc.ilike(f"%{miejscowosc}%"))
        
        return query.order_by(Zgloszenie.data_zgloszenia.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_zgloszenia_by_reporter(
        db: Session, 
        reporter_email: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Zgloszenie]:
        """Get all zgłoszenia created by specific user."""
        return db.query(Zgloszenie)\
            .filter(Zgloszenie.login_email_reporter == reporter_email)\
            .order_by(Zgloszenie.data_zgloszenia.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def create_zgloszenie(
        db: Session, 
        zgloszenie_data: ZgloszenieCreate,
        reporter_email: Optional[str] = None
    ) -> Zgloszenie:
        """Create a new zgłoszenie."""
        new_zgloszenie = Zgloszenie(
            imie_nazwisko=zgloszenie_data.imie_nazwisko,
            nr_tel=zgloszenie_data.nr_tel,
            wiek=zgloszenie_data.wiek,
            adres=zgloszenie_data.adres,
            miejscowosc=zgloszenie_data.miejscowosc,
            problem=zgloszenie_data.problem,
            czy_do_kontaktu=zgloszenie_data.czy_do_kontaktu,
            typ_zgloszenia_id=zgloszenie_data.typ_zgloszenia_id,
            zgloszenie_szczegoly=zgloszenie_data.zgloszenie_szczegoly,
            login_email_reporter=reporter_email
        )
        
        db.add(new_zgloszenie)
        db.commit()
        db.refresh(new_zgloszenie)
        
        return new_zgloszenie
    
    @staticmethod
    def update_zgloszenie(
        db: Session, 
        zgloszenie_id: int, 
        zgloszenie_data: ZgloszenieUpdate
    ) -> Optional[Zgloszenie]:
        """Update zgłoszenie information."""
        zgloszenie = ZgloszenieService.get_zgloszenie_by_id(db, zgloszenie_id)
        if not zgloszenie:
            return None
        
        # Update fields if provided
        update_data = zgloszenie_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(zgloszenie, field, value)
        
        db.commit()
        db.refresh(zgloszenie)
        
        return zgloszenie
    
    @staticmethod
    def delete_zgloszenie(db: Session, zgloszenie_id: int) -> bool:
        """Delete a zgłoszenie."""
        zgloszenie = ZgloszenieService.get_zgloszenie_by_id(db, zgloszenie_id)
        if not zgloszenie:
            return False
        
        db.delete(zgloszenie)
        db.commit()
        return True
    
    @staticmethod
    def get_statistics(db: Session) -> dict:
        """Get zgłoszenia statistics."""
        total = db.query(Zgloszenie).count()
        by_type = db.query(
            Zgloszenie.typ_zgloszenia_id,
            db.func.count(Zgloszenie.id)
        ).group_by(Zgloszenie.typ_zgloszenia_id).all()
        
        return {
            "total_zgloszenia": total,
            "by_type": {typ_id: count for typ_id, count in by_type}
        }
