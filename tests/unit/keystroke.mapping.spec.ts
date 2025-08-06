//FILE: tests/unit/keystroke.mapping.spec.ts

import { describe, it, expect } from "vitest";
import {
  canonicalizeModifier,
  MAC_MODIFIER_CODES,
  MODIFIER_COMBO_TO_CODE,
  toAppleScriptKeyCode,
} from "../../src/utils/utils.keystroke.mapping";

describe("keystroke.mapping", () => {
  it("canonicalizes every alias to one of Cmd/Shift/Option/Control", () => {
    expect(canonicalizeModifier("Command")).toBe("Cmd");
    expect(canonicalizeModifier("Meta")).toBe("Cmd");
    expect(canonicalizeModifier("Alt")).toBe("Option");
    expect(canonicalizeModifier("macControl")).toBe("Control");
    expect(canonicalizeModifier("FooBar")).toBe("FooBar"); // pass-through
  });

  it("reports correct single-modifier masks", () => {
    expect(MAC_MODIFIER_CODES.Cmd).toBe(256);
    expect(MAC_MODIFIER_CODES.Shift).toBe(512);
    expect(MAC_MODIFIER_CODES.Option).toBe(2048);
    expect(MAC_MODIFIER_CODES.Control).toBe(4096);
  });

  it("builds the right combo mask", () => {
    expect(MODIFIER_COMBO_TO_CODE["Cmd+Shift"]).toBe(768);
    expect(MODIFIER_COMBO_TO_CODE[""]).toBe(0);
    expect(MODIFIER_COMBO_TO_CODE["Cmd+Control+Option+Shift"]).toBe(6912);
  });

  it("maps JS event.codes to AppleScript codes", () => {
    // e.g. KeyD → 2
    expect(toAppleScriptKeyCode("KeyD")).toBe(2);
    expect(toAppleScriptKeyCode("Digit5")).toBe(23);
    expect(toAppleScriptKeyCode("F12")).toBe(111);
    expect(toAppleScriptKeyCode("NonExistent")).toBeUndefined();
  });

  it("distinguishes digit token vs raw keycode fallback path", () => {
    // Digit1 as event.code
    expect(toAppleScriptKeyCode("Digit1")).toBe(18);
    // Raw numeric '1' is resolved later (NOT here) – ensure mapper itself does not mis-handle.
    expect(toAppleScriptKeyCode("1")).toBeUndefined();
  });
});
