//FILE: tests/unit/keystroke.modifierOnly.spec.ts

import { describe, it, expect } from "vitest";
import { normalizeAppleScriptShortcut } from "../../src/utils/utils.keystroke";

describe("keystroke.modifierOnly", () => {
  it("supports single modifier-only keystrokes with null keys", () => {
    expect(normalizeAppleScriptShortcut("Cmd")).toEqual({ 256: null });
    expect(normalizeAppleScriptShortcut("Shift")).toEqual({ 512: null });
    expect(normalizeAppleScriptShortcut("Option")).toEqual({ 2048: null });
    expect(normalizeAppleScriptShortcut("Control")).toEqual({ 4096: null });
  });

  it("supports multi-modifier-only keystrokes with null keys", () => {
    expect(normalizeAppleScriptShortcut("Cmd+Shift")).toEqual({ 768: null });
    expect(normalizeAppleScriptShortcut("Cmd+Option")).toEqual({ 2304: null });
    expect(normalizeAppleScriptShortcut("Cmd+Control")).toEqual({ 4352: null });
    expect(normalizeAppleScriptShortcut("Option+Shift")).toEqual({
      2560: null,
    });
    expect(normalizeAppleScriptShortcut("Control+Shift")).toEqual({
      4608: null,
    });
    expect(normalizeAppleScriptShortcut("Control+Option")).toEqual({
      6144: null,
    });
  });

  it("supports all modifiers combined with null key", () => {
    expect(normalizeAppleScriptShortcut("Cmd+Control+Option+Shift")).toEqual({
      6912: null,
    });
  });

  it("supports modifier aliases in modifier-only keystrokes", () => {
    expect(normalizeAppleScriptShortcut("Command")).toEqual({ 256: null });
    expect(normalizeAppleScriptShortcut("Alt")).toEqual({ 2048: null });
    expect(normalizeAppleScriptShortcut("Ctrl")).toEqual({ 4096: null });
  });
});
