"""Report service for business logic."""
from datetime import datetime, time
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Report
from app.schemas.report import ReportCreate, ReportUpdate


class ReportService:
    """Service for report-related operations."""
    
    @staticmethod
    def get_report_by_id(db: Session, report_id: int) -> Optional[Report]:
        """Get report by ID."""
        return db.query(Report).filter(Report.id == report_id).first()
    
    @staticmethod
    def get_all_reports(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        report_type_id: Optional[int] = None,
        city: Optional[str] = None,
        search: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List[Report]:
        """Get all reports with optional filters and pagination."""
        query = db.query(Report)
        
        if report_type_id:
            query = query.filter(Report.report_type_id == report_type_id)
        
        if city:
            query = query.filter(Report.city.ilike(f"%{city}%"))

        if search:
            pattern = f"%{search}%"
            query = query.filter(
                Report.problem.ilike(pattern) | Report.address.ilike(pattern)
            )

        if date_from:
            if isinstance(date_from, datetime):
                start_dt = date_from
            else:
                start_dt = datetime.combine(date_from, time.min)
            query = query.filter(Report.reported_at >= start_dt)

        if date_to:
            if isinstance(date_to, datetime):
                end_dt = date_to
            else:
                end_dt = datetime.combine(date_to, time.max)
            query = query.filter(Report.reported_at <= end_dt)
        
        return query.order_by(Report.reported_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_reports_by_reporter(
        db: Session, 
        reporter_email: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Report]:
        """Get all reports created by specific user."""
        return db.query(Report)\
            .filter(Report.reporter_email == reporter_email)\
            .order_by(Report.reported_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def create_report(
        db: Session, 
        report_data: ReportCreate,
        reporter_email: Optional[str] = None
    ) -> Report:
        """Create a new report."""
        new_report = Report(
            full_name=report_data.full_name,
            phone=report_data.phone,
            age=report_data.age,
            address=report_data.address,
            city=report_data.city,
            problem=report_data.problem,
            contact_ok=report_data.contact_ok,
            report_type_id=report_data.report_type_id,
            report_details=report_data.report_details,
            reporter_email=reporter_email
        )
        
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        return new_report
    
    @staticmethod
    def update_report(
        db: Session, 
        report_id: int, 
        report_data: ReportUpdate
    ) -> Optional[Report]:
        """Update report information."""
        report = ReportService.get_report_by_id(db, report_id)
        if not report:
            return None
        
        # Update fields if provided
        update_data = report_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(report, field, value)
        
        db.commit()
        db.refresh(report)
        
        return report
    
    @staticmethod
    def delete_report(db: Session, report_id: int) -> bool:
        """Delete a report."""
        report = ReportService.get_report_by_id(db, report_id)
        if not report:
            return False
        
        db.delete(report)
        db.commit()
        return True
    
    @staticmethod
    def get_statistics(db: Session) -> dict:
        """Get reports statistics."""
        total = db.query(Report).count()
        by_type = (
            db.query(
                Report.report_type_id,
                func.count(Report.id)
            )
            .group_by(Report.report_type_id)
            .all()
        )

        return {
            "total_reports": total,
            "by_type": {typ_id: count for typ_id, count in by_type}
        }
