//FILE: tests/unit/tokens.spec.ts

import { describe, it, expect } from "vitest";
import { KM_TOKENS, type KMToken } from "../../src/tokens/km.tokens";
import { lookupKMToken } from "../../src/tokens/km.token.lookup";

describe("KM Tokens Module", () => {
  describe("KM_TOKENS Constant", () => {
    it("should be a non-empty object", () => {
      expect(KM_TOKENS).toBeTypeOf("object");
      expect(KM_TOKENS).not.toBeNull();
      expect(Object.keys(KM_TOKENS).length).toBeGreaterThan(100); // Sanity check for a reasonable number of tokens
    });

    it("should contain known key-value pairs", () => {
      expect(KM_TOKENS.ARandomUniqueID).toBe("%RandomUUID%");
      expect(KM_TOKENS.SystemClipboard).toBe("%SystemClipboard%");
      expect(KM_TOKENS.FrontApplicationName).toBe("%Application%1%");
    });

    it("should have values that are valid token strings (start and end with %)", () => {
      for (const token of Object.values(KM_TOKENS)) {
        expect(token).toMatch(/^%.*%$/);
      }
    });

    it("should not have duplicate values", () => {
      const values = Object.values(KM_TOKENS);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });

    it("should have its type definition match a sample of object keys", () => {
      // This is a compile-time check, but we can do a runtime sanity check
      const sampleToken: KMToken = "%ExecutingMacro%";
      expect(Object.values(KM_TOKENS)).toContain(sampleToken);
    });
  });

  describe("lookupKMToken Utility", () => {
    it("should look up by raw token string", () => {
      const result = lookupKMToken("%RandomUUID%");
      expect(result).toEqual({
        human: "A Random Unique ID",
        pascal: "ARandomUniqueID",
      });
    });

    it("should look up by human-readable string", () => {
      const result = lookupKMToken("A Random Unique ID");
      expect(result).toEqual({
        pascal: "ARandomUniqueID",
        token: "%RandomUUID%",
      });
    });

    it("should look up by PascalCase string", () => {
      const result = lookupKMToken("ARandomUniqueID");
      expect(result).toEqual({
        human: "A Random Unique ID",
        token: "%RandomUUID%",
      });
    });

    it("should return a specific key when requested", () => {
      // Test lookup by token, return human
      expect(lookupKMToken("%RandomUUID%", "human")).toBe("A Random Unique ID");

      // Test lookup by human, return pascal
      expect(lookupKMToken("System Clipboard", "pascal")).toBe(
        "SystemClipboard",
      );

      // Test lookup by pascal, return token
      expect(lookupKMToken("Calculation", "token")).toBe("%Calculate%1+2%");
    });

    it("should handle tokens with special characters in their human-readable name", () => {
      expect(lookupKMToken("Linefeed (\\n)", "token")).toBe("%LineFeed%");
      expect(lookupKMToken("%LineFeed%", "human")).toBe("Linefeed (\\n)");
    });

    it("should throw an error for an unknown token", () => {
      expect(() => lookupKMToken("ThisIsDefinitelyNotAKMToken")).toThrow(
        /Unknown Keyboard Maestro token/,
      );
      expect(() => lookupKMToken("%InvalidToken%")).toThrow(
        /Unknown Keyboard Maestro token/,
      );
    });

    it("should be case-sensitive for PascalCase and case-insensitive for others implicitly through the map", () => {
      // Correct case
      expect(lookupKMToken("ARandomUniqueID", "token")).toBe("%RandomUUID%");
      // Incorrect case should fail as it's a different key
      expect(() => lookupKMToken("arandomuniqueid")).toThrow();
    });
  });
});
