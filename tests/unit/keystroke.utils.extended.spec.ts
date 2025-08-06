//FILE: tests/unit/keystroke.utils.extended.spec.ts

import { describe, it, expect } from "vitest";
import {
  processKeys,
  toAppleScript,
  normalizeAppleScriptShortcut,
  comboMask,
  parseShortcut,
} from "../../src/utils/utils.keystroke";

/**
 * Helper to unwrap the single mask→key pair.
 */
function unwrap(map: Record<number, number | null>) {
  const [[maskStr, key]] = Object.entries(map);
  return { mask: Number(maskStr), key };
}

describe("keystroke.utils – extended", () => {
  describe("explicit KeyCode:NN syntax", () => {
    it("accepts KeyCode:36 (Return)", () => {
      expect(processKeys("KeyCode:36")).toEqual({ modifier: 0, key: 36 });
      expect(unwrap(toAppleScript("KeyCode:36"))).toEqual({ mask: 0, key: 36 });
    });

    it("distinguishes single-digit '1' (Digit1) from 'KeyCode:1'", () => {
      // '1' should map to Digit1 key code (18)
      expect(processKeys("1")).toEqual({ modifier: 0, key: 18 });
      // explicit raw keycode 1
      expect(processKeys("KeyCode:1")).toEqual({ modifier: 0, key: 1 });
    });

    it("multi-digit numeric without prefix becomes raw key code (e.g. '36')", () => {
      expect(processKeys("36")).toEqual({ modifier: 0, key: 36 });
    });

    it("single-digit numeric with prefix still raw (KeyCode:7)", () => {
      expect(processKeys("KeyCode:7")).toEqual({ modifier: 0, key: 7 });
    });

    it("throws if raw key code is out of range", () => {
      expect(() => normalizeAppleScriptShortcut(999)).toThrow(/out of range/i);
      expect(() => processKeys("KeyCode:999")).toThrow(/Unsupported key token/); // numeric filtered later
    });
  });

  describe("character & event.code mapping precedence", () => {
    it("maps 'Digit8' directly", () => {
      expect(processKeys("Digit8")).toEqual({ modifier: 0, key: 28 });
    });
    it("maps single char '8' via Digit8 fallback (NOT raw 8)", () => {
      expect(processKeys("8")).toEqual({ modifier: 0, key: 28 });
    });
    it("maps letter single char 'a' → KeyA", () => {
      expect(processKeys("a")).toEqual({ modifier: 0, key: 0 });
    });
    it("maps explicit event.code 'KeyA'", () => {
      expect(processKeys("KeyA")).toEqual({ modifier: 0, key: 0 });
    });
  });

  describe("modifiers + explicit/raw combos", () => {
    it("Cmd+Digit5 → mask 256, key 23", () => {
      expect(processKeys("Cmd+Digit5")).toEqual({ modifier: 256, key: 23 });
    });
    it("Cmd+5 (single char) resolves to Digit5 route", () => {
      expect(processKeys("Cmd+5")).toEqual({ modifier: 256, key: 23 });
    });
    it("Cmd+36 (multi-digit numeric) treats 36 as raw keycode", () => {
      expect(processKeys("Cmd+36")).toEqual({ modifier: 256, key: 36 });
    });
    it("Cmd+KeyCode:36 (explicit raw) same result", () => {
      expect(processKeys("Cmd+KeyCode:36")).toEqual({ modifier: 256, key: 36 });
    });
  });

  describe("normalizeAppleScriptShortcut forms", () => {
    it("accepts number raw keyCode directly", () => {
      expect(normalizeAppleScriptShortcut(36)).toEqual({ 0: 36 });
    });
    it("accepts map passthrough", () => {
      const map = { 256: 2 };
      expect(normalizeAppleScriptShortcut(map)).toBe(map);
    });
    it("accepts pure modifiers only (creates null key)", () => {
      expect(normalizeAppleScriptShortcut("Cmd+Shift")).toEqual({ 768: null });
    });
    it("string numeric multi-digit chooses raw", () => {
      expect(normalizeAppleScriptShortcut("36")).toEqual({ 0: 36 });
    });
    it("string single digit chooses Digit mapping", () => {
      expect(normalizeAppleScriptShortcut("5")).toEqual({ 0: 23 });
    });
  });

  describe("error cases", () => {
    it("throws on unknown event.code style token", () => {
      expect(() => processKeys("KeyQQ")).toThrow(/Unsupported key token/);
    });
    it("throws on non-alphanumeric single char", () => {
      expect(() => processKeys("@")).toThrow(/Unsupported key token/);
    });
  });

  describe("parseShortcut edge coverage", () => {
    it("parses with trailing plus spaces", () => {
      const { modifiers, keyToken } = parseShortcut("Cmd +  Shift  + Digit1 ");
      expect(modifiers).toEqual(["Cmd", "Shift"]);
      expect(keyToken).toBe("Digit1");
    });
    it("returns empty keyToken for modifier-only sequence", () => {
      const { modifiers, keyToken } = parseShortcut("Cmd+Option+Shift");
      expect(modifiers).toEqual(["Cmd", "Option", "Shift"]);
      expect(keyToken).toBe("");
    });
  });

  describe("comboMask sanity", () => {
    it("matches manually built mask (Cmd+Control+Option+Shift)", () => {
      expect(comboMask("Cmd+Control+Option+Shift")).toBe(6912);
    });
  });
});
