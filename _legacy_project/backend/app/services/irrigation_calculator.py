from typing import Dict, Any, Tuple
from backend.app.schemas.agronomy_schemas import IrrigationRequirementCalculation
from backend.app.services.soil_water_balance import SoilWaterBalanceService

class IrrigationCalculatorService:
    """
    Calculates net & gross irrigation depths, application volume (m3 & Liters),
    and pump operating duration based on root-zone depletion Dr, TAW, RAW,
    application efficiency Ea, and pump capacity.
    """

    @staticmethod
    def calculate_net_depth(current_dr_mm: float) -> float:
        """
        Net irrigation depth Inet = max(0.0, Dr) to replenish depleted soil storage.
        """
        return max(0.0, round(current_dr_mm, 2))

    @staticmethod
    def calculate_gross_depth(net_depth_mm: float, application_efficiency: float) -> float:
        """
        Gross irrigation depth Igross = Inet / Ea.
        Handles both decimal fraction (0.85) and percentage (85.0).
        """
        ea = application_efficiency / 100.0 if application_efficiency > 1.0 else application_efficiency
        ea = max(0.30, min(1.0, ea))
        return round(max(0.0, net_depth_mm) / ea, 2)

    @staticmethod
    def calculate_water_volume(gross_depth_mm: float, area_ha: float) -> Tuple[float, float]:
        """
        Calculates volumetric water requirement:
        1 mm depth over 1 ha (10,000 m2) = 10 m3 water = 10,000 Liters.
        Volume (m3) = Depth (mm) * Area (ha) * 10
        Volume (Liters) = Volume (m3) * 1000
        """
        v_m3 = round(max(0.0, gross_depth_mm) * max(0.0, area_ha) * 10.0, 2)
        v_liters = round(v_m3 * 1000.0, 0)
        return v_m3, v_liters

    @staticmethod
    def calculate_pump_operating_time(volume_m3: float, pump_capacity_m3h: float) -> float:
        """
        Pump operating duration in hours:
        Operating_Time = Volume (m3) / Pump_Capacity (m3/h).
        Guards against zero or negative pump capacity.
        """
        if pump_capacity_m3h <= 0.0 or volume_m3 <= 0.0:
            return 0.0
        return round(volume_m3 / pump_capacity_m3h, 2)

    @classmethod
    def calculate_requirement(
        cls,
        field_id: str,
        area_ha: float,
        current_dr_mm: float,
        fc_pct: float,
        pwp_pct: float,
        root_depth_m: float,
        default_p: float,
        application_efficiency: float,
        pump_capacity_m3h: float
    ) -> IrrigationRequirementCalculation:
        taw = SoilWaterBalanceService.calculate_taw(fc_pct, pwp_pct, root_depth_m)
        raw, p_adj = SoilWaterBalanceService.calculate_raw(taw, default_p)
        
        # Physical clamp on depletion: cannot be negative or exceed TAW
        dr = max(0.0, min(taw, current_dr_mm))
        
        # Net & Gross Depths
        net_depth_mm = cls.calculate_net_depth(dr)
        gross_depth_mm = cls.calculate_gross_depth(net_depth_mm, application_efficiency)
        
        # Volume (m3 and Liters)
        volume_m3, volume_liters = cls.calculate_water_volume(gross_depth_mm, area_ha)
        
        # Pump operating time (hours)
        pump_hours = cls.calculate_pump_operating_time(volume_m3, pump_capacity_m3h)
        
        # Normalized Ea for reporting
        ea_norm = application_efficiency / 100.0 if application_efficiency > 1.0 else application_efficiency
        ea_norm = round(max(0.30, min(1.0, ea_norm)), 3)
        
        # Determine status tier
        if dr >= 0.85 * taw:
            tier = "CRITICAL"
        elif dr > raw:
            tier = "RECOMMENDED"
        elif dr >= 0.7 * raw:
            tier = "WATCH"
        else:
            tier = "NO_IRRIGATION"
        
        formula_audit = {
            "TAW": "TAW = 1000 * (FC - PWP) * Zr",
            "RAW": "RAW = p_adj * TAW",
            "Net Depth": "Net_Depth = max(0, Dr)",
            "Gross Depth": "Gross_Depth = Net_Depth / Ea",
            "Volume (m³)": "Volume_m3 = Gross_Depth_mm * Area_ha * 10",
            "Volume (L)": "Volume_L = Volume_m3 * 1000",
            "Pump Hours": "Operating_Time = Volume_m3 / Pump_Capacity_m3h"
        }
        
        intermediate_values = {
            "taw_mm": taw,
            "raw_mm": raw,
            "p_adj": p_adj,
            "dr_mm": dr,
            "depletion_pct_of_taw": round((dr / taw) * 100.0, 1),
            "depletion_pct_of_raw": round((dr / raw) * 100.0, 1) if raw > 0 else 0.0,
            "application_efficiency": ea_norm,
            "pump_capacity_m3h": pump_capacity_m3h
        }
        
        return IrrigationRequirementCalculation(
            field_id=field_id,
            area_ha=area_ha,
            current_depletion_dr_mm=dr,
            taw_mm=taw,
            raw_mm=raw,
            application_efficiency=ea_norm,
            pump_capacity_m3h=pump_capacity_m3h,
            net_irrigation_depth_mm=net_depth_mm,
            gross_irrigation_depth_mm=gross_depth_mm,
            irrigation_water_volume_m3=volume_m3,
            irrigation_water_volume_liters=volume_liters,
            pump_operating_time_hours=pump_hours,
            formula_audit=formula_audit,
            intermediate_values=intermediate_values,
            recommendation_tier=tier
        )
