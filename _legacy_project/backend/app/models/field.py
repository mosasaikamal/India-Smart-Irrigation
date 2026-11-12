from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Field(Base):
    __tablename__ = "fields"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    area_ha = Column(Float, nullable=False, default=2.5) # Area in hectares
    crop_type = Column(String(50), nullable=False, default="Maize")
    growth_stage = Column(String(50), nullable=False, default="Mid-season") # Initial, Vegetative, Mid-season, Late
    soil_type = Column(String(50), nullable=False, default="Loamy")
    root_depth_m = Column(Float, nullable=False, default=0.8) # Root depth Zr in m
    volumetric_moisture = Column(Float, nullable=False, default=24.0) # Current theta (%)
    field_capacity = Column(Float, nullable=False, default=32.0) # FC (% vol)
    wilting_point = Column(Float, nullable=False, default=14.0) # PWP (% vol)
    allowable_depletion_fraction = Column(Float, nullable=False, default=0.55) # p
    application_efficiency = Column(Float, nullable=False, default=0.85) # Ea (e.g. 0.85 for drip, 0.75 sprinkler)
    pump_capacity_m3h = Column(Float, nullable=False, default=25.0) # m3/hour
    
    # Weather & environmental current conditions
    temperature_c = Column(Float, nullable=False, default=28.5)
    relative_humidity = Column(Float, nullable=False, default=45.0)
    wind_speed_ms = Column(Float, nullable=False, default=2.2) # m/s
    solar_radiation_mj = Column(Float, nullable=False, default=21.5) # MJ/m2/day
    rainfall_mm = Column(Float, nullable=False, default=0.0) # mm
    
    # Calculated root-zone depletion Dr (mm)
    current_depletion_mm = Column(Float, nullable=False, default=35.0)
    
    # Geospatial location
    latitude = Column(Float, nullable=False, default=36.7783)
    longitude = Column(Float, nullable=False, default=-119.4179)
    location_name = Column(String(100), nullable=False, default="Central Valley, CA")
    
    # Weather source: "LIVE_API", "USER_MANUAL", "SIMULATED"
    weather_source = Column(String(50), nullable=False, default="SIMULATED")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CropProfile(Base):
    __tablename__ = "crop_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop_name = Column(String(50), nullable=False, unique=True)
    initial_kc = Column(Float, nullable=False)
    mid_kc = Column(Float, nullable=False)
    end_kc = Column(Float, nullable=False)
    max_root_depth_m = Column(Float, nullable=False)
    default_p = Column(Float, nullable=False) # depletion fraction
    description = Column(Text, nullable=True)

class SoilProfile(Base):
    __tablename__ = "soil_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    soil_name = Column(String(50), nullable=False, unique=True)
    field_capacity_pct = Column(Float, nullable=False)
    wilting_point_pct = Column(Float, nullable=False)
    infiltration_rate_mmh = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
