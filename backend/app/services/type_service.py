"""ReportType services."""
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.models import ReportType
from app.schemas.report_type import ReportTypeCreate


class ReportTypeService:
    """Service for report type operations."""

    DEFAULT_TYPES = (
        {
            "name": "Aplikacje",
            "description": "Problemy z aplikacjami i rozwiązaniami cyfrowymi",
        },
        {
            "name": "Bezpieczeństwo",
            "description": "Zgłoszenia dotyczące bezpieczeństwa i zagrożeń",
        },
        {
            "name": "Kontakt i połączenia",
            "description": "Trudności z komunikacją lub połączeniami",
        },
        {
            "name": "Płatności i bankowość",
            "description": "Problemy finansowe oraz bankowe",
        },
        {
            "name": "Inne",
            "description": "Pozostałe sprawy wymagające uwagi",
        },
    )

    @staticmethod
    def ensure_default_types(db: Session) -> None:
        """Seed mandatory report categories if they are missing."""

        created_or_updated = False
        for preset in ReportTypeService.DEFAULT_TYPES:
            existing = (
                db.query(ReportType)
                .filter(ReportType.name == preset["name"])
                .one_or_none()
            )
            if existing is None:
                db.add(ReportType(**preset))
                created_or_updated = True
                continue
            if existing.description != preset["description"]:
                existing.description = preset["description"]
                created_or_updated = True

        if created_or_updated:
            db.commit()

    @staticmethod
    def get_all(db: Session) -> List[ReportType]:
        """Get all report types."""
        ReportTypeService.ensure_default_types(db)
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
