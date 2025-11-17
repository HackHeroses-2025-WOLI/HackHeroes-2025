"""AvailabilityType and ReportType services."""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.models import AvailabilityType, ReportType
from app.schemas.availability_type import AvailabilityTypeCreate
from app.schemas.report_type import ReportTypeCreate


class AvailabilityTypeService:
    """Service for availability/accessibility type operations."""
    
    @staticmethod
    def get_all(db: Session) -> List[AvailabilityType]:
        """Get all availability types."""
        return db.query(AvailabilityType).all()
    
    @staticmethod
    def get_by_id(db: Session, type_id: int) -> Optional[AvailabilityType]:
        """Get availability type by ID."""
        return db.query(AvailabilityType).filter(AvailabilityType.id == type_id).first()
    
    @staticmethod
    def create(db: Session, type_data: AvailabilityTypeCreate) -> AvailabilityType:
        """Create a new availability type."""
        new_typ = AvailabilityType(
            name=type_data.name,
            description=type_data.description
        )
        db.add(new_typ)
        db.commit()
        db.refresh(new_typ)
        return new_typ


class ReportTypeService:
    """Service for report type operations."""
    
    @staticmethod
    def get_all(db: Session) -> List[ReportType]:
        """Get all report types."""
        return db.query(ReportType).all()
    
    @staticmethod
    def get_by_id(db: Session, type_id: int) -> Optional[ReportType]:
        """Get report type by ID."""
        return db.query(ReportType).filter(ReportType.id == type_id).first()
    
    @staticmethod
    def create(db: Session, type_data: ReportTypeCreate) -> ReportType:
        """Create a new report type."""
        new_typ = ReportType(
            name=type_data.name,
            description=type_data.description
        )
        db.add(new_typ)
        db.commit()
        db.refresh(new_typ)
        return new_typ
