import json
from typing import Dict, Any, List, Optional
from backend.app.schemas.rule_schemas import (
    RuleSchema,
    RuleConditionSchema,
    RuleEvaluationItem,
    RuleExecutionTraceResponse
)

DEFAULT_RULES: List[RuleSchema] = [
    RuleSchema(
        id="rule-trig-01",
        code="R-TRIG-01",
        name="Depletion Exceeds Readily Available Water (RAW)",
        category="Triggering",
        conditions=[
            RuleConditionSchema(field="depletion_dr_mm", operator=">", value=0.0) # Evaluated against dynamic raw_mm
        ],
        conclusion="Root zone depletion has passed the no-stress threshold. Plant will experience water stress if not irrigated.",
        action="TRIGGER_IRRIGATION",
        priority=2,
        is_active=True,
        explanation="When Dr > RAW, soil moisture tension rises and stomatal conductance decreases, reducing photosynthesis."
    ),
    RuleSchema(
        id="rule-rain-01",
        code="R-RAIN-01",
        name="Heavy Rainfall Postponement",
        category="Postponement",
        conditions=[
            RuleConditionSchema(field="forecast_rain_24h_mm", operator=">=", value=10.0)
        ],
        conclusion="Substantial rainfall forecasted within 24 hours. Irrigation postponed to prevent runoff and deep percolation losses.",
        action="POSTPONE_RAIN",
        priority=1,
        is_active=True,
        explanation="Applying irrigation before rainfall saturates the root zone and forces subsequent precipitation to be lost to deep percolation."
    ),
    RuleSchema(
        id="rule-crit-01",
        code="R-CRIT-01",
        name="Critical Soil Depletion Safety Override",
        category="Critical",
        conditions=[
            RuleConditionSchema(field="depletion_ratio_taw", operator=">=", value=0.85)
        ],
        conclusion="Soil moisture approaching Permanent Wilting Point (85%+ TAW depleted). Emergency deficit pulse mandated.",
        action="EMERGENCY_WATER",
        priority=1,
        is_active=True,
        explanation="Crop survival threatened by acute cellular dehydration. Rapid refilling is essential to avoid permanent tissue damage."
    ),
    RuleSchema(
        id="rule-sat-01",
        code="R-SAT-01",
        name="Soil Saturation / Anaerobic Lockout",
        category="Saturation",
        conditions=[
            RuleConditionSchema(field="volumetric_moisture_pct", operator=">=", value=32.0)
        ],
        conclusion="Root zone is at or above Field Capacity. Any additional irrigation causes root hypoxia and leaching.",
        action="BLOCK_SATURATION",
        priority=1,
        is_active=True,
        explanation="Saturated soils lack oxygen in the macropores, inhibiting root respiration and nutrient uptake."
    ),
    RuleSchema(
        id="rule-prio-01",
        code="R-PRIO-01",
        name="Flowering / Reproductive Stage Priority Boost",
        category="Priority",
        conditions=[
            RuleConditionSchema(field="crop_stage", operator="==", value="Flowering"),
            RuleConditionSchema(field="depletion_ratio_raw", operator=">=", value=0.70)
        ],
        conclusion="Flowering stage is highly sensitive to water deficit (Ky > 1.0). Early irrigation refill recommended.",
        action="BOOST_PRIORITY",
        priority=3,
        is_active=True,
        explanation="Yield response factor during flowering is highest. Mild stress during pollination can lead to irreversible flower abortion."
    ),
    RuleSchema(
        id="rule-sens-01",
        code="R-SENS-01",
        name="Sensor Range Anomaly / Disconnection Validation",
        category="Sensor",
        conditions=[
            RuleConditionSchema(field="volumetric_moisture_pct", operator="<", value=3.0)
        ],
        conclusion="Sensor reading is below physical wilting point limit for natural soils (<3%), indicating probable probe disconnection or air pocket.",
        action="SENSOR_INVALID_ALERT",
        priority=1,
        is_active=True,
        explanation="Unphysical telemetry readings must trigger fallback to modelled water balance and operator inspection."
    )
]

class AgriculturalRuleEngineService:
    """
    Evaluates rule conditions against structured field state facts.
    Produces complete execution audit logs with condition-by-condition match diagnostics.
    """

    @staticmethod
    def evaluate_condition(cond: RuleConditionSchema, facts: Dict[str, Any]) -> bool:
        field_name = cond.field
        if field_name not in facts:
            return False
        
        actual_val = facts[field_name]
        expected_val = cond.value
        op = cond.operator
        
        try:
            if op == "<":
                return float(actual_val) < float(expected_val)
            elif op == "<=":
                return float(actual_val) <= float(expected_val)
            elif op == ">":
                return float(actual_val) > float(expected_val)
            elif op == ">=":
                return float(actual_val) >= float(expected_val)
            elif op == "==":
                return str(actual_val).lower() == str(expected_val).lower()
            elif op == "!=":
                return str(actual_val).lower() != str(expected_val).lower()
        except Exception:
            return False
        return False

    @classmethod
    def evaluate_all(
        cls,
        field_id: str,
        facts: Dict[str, Any],
        active_rules: Optional[List[RuleSchema]] = None
    ) -> RuleExecutionTraceResponse:
        rules_to_run = active_rules if active_rules is not None else DEFAULT_RULES
        
        fired: List[RuleEvaluationItem] = []
        unfired: List[RuleEvaluationItem] = []
        
        for rule in rules_to_run:
            if not rule.is_active:
                continue
            
            # Special dynamic condition check for R-TRIG-01
            all_matched = True
            cond_diagnostics = []
            
            if rule.code == "R-TRIG-01":
                dr = facts.get("depletion_dr_mm", 0.0)
                raw = facts.get("raw_mm", 50.0)
                matched = dr > raw
                cond_diagnostics.append({
                    "field": "depletion_dr_mm vs raw_mm",
                    "actual": dr,
                    "threshold": raw,
                    "matched": matched
                })
                all_matched = matched
            elif rule.code == "R-SAT-01":
                moist = facts.get("volumetric_moisture_pct", 0.0)
                fc = facts.get("field_capacity_pct", 32.0)
                matched = moist >= fc
                cond_diagnostics.append({
                    "field": "volumetric_moisture_pct vs field_capacity_pct",
                    "actual": moist,
                    "threshold": fc,
                    "matched": matched
                })
                all_matched = matched
            else:
                for cond in rule.conditions:
                    res = cls.evaluate_condition(cond, facts)
                    cond_diagnostics.append({
                        "field": cond.field,
                        "operator": cond.operator,
                        "expected": cond.value,
                        "actual": facts.get(cond.field),
                        "matched": res
                    })
                    if not res:
                        all_matched = False
            
            item = RuleEvaluationItem(
                rule_id=rule.id,
                code=rule.code,
                name=rule.name,
                category=rule.category,
                matched=all_matched,
                action=rule.action,
                priority=rule.priority,
                matched_conditions=cond_diagnostics,
                explanation=rule.explanation
            )
            
            if all_matched:
                fired.append(item)
            else:
                unfired.append(item)
        
        # Sort fired by priority ascending (1 is highest priority)
        fired.sort(key=lambda r: r.priority)
        
        top_action = fired[0].action if fired else "HOLD_MONITORING"
        top_explanation = fired[0].explanation if fired else "All agronomic thresholds are currently within safe optimal ranges."
        
        return RuleExecutionTraceResponse(
            field_id=field_id,
            timestamp=facts.get("timestamp", "NOW"),
            facts_evaluated=facts,
            rules_fired=fired,
            rules_unfired=unfired,
            top_recommended_action=top_action,
            explanation=top_explanation
        )
