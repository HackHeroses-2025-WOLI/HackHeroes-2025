"""Report service for business logic."""
from datetime import datetime, time, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Account, Report
from app.schemas.report import ReportCreate, ReportUpdate


class ReportService:
    """Service for report-related operations."""
    
    @staticmethod
    def get_report_by_id(db: Session, report_id: int) -> Optional[Report]:
        """Get report by ID."""
        return db.query(Report).filter(Report.id == report_id).first()

    @staticmethod
    def _ensure_report_exists(db: Session, report_id: int) -> Report:
        report = ReportService.get_report_by_id(db, report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID {report_id} not found",
            )
        return report
    
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
        """Get all unaccepted and uncompleted reports with optional filters and pagination."""
        # Exclude reports currently assigned to any volunteer
        assigned_ids = db.query(Account.active_report).filter(
            Account.active_report.isnot(None)
        ).scalar_subquery()
        
        # Exclude both actively assigned reports AND completed reports
        query = db.query(Report).filter(
            ~Report.id.in_(assigned_ids),
            Report.completed_at.is_(None)
        )
        
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
            reporter_email=reporter_email,
            is_reviewed=report_data.is_reviewed,
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
    def assign_report_to_volunteer(
        db: Session,
        volunteer: Account,
        report_id: int,
    ) -> Report:
        """Assign a report to the volunteer, ensuring exclusivity."""

        report = ReportService._ensure_report_exists(db, report_id)

        if volunteer.active_report and volunteer.active_report != report_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active report assigned.",
            )

        already_taken = (
            db.query(Account)
            .filter(Account.active_report == report_id, Account.email != volunteer.email)
            .first()
        )
        if already_taken:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This report is already accepted by another volunteer.",
            )

        volunteer.active_report = report_id
        if not report.is_reviewed:
            report.is_reviewed = True
        if not report.accepted_at:
            report.accepted_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(volunteer)
        db.refresh(report)
        return report

    @staticmethod
    def cancel_active_report(db: Session, volunteer: Account) -> Report:
        """Release the volunteer's active report assignment."""

        if not volunteer.active_report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You do not have an active report to cancel.",
            )

        report = ReportService._ensure_report_exists(db, volunteer.active_report)
        volunteer.active_report = None

        db.commit()
        db.refresh(volunteer)
        db.refresh(report)
        return report

    @staticmethod
    def complete_active_report(db: Session, volunteer: Account) -> Report:
        """Mark the active report as completed and update volunteer stats."""

        if not volunteer.active_report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You do not have an active report to complete.",
            )

        report = ReportService._ensure_report_exists(db, volunteer.active_report)

        volunteer.active_report = None
        volunteer.resolved_cases = (volunteer.resolved_cases or 0) + 1
        volunteer.resolved_cases_this_year = (volunteer.resolved_cases_this_year or 0) + 1
        volunteer.genpoints = (volunteer.genpoints or 0) + 10
        report.is_reviewed = True
        report.completed_at = datetime.now(timezone.utc)
        report.completed_by_email = volunteer.email

        db.commit()
        db.refresh(volunteer)
        db.refresh(report)
        return report
    
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

    @staticmethod
    def get_average_response_minutes(db: Session) -> Optional[float]:
        """Average minutes from report submission to first acceptance."""

        rows = (
            db.query(Report.reported_at, Report.accepted_at)
            .filter(Report.accepted_at.isnot(None))
            .all()
        )
        if not rows:
            return None

        total_seconds = 0.0
        counted = 0
        for reported, accepted in rows:
            if not (reported and accepted):
                continue
            delta = accepted - reported
            seconds = delta.total_seconds()
            if seconds < 0:
                continue
            total_seconds += seconds
            counted += 1

        if counted == 0:
            return None

        return (total_seconds / counted) / 60.0

    @staticmethod
    def get_completed_reports_by_volunteer(
        db: Session,
        volunteer_email: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Report]:
        """Return reports completed by the given volunteer."""
        return (
            db.query(Report)
            .filter(Report.completed_by_email == volunteer_email)
            .order_by(Report.completed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
