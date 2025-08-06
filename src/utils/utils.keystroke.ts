//FILE: src/utils/utils.keystroke.ts

/**
 * Keyboard Shortcut Utilities for macOS Automation
 *
 * This module provides functions for parsing, normalizing, and converting keyboard shortcuts
 * into AppleScript/Keyboard Maestro compatible formats. The main entry point is
 * {@link normalizeAppleScriptShortcut}, which accepts a shortcut in various forms (string, number,
 * or mask→key map) and returns a normalized map suitable for automation scripting.
 *
 * Key features:
 * - Parse human-readable javascript shortcut strings (e.g. "Cmd+Shift+KeyD")
 * - Convert to AppleScript modifier mask and key code
 * - Handle modifier aliases and canonicalization
 * - Utility functions for sorting, combining, and mapping modifiers
 * - Support for single-character keys and digit keys
 * - Handles passing in existing mask→key maps directly without modification for a seamless interface
 *
 * See also:
 * - keystroke.mapping.ts: Contains static tables for modifier aliases, key code mapping, and mask values.
 *  - Included converting from JavaScript `event.code`, and windows modifier aliases for convenience.
 *  - Directional modifers like "CmdLeft" and "OptRight" are flattened to non-directional variants
 *
 * Example usage:
 *   import { normalizeAppleScriptShortcut } from "./keystroke.utils";
 *   const shortcut = normalizeAppleScriptShortcut("Cmd+Option+O"); // { 2304: 31 }
 *
 * For lower-level utilities, see {@link processKeys}, {@link toAppleScript}, {@link comboMask}, etc.
 */

import {
  MacModifier,
  canonicalizeModifier,
  MAC_MODIFIER_CODES,
  MODIFIER_ALIASES,
  MODIFIER_COMBO_TO_CODE,
  toAppleScriptKeyCode,
} from "./utils.keystroke.mapping";

/* ---------------------- */
/* Interfaces / Types
/* ---------------------- */

/**
 * Represents the result of parsing a shortcut string.
 * @property modifiers - Array of canonical modifier names.
 * @property keyToken - The key portion of the shortcut (e.g. 'KeyD', 'A', 'Digit5').
 */
export interface ParsedShortcut {
  modifiers: MacModifier[];
  keyToken: string;
}

/**
 * Represents a shortcut in AppleScript format.
 * @property modifier - Numeric AppleScript modifier mask (0–6912).
 * @property key - Numeric AppleScript key code (0–255), or null for modifier-only shortcuts
 */
export interface AppleScriptShortcut {
  /** AppleScript modifier mask (0 – 6912) */
  modifier: number;
  /** AppleScript key code (0 – 255), or null for modifier-only shortcuts */
  key: number | null;
}

/* ---------------------- */
/* Functions
/* ---------------------- */

/**
 * Checks if a token is a recognized modifier (Cmd, Shift, Option, Control or any alias).
 * @param token - The string to test (e.g. 'Cmd', 'Alt', 'Control', 'Foo').
 * @returns True if the token is a modifier or alias, false otherwise.
 */
export function isModifier(token: string): boolean {
  return token in MODIFIER_ALIASES;
}

/**
 * Sorts an array of modifiers into canonical macOS order: Cmd → Option → Shift → Control.
 * @param mods - Array of unsorted modifier names (canonical or aliases).
 * @returns Sorted array of canonical modifier names.
 */
export function sortModifiers(mods: MacModifier[]): MacModifier[] {
  const order: MacModifier[] = ["Cmd", "Option", "Shift", "Control"];
  return [...mods].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

/**
 * Combines an array of modifiers into a single AppleScript modifier mask value.
 * @param mods - Array of canonical modifier names.
 * @returns Numeric mask (e.g. 768 for Cmd+Shift).
 */
export function buildModifierMask(mods: MacModifier[]): number {
  return mods.reduce((acc, m) => acc + MAC_MODIFIER_CODES[m], 0);
}

/**
 * Parses a shortcut string (e.g. 'Cmd+Shift+KeyD') into its modifier and key components.
 * @param shortcut - Shortcut string to parse.
 * @returns ParsedShortcut object with sorted modifiers and keyToken.
 */
export function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  const modifiers: MacModifier[] = [];
  let keyToken = "";

  for (const part of parts) {
    if (isModifier(part)) {
      modifiers.push(canonicalizeModifier(part) as MacModifier);
    } else {
      keyToken = part;
    }
  }

  return {
    modifiers: sortModifiers(modifiers),
    keyToken,
  };
}

/**
 * Converts a human-readable shortcut (e.g. 'Cmd+Shift+KeyD' or 'd')
 * into an AppleScriptShortcut object with modifier mask and key code.
 * Throws an Error if the key or modifiers are unknown.
 * @param shortcut - Shortcut string to process.
 * @returns AppleScriptShortcut object.
 */
export function processKeys(shortcut: string): AppleScriptShortcut {
  const { modifiers, keyToken } = parseShortcut(shortcut);

  // Compute modifier mask
  const modifierMask = buildModifierMask(modifiers);

  // Explicit KeyCode:NN optional syntax (always wins)
  let rawToken = keyToken;
  let explicitRaw = false;
  const keyCodePrefixMatch = /^KeyCode:(\d+)$/.exec(rawToken);
  if (keyCodePrefixMatch) {
    explicitRaw = true;
    rawToken = keyCodePrefixMatch[1];
  }

  // 1) Direct lookup (event.code style already, e.g. Digit1 / KeyA)
  let keyCode = !explicitRaw ? toAppleScriptKeyCode(rawToken) : undefined;

  // 2) Single-character alphanumeric → map to DigitX / KeyX
  if (!explicitRaw && keyCode === undefined && rawToken.length === 1) {
    const ch = rawToken.toUpperCase();
    const code = /[A-Z]/.test(ch)
      ? `Key${ch}`
      : /[0-9]/.test(ch)
        ? `Digit${ch}`
        : undefined;
    if (code) keyCode = toAppleScriptKeyCode(code);
  }

  // 3) Raw numeric keycode fallback:
  //    - explicit "KeyCode:NN"
  //    - OR multi-digit numeric string (length > 1 and all digits)
  if (
    keyCode === undefined &&
    /^\d+$/.test(rawToken) &&
    (explicitRaw || rawToken.length > 1)
  ) {
    const numeric = Number(rawToken);
    if (numeric >= 0 && numeric <= 255) {
      keyCode = numeric;
    }
  }

  // (Do *not* treat single-digit numeric string without prefix as raw code; already resolved above.)

  // 4. Give up if still undefined
  if (keyCode === undefined) {
    throw new Error(`Unsupported key token: "${keyToken}"`);
  }

  return { modifier: modifierMask, key: keyCode };
}

/**
 * Converts a shortcut string (e.g. 'Cmd+Shift+KeyD') into a map of modifier mask to key code.
 * Always returns an object with a single key-value pair: {modifierMask: keyCode}.
 * @param shortcut - Shortcut string to convert.
 * @returns Record<number, number> mapping modifier mask to key code.
 */
export function toAppleScript(shortcut: string): Record<number, number | null> {
  const { modifier, key } = processKeys(shortcut);
  // Always return the mask→key map, even when modifier === 0
  return { [modifier]: key };
}

/**
 * Returns the precomputed AppleScript modifier mask for a given combination string (e.g. 'Cmd+Option').
 * Throws an Error if the combination is not recognized.
 * @param combo - Modifier combination string (e.g. 'Cmd+Shift').
 * @returns Numeric mask value for the combination.
 */
export function comboMask(combo: string): number {
  const tokens = combo
    .split("+")
    .map((m) => m.trim())
    .filter(Boolean);

  // Validate all tokens are valid modifiers
  for (const token of tokens) {
    if (!isModifier(token)) {
      throw new Error(`Unknown modifier combination: "${combo}"`);
    }
  }

  const mods = tokens.map((m) => canonicalizeModifier(m) as MacModifier);
  const sorted = sortModifiers(mods).join("+");
  const val = MODIFIER_COMBO_TO_CODE[sorted];
  if (val !== undefined) return val;

  // Fallback: build mask dynamically (prevents need for exhaustive table entries)
  return buildModifierMask(sortModifiers(mods));
}

/**
 * Normalize any form of shortcut input into a ready-to-use AppleScript modifier mask → key code map.
 *
 * This is the main entry point for keystroke processing in kmjs. It accepts various input formats
 * and converts them to a standardized format suitable for AppleScript/Keyboard Maestro automation.
 *
 * **Supported Input Formats:**
 * - **String shortcuts**: Human-readable combinations like "Cmd+S", "Shift+KeyA", "Option+F1"
 * - **Single characters**: "a", "1", "A" (automatically mapped to KeyA, Digit1, etc.)
 * - **Event codes**: JavaScript event.code strings like "KeyA", "Digit1", "Space", "Enter"
 * - **Raw key codes**: Numeric values (0-255) representing AppleScript key codes
 * - **Explicit key codes**: "KeyCode:36" format for explicit raw key code specification
 * - **Modifier-only**: "Cmd", "Shift+Option" (returns null key with modifier mask)
 * - **Existing maps**: Pre-formatted {mask: keyCode} objects (returned as-is)
 *
 * **Modifier Support:**
 * - Cmd/Command/Meta (aliases supported)
 * - Shift
 * - Option/Alt (aliases supported)
 * - Control/Ctrl (aliases supported)
 * - All combinations: "Cmd+Shift+Option+Control"
 *
 * **Return Format:**
 * Returns a Record<number, number | null> where:
 * - Key: AppleScript modifier mask (0-6912)
 * - Value: AppleScript key code (0-255) or null for modifier-only shortcuts
 *
 * @param input - The keystroke input to normalize. Can be:
 *   - `string`: Human-readable shortcut like "Cmd+S" or "KeyA" or modifier-only like "Cmd"
 *   - `number`: Raw AppleScript key code (0-255)
 *   - `Record<number, number | null>`: Pre-formatted mask→key map (returned verbatim)
 *
 * @returns A normalized AppleScript-compatible map with modifier mask as key and key code as value.
 *   For modifier-only shortcuts, the value will be null.
 *
 * @throws {Error} When key code is out of valid range (0-255) or input format is invalid
 *
 * @example
 * ```typescript
 * // String shortcuts
 * normalizeAppleScriptShortcut("Cmd+S")           // { 256: 1 }
 * normalizeAppleScriptShortcut("Shift+KeyA")      // { 512: 0 }
 * normalizeAppleScriptShortcut("Cmd+Option+F1")   // { 2304: 122 }
 *
 * // Single characters (auto-mapped)
 * normalizeAppleScriptShortcut("a")               // { 0: 0 }
 * normalizeAppleScriptShortcut("1")               // { 0: 18 }
 *
 * // Event codes
 * normalizeAppleScriptShortcut("Space")           // { 0: 49 }
 * normalizeAppleScriptShortcut("Enter")           // { 0: 36 }
 *
 * // Raw key codes
 * normalizeAppleScriptShortcut(36)                // { 0: 36 }
 * normalizeAppleScriptShortcut("KeyCode:36")      // { 0: 36 }
 *
 * // Modifier-only (returns null key)
 * normalizeAppleScriptShortcut("Cmd")             // { 256: null }
 * normalizeAppleScriptShortcut("Shift+Option")    // { 2560: null }
 *
 * // Pre-formatted maps (returned as-is)
 * normalizeAppleScriptShortcut({ 256: 1 })       // { 256: 1 }
 * ```
 *
 * @see {@link processKeys} For the underlying string processing logic
 * @see {@link toAppleScript} For direct string-to-map conversion
 * @see {@link buildModifierMask} For modifier mask calculation
 */
export function normalizeAppleScriptShortcut(
  input: number | Record<number, number | null> | string,
): Record<number, number | null> {
  // Raw numeric keyCode (no modifiers) – treat as already-resolved
  if (typeof input === "number" && Number.isInteger(input)) {
    // Guard: ensure plausible keycode range (0–255 typical; KM uses <= 126 main keys, some higher fn keys)
    if (input < 0 || input > 255) {
      throw new Error(`Key code out of range: ${input}`);
    }
    return { 0: input };
  }
  // NOTE: numeric *string* forms are handled in processKeys():
  //  - Single digit "1" → Digit1 key (NOT raw code 1)
  //  - Multi-digit "36" → raw keyCode 36
  //  - "KeyCode:1"     → raw keyCode 1 (explicit override)

  // Already a mask→key map?
  if (
    typeof input === "object" &&
    input !== null &&
    Object.keys(input).length === 1 &&
    Object.entries(input).every(
      ([mask, key]) =>
        !isNaN(Number(mask)) && (typeof key === "number" || key === null),
    )
  ) {
    return input as Record<number, number | null>;
  }

  // If input is a string of just modifiers, allow mask→key map with key null
  if (typeof input === "string") {
    const parsed = parseShortcut(input);
    if (parsed.keyToken === "" && parsed.modifiers.length > 0) {
      const mask = buildModifierMask(parsed.modifiers);
      return { [mask]: null };
    }
  }

  // Otherwise treat as human-readable (or numeric) shortcut
  return toAppleScript(String(input));
}
