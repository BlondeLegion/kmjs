//FILE: tests/unit/keystroke.utils.spec.ts

import { describe, it, expect } from "vitest";
import { processKeys, toAppleScript } from "../../src/utils/utils.keystroke";
import {
  isModifier,
  sortModifiers,
  buildModifierMask,
  parseShortcut,
  comboMask,
} from "../../src/utils/utils.keystroke";

describe("keystroke.utils", () => {
  it("processes a pure letter key", () => {
    const out = processKeys("KeyD");
    expect(out).toEqual({ modifier: 0, key: 2 });
  });

  it("processes a single-character fallback", () => {
    const out = processKeys("d");
    expect(out).toEqual({ modifier: 0, key: 2 });
  });

  it("combines modifiers correctly", () => {
    expect(processKeys("Cmd+Shift+KeyD")).toEqual({
      modifier: 256 + 512,
      key: 2,
    });
  });

  it("throws on unknown key", () => {
    expect(() => processKeys("KeyZZ")).toThrow(/Unsupported key token/);
  });

  it("throws on unknown single-char key", () => {
    expect(() => processKeys("@")).toThrow(/Unsupported key token/);
  });

  it("toAppleScript returns a mask→key map", () => {
    expect(toAppleScript("Cmd+Shift+KeyD")).toEqual({ 768: 2 });
    expect(toAppleScript("KeyD")).toEqual({ 0: 2 });
  });

  it("identifies modifiers correctly", () => {
    expect(isModifier("Cmd")).toBe(true);
    expect(isModifier("Control")).toBe(true);
    expect(isModifier("Foo")).toBe(false);
  });

  it("sorts modifier arrays into Cmd→Option→Shift→Control", () => {
    const input = ["Control", "Shift", "Cmd", "Option"] as any;
    expect(sortModifiers(input)).toEqual(["Cmd", "Option", "Shift", "Control"]);
  });

  it("builds mask sums correctly", () => {
    const sum = buildModifierMask(["Cmd", "Shift", "Control"]);
    // 256 + 512 + 4096 = 4864
    expect(sum).toBe(4864);
  });

  it("parses a mixed shortcut string", () => {
    const { modifiers, keyToken } = parseShortcut("  Option + Cmd + KeyA ");
    expect(modifiers).toEqual(["Cmd", "Option"]);
    expect(keyToken).toBe("KeyA");
  });

  it("falls back on single-digit keys", () => {
    // Digit5 → AppleScript code 23
    expect(processKeys("5")).toEqual({ modifier: 0, key: 23 });
  });

  it("comboMask returns the precomputed mask or throws", () => {
    expect(comboMask("Cmd+Shift")).toBe(768);
    expect(() => comboMask("NotAMod")).toThrow(/Unknown modifier combination/);
  });
  it("comboMask accepts both canonical and legacy orderings for all modifiers", () => {
    expect(comboMask("Cmd+Control+Option+Shift")).toBe(6912);
    expect(comboMask("Cmd+Option+Shift+Control")).toBe(6912);
  });
});
