//FILE: src/utils/template.xml.variable.ts

import type {
  ProcessingMode,
  SetVariableWhere,
} from "../virtual_actions/types/types.data";
import type { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Preset modes for Set Variable action (convenience, not in KM UI).
 * - undefined: normal
 * - "delete": sets Text to "%Delete%" (KM GUI suggested option)
 * - "positionCursor": sets Text to "%|%" (KM GUI suggested option)
 * - Any key from KM_TOKENS: sets Text to the corresponding token value
 *
 * @example
 * // KM GUI suggested presets
 * presetMode: "delete" // → "%Delete%"
 * presetMode: "positionCursor" // → "%|%"
 *
 * // Token presets
 * presetMode: "ARandomUniqueID" // → "%RandomUUID%"
 * presetMode: "FrontApplicationName" // → "%Application%1%"
 * presetMode: "CurrentMouseLocation" // → "%CurrentMouse%"
 */
export type SetVariablePresetMode =
  | undefined
  | "delete"
  | "positionCursor"
  | keyof typeof KM_TOKENS;

/**
 * Renders the XML for the Set Variable action's ProcessingMode key.
 * Omits the key if mode is undefined ("Process Text Normally").
 * @param mode - Processing mode (undefined, "TextTokensOnly", "Nothing")
 * @returns Array of XML lines (empty if omitted)
 */
export function renderSetVariableProcessingModeXml(
  mode?: ProcessingMode,
): string[] {
  if (!mode) return [];
  return ["\t\t<key>ProcessingMode</key>", `\t\t<string>${mode}</string>`];
}

/**
 * Renders the XML for the Set Variable action's Where key.
 * Omits the key if where is undefined ("Set Variable").
 * @param where - Where mode (undefined, "Prepend", "Append")
 * @returns Array of XML lines (empty if omitted)
 */
export function renderSetVariableWhereXml(where?: SetVariableWhere): string[] {
  if (!where) return [];
  return ["\t\t<key>Where</key>", `\t\t<string>${where}</string>`];
}
