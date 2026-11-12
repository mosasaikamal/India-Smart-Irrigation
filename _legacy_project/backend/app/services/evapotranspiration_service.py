import math
from typing import Dict, Any, Tuple
from backend.app.schemas.agronomy_schemas import (
    PenmanMonteithInput,
    PenmanMonteithResult,
    IntermediateVariables,
    HargreavesInput,
    HargreavesResult
)

class EvapotranspirationService:
    """
    FAO-56 Penman-Monteith reference evapotranspiration (ET0) calculator
    and Hargreaves-Samani fallback.
    Reference: Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998).
    Crop evapotranspiration - Guidelines for computing crop water requirements -
    FAO Irrigation and drainage paper 56.
    """

    @staticmethod
    def saturation_vapour_pressure(t_celsius: float) -> float:
        """e0(T) in kPa (FAO-56 eq. 11)"""
        return 0.6108 * math.exp((17.27 * t_celsius) / (t_celsius + 237.3))

    @staticmethod
    def slope_vapour_pressure_curve(t_celsius: float) -> float:
        """Delta in kPa/°C at temperature T (FAO-56 eq. 13)"""
        e0 = EvapotranspirationService.saturation_vapour_pressure(t_celsius)
        return (4098.0 * e0) / ((t_celsius + 237.3) ** 2)

    @staticmethod
    def atmospheric_pressure(elevation_m: float) -> float:
        """Atmospheric pressure P in kPa for a given elevation z (FAO-56 eq. 7)"""
        return 101.3 * math.pow((293.0 - 0.0065 * elevation_m) / 293.0, 5.26)

    @staticmethod
    def psychrometric_constant(pressure_kpa: float) -> float:
        """Psychrometric constant gamma in kPa/°C (FAO-56 eq. 8)"""
        return 0.000665 * pressure_kpa

    @staticmethod
    def extraterrestrial_radiation(latitude_deg: float, day_of_year: int) -> Tuple[float, float, float]:
        """
        Calculates Ra (MJ/m2/day), dr (inverse relative distance Earth-Sun),
        and delta (solar declination) (FAO-56 eqs. 21-28).
        """
        phi = math.radians(latitude_deg)
        dr = 1.0 + 0.033 * math.cos((2.0 * math.pi / 365.0) * day_of_year)
        delta = 0.409 * math.sin(((2.0 * math.pi / 365.0) * day_of_year) - 1.39)
        
        # Sunset hour angle omega_s (FAO-56 eq. 25)
        tan_tan = -math.tan(phi) * math.tan(delta)
        # Clamped to [-1.0, 1.0] for polar daylight edge cases
        tan_tan = max(-1.0, min(1.0, tan_tan))
        omega_s = math.acos(tan_tan)
        
        # Ra in MJ/m2/day (FAO-56 eq. 21)
        g_sc = 0.0820 # Solar constant MJ/m2/min
        ra = ((24.0 * 60.0) / math.pi) * g_sc * dr * (
            omega_s * math.sin(phi) * math.sin(delta) +
            math.cos(phi) * math.cos(delta) * math.sin(omega_s)
        )
        return max(0.0, ra), dr, delta

    @classmethod
    def calculate_penman_monteith(cls, inp: PenmanMonteithInput) -> PenmanMonteithResult:
        """
        Computes reference ET0 using full FAO-56 Penman-Monteith equation.
        Hardened with unit normalizations and physical boundary protections.
        """
        t_max = max(inp.temp_max_c, inp.temp_min_c)
        t_min = min(inp.temp_max_c, inp.temp_min_c)
        
        # Ensure T_mean is bounded within [t_min, t_max] or defaulted to midpoint (FAO-56 eq. 9)
        t_mean = inp.temp_mean_c
        if not (t_min <= t_mean <= t_max):
            t_mean = (t_max + t_min) / 2.0
            
        # Robust Relative Humidity Normalization (handle decimal fractions vs percentage)
        rh = inp.relative_humidity_pct
        if 0.0 < rh <= 1.0:
            rh = rh * 100.0 # Converted decimal fraction 0.65 -> 65.0%
        rh = max(1.0, min(100.0, rh)) # Clamped to physical range [1%, 100%]
        
        # Non-negative solar radiation and wind speed
        solar_rad = max(0.0, inp.solar_radiation_mj)
        u2 = max(0.0, inp.wind_speed_ms)
        
        # 1. Atmospheric parameters
        p_kpa = cls.atmospheric_pressure(inp.elevation_m)
        gamma = cls.psychrometric_constant(p_kpa)
        delta = cls.slope_vapour_pressure_curve(t_mean)
        
        # 2. Vapour pressures (FAO-56 eqs. 11, 12, 17, 19)
        e0_max = cls.saturation_vapour_pressure(t_max)
        e0_min = cls.saturation_vapour_pressure(t_min)
        es = (e0_max + e0_min) / 2.0
        
        # Actual vapour pressure ea from RH mean (FAO-56 eq. 19)
        ea = es * (rh / 100.0)
        vpd = max(0.0, es - ea)
        
        # 3. Radiation calculations
        ra, _, _ = cls.extraterrestrial_radiation(inp.latitude_deg, inp.day_of_year)
        rso = (0.75 + (2e-5 * inp.elevation_m)) * ra # Clear-sky solar radiation (FAO-56 eq. 37)
        rso = max(0.001, rso)
        
        # Net solar radiation Rns (FAO-56 eq. 38)
        albedo = max(0.05, min(0.40, inp.albedo))
        rns = (1.0 - albedo) * solar_rad
        
        # Cloudiness factor Rs/Rso bounded between 0.3 and 1.0 (FAO-56 page 52)
        rel_solar = min(1.0, max(0.3, solar_rad / rso))
        
        # Net longwave radiation Rnl (FAO-56 eq. 39)
        sigma = 4.903e-9 # Stefan-Boltzmann constant MJ/K4/m2/day
        t_max_k4 = (t_max + 273.16) ** 4
        t_min_k4 = (t_min + 273.16) ** 4
        mean_tk4 = (t_max_k4 + t_min_k4) / 2.0
        
        rnl = sigma * mean_tk4 * (0.34 - 0.14 * math.sqrt(max(0.0, ea))) * (1.35 * rel_solar - 0.35)
        rnl = max(0.0, rnl)
        
        # Net radiation Rn
        rn = rns - rnl
        g_flux = 0.0 # Soil heat flux density is ~0 for daily calculations (FAO-56 eq. 42)
        
        # 4. FAO-56 Penman-Monteith (FAO-56 eq. 6)
        num = (0.408 * delta * (rn - g_flux)) + (gamma * (900.0 / (t_mean + 273.0)) * u2 * (es - ea))
        denom = delta + (gamma * (1.0 + 0.34 * u2))
        
        et0 = max(0.0, num / denom)
        
        inter = IntermediateVariables(
            atmospheric_pressure_kpa=round(p_kpa, 3),
            psychrometric_constant_kpa_c=round(gamma, 4),
            delta_slope_vapour_pressure_kpa_c=round(delta, 4),
            saturation_vapour_pressure_es_kpa=round(es, 3),
            actual_vapour_pressure_ea_kpa=round(ea, 3),
            vapour_pressure_deficit_vpd_kpa=round(vpd, 3),
            extraterrestrial_radiation_ra_mj=round(ra, 2),
            clear_sky_radiation_rso_mj=round(rso, 2),
            net_solar_radiation_rns_mj=round(rns, 2),
            net_longwave_radiation_rnl_mj=round(rnl, 2),
            net_radiation_rn_mj=round(rn, 2),
            soil_heat_flux_g_mj=0.0
        )
        
        return PenmanMonteithResult(
            et0_mm_day=round(et0, 2),
            method_used="FAO-56 Penman-Monteith",
            formula="ET0 = [0.408*Δ*(Rn - G) + γ*(900/(T+273))*u2*(es - ea)] / [Δ + γ*(1 + 0.34*u2)]",
            intermediate_variables=inter,
            input_values=inp.model_dump(),
            units={
                "et0": "mm/day",
                "Rn": "MJ/m2/day",
                "G": "MJ/m2/day",
                "T": "°C",
                "u2": "m/s",
                "es, ea": "kPa",
                "Δ, γ": "kPa/°C"
            },
            assumptions=[
                "Hypothetical reference grass crop with assumed crop height 0.12m, fixed surface resistance 70 s/m, and albedo 0.23",
                "Daily soil heat flux G is negligible and assumed to equal 0.0 MJ/m2/day",
                "Wind speed measured or adjusted to standard 2.0 m height",
                "Net longwave radiation computed using standard FAO Stefan-Boltzmann equation"
            ]
        )

    @classmethod
    def calculate_hargreaves(cls, inp: HargreavesInput) -> HargreavesResult:
        """
        Hargreaves-Samani fallback when solar radiation, wind speed, or humidity
        are missing (FAO-56 eq. 52).
        ET0 = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra
        """
        # Temperature range serves as proxy for global solar radiation
        # If Tmax <= Tmin (e.g. sensor flatline or bad data), delta_t is 0, so ET0 = 0
        delta_t = max(0.0, inp.temp_max_c - inp.temp_min_c)
        t_mean = inp.temp_mean_c
            
        ra, _, _ = cls.extraterrestrial_radiation(inp.latitude_deg, inp.day_of_year)
        
        # Ra in mm/day equivalent: 1 MJ/m2/day ≈ 0.408 mm/day
        ra_mm = 0.408 * ra
        t_factor = max(0.0, t_mean + 17.8)
        et0 = 0.0023 * t_factor * math.sqrt(delta_t) * ra_mm
        et0 = max(0.0, et0)
        
        return HargreavesResult(
            et0_mm_day=round(et0, 2),
            method_used="Hargreaves-Samani (Fallback)",
            formula="ET0 = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra",
            ra_extraterrestrial_radiation_mj=round(ra, 2),
            delta_temperature_c=round(delta_t, 2),
            input_values=inp.model_dump(),
            units={
                "et0": "mm/day",
                "Ra": "MJ/m2/day (converted to mm/day equivalent via 0.408)",
                "T": "°C"
            },
            assumptions=[
                "Extraterrestrial radiation Ra calculated purely from latitude and day of year",
                "Temperature range (Tmax - Tmin) serves as a proxy for global solar radiation",
                "Used strictly as a fallback when solar radiation, wind speed, or relative humidity are unavailable"
            ]
        )
