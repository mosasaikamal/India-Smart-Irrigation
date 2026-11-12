from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from backend.app.database import Base

class WeatherCache(Base):
    __tablename__ = "weather_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    forecast_date = Column(String(20), nullable=False) # YYYY-MM-DD
    temp_max_c = Column(Float, nullable=False)
    temp_min_c = Column(Float, nullable=False)
    temp_mean_c = Column(Float, nullable=False)
    relative_humidity_pct = Column(Float, nullable=False)
    wind_speed_ms = Column(Float, nullable=False)
    solar_radiation_mj = Column(Float, nullable=False)
    precipitation_mm = Column(Float, nullable=False)
    precipitation_probability_pct = Column(Float, default=0.0)
    calculated_et0_mm = Column(Float, nullable=True)
    source = Column(String(50), nullable=False, default="LIVE_API") # LIVE_API, SIMULATED, USER_MANUAL
    fetched_at = Column(DateTime, default=datetime.utcnow)
