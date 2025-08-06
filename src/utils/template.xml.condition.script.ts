//FILE: src/utils/template.xml.condition.script.ts

import type { KMCondition } from "../virtual_actions/types/types.conditions";

/**
 * Normalises a ScriptCondition so IncludedVariables is always present.
 *
 * Rules:
 *  - If the user supplies IncludedVariables: use it verbatim.
 *  - If they set includeAllVariables flag: emit sentinel ["9999"].
 *  - If neither provided: emit [] (no variables).
 *
 * The helper property `includeAllVariables` is removed before serialisation.
 */
export function normaliseScriptCondition(raw: KMCondition): KMCondition {
  if (raw.ConditionType !== "Script") return raw;
  const c: any = { ...raw };

  if (Array.isArray(c.IncludedVariables)) {
    // Use explicit list exactly as given (empty / one / many / ["9999"])
  } else if (c.includeAllVariables === true) {
    c.IncludedVariables = ["9999"];
  } else {
    c.IncludedVariables = [];
  }

  delete c.includeAllVariables;
  return c as KMCondition;
}
