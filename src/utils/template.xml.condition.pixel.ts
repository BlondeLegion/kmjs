//FILE: src/utils/template.xml.condition.pixel.ts

import type { KMCondition } from "../virtual_actions/types";

/**
 * Normalizes a PixelCondition to ensure only valid combinations of PixelConditionType and PixelConditionTypeGood are serialized.
 * - Ensures types are not identical.
 * - Ensures mutually exclusive pairs are not generated.
 * - Optionally corrects or skips invalid combinations.
 */
export function normalisePixelCondition(raw: KMCondition): KMCondition {
  if (raw.ConditionType !== "Pixel") return { ...raw };

  const PAIRS: Record<string, string> = {
    Is: "IsNot",
    IsNot: "IsBrighter",
    IsBrighter: "IsDarker",
    IsDarker: "IsMoreRed",
    IsMoreRed: "IsLessRed",
    IsLessRed: "IsMoreGreen",
    IsMoreGreen: "IsLessGreen",
    IsLessGreen: "IsMoreBlue",
    IsMoreBlue: "IsLessBlueIsNot",
    IsLessBlue: "IsLessBlue", // self-pair
  };

  const validBad = new Set(Object.values(PAIRS));
  const validGood = new Set(Object.keys(PAIRS));

  let {
    PixelConditionType: bad,
    PixelConditionTypeGood: good,
    ...rest
  } = raw as any;

  // 1) Fallback to known good values if either side is illegal
  if (!validBad.has(bad)) bad = "IsNot";
  if (!validGood.has(good)) good = "Is";

  // 2) Realign mismatched pairs
  if (PAIRS[good] !== bad) bad = PAIRS[good];

  return {
    ...(rest as KMCondition),
    ConditionType: "Pixel",
    PixelConditionType: bad,
    PixelConditionTypeGood: good,
  } as KMCondition;
}
