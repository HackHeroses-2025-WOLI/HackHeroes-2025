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
    "",
    response_model=List[ReportOut],
    include_in_schema=False,
)
def get_all_reports_no_slash(
    skip: int = Query(0, ge=0, description="Liczba pominiętych wyników"),
    limit: int = Query(100, ge=1, le=500, description="Maksymalna liczba wyników"),
    report_type_id: Optional[int] = Query(None, description="Filter by report type id"),
    city: Optional[str] = Query(None, description="Filter by city"),
    search: Optional[str] = Query(None, min_length=2, description="Szukaj po adresie lub opisie"),
    date_from: Optional[date] = Query(None, description="Filter reports from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter reports to date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account),
):
    """Support /api/v1/reports without trailing slash to avoid redirects."""
    return get_all_reports(
        skip=skip,
        limit=limit,
        report_type_id=report_type_id,
        city=city,
        search=search,
        date_from=date_from,
        date_to=date_to,
        db=db,
        _=current_account,
    )


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
    "/metrics/avg-response-time",
    summary="Average response time",
    description="Public metric showing the average minutes between submission and first acceptance",
)
def get_average_response_time(
    db: Session = Depends(get_db),
):
    """Return average response time in minutes (public endpoint)."""
    avg_minutes = ReportService.get_average_response_minutes(db)
    return {"average_response_minutes": avg_minutes}


@router.get(
    "/my-accepted-report",
    summary="Get my accepted report",
    description="Return the ID of the report currently assigned to the authenticated volunteer.",
)
def get_my_accepted_report(
    current_account: Account = Depends(get_current_account),
):
    """Return active report id (or null) for the current volunteer."""
    return {"report_id": current_account.active_report}


@router.get(
    "/my-completed-reports",
    response_model=List[ReportOut],
    summary="Get my completed reports",
    description="Return full report data for all reports that the authenticated volunteer has completed.",
)
def get_my_completed_reports(
    skip: int = Query(0, ge=0, description="Skip N reports"),
    limit: int = Query(100, ge=1, le=500, description="Max results"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account),
):
    """List completed reports for the current volunteer with full report details."""
    return ReportService.get_completed_reports_by_volunteer(
        db, current_account.email, skip=skip, limit=limit
    )


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


@router.post(
    "/{report_id}/accept",
    response_model=ReportOut,
    summary="Accept a report",
    description="Assign a report to the authenticated volunteer if it is not already taken."
)
def accept_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account),
):
    """Assign a report to the current volunteer, enforcing exclusivity."""
    return ReportService.assign_report_to_volunteer(db, current_account, report_id)


@router.post(
    "/active/cancel",
    response_model=ReportOut,
    summary="Cancel current assignment",
    description="Release the volunteer's active report so someone else can accept it."
)
def cancel_active_report(
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account),
):
    """Cancel the current volunteer's assignment."""
    return ReportService.cancel_active_report(db, current_account)


@router.post(
    "/active/complete",
    response_model=ReportOut,
    summary="Complete current assignment",
    description="Mark the active report as completed and increment volunteer statistics."
)
def complete_active_report(
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account),
):
    """Complete the current assignment and update counters."""
    return ReportService.complete_active_report(db, current_account)


# Deprecated: reporter-linked reports removed
