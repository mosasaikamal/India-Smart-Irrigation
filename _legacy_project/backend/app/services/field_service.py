from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.field import Field, CropProfile, SoilProfile
from backend.app.schemas.field_schemas import FieldCreate, FieldUpdate

DEFAULT_CROPS = [
    CropProfile(crop_name="Maize", initial_kc=0.30, mid_kc=1.20, end_kc=0.60, max_root_depth_m=1.0, default_p=0.55, description="Field corn / maize with high water productivity"),
    CropProfile(crop_name="Wheat", initial_kc=0.30, mid_kc=1.15, end_kc=0.40, max_root_depth_m=1.2, default_p=0.55, description="Spring / winter grain crop"),
    CropProfile(crop_name="Tomato", initial_kc=0.60, mid_kc=1.15, end_kc=0.80, max_root_depth_m=0.7, default_p=0.40, description="Drip-irrigated commercial solanaceous crop"),
    CropProfile(crop_name="Cotton", initial_kc=0.35, mid_kc=1.20, end_kc=0.70, max_root_depth_m=1.4, default_p=0.65, description="Deep-rooted fiber crop with drought tolerance"),
    CropProfile(crop_name="Potato", initial_kc=0.50, mid_kc=1.15, end_kc=0.75, max_root_depth_m=0.6, default_p=0.35, description="Shallow-rooted tuber sensitive to moisture deficit"),
    CropProfile(crop_name="Rice", initial_kc=1.05, mid_kc=1.20, end_kc=0.90, max_root_depth_m=0.5, default_p=0.20, description="Paddy / flood or aerobic irrigated rice")
]

DEFAULT_SOILS = [
    SoilProfile(soil_name="Sandy", field_capacity_pct=15.0, wilting_point_pct=6.0, infiltration_rate_mmh=50.0, description="Coarse sand, low retention, high infiltration"),
    SoilProfile(soil_name="Loamy", field_capacity_pct=31.0, wilting_point_pct=14.0, infiltration_rate_mmh=15.0, description="Balanced agricultural loam with high plant-available water"),
    SoilProfile(soil_name="Clay", field_capacity_pct=38.0, wilting_point_pct=22.0, infiltration_rate_mmh=5.0, description="Fine-textured clay, high water holding, slow drainage"),
    SoilProfile(soil_name="Sandy Loam", field_capacity_pct=22.0, wilting_point_pct=10.0, infiltration_rate_mmh=25.0, description="Light agricultural soil with moderate retention"),
    SoilProfile(soil_name="Clay Loam", field_capacity_pct=34.0, wilting_point_pct=18.0, infiltration_rate_mmh=8.0, description="Heavy agricultural soil with excellent retention")
]

DEFAULT_FIELDS = [
    Field(
        id="field-01",
        name="North Valley Maize Sector",
        area_ha=4.2,
        crop_type="Maize",
        growth_stage="Mid-season",
        soil_type="Loamy",
        root_depth_m=0.9,
        volumetric_moisture=22.0,
        field_capacity=31.0,
        wilting_point=14.0,
        allowable_depletion_fraction=0.55,
        application_efficiency=0.88,
        pump_capacity_m3h=35.0,
        temperature_c=29.0,
        relative_humidity=42.0,
        wind_speed_ms=2.1,
        solar_radiation_mj=22.5,
        rainfall_mm=0.0,
        current_depletion_mm=48.0, # Dr > RAW -> Triggers recommendation
        latitude=36.7783,
        longitude=-119.4179,
        location_name="Fresno, Central Valley CA",
        weather_source="SIMULATED"
    ),
    Field(
        id="field-02",
        name="East Basin Drip Tomatoes",
        area_ha=2.5,
        crop_type="Tomato",
        growth_stage="Flowering",
        soil_type="Sandy Loam",
        root_depth_m=0.6,
        volumetric_moisture=17.5,
        field_capacity=22.0,
        wilting_point=10.0,
        allowable_depletion_fraction=0.40,
        application_efficiency=0.92,
        pump_capacity_m3h=20.0,
        temperature_c=31.5,
        relative_humidity=38.0,
        wind_speed_ms=1.8,
        solar_radiation_mj=23.8,
        rainfall_mm=0.0,
        current_depletion_mm=26.0,
        latitude=34.0522,
        longitude=-118.2437,
        location_name="Salinas Valley, CA",
        weather_source="SIMULATED"
    ),
    Field(
        id="field-03",
        name="South Terraced Wheat Basin",
        area_ha=6.0,
        crop_type="Wheat",
        growth_stage="Vegetative",
        soil_type="Clay Loam",
        root_depth_m=0.8,
        volumetric_moisture=29.0,
        field_capacity=34.0,
        wilting_point=18.0,
        allowable_depletion_fraction=0.55,
        application_efficiency=0.78,
        pump_capacity_m3h=45.0,
        temperature_c=26.5,
        relative_humidity=52.0,
        wind_speed_ms=3.2,
        solar_radiation_mj=19.5,
        rainfall_mm=0.0,
        current_depletion_mm=28.0,
        latitude=39.7392,
        longitude=-104.9903,
        location_name="Weld County, CO",
        weather_source="SIMULATED"
    )
]

class FieldService:
    """Manages agricultural fields and parameter profiles"""

    @staticmethod
    def calculate_crop_coefficient(
        crop_name: str,
        growth_stage: str,
        initial_kc: Optional[float] = None,
        mid_kc: Optional[float] = None,
        end_kc: Optional[float] = None,
        wind_speed_ms: Optional[float] = None,
        rh_min_pct: Optional[float] = None,
        crop_height_m: Optional[float] = None
    ) -> float:
        """
        FAO-56 single crop coefficient calculation.
        Computes stage Kc with optional climate adjustment (FAO-56 eqs. 62 & 65).
        """
        crop_defaults = {
            "Maize": (0.30, 1.20, 0.60, 2.0),
            "Wheat": (0.30, 1.15, 0.40, 1.0),
            "Tomato": (0.60, 1.15, 0.80, 0.6),
            "Cotton": (0.35, 1.20, 0.70, 1.2),
            "Potato": (0.50, 1.15, 0.75, 0.6),
            "Rice": (1.05, 1.20, 0.90, 1.0)
        }
        
        defaults = crop_defaults.get(crop_name, (0.35, 1.15, 0.65, 1.0))
        kc_ini = initial_kc if initial_kc is not None else defaults[0]
        kc_mid = mid_kc if mid_kc is not None else defaults[1]
        kc_end = end_kc if end_kc is not None else defaults[2]
        height = crop_height_m if crop_height_m is not None else defaults[3]
        
        # Climate adjustment for mid and end Kc under non-standard wind/humidity (FAO-56 eq. 62 & 65)
        if wind_speed_ms is not None and rh_min_pct is not None and height > 0.1:
            u2 = max(1.0, min(6.0, wind_speed_ms))
            rh_min = max(20.0, min(80.0, rh_min_pct))
            adj = (0.04 * (u2 - 2.0) - 0.004 * (rh_min - 45.0)) * ((height / 3.0) ** 0.3)
            kc_mid = max(0.2, kc_mid + adj)
            kc_end = max(0.15, kc_end + adj)
            
        stage = (growth_stage or "").lower()
        if "init" in stage:
            return round(kc_ini, 3)
        elif "veg" in stage or "dev" in stage:
            return round((kc_ini + kc_mid) / 2.0, 3)
        elif "flow" in stage or "mid" in stage:
            return round(kc_mid, 3)
        elif "late" in stage or "end" in stage or "matur" in stage:
            return round(kc_end, 3)
        else:
            return round(kc_mid, 3)

    @classmethod
    def seed_initial_data(cls, db: Session):
        # Seed crop profiles
        if db.query(CropProfile).count() == 0:
            db.add_all(DEFAULT_CROPS)
            db.commit()
            
        # Seed soil profiles
        if db.query(SoilProfile).count() == 0:
            db.add_all(DEFAULT_SOILS)
            db.commit()
            
        # Seed default fields
        if db.query(Field).count() == 0:
            db.add_all(DEFAULT_FIELDS)
            db.commit()

    @classmethod
    def get_all_fields(cls, db: Session) -> List[Field]:
        return db.query(Field).all()

    @classmethod
    def get_field_by_id(cls, db: Session, field_id: str) -> Optional[Field]:
        return db.query(Field).filter(Field.id == field_id).first()

    @classmethod
    def create_field(cls, db: Session, data: FieldCreate) -> Field:
        f_id = data.id or f"field-{datetime.utcnow().strftime('%y%m%d%H%M%S')}"
        field_obj = Field(
            id=f_id,
            name=data.name,
            area_ha=data.area_ha,
            crop_type=data.crop_type,
            growth_stage=data.growth_stage,
            soil_type=data.soil_type,
            root_depth_m=data.root_depth_m,
            volumetric_moisture=data.volumetric_moisture,
            field_capacity=data.field_capacity,
            wilting_point=data.wilting_point,
            allowable_depletion_fraction=data.allowable_depletion_fraction,
            application_efficiency=data.application_efficiency,
            pump_capacity_m3h=data.pump_capacity_m3h,
            temperature_c=data.temperature_c,
            relative_humidity=data.relative_humidity,
            wind_speed_ms=data.wind_speed_ms,
            solar_radiation_mj=data.solar_radiation_mj,
            rainfall_mm=data.rainfall_mm,
            current_depletion_mm=data.current_depletion_mm,
            latitude=data.latitude,
            longitude=data.longitude,
            location_name=data.location_name,
            weather_source=data.weather_source
        )
        db.add(field_obj)
        db.commit()
        db.refresh(field_obj)
        return field_obj

    @classmethod
    def update_field(cls, db: Session, field_id: str, updates: FieldUpdate) -> Optional[Field]:
        f = cls.get_field_by_id(db, field_id)
        if not f:
            return None
        up_data = updates.dict(exclude_unset=True)
        for k, v in up_data.items():
            setattr(f, k, v)
        f.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(f)
        return f

    @classmethod
    def delete_field(cls, db: Session, field_id: str) -> bool:
        f = cls.get_field_by_id(db, field_id)
        if not f:
            return False
        db.delete(f)
        db.commit()
        return True

    @classmethod
    def get_crop_profiles(cls, db: Session) -> List[CropProfile]:
        return db.query(CropProfile).all()

    @classmethod
    def get_soil_profiles(cls, db: Session) -> List[SoilProfile]:
        return db.query(SoilProfile).all()
