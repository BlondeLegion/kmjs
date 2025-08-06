//FILE: src/utils/template.xml.condition.ts

import { kmKeyOrder } from "./utils.xml";
import { normaliseFoundImage, screenAreaToXml } from "./template.xml.ui";
import { normaliseWindowCondition } from "./template.xml.condition.window";
import { normaliseScriptCondition } from "./template.xml.condition.script";
import {
  normaliseOCRCondition,
  renderOCRImageScreenAreaXml,
} from "./template.xml.condition.ocr";
import { normalisePixelCondition } from "./template.xml.condition.pixel";
import type { KMCondition } from "../virtual_actions/types/types.conditions";

/**
 * Converts a single KMCondition object into its XML representation.
 * @param condition - The condition object to serialize.
 * @returns An XML string for the condition dictionary.
 */
export function conditionToXml(condition: KMCondition): string {
  // If the condition is FoundImageCondition (actually 'ScreenImage' in KM)
  if (condition.ConditionType === "ScreenImage") {
    // Normalize it first
    condition = normaliseFoundImage(condition);
  }
  // If the condition is OCRCondition, normalize it
  if (condition.ConditionType === "OCR") {
    condition = normaliseOCRCondition(condition);
  }
  // If the condition is FrontWindow or AnyWindow, normalize it for window conditions
  if (
    condition.ConditionType === "FrontWindow" ||
    condition.ConditionType === "AnyWindow"
  ) {
    condition = normaliseWindowCondition(condition);
  }
  // If the condition is PixelCondition, normalize it for valid type pairs
  if (condition.ConditionType === "Pixel") {
    condition = normalisePixelCondition(condition);
  }
  // If the condition is ScriptCondition, normalize it
  if (condition.ConditionType === "Script") {
    condition = normaliseScriptCondition(condition);
  }

  const lines: string[] = ["<dict>"];
  const orderedKeys = kmKeyOrder(Object.keys(condition), "condition");

  for (const key of orderedKeys) {
    const value = (condition as any)[key];
    if (value === undefined || value === null) continue;

    // Special handling for ImageScreenArea in OCRCondition
    if (
      condition.ConditionType === "OCR" &&
      key === "ImageScreenArea" &&
      typeof value === "object" &&
      "type" in value
    ) {
      renderOCRImageScreenAreaXml(value).forEach((l) => lines.push(l));
      continue;
    }

    // --- Special handling for ScreenArea / ImageScreenArea in ScreenImage conditions ---
    if (
      condition.ConditionType === "ScreenImage" &&
      (key === "ScreenArea" || key === "ImageScreenArea") &&
      typeof value === "object" &&
      "type" in value
    ) {
      // Re-use existing renderer so ordering for complex variants matches KM.
      const xml = screenAreaToXml(key, value);
      xml
        .split("\n")
        .filter(Boolean)
        .forEach((l) => lines.push("\t" + l));
      continue;
    }

    // Special handling for MouseButtonCondition.Pressed
    if (condition.ConditionType === "MouseButton" && key === "Pressed") {
      // Only serialize if false; KM omits if true
      if (value === false) {
        lines.push(`\t<key>Pressed</key>`);
        lines.push(`\t<false/>`);
      }
      continue;
    }

    // Generic rendering
    lines.push(`\t<key>${key}</key>`);
    if (typeof value === "string") {
      // KM uses a self-closing form for empty strings
      lines.push(value === "" ? "\t<string/>" : `\t<string>${value}</string>`);
    } else if (typeof value === "number") {
      lines.push(`\t<integer>${value}</integer>`);
    } else if (typeof value === "boolean") {
      lines.push(`\t${value ? "<true/>" : "<false/>"}`);
    } else if (Array.isArray(value)) {
      lines.push("\t<array>");
      value.forEach((item) => lines.push(`\t\t<string>${item}</string>`));
      lines.push("\t</array>");
    } else if (typeof value === "object") {
      // For nested dicts (Application, ScreenArea…) use canonical ordering
      lines.push("\t<dict>");
      const nestedKeys = kmKeyOrder(
        Object.keys(value),
        key === "Application" ? "application" : undefined,
      );
      for (const subKey of nestedKeys) {
        const subValue = value[subKey];
        if (subValue === undefined || subValue === null) continue;
        lines.push(`\t\t<key>${subKey}</key>`);
        lines.push(
          typeof subValue === "string" && subValue === ""
            ? "\t\t<string/>"
            : `\t\t<string>${subValue}</string>`,
        );
      }
      lines.push("\t</dict>");
    }
  }
  lines.push("</dict>");
  return lines.join("\n");
}
