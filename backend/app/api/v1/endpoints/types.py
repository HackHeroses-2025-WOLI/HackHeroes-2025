"""Types endpoints - expose fixed report categories."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import ReportTypeOut
from app.services.type_service import ReportTypeService

router = APIRouter()


@router.get(
    "/report_types",
    response_model=List[ReportTypeOut],
    summary="Get report categories",
    description="Return the predefined categories used while submitting reports"
)
def get_all_report_types(db: Session = Depends(get_db)):
    """Get all report types."""
    types_list = ReportTypeService.get_all(db)
    return types_list
