from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.reporting_schemas import ReportSummaryResponse
from backend.app.services.reporting_service import ReportingService

router = APIRouter(prefix="/reports", tags=["Analytics & Reports"])

@router.get("/summary", response_model=ReportSummaryResponse)
def get_analytics_summary(db: Session = Depends(get_db)):
    """Provides high-level water accounting, savings vs baseline, and trends"""
    return ReportingService.generate_summary(db)

@router.get("/export/csv")
def export_csv_report(db: Session = Depends(get_db)):
    """Exports field water accounting data as a downloadable CSV stream"""
    csv_data = ReportingService.export_fields_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agro_intelligence_fields_report.csv"}
    )
