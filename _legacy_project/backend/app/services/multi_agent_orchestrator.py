import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from backend.app.schemas.agent_schemas import (
    AgentStateSchema,
    AgentMessageSchema,
    BlackboardStateResponse
)
from backend.app.schemas.weather_schemas import DailyForecastItem
from backend.app.services.soil_water_balance import SoilWaterBalanceService
from backend.app.services.agricultural_rule_engine import AgriculturalRuleEngineService
from backend.app.services.irrigation_calculator import IrrigationCalculatorService
from backend.app.services.schedule_optimizer import ScheduleOptimizerService, BeamSearchInput

class MultiAgentOrchestratorService:
    """
    Coordinates 6 logical autonomous agents via a shared blackboard context.
    Executes conflict detection, supervisor arbitration, and enforces mandatory
    human sign-off before physical actuation.
    """

    @classmethod
    def execute_workflow(
        cls,
        field_id: str,
        field_name: str,
        area_ha: float,
        crop_type: str,
        growth_stage: str,
        soil_type: str,
        root_depth_m: float,
        volumetric_moisture: float,
        fc_pct: float,
        pwp_pct: float,
        default_p: float,
        kc: float,
        application_efficiency: float,
        pump_capacity_m3h: float,
        current_dr_mm: float,
        forecast: List[DailyForecastItem]
    ) -> BlackboardStateResponse:
        run_id = f"run-{uuid.uuid4().hex[:8]}"
        timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        
        agents: List[AgentStateSchema] = []
        messages: List[AgentMessageSchema] = []
        
        taw = SoilWaterBalanceService.calculate_taw(fc_pct, pwp_pct, root_depth_m)
        raw, p_adj = SoilWaterBalanceService.calculate_raw(taw, default_p)
        
        # -------------------------------------------------------------
        # AGENT 1: Soil Monitoring Agent
        # -------------------------------------------------------------
        t0 = time.time()
        ks = SoilWaterBalanceService.calculate_water_stress_ks(current_dr_mm, taw, raw)
        dr_ratio = current_dr_mm / taw if taw > 0 else 0.0
        
        if dr_ratio >= 0.85:
            soil_action = "REQUEST_EMERGENCY_IRRIGATION"
            soil_urgency = "CRITICAL"
            soil_status = "ALERT"
            conf = 98.0
        elif current_dr_mm > raw:
            soil_action = "REQUEST_IRRIGATION"
            soil_urgency = "HIGH"
            soil_status = "EVALUATING"
            conf = 94.0
        elif current_dr_mm >= 0.7 * raw:
            soil_action = "MONITOR_DEFICIT"
            soil_urgency = "MEDIUM"
            soil_status = "MONITORING"
            conf = 90.0
        else:
            soil_action = "HOLD_OPTIMAL"
            soil_urgency = "LOW"
            soil_status = "IDLE"
            conf = 95.0
            
        soil_agent = AgentStateSchema(
            agent_id="soil_monitor",
            name="Soil Monitoring Agent",
            role="Tracks volumetric soil moisture, root zone depletion (Dr), and water stress (Ks)",
            status=soil_status,
            execution_time_ms=round((time.time() - t0) * 1000.0, 1),
            input_summary=f"Moisture: {volumetric_moisture}%, Dr: {current_dr_mm}mm, RAW: {raw}mm, TAW: {taw}mm",
            output_decision=f"Depletion at {round(dr_ratio*100,1)}% of TAW. Water stress factor Ks = {ks}.",
            confidence_score=conf,
            urgency=soil_urgency,
            proposed_action=soil_action,
            proposed_depth_mm=current_dr_mm,
            proposed_volume_m3=round(current_dr_mm * area_ha * 10.0, 1),
            reasoning=[
                f"Root zone TAW = {taw} mm, RAW = {raw} mm for {soil_type} soil with {root_depth_m}m root depth",
                f"Current depletion Dr = {current_dr_mm} mm {'exceeds' if current_dr_mm > raw else 'within'} RAW threshold",
                f"Crop stress index Ks = {ks} (1.0 = no stress, <1.0 = stomatal closure)"
            ]
        )
        agents.append(soil_agent)
        
        messages.append(AgentMessageSchema(
            sender="soil_monitor",
            recipient="supervisor",
            timestamp=timestamp_str,
            content=f"Telemetry indicates Dr={current_dr_mm}mm (RAW={raw}mm). Proposing {soil_action}.",
            sentiment="urgent" if soil_urgency in ["HIGH", "CRITICAL"] else "neutral"
        ))
        
        # -------------------------------------------------------------
        # AGENT 2: Weather Analysis Agent
        # -------------------------------------------------------------
        t0 = time.time()
        rain_24h = forecast[0].precipitation_mm if forecast else 0.0
        rain_48h = rain_24h + (forecast[1].precipitation_mm if len(forecast) > 1 else 0.0)
        max_temp_next3d = max([f.temp_max_c for f in forecast[:3]]) if forecast else 30.0
        
        if rain_24h >= 8.0:
            wx_action = "POSTPONE_RAIN_EXPECTED"
            wx_urgency = "HIGH"
            wx_status = "ALERT"
            wx_conf = 92.0
            wx_desc = f"Heavy rainfall ({rain_24h} mm) expected within 24 hours. Recommend delaying irrigation."
        elif rain_48h >= 12.0:
            wx_action = "POSTPONE_RAIN_EXPECTED"
            wx_urgency = "MEDIUM"
            wx_status = "EVALUATING"
            wx_conf = 85.0
            wx_desc = f"Rainfall total of {rain_48h} mm forecast in next 48h. Advise holding irrigation."
        elif max_temp_next3d >= 35.0:
            wx_action = "HEATWAVE_PRE_WATERING"
            wx_urgency = "MEDIUM"
            wx_status = "EVALUATING"
            wx_conf = 88.0
            wx_desc = f"Heatwave detected (Tmax {max_temp_next3d}°C). Recommend replenishing buffer."
        else:
            wx_action = "WEATHER_PERMISSIVE"
            wx_urgency = "LOW"
            wx_status = "MONITORING"
            wx_conf = 94.0
            wx_desc = "Forecast indicates clear dry conditions. Weather conditions permissive for irrigation."
            
        weather_agent = AgentStateSchema(
            agent_id="weather_analyst",
            name="Weather Analysis Agent",
            role="Forecast analysis, ET0 trend monitoring, and precipitation cancellation windows",
            status=wx_status,
            execution_time_ms=round((time.time() - t0) * 1000.0, 1),
            input_summary=f"Next 24h Rain: {rain_24h}mm, 48h Rain: {rain_48h}mm, Max Temp: {max_temp_next3d}°C",
            output_decision=wx_desc,
            confidence_score=wx_conf,
            urgency=wx_urgency,
            proposed_action=wx_action,
            proposed_depth_mm=0.0 if "POSTPONE" in wx_action else 15.0,
            proposed_volume_m3=0.0 if "POSTPONE" in wx_action else round(15.0 * area_ha * 10.0, 1),
            reasoning=[
                f"7-day Open-Meteo atmospheric forecast processed",
                f"24-hour rainfall projection: {rain_24h} mm (prob: {forecast[0].precipitation_probability_pct if forecast else 0}%)",
                f"Atmospheric evaporative demand peak ET0: {forecast[0].calculated_et0_mm if forecast else 5.0} mm/day"
            ]
        )
        agents.append(weather_agent)
        
        messages.append(AgentMessageSchema(
            sender="weather_analyst",
            recipient="supervisor",
            timestamp=timestamp_str,
            content=f"Weather evaluation complete. Rain 24h={rain_24h}mm. Action: {wx_action}.",
            sentiment="caution" if "POSTPONE" in wx_action else "neutral"
        ))
        
        # -------------------------------------------------------------
        # AGENT 3: Agricultural Rule Agent
        # -------------------------------------------------------------
        t0 = time.time()
        facts = {
            "depletion_dr_mm": current_dr_mm,
            "raw_mm": raw,
            "depletion_ratio_taw": round(dr_ratio, 2),
            "depletion_ratio_raw": round(current_dr_mm / raw, 2) if raw > 0 else 0.0,
            "forecast_rain_24h_mm": rain_24h,
            "volumetric_moisture_pct": volumetric_moisture,
            "field_capacity_pct": fc_pct,
            "crop_stage": growth_stage,
            "timestamp": timestamp_str
        }
        rule_trace = AgriculturalRuleEngineService.evaluate_all(field_id, facts)
        
        rule_agent = AgentStateSchema(
            agent_id="rule_evaluator",
            name="Agricultural Rule Agent",
            role="Evaluates expert IF-THEN agronomic rules, constraints, and physiological safety limits",
            status="CONSENSUS_REACHED" if rule_trace.rules_fired else "MONITORING",
            execution_time_ms=round((time.time() - t0) * 1000.0, 1),
            input_summary=f"Evaluated {len(rule_trace.rules_fired) + len(rule_trace.rules_unfired)} rules against 8 active field facts",
            output_decision=f"Top active rule: {rule_trace.rules_fired[0].code if rule_trace.rules_fired else 'None'} -> {rule_trace.top_recommended_action}",
            confidence_score=96.0,
            urgency="HIGH" if rule_trace.rules_fired and rule_trace.rules_fired[0].priority == 1 else "MEDIUM",
            proposed_action=rule_trace.top_recommended_action,
            proposed_depth_mm=current_dr_mm if rule_trace.top_recommended_action in ["TRIGGER_IRRIGATION", "EMERGENCY_WATER"] else 0.0,
            proposed_volume_m3=round(current_dr_mm * area_ha * 10.0, 1) if rule_trace.top_recommended_action in ["TRIGGER_IRRIGATION", "EMERGENCY_WATER"] else 0.0,
            reasoning=[f"[{r.code}] {r.name}: {r.action}" for r in rule_trace.rules_fired[:3]]
        )
        agents.append(rule_agent)
        
        messages.append(AgentMessageSchema(
            sender="rule_evaluator",
            recipient="supervisor",
            timestamp=timestamp_str,
            content=f"Rule engine fired {len(rule_trace.rules_fired)} rules. Highest priority recommendation: {rule_trace.top_recommended_action}.",
            sentiment="urgent" if rule_agent.urgency == "HIGH" else "neutral"
        ))
        
        # -------------------------------------------------------------
        # AGENT 4: Irrigation Planning Agent
        # -------------------------------------------------------------
        t0 = time.time()
        calc_res = IrrigationCalculatorService.calculate_requirement(
            field_id=field_id,
            area_ha=area_ha,
            current_dr_mm=current_dr_mm,
            fc_pct=fc_pct,
            pwp_pct=pwp_pct,
            root_depth_m=root_depth_m,
            default_p=default_p,
            application_efficiency=application_efficiency,
            pump_capacity_m3h=pump_capacity_m3h
        )
        
        plan_agent = AgentStateSchema(
            agent_id="irrigation_planner",
            name="Irrigation Planning Agent",
            role="Converts agronomic deficit into gross hydraulic depth, water volume (m3), and pump operating duration",
            status="EVALUATING",
            execution_time_ms=round((time.time() - t0) * 1000.0, 1),
            input_summary=f"Net depth: {calc_res.net_irrigation_depth_mm}mm, Ea: {application_efficiency}, Pump: {pump_capacity_m3h}m3/h",
            output_decision=f"Hydraulic requirement: Gross {calc_res.gross_irrigation_depth_mm}mm ({calc_res.irrigation_water_volume_m3}m³), Pump run: {calc_res.pump_operating_time_hours} hours",
            confidence_score=95.0,
            urgency=calc_res.recommendation_tier,
            proposed_action="DISPATCH_PUMP_SCHEDULE" if calc_res.gross_irrigation_depth_mm > 5.0 else "HOLD",
            proposed_depth_mm=calc_res.gross_irrigation_depth_mm,
            proposed_volume_m3=calc_res.irrigation_water_volume_m3,
            reasoning=[
                f"Gross depth = Net ({calc_res.net_irrigation_depth_mm}mm) / Ea ({application_efficiency}) = {calc_res.gross_irrigation_depth_mm} mm",
                f"Application water volume = {calc_res.gross_irrigation_depth_mm} mm * {area_ha} ha * 10 = {calc_res.irrigation_water_volume_m3} m³",
                f"Pump runtime at {pump_capacity_m3h} m³/h = {calc_res.pump_operating_time_hours} hours (off-peak window 04:00 - 08:00)"
            ]
        )
        agents.append(plan_agent)
        
        messages.append(AgentMessageSchema(
            sender="irrigation_planner",
            recipient="supervisor",
            timestamp=timestamp_str,
            content=f"Hydraulic dosing: Gross {calc_res.gross_irrigation_depth_mm}mm, Volume {calc_res.irrigation_water_volume_m3}m³, Runtime {calc_res.pump_operating_time_hours}h.",
            sentiment="neutral"
        ))
        
        # -------------------------------------------------------------
        # AGENT 5: Water Optimization Agent
        # -------------------------------------------------------------
        t0 = time.time()
        bs_inp = BeamSearchInput(
            field_id=field_id,
            horizon_days=7,
            beam_width=4,
            allow_rain_lookahead=True
        )
        bs_res = ScheduleOptimizerService.run_beam_search(
            inp=bs_inp,
            area_ha=area_ha,
            current_dr_mm=current_dr_mm,
            fc_pct=fc_pct,
            pwp_pct=pwp_pct,
            root_depth_m=root_depth_m,
            default_p=default_p,
            kc=kc,
            application_efficiency=application_efficiency,
            pump_capacity_m3h=pump_capacity_m3h,
            forecast=forecast
        )
        
        day1_plan = bs_res.recommended_schedule[0] if bs_res.recommended_schedule else None
        opt_agent = AgentStateSchema(
            agent_id="water_optimizer",
            name="Water Optimization Agent",
            role="Multi-day Beam Search schedule exploration, energy cost minimization, and baseline savings benchmarking",
            status="CONSENSUS_REACHED",
            execution_time_ms=round((time.time() - t0) * 1000.0, 1),
            input_summary=f"Beam Width: 4, Horizon: 7 days, Explored nodes: {bs_res.nodes_explored}",
            output_decision=f"Day 1 plan: {day1_plan.action_type if day1_plan else 'NO_IRRIGATION'} ({day1_plan.irrigation_depth_gross_mm if day1_plan else 0}mm). 7d Water Savings: {bs_res.water_savings_m3}m³ ({bs_res.water_savings_pct}%)",
            confidence_score=93.0,
            urgency="LOW",
            proposed_action=day1_plan.action_type if day1_plan else "NO_IRRIGATION",
            proposed_depth_mm=day1_plan.irrigation_depth_gross_mm if day1_plan else 0.0,
            proposed_volume_m3=day1_plan.water_volume_m3 if day1_plan else 0.0,
            reasoning=[
                f"Explored {bs_res.nodes_explored} candidate multi-day paths with beam width B=4",
                f"Benchmark against calendar baseline yields {bs_res.water_savings_m3} m³ saved ({bs_res.water_savings_pct}%)",
                f"Selected optimal path objective score: {bs_res.objective_score}"
            ]
        )
        agents.append(opt_agent)
        
        messages.append(AgentMessageSchema(
            sender="water_optimizer",
            recipient="supervisor",
            timestamp=timestamp_str,
            content=f"Beam search recommendation for Day 1: {opt_agent.proposed_action} ({opt_agent.proposed_depth_mm}mm). Baseline water savings: {bs_res.water_savings_pct}%.",
            sentiment="approval"
        ))
        
        # -------------------------------------------------------------
        # AGENT 6: Supervisor Agent (Conflict Resolution & Human Sign-off)
        # -------------------------------------------------------------
        t0 = time.time()
        conflict_detected = False
        conflict_details = None
        conflict_resolution = None
        
        # Conflict Detection Scenario:
        # Soil Agent wants to irrigate (Dr > RAW), but Weather Agent wants to postpone (rain >= 8mm)
        soil_demands_water = soil_agent.proposed_action in ["REQUEST_IRRIGATION", "REQUEST_EMERGENCY_IRRIGATION"]
        weather_wants_postpone = "POSTPONE" in weather_agent.proposed_action
        
        final_action = "HOLD_OPTIMAL"
        final_depth = 0.0
        final_volume = 0.0
        pump_runtime = 0.0
        
        if soil_demands_water and weather_wants_postpone:
            conflict_detected = True
            conflict_details = (
                f"CONFLICT DETECTED: Soil Monitoring Agent requested irrigation (Dr={current_dr_mm}mm), "
                f"but Weather Analysis Agent recommended postponement due to forecasted rainfall ({rain_24h}mm in 24h)."
            )
            
            # Arbitration Logic:
            # If depletion is at critical wilting hazard (Dr >= 0.85 TAW), apply emergency pulse (10mm) and postpone the rest
            if dr_ratio >= 0.85:
                conflict_resolution = (
                    "SUPERVISOR ARBITRATION: Depletion is at critical emergency level (>=85% TAW). "
                    "Overriding full rain postponement: Authorizing 10mm emergency deficit pulse to protect crop viability, "
                    "while retaining capacity to capture upcoming rainfall."
                )
                final_action = "EMERGENCY_PULSE_IRRIGATION"
                final_depth = 10.0
            else:
                conflict_resolution = (
                    "SUPERVISOR ARBITRATION: Root-zone depletion is moderate (Dr < 85% TAW). "
                    "Weather postponement upheld. Irrigation delayed 24 hours to utilize natural precipitation, "
                    "preventing deep percolation waste and saving water."
                )
                final_action = "POSTPONE_FOR_RAIN"
                final_depth = 0.0
        elif soil_demands_water:
            # No weather conflict, soil needs water
            final_action = "IRRIGATE_NOW"
            final_depth = calc_res.gross_irrigation_depth_mm
            conflict_resolution = "Consensus achieved: Soil deficit confirmed with permissive weather conditions."
        elif weather_agent.proposed_action == "HEATWAVE_PRE_WATERING":
            final_action = "PREVENTIVE_HEATWAVE_PULSE"
            final_depth = 12.0
            conflict_resolution = "Preventive buffering authorized for incoming extreme temperature surge."
        else:
            final_action = "NO_IRRIGATION_REQUIRED"
            final_depth = 0.0
            conflict_resolution = "Consensus achieved: Soil moisture optimal, no action required."
            
        final_volume = round(final_depth * area_ha * 10.0, 1)
        pump_runtime = round(final_volume / pump_capacity_m3h, 2) if pump_capacity_m3h > 0 else 0.0
        
        supervisor_agent = AgentStateSchema(
            agent_id="supervisor",
            name="Supervisor Agent",
            role="Central workflow coordinator, conflict detection, safety validation, and human sign-off manager",
            status="CONSENSUS_REACHED" if not conflict_detected else "ALERT",
            execution_time_ms=round((time.time() - t0) * 1000.0, 1),
            input_summary="Synthesized proposals from 5 sub-agents across shared blackboard",
            output_decision=f"Final Determination: {final_action} ({final_depth}mm, {final_volume}m³)",
            confidence_score=97.0 if not conflict_detected else 91.0,
            urgency="HIGH" if final_action in ["IRRIGATE_NOW", "EMERGENCY_PULSE_IRRIGATION"] else "LOW",
            proposed_action=final_action,
            proposed_depth_mm=final_depth,
            proposed_volume_m3=final_volume,
            reasoning=[
                f"Conflict status: {'Resolved via agronomic safety policy' if conflict_detected else 'No conflicts detected'}",
                f"Final action: {final_action}",
                f"Execution requires explicit human operator sign-off before hardware pump activation"
            ]
        )
        agents.append(supervisor_agent)
        
        messages.append(AgentMessageSchema(
            sender="supervisor",
            recipient="all",
            timestamp=timestamp_str,
            content=f"Supervisor arbitration complete. Final decision: {final_action} ({final_depth}mm). Awaiting operator authorization.",
            sentiment="urgent" if final_depth > 0 else "approval"
        ))
        
        summary = (
            f"Supervisor synthesized {len(agents)} autonomous agent inputs. "
            f"{conflict_resolution} "
            f"Proposed application: {final_depth} mm ({final_volume} m³ across {area_ha} ha, pump runtime {pump_runtime}h)."
        )
        
        return BlackboardStateResponse(
            run_id=run_id,
            field_id=field_id,
            timestamp=timestamp_str,
            agents=agents,
            messages=messages,
            supervisor_summary=summary,
            conflict_detected=conflict_detected,
            conflict_details=conflict_details,
            conflict_resolution=conflict_resolution,
            final_action=final_action,
            final_depth_mm=final_depth,
            final_volume_m3=final_volume,
            pump_hours=pump_runtime,
            human_approval_required=True,
            approval_status="PENDING" if final_depth > 0 else "APPROVED",
            approved_by=None
        )
