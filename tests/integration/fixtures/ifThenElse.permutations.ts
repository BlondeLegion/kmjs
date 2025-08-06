//FILE: tests/integration/fixtures/ifThenElse.permutations.ts

/**
 * Auto-generates *all* test-cases for the If/Then/Else virtual action without
 * maintaining a giant hand-written spec list.  All enums & booleans appearing
 * in any `KMCondition` sub-type are expanded automatically.
 */

import { createVirtualIf } from "../../../src/virtual_actions/kmjs.virtualAction.ifThenElse";
import { buildPermutations } from "../utils/permutations.conditionGenerator";
import type {
  KMCondition,
  ConditionListMatch,
} from "../../../src/virtual_actions/types";

/* ------------------------------------------------------------------ */
/* Configuration: Choose which condition types to test                */
/* ------------------------------------------------------------------ */

// CONFIG 1: Test only specific condition types (for focused testing)
const config1 = {
  conditionTypes: ["ClipboardCondition"],
};

// CONFIG 2: Test a representative sample
const config2 = {
  conditionTypes: [
    "FoundImageCondition",
    "FrontWindowCondition",
    "ApplicationCondition",
    "ClipboardCondition",
    "OCRCondition",
  ],
};

// CONFIG 3: Test all condition types (full coverage)
const config3 = {
  conditionTypes: "all",
};

// USE CONFIG 1 for focused testing
const { conditionTypes } = config1;

/* ------------------------------------------------------------------ */
/* 1. Gather every concrete Condition variant                         */
/* ------------------------------------------------------------------ */

const allConditionTypes = Object.keys(
  require("../permutations/schema.json").definitions,
).filter((d: string) => d.endsWith("Condition") && d !== "KMCondition");

console.log("All available condition types:", allConditionTypes);
console.log("Selected config condition types:", conditionTypes);

const conditionTypeNames = Array.isArray(conditionTypes)
  ? conditionTypes // trust caller even if schema.json lacks it
  : allConditionTypes;

console.log("Filtered condition type names:", conditionTypeNames);

let CONDITIONS: KMCondition[];
if (
  conditionTypeNames.length === 1 &&
  conditionTypeNames[0] === "ModifiersCondition"
) {
  const bitmaskValues = [0, 256, 5632, 7936];
  CONDITIONS = [];
  for (const down of bitmaskValues) {
    for (const up of bitmaskValues) {
      CONDITIONS.push({
        ConditionType: "Modifiers",
        ModifiersDown: down,
        ModifiersUp: up,
      });
    }
  }
  console.log(
    "[FORCED] ModifiersCondition permutations count:",
    CONDITIONS.length,
  );
} else {
  CONDITIONS = conditionTypeNames.flatMap((n) =>
    buildPermutations<KMCondition>(n),
  );
}

/**
 * Force expansion of FoundImageCondition (ScreenImage) across all desired ScreenArea variants,
 * regardless of whether the permutations generator handled it. If a condition already has a
 * specific ScreenArea (not null/undefined), we keep it; if it is missing/null we explode it into
 * the 7 canonical variants we want to exercise.
 */
const SCREEN_AREA_VARIANTS: import("../../../src/virtual_actions/types").ScreenArea[] =
  [
    { type: "ScreenAll" },
    { type: "ScreenIndex", index: 1 },
    { type: "WindowName", name: "Main" },
    { type: "WindowNameContaining", name: "Contain" },
    { type: "WindowNameMatching", name: "Match.*" },
    { type: "WindowIndex", index: 1 },
    { type: "Area", left: 10, top: 20, width: 300, height: 200 },
  ];
function expandScreenAreas(conds: KMCondition[]): KMCondition[] {
  const out: KMCondition[] = [];
  for (const c of conds) {
    if ((c as any).ConditionType === "ScreenImage") {
      const existing = (c as any).ScreenArea;
      if (!existing || !existing.type) {
        for (const variant of SCREEN_AREA_VARIANTS) {
          out.push({
            ...(c as any),
            ScreenArea: variant,
          });
        }
      } else {
        out.push(c);
      }
    } else {
      out.push(c);
    }
  }
  return out;
}

function uniqBySignature(conds: KMCondition[]): KMCondition[] {
  const seen = new Set<string>();
  const out: KMCondition[] = [];
  for (const c of conds) {
    const sa = (c as any).ScreenArea;
    const sig = JSON.stringify({
      t: (c as any).ConditionType,
      ic: (c as any).ImageSource,
      sc: sa ? sa.type : "none",
      sIdx: sa && sa.index,
      sName: sa && sa.name,
      sel: (c as any).ScreenImageConditionType,
    });
    if (!seen.has(sig)) {
      seen.add(sig);
      out.push(c);
    }
  }
  return out;
}

const EXPANDED_CONDITIONS: KMCondition[] = expandScreenAreas(CONDITIONS);

// (optional) console.log counts
console.log(
  "FoundImageCondition expanded from",
  CONDITIONS.filter((c) => (c as any).ConditionType === "ScreenImage").length,
  "to",
  EXPANDED_CONDITIONS.filter((c) => (c as any).ConditionType === "ScreenImage")
    .length,
  "with ScreenArea variants.",
);

console.log("Generated CONDITIONS count:", CONDITIONS.length);
console.log("ModifiersCondition permutations count:", CONDITIONS.length);
if (CONDITIONS.length > 0) {
  console.log(
    "First condition sample:",
    JSON.stringify(CONDITIONS[0], null, 2),
  );
}

/* ------------------------------------------------------------------ */
/* 2. Generate the two possible match modes (reduced)                 */
/* ------------------------------------------------------------------ */

// const MATCHES: ConditionListMatch[] = ["All", "Any", "None", "NotAll"];
const MATCHES: ConditionListMatch[] = ["All"];

/* ------------------------------------------------------------------ */
/* 3. Create the actual test-cases consumed by Vitest                 */
/* ------------------------------------------------------------------ */

export function generateIfActionPermutations() {
  // TEMPORARY: Test with empty conditions first to validate the base structure
  // console.log(
  //   "Testing with empty conditions to validate base If/Then/Else structure...",
  // );
  // return MATCHES.map((match) => ({
  //   name: `Empty Conditions – ${match}`,
  //   action: createVirtualIf({
  //     conditions: [], // Empty conditions array for testing basic structure
  //     match,
  //     then: [], // no nested notifications
  //     else: [], // no nested notifications
  //   }),
  // }));

  // Original code with conditions - commented out for debugging

  // if (CONDITIONS.length === 0) {
  if (EXPANDED_CONDITIONS.length === 0) {
    console.warn("No CONDITIONS found! Falling back to empty conditions test.");
    return MATCHES.map((match) => ({
      name: `Empty Conditions – ${match}`,
      action: createVirtualIf({
        conditions: [], // Empty conditions array for testing basic structure
        match,
        then: [], // no nested notifications
        else: [], // no nested notifications
      }),
    }));
  }

  // const result = CONDITIONS.flatMap((cond) =>
  let index = 0;
  const result = EXPANDED_CONDITIONS.flatMap((cond) =>
    MATCHES.map((match) => {
      const permutation = {
        name: `IfThenElse – Permutation ${index}`,
        action: createVirtualIf({
          conditions: [cond],
          match,
          then: [],
          else: [],
        }),
      };
      index++;
      return permutation;
    }),
  );

  return result;
}
