//FILE: src/utils/utils.keystroke.mapping.ts

/**
 * Mac-only keyboard → AppleScript mapping helpers
 *
 * Provides:
 * - Modifier aliases and canonicalization
 * - Canonical-name normalization
 * - JavaScript `event.code` → AppleScript key-code table
 * - Modifier-combo → AppleScript modifier-mask table
 *
 * Key-code data taken from the public domain reference
 * “Complete List of AppleScript Key Codes” by Christopher Kielty (2018).
 */

/* ---------------------- */
/* Interfaces / Types
/* ---------------------- */

export type MacModifier = "Cmd" | "Shift" | "Option" | "Control";

/* ---------------------- */
/* Functions
/* ---------------------- */

/**
 * Returns the canonical modifier name (“Cmd”, “Shift”, “Option”, “Control”),
 * or the original token if it is not recognized as a modifier.
 * @param token - Modifier or alias string.
 * @returns Canonical modifier name or original token.
 */
export function canonicalizeModifier(token: string): MacModifier | string {
  return MODIFIER_ALIASES[token] ?? token;
}

/**
 * Looks up the AppleScript key code for a given JavaScript `event.code` string.
 * @param code - JavaScript event.code string (e.g. 'KeyD', 'Digit5').
 * @returns AppleScript key code (number) or undefined if not mapped.
 */
export function toAppleScriptKeyCode(code: string): number | undefined {
  return JS_CODE_TO_AS_KEY_CODE[code];
}

/* ---------------------- */
/* Mappings
/* ---------------------- */

/**
 * Acceptable modifier aliases.
 * Maps various modifier names and aliases to their canonical form (Cmd, Shift, Option, Control).
 */
export const MODIFIER_ALIASES: Record<string, MacModifier> = {
  /* Command -------------------------------------------------------------- */
  Cmd: "Cmd",
  Command: "Cmd",
  Meta: "Cmd",
  CmdLeft: "Cmd",
  CmdRight: "Cmd",
  CommandLeft: "Cmd",
  CommandRight: "Cmd",
  MetaLeft: "Cmd",
  MetaRight: "Cmd",
  Win: "Cmd", // Windows key on Apple keyboards
  WinLeft: "Cmd", // Windows key on Apple keyboards
  WinRight: "Cmd", // Windows key on Apple keyboards
  Windows: "Cmd", // Windows key on Apple keyboards
  WindowsLeft: "Cmd", // Windows key on Apple keyboards
  WindowsRight: "Cmd", // Windows key on Apple keyboards
  /* Shift ---------------------------------------------------------------- */
  Shift: "Shift",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  /* Option / Alt --------------------------------------------------------- */
  Option: "Option",
  OptionLeft: "Option",
  OptionRight: "Option",
  Opt: "Option",
  OptLeft: "Option",
  OptRight: "Option",
  Alt: "Option",
  AltLeft: "Option",
  AltRight: "Option",
  /* Control -------------------------------------------------------------- */
  Ctrl: "Control",
  CtrlLeft: "Control",
  CtrlRight: "Control",
  Control: "Control",
  ControlLeft: "Control",
  ControlRight: "Control",
  macControl: "Control", // Adobe-specific alias
};

/**
 * Single-modifier → AppleScript mask values.
 * Maps canonical modifier names to their AppleScript mask values.
 */
export const MAC_MODIFIER_CODES: Record<MacModifier, number> = {
  Cmd: 256, // 0x0100
  Shift: 512, // 0x0200
  Option: 2048, // 0x0800
  Control: 4096, // 0x1000
};

/**
 * Pre-computed combination-mask table.
 * Maps modifier combination strings to their AppleScript mask values.
 */
export const MODIFIER_COMBO_TO_CODE: Record<string, number> = {
  "": 0,
  Cmd: 256,
  Shift: 512,
  "Cmd+Shift": 768,
  Option: 2048,
  "Cmd+Option": 2304,
  "Option+Shift": 2560,
  "Cmd+Option+Shift": 2816,
  Control: 4096,
  "Cmd+Control": 4352,
  "Control+Shift": 4608,
  "Cmd+Control+Shift": 4864,
  "Control+Option": 6144,
  "Cmd+Control+Option": 6400,
  "Control+Option+Shift": 6656,
  "Cmd+Control+Option+Shift": 6912,
};

/**
 * JavaScript event.code → AppleScript key code mapping.
 * Full static list for every key present on a standard Mac keyboard.
 */
export const JS_CODE_TO_AS_KEY_CODE: Record<string, number> = {
  /* 4.1 –– Alphanumeric row --------------------------------------------- */
  Backquote: 50, // ` ~
  Digit1: 18, // 1 !
  Digit2: 19, // 2 @
  Digit3: 20, // 3 #
  Digit4: 21, // 4 $
  Digit5: 23, // 5 %
  Digit6: 22, // 6 ^
  Digit7: 26, // 7 &
  Digit8: 28, // 8 *
  Digit9: 25, // 9 (
  Digit0: 29, // 0 )
  Minus: 27, // - _
  Equal: 24, // = +
  /* 4.2 –– QWERTY row ---------------------------------------------------- */
  KeyQ: 12,
  KeyW: 13,
  KeyE: 14,
  KeyR: 15,
  KeyT: 17,
  KeyY: 16,
  KeyU: 32,
  KeyI: 34,
  KeyO: 31,
  KeyP: 35,
  BracketLeft: 33, // [ {
  BracketRight: 30, // ] }
  Backslash: 42, // \ |
  /* 4.3 –– ASDF row ------------------------------------------------------ */
  KeyA: 0,
  KeyS: 1,
  KeyD: 2,
  KeyF: 3,
  KeyG: 5,
  KeyH: 4,
  KeyJ: 38,
  KeyK: 40,
  KeyL: 37,
  Semicolon: 41, // ; :
  Quote: 39, // ' "
  /* 4.4 –– ZXCV row ------------------------------------------------------ */
  KeyZ: 6,
  KeyX: 7,
  KeyC: 8,
  KeyV: 9,
  KeyB: 11,
  KeyN: 45,
  KeyM: 46,
  Comma: 43, // , <
  Period: 47, // . >
  Slash: 44, // / ?
  /* 4.5 –– Whitespace & editing ----------------------------------------- */
  Space: 49,
  Tab: 48,
  Enter: 36, // Return (main)
  NumpadEnter: 76, // Enter (numeric pad)
  Backspace: 51, // Delete ⌫ (backwards)
  Delete: 51, // alias for Backspace
  Escape: 53,
  CapsLock: 57,
  /* 4.6 –– Arrow / navigation ------------------------------------------- */
  ArrowLeft: 123,
  ArrowRight: 124,
  ArrowDown: 125,
  ArrowUp: 126,
  Home: 115,
  End: 119,
  PageUp: 116,
  PageDown: 121,
  /* 4.7 –– Function keys ------------------------------------------------- */
  F1: 122,
  F2: 120,
  F3: 99,
  F4: 118,
  F5: 96,
  F6: 97,
  F7: 98,
  F8: 100,
  F9: 101,
  F10: 109,
  F11: 103,
  F12: 111,
  F13: 105,
  F14: 107,
  F15: 113,
  F16: 106,
  F17: 64,
  F18: 79,
  F19: 80,
  F20: 90,
  /* 4.8 –– Numpad -------------------------------------------------------- */
  Numpad0: 82,
  Numpad1: 83,
  Numpad2: 84,
  Numpad3: 85,
  Numpad4: 86,
  Numpad5: 87,
  Numpad6: 88,
  Numpad7: 89,
  Numpad8: 91,
  Numpad9: 92,
  NumpadMultiply: 67,
  NumpadAdd: 69,
  NumpadSubtract: 78,
  NumpadDivide: 75,
  NumpadDecimal: 65,
  NumpadEqual: 81,
  NumLock: 71, // “Clear”
  /* 4.9 –– Misc system keys --------------------------------------------- */
  Insert: 114, // “Help” on Apple keyboards
  PrintScreen: 114, // same physical key as Help
  Pause: 131, // F16 top-function variant
};
