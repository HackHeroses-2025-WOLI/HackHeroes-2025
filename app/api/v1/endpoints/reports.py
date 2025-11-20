"""Zgłoszenie (Report) endpoints."""
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_account
from app.db.database import get_db
from app.db.models import Account
from app.schemas import ReportCreate, ReportOut
from app.services.report_service import ReportService

router = APIRouter()


@router.post(
    "/",
    response_model=ReportOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new report",
    description="Create a new problem report"
)
def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
):
    """Create a new report.

    - **full_name**: full name of the reporter
    - **phone**: 9-digit phone number
    - **age**: age of the reporter
    - **address**: address where the problem occurred
    - **city**: city/town
    - **problem**: detailed description of the problem
    - **contact_ok**: whether the reporter can be contacted
    - **report_type_id**: ID of report type
    - **report_details**: additional details
    """
    report = ReportService.create_report(db, report_data, reporter_email=None)
    return report


@router.get(
    "/",
    response_model=List[ReportOut],
    summary="Get all reports",
    description="Get a list of reports with optional filters"
)
def get_all_reports(
    skip: int = Query(0, ge=0, description="Liczba pominiętych wyników"),
    limit: int = Query(100, ge=1, le=500, description="Maksymalna liczba wyników"),
    report_type_id: Optional[int] = Query(None, description="Filter by report type id"),
    city: Optional[str] = Query(None, description="Filter by city"),
    search: Optional[str] = Query(None, min_length=2, description="Szukaj po adresie lub opisie"),
    date_from: Optional[date] = Query(None, description="Filter reports from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter reports to date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    _: Account = Depends(get_current_account),
):
    """
    Get all reports with optional filters.

    - **skip**: number of items to skip (pagination)
    - **limit**: maximum number of items per page
    - **report_type_id**: filter by report type id
    - **city**: filter by city
    - **search**: search by address or problem description
    - **date_from**, **date_to**: filter by date range
    """
    reports = ReportService.get_all_reports(
        db, 
        skip=skip, 
        limit=limit,
        report_type_id=report_type_id,
        city=city,
        search=search,
        date_from=datetime.combine(date_from, datetime.min.time()) if date_from else None,
        date_to=datetime.combine(date_to, datetime.max.time()) if date_to else None,
    )
    return reports


@router.get(
    "/stats",
    summary="Reports statistics",
    description="Get basic statistics for reports"
)
def get_reports_statistics(
    db: Session = Depends(get_db),
    _: Account = Depends(get_current_account),
):
    """Get reports statistics."""
    stats = ReportService.get_statistics(db)
    return stats


@router.get(
    "/{report_id}",
    response_model=ReportOut,
    summary="Get report by ID",
    description="Get report details by ID"
)
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    _: Account = Depends(get_current_account),
):
    """Get report by id."""
    report = ReportService.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    return report


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete report",
    description="Delete a report"
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    _: Account = Depends(get_current_account),
):
    """Delete a report."""
    success = ReportService.delete_report(db, report_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found"
        )
    return None


# Deprecated: reporter-linked reports removed
