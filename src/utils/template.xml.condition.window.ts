//FILE: src/utils/template.xml.condition.window.ts

import type { KMCondition } from "../virtual_actions/types/types.conditions";

/* ──────────────────────────────────────────────────────────────────────────
 *  Helpers to coerce   FrontWindowCondition / AnyWindowCondition
 *  into the exact key/value surface Keyboard Maestro serialises.
 * ────────────────────────────────────────────────────────────────────────── */

const FRONT_OP_TITLE_NEEDED = new Set([
  "TitleIs",
  "TitleIsNot",
  "TitleContains",
  "TitleDoesNotContain",
  "TitleMatches",
  "TitleDoesNotMatch",
]);

const FRONT_OP_TITLE_OPTIONAL = new Set([
  "ExistsButTitleIsNot",
  "ExistsButTitleDoesNotContain",
  "ExistsButTitleDoesNotMatch",
]);

export function normaliseWindowCondition(raw: KMCondition): KMCondition {
  if (
    raw.ConditionType !== "FrontWindow" &&
    raw.ConditionType !== "AnyWindow"
  ) {
    return raw;
  }
  // Shallow-copy to avoid mutating the caller’s object
  const c: any = { ...raw };

  // 1. Ensure IsFrontApplication and Application are mutually-valid

  if (c.IsFrontApplication === undefined) c.IsFrontApplication = true;
  if (c.IsFrontApplication) {
    delete c.Application; // KM drops the dict entirely
  } else {
    // Guarantee an <Application><dict/></Application> – KM never serialises
    // a bare <dict/>
    if (!c.Application || Object.keys(c.Application).length === 0) {
      c.Application = {}; // empty dict is fine – template.xml will emit <dict/>
    }
  }

  // 2. Title key semantics (FrontWindow only)

  if (c.ConditionType === "FrontWindow") {
    const op = c.FrontWindowConditionType as string;
    if (FRONT_OP_TITLE_NEEDED.has(op)) {
      if (c.FrontWindowTitle === undefined) c.FrontWindowTitle = "Untitled";
    } else if (FRONT_OP_TITLE_OPTIONAL.has(op)) {
      if (c.FrontWindowTitle === undefined) c.FrontWindowTitle = "";
    } else {
      delete c.FrontWindowTitle; // KM omits key entirely
    }
  }

  // 3. AnyWindow always has AnyWindowTitle (may be empty string)

  if (c.ConditionType === "AnyWindow") {
    if (c.AnyWindowTitle === undefined) c.AnyWindowTitle = "";
  }
  return c;
}
