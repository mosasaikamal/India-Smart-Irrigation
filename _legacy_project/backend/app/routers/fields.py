from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.field_schemas import (
    FieldResponse,
    FieldCreate,
    FieldUpdate,
    CropProfileSchema,
    SoilProfileSchema
)
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/fields", tags=["Field Management"])

@router.get("", response_model=List[FieldResponse])
def list_fields(db: Session = Depends(get_db)):
    return FieldService.get_all_fields(db)

@router.get("/meta/crops", response_model=List[CropProfileSchema])
def get_crop_profiles(db: Session = Depends(get_db)):
    return FieldService.get_crop_profiles(db)

@router.get("/meta/soils", response_model=List[SoilProfileSchema])
def get_soil_profiles(db: Session = Depends(get_db)):
    return FieldService.get_soil_profiles(db)

@router.get("/{field_id}", response_model=FieldResponse)
def get_field(field_id: str, db: Session = Depends(get_db)):
    field = FieldService.get_field_by_id(db, field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

@router.post("", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
def create_field(data: FieldCreate, db: Session = Depends(get_db)):
    return FieldService.create_field(db, data)

@router.put("/{field_id}", response_model=FieldResponse)
def update_field(field_id: str, updates: FieldUpdate, db: Session = Depends(get_db)):
    updated = FieldService.update_field(db, field_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Field not found")
    return updated

@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(field_id: str, db: Session = Depends(get_db)):
    success = FieldService.delete_field(db, field_id)
    if not success:
        raise HTTPException(status_code=404, detail="Field not found")
    return None
