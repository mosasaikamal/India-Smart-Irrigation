import math
from typing import List, Optional
from backend.app.schemas.agronomy_schemas import (
    WaterBalanceStep,
    WaterBalanceResult,
    CropWaterBalanceDayInput
)

class SoilWaterBalanceService:
    """
    FAO-56 Root-Zone Daily Water Balance Engine.
    Tracks depletion Dr, readily available water RAW, total available water TAW,
    effective rainfall, deep percolation, capillary rise, and stress factor Ks.
    Reference: FAO-56 Chapter 8 (Allen et al., 1998).
    """

    @staticmethod
    def calculate_taw(fc_pct: float, pwp_pct: float, root_depth_m: float) -> float:
        """
        TAW = 1000 * (FC - PWP) * Zr
        Where FC and PWP are volumetric moisture contents (either % or m3/m3).
        """
        # Auto-normalize percentage vs decimal fraction
        fc_dec = fc_pct / 100.0 if fc_pct > 1.0 else fc_pct
        pwp_dec = pwp_pct / 100.0 if pwp_pct > 1.0 else pwp_pct
        
        # Physical constraint: FC must strictly exceed PWP
        if fc_dec <= pwp_dec:
            raise ValueError(
                f"Field capacity ({fc_pct}) must be strictly greater than permanent wilting point ({pwp_pct})."
            )
            
        # Protect against mm vs m confusion for root depth (e.g. 800mm vs 0.8m)
        zr = root_depth_m / 1000.0 if root_depth_m > 10.0 else root_depth_m
        if zr <= 0.0:
            raise ValueError(f"Root depth Zr must be strictly positive, got {root_depth_m}")
            
        taw = 1000.0 * (fc_dec - pwp_dec) * zr
        return max(0.1, round(taw, 2))

    @staticmethod
    def calculate_raw(taw_mm: float, default_p: float, etc_mm: float = 5.0) -> tuple:
        """
        RAW = p_adj * TAW
        p_adj = p + 0.04 * (5.0 - ETc), bounded between 0.1 and 0.8 (FAO-56 eq. 89).
        """
        p_val = default_p / 100.0 if default_p > 1.0 else default_p
        p_adj = p_val + (0.04 * (5.0 - max(0.0, etc_mm)))
        p_adj = max(0.1, min(0.8, p_adj))
        raw = p_adj * max(0.0, taw_mm)
        return round(raw, 2), round(p_adj, 3)

    @staticmethod
    def calculate_runoff_usda_scs(rainfall_mm: float, curve_number: float = 75.0) -> float:
        """
        USDA Soil Conservation Service (SCS) runoff model (FAO-56 Chapter 8 & USDA-NRCS NEH-4).
        S = (25400 / CN) - 254 (potential maximum retention in mm)
        Initial abstraction Ia = 0.2 * S
        If P > Ia: Runoff RO = (P - Ia)^2 / (P - Ia + S)
        """
        if rainfall_mm <= 0.0:
            return 0.0
        cn = max(30.0, min(98.0, curve_number))
        s = (25400.0 / cn) - 254.0
        ia = 0.2 * s
        if rainfall_mm <= ia:
            return 0.0
        ro = ((rainfall_mm - ia) ** 2) / (rainfall_mm - ia + s)
        return round(min(rainfall_mm, max(0.0, ro)), 2)

    @staticmethod
    def calculate_water_stress_ks(dr_mm: float, taw_mm: float, raw_mm: float) -> float:
        """
        FAO-56 water stress coefficient Ks (FAO-56 eq. 84).
        If Dr <= RAW: Ks = 1.0 (No stress)
        If Dr > RAW: Ks = (TAW - Dr) / (TAW - RAW)
        Bounded between 0.0 and 1.0.
        """
        if dr_mm <= raw_mm:
            return 1.0
        if dr_mm >= taw_mm:
            return 0.0
        denom = taw_mm - raw_mm
        if denom <= 0.001:
            return 0.0 if dr_mm > raw_mm else 1.0
        ks = (taw_mm - dr_mm) / denom
        return max(0.0, min(1.0, round(ks, 3)))

    @classmethod
    def simulate_multiday_balance(
        cls,
        field_id: str,
        initial_dr_mm: float,
        fc_pct: float,
        pwp_pct: float,
        root_depth_m: float,
        default_p: float,
        daily_inputs: List[CropWaterBalanceDayInput],
        application_efficiency: float = 0.85,
        curve_number: float = 75.0
    ) -> WaterBalanceResult:
        """
        Executes daily root-zone depletion balance:
        Dr(next) = Dr(prev) - (P - RO) - I_net - CR + ETc_adj + DP
        Subject to 0 <= Dr <= TAW.
        """
        taw = cls.calculate_taw(fc_pct, pwp_pct, root_depth_m)
        current_dr = max(0.0, min(taw, initial_dr_mm))
        
        # Normalize application efficiency
        ea = application_efficiency / 100.0 if application_efficiency > 1.0 else application_efficiency
        ea = max(0.3, min(1.0, ea))
        
        fc_val = fc_pct if fc_pct > 1.0 else fc_pct * 100.0
        pwp_val = pwp_pct if pwp_pct > 1.0 else pwp_pct * 100.0
        
        steps: List[WaterBalanceStep] = []
        total_p = 0.0
        total_peff = 0.0
        total_inet = 0.0
        total_dp = 0.0
        total_etc = 0.0
        stress_days = 0
        
        for d in daily_inputs:
            etc_pot = round(d.kc * d.et0_mm, 2)
            raw, p_adj = cls.calculate_raw(taw, default_p, etc_pot)
            
            # 1. Stress factor Ks
            ks = cls.calculate_water_stress_ks(current_dr, taw, raw)
            etc_adj = round(etc_pot * ks, 2)
            if ks < 0.99:
                stress_days += 1
            
            # 2. Precipitation and Runoff
            ro = cls.calculate_runoff_usda_scs(d.rainfall_mm, curve_number)
            p_infiltrated = max(0.0, d.rainfall_mm - ro)
            
            # 3. Net irrigation entering root zone
            i_net = round(d.irrigation_supplied_mm * ea, 2)
            
            # 4. Capillary rise (modeled as 0 if no shallow water table, or up to 0.5 mm/day)
            cr = 0.0
            if d.water_table_depth_m is not None and d.water_table_depth_m < 2.0:
                cr = min(1.0, 0.5 * (2.0 - d.water_table_depth_m))
            
            # 5. Inflow to root zone: (P - RO) + I_net + CR
            water_inflow = p_infiltrated + i_net + cr
            
            # 6. Deep percolation occurs if inflow exceeds current root-zone depletion capacity
            if water_inflow > current_dr:
                dp = round(water_inflow - current_dr, 2)
                effective_rain = round(min(p_infiltrated, current_dr), 2)
                intermediate_dr = 0.0
            else:
                dp = 0.0
                effective_rain = p_infiltrated
                intermediate_dr = current_dr - water_inflow
            
            # 7. Next depletion Dr after evapotranspiration
            next_dr = min(taw, max(0.0, intermediate_dr + etc_adj))
            next_dr = round(next_dr, 2)
            
            # 8. Volumetric soil moisture theta = FC - (Dr / (1000 * Zr)) * 100%
            zr = d.root_depth_m / 1000.0 if d.root_depth_m > 10.0 else d.root_depth_m
            moisture_deficit_pct = (next_dr / (1000.0 * zr)) * 100.0
            theta_pct = max(pwp_val, min(fc_val, fc_val - moisture_deficit_pct))
            theta_pct = round(theta_pct, 1)
            
            steps.append(WaterBalanceStep(
                day=d.day,
                dr_previous_mm=round(current_dr, 2),
                etc_mm=etc_pot,
                ks_stress_factor=ks,
                etc_adjusted_mm=etc_adj,
                rainfall_mm=round(d.rainfall_mm, 2),
                runoff_mm=ro,
                effective_rainfall_mm=effective_rain,
                irrigation_net_mm=i_net,
                capillary_rise_mm=round(cr, 2),
                deep_percolation_mm=dp,
                dr_next_mm=next_dr,
                volumetric_moisture_pct=theta_pct,
                is_stressed=(ks < 0.99)
            ))
            
            total_p += d.rainfall_mm
            total_peff += effective_rain
            total_inet += i_net
            total_dp += dp
            total_etc += etc_adj
            
            # Advance to next day
            current_dr = next_dr
        
        raw_val, p_adj_val = cls.calculate_raw(taw, default_p)
        return WaterBalanceResult(
            field_id=field_id,
            taw_mm=taw,
            raw_mm=raw_val,
            p_adjusted=p_adj_val,
            steps=steps,
            total_rainfall_mm=round(total_p, 2),
            total_effective_rainfall_mm=round(total_peff, 2),
            total_irrigation_net_mm=round(total_inet, 2),
            total_deep_percolation_mm=round(total_dp, 2),
            total_crop_et_mm=round(total_etc, 2),
            stress_days_count=stress_days,
            formula="Dr(t) = min(TAW, max(0, Dr(t-1) - (P - RO) - I_net - CR + ETc_adj + DP))",
            assumptions=[
                "Root-zone soil layer is treated as a single mass-conserving bucket of depth Zr",
                "Runoff RO calculated via USDA-SCS Curve Number methodology (CN=75 for cultivated field crops)",
                "Water entering root zone bounded by available storage capacity; surplus becomes deep percolation DP",
                "Water stress coefficient Ks linearly reduces potential ETc when Dr exceeds RAW"
            ]
        )
