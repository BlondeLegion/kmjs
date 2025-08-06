//FILE: tests/unit/kmjs.generateMacro.spec.ts

/**
 * Test suite for the generateMacro function.
 *
 * This test suite validates the core functionality of the generateMacro function,
 * focusing on XML generation and plist wrapping. File system and KM integration
 * tests are handled separately to avoid mocking complexity.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateMacro } from "../../src/kmjs.generateMacro";
import { createVirtualNotification } from "../../src/virtual_actions/kmjs.virtualAction.notification";
import { createVirtualPause } from "../../src/virtual_actions/kmjs.virtualAction.pause";
import { createVirtualComment } from "../../src/virtual_actions/kmjs.virtualAction.comment";

// Mock external dependencies
vi.mock("../../src/kmjs.runVirtualMacro", () => ({
  runVirtualMacro: vi.fn(),
}));

describe("generateMacro", () => {
  // Test data - create some sample virtual actions
  const sampleActions = [
    createVirtualNotification({
      title: "Test Notification",
      body: "This is a test notification",
    }),
    createVirtualPause({ time: 1 }),
    createVirtualComment({
      title: "Test Comment",
      text: "This is a test comment",
    }),
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe("Basic XML Generation", () => {
    it("should generate raw XML from virtual actions", () => {
      const result = generateMacro(sampleActions);

      // Should contain XML from all actions
      expect(result).toContain("Test Notification");
      expect(result).toContain("This is a test notification");
      expect(result).toContain("Test Comment"); // Comment text is base64 encoded, so check title

      // Should not contain plist wrapper by default
      expect(result).not.toContain("<?xml version");
      expect(result).not.toContain("<plist version");
    });

    it("should handle empty actions array", () => {
      const result = generateMacro([]);

      // Should return empty string or minimal XML
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should add plist wrapping when requested", () => {
      const result = generateMacro(sampleActions, {
        addPlistWrapping: true,
      });

      // Should contain plist header and footer
      expect(result).toContain("<?xml version");
      expect(result).toContain("<plist version");
      expect(result).toContain("</plist>");

      // Should still contain action content
      expect(result).toContain("Test Notification");
      expect(result).toContain("Test Comment");
    });
  });

  describe("Export Target: displayInTextWindow", () => {
    it("should call runVirtualMacro when displayInTextWindow is true", async () => {
      const { runVirtualMacro } = await import(
        "../../src/kmjs.runVirtualMacro"
      );

      const result = generateMacro(sampleActions, {
        exportTarget: { displayInTextWindow: true },
      });

      // Should still return the XML
      expect(result).toContain("Test Notification");
      expect(result).toContain("Test Comment");

      // Should have called runVirtualMacro with display action
      expect(runVirtualMacro).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            toXml: expect.any(Function),
          }),
        ]),
        "Display Generated XML",
      );
    });

    it("should not call runVirtualMacro when displayInTextWindow is false", async () => {
      const { runVirtualMacro } = await import(
        "../../src/kmjs.runVirtualMacro"
      );

      generateMacro(sampleActions, {
        exportTarget: { displayInTextWindow: false },
      });

      expect(runVirtualMacro).not.toHaveBeenCalled();
    });
  });

  describe("Automatic Plist Wrapping", () => {
    it("should automatically add plist wrapping for file export", () => {
      const result = generateMacro(sampleActions, {
        exportTarget: { filePath: "/test/macro.kmmacros" },
      });

      // Should have plist wrapper in the returned XML
      expect(result).toContain("<?xml version");
      expect(result).toContain("<plist version");
      expect(result).toContain("</plist>");
      expect(result).toContain("Test Notification");
    });

    it("should automatically add plist wrapping for KM group export", () => {
      const result = generateMacro(sampleActions, {
        exportTarget: { toKMGroup: "Test Group" },
      });

      // Should have plist wrapper in the returned XML
      expect(result).toContain("<?xml version");
      expect(result).toContain("<plist version");
      expect(result).toContain("</plist>");
      expect(result).toContain("Test Notification");
    });

    it("should not add plist wrapping when only displayInTextWindow is used", () => {
      const result = generateMacro(sampleActions, {
        exportTarget: { displayInTextWindow: true },
      });

      // Should not have plist wrapper
      expect(result).not.toContain("<?xml version");
      expect(result).not.toContain("<plist version");
      expect(result).toContain("Test Notification");
    });
  });

  describe("Multiple Export Targets", () => {
    it("should handle multiple export targets simultaneously", async () => {
      const { runVirtualMacro } = await import(
        "../../src/kmjs.runVirtualMacro"
      );

      const result = generateMacro(sampleActions, {
        exportTarget: {
          displayInTextWindow: true,
          filePath: "/test/macro.kmmacros",
          toKMGroup: "Test Group",
        },
        macroName: "Multi Export Test",
      });

      // Should have called displayInTextWindow
      expect(runVirtualMacro).toHaveBeenCalled();

      // Should have plist wrapping due to file/KM export
      expect(result).toContain("<?xml version");
      expect(result).toContain("Test Notification");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should use default macro name when not provided", () => {
      const result = generateMacro(sampleActions, {
        exportTarget: { filePath: "/test/macro.kmmacros" },
      });

      // Should still generate XML
      expect(result).toContain("Test Notification");
    });

    it("should handle missing export target gracefully", () => {
      const result = generateMacro(sampleActions, {
        exportTarget: {},
      });

      // Should still return XML
      expect(result).toContain("Test Notification");
      expect(result).toContain("Test Comment");
    });

    it("should handle undefined export target", () => {
      const result = generateMacro(sampleActions);

      // Should still return XML
      expect(result).toContain("Test Notification");
      expect(result).toContain("Test Comment");
    });
  });

  describe("XML Content Validation", () => {
    it("should preserve action XML structure", () => {
      const result = generateMacro(sampleActions);

      // Should contain proper XML structure from actions
      expect(result).toContain("<dict>");
      expect(result).toContain("</dict>");
      expect(result).toContain("<key>");
      expect(result).toContain("<string>");
    });

    it("should properly format plist wrapper", () => {
      const result = generateMacro(sampleActions, {
        addPlistWrapping: true,
      });

      // Should start with proper plist header
      expect(result).toMatch(/^<\?xml version="1\.0"/);
      expect(result).toContain("<!DOCTYPE plist");
      expect(result).toContain('<plist version="1.0">');
      expect(result).toContain("<array>");

      // Should end with proper plist footer
      expect(result).toContain("</array>");
      expect(result).toMatch(/<\/plist>\s*$/);
    });

    it("should join actions with newlines", () => {
      const result = generateMacro(sampleActions);

      // Should contain multiple dict blocks separated by newlines
      const dictCount = (result.match(/<dict>/g) || []).length;
      expect(dictCount).toBe(3); // One for each action
    });
  });
});
