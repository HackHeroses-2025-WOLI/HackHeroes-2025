"""Types endpoints - Availability types and Report types."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas import (
    AvailabilityTypeCreate,
    AvailabilityTypeOut,
    ReportTypeCreate,
    ReportTypeOut
)
from app.services.type_service import AvailabilityTypeService, ReportTypeService

router = APIRouter()


# ==================== AVAILABILITY TYPE ====================

@router.get(
    "/availability",
    response_model=List[AvailabilityTypeOut],
    summary="Get availability types",
    description="Get all availability/accessibility types"
)
def get_all_availability_types(db: Session = Depends(get_db)):
    """Get all availability types."""
    types_list = AvailabilityTypeService.get_all(db)
    return types_list


@router.get(
    "/availability/{typ_id}",
    response_model=AvailabilityTypeOut,
    summary="Get availability type by ID",
    description="Get details for an availability type"
)
def get_availability_type_by_id(
    type_id: int,
    db: Session = Depends(get_db)
):
    """Get availability type by ID."""
    type_ = AvailabilityTypeService.get_by_id(db, type_id)
    if not type_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability type with ID {type_id} not found"
        )
    return type_


@router.post(
    "/availability",
    response_model=AvailabilityTypeOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create availability type",
    description="Create a new availability type"
)
def create_availability_type(
    typ_data: AvailabilityTypeCreate,
    db: Session = Depends(get_db)
):
    """Create a new availability type."""
    new_type = AvailabilityTypeService.create(db, typ_data)
    return new_type


# ==================== REPORT TYPE ====================

@router.get(
    "/report_types",
    response_model=List[ReportTypeOut],
    summary="Get report types",
    description="Get all report types"
)
def get_all_report_types(db: Session = Depends(get_db)):
    """Get all report types."""
    types_list = ReportTypeService.get_all(db)
    return types_list


@router.get(
    "/report_types/{typ_id}",
    response_model=ReportTypeOut,
    summary="Get report type by ID",
    description="Get details for a report type"
)
def get_report_type_by_id(
    type_id: int,
    db: Session = Depends(get_db)
):
    """Get report type by ID."""
    type_ = ReportTypeService.get_by_id(db, type_id)
    if not type_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report type with ID {type_id} not found"
        )
    return type_


@router.post(
    "/report_types",
    response_model=ReportTypeOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create report type",
    description="Create a new report type"
)
def create_report_type(
    typ_data: ReportTypeCreate,
    db: Session = Depends(get_db)
):
    """Create a new report type."""
    new_type = ReportTypeService.create(db, typ_data)
    return new_type
