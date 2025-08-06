//FILE: src/utils/template.xml.token.ts

import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Generic token preset mode for actions that support token insertion.
 * - undefined: normal (use provided text)
 * - Any key from KM_TOKENS: sets text to the corresponding token value
 *
 * @example
 * // Token presets
 * tokenPreset: "ARandomUniqueID" // → "%RandomUUID%"
 * tokenPreset: "FrontApplicationName" // → "%Application%1%"
 * tokenPreset: "CurrentMouseLocation" // → "%CurrentMouse%"
 */
export type TokenPresetMode = undefined | keyof typeof KM_TOKENS;

/**
 * Resolves a token preset to its actual token value.
 * If tokenPreset is provided, returns the corresponding token from KM_TOKENS.
 * Otherwise, returns the original text.
 *
 * @param text - The original text value
 * @param tokenPreset - Optional token preset mode
 * @returns The resolved text (either original text or token value)
 *
 * @example
 * resolveTokenPreset("Hello", undefined) // → "Hello"
 * resolveTokenPreset("Hello", "ARandomUniqueID") // → "%RandomUUID%"
 * resolveTokenPreset("", "FrontApplicationName") // → "%Application%1%"
 */
export function resolveTokenPreset(
  text: string,
  tokenPreset?: TokenPresetMode,
): string {
  if (tokenPreset && tokenPreset in KM_TOKENS) {
    return KM_TOKENS[tokenPreset as keyof typeof KM_TOKENS];
  }
  return text;
}
