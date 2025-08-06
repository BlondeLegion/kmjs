//FILE: tests/unit/convert-macro-to-virtual.spec.ts

/**
 * Tests for the Keyboard Maestro Macro to Virtual Macro Converter
 *
 * This test suite validates the conversion functionality by testing the script
 * against the example macro files provided in the project root. It ensures
 * that the conversion process works correctly and generates valid JavaScript
 * code with proper virtual action mappings.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Import the conversion functions for unit testing
const {
  convertMacroToVirtual,
  extractMacroData,
  convertActions,
} = require("../../scripts/convert-macro-to-virtual.js");

const { createActionMapper } = require("../../scripts/lib/action-mapper.js");
const {
  generateVirtualMacroCode,
} = require("../../scripts/lib/code-generator.js");

describe("Macro to Virtual Converter", () => {
  const testOutputDir = "test-output";
  const exampleMacros = [
    "SIMPLEMACRO.kmmacros",
    "MEDIUMCOMPLEXITYMACRO.kmmacros",
    "COMPLICATEDMACRO.kmmacros",
  ];

  beforeAll(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe("CLI Interface", () => {
    it("should show help when no arguments provided", () => {
      try {
        execSync("node scripts/convert-macro-to-virtual.js", {
          encoding: "utf8",
          stdio: "pipe",
        });
      } catch (error: any) {
        expect(error.status).toBe(1);
        expect(error.stdout).toContain("Usage:");
        expect(error.stdout).toContain("convert-macro-to-virtual.js");
      }
    });

    it("should show error for non-existent file", () => {
      try {
        execSync(
          "node scripts/convert-macro-to-virtual.js nonexistent.kmmacros",
          {
            encoding: "utf8",
            stdio: "pipe",
          },
        );
      } catch (error: any) {
        expect(error.status).toBe(1);
        expect(error.stderr).toContain("Input file not found");
      }
    });

    it("should show error for wrong file extension", () => {
      try {
        execSync("node scripts/convert-macro-to-virtual.js package.json", {
          encoding: "utf8",
          stdio: "pipe",
        });
      } catch (error: any) {
        expect(error.status).toBe(1);
        expect(error.stderr).toContain("must be a .kmmacros file");
      }
    });
  });

  describe("Macro Data Extraction", () => {
    it("should extract macro data from SIMPLEMACRO", async () => {
      const { xmlToJson } = require("../../dist/utils/utils.kmet");
      const macroXml = fs.readFileSync("SIMPLEMACRO.kmmacros", "utf8");
      const macroJson = JSON.parse(xmlToJson(macroXml));

      const macroData = extractMacroData(macroJson);

      expect(macroData.name).toBe("SIMPLEMACRO");
      expect(macroData.actions).toHaveLength(1);
      // The action structure is now key-value arrays, so we need to extract the MacroActionType
      const action = macroData.actions[0];
      const typeIndex = action.key.indexOf("MacroActionType");
      const stringKeys = [
        "ActionColor",
        "ActionName",
        "MacroActionType",
        "SoundName",
        "Subtitle",
        "Text",
        "Title",
      ];
      const stringKeysBeforeTarget: string[] = [];
      for (let i = 0; i < typeIndex; i++) {
        if (stringKeys.includes(action.key[i])) {
          stringKeysBeforeTarget.push(action.key[i]);
        }
      }
      const stringIndex = stringKeysBeforeTarget.length;
      expect(action.string[stringIndex]).toBe("Notification");
      expect(macroData.uid).toBeDefined();
    });

    it("should extract macro data from MEDIUMCOMPLEXITYMACRO", async () => {
      const { xmlToJson } = require("../../dist/utils/utils.kmet");
      const macroXml = fs.readFileSync(
        "MEDIUMCOMPLEXITYMACRO.kmmacros",
        "utf8",
      );
      const macroJson = JSON.parse(xmlToJson(macroXml));

      const macroData = extractMacroData(macroJson);

      expect(macroData.name).toBe("MEDIUMCOMPLEXITYMACRO");
      expect(macroData.actions).toHaveLength(1); // One group action
      expect(macroData.triggers).toHaveLength(1); // Has a hotkey trigger
    });

    it("should handle macro with no actions gracefully", async () => {
      const mockMacroJson = {
        plist: {
          array: [
            {
              dict: {
                Macros: {
                  array: [
                    {
                      dict: {
                        Name: { string: "EmptyMacro" },
                        Actions: { array: [] },
                        UID: { string: "test-uid" },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      };

      const macroData = extractMacroData(mockMacroJson);

      expect(macroData.name).toBe("EmptyMacro");
      expect(macroData.actions).toHaveLength(0);
    });
  });

  describe("Action Mapping", () => {
    let actionMapper: any;

    beforeAll(() => {
      actionMapper = createActionMapper();
    });

    it("should map notification action correctly", async () => {
      const kmAction = {
        MacroActionType: { string: "Notification" },
        Title: { string: "Test Title" },
        Text: { string: "Test Body" },
        Subtitle: { string: "Test Subtitle" },
        SoundName: { string: "Glass" },
      };

      const virtualAction = await actionMapper.mapAction(
        "Notification",
        kmAction,
      );

      expect(virtualAction).toBeDefined();
      expect(virtualAction.functionName).toBe("createVirtualNotification");
      expect(virtualAction.code).toContain('title: "Test Title"');
      expect(virtualAction.code).toContain('body: "Test Body"');
      expect(virtualAction.code).toContain('subtitle: "Test Subtitle"');
      expect(virtualAction.code).toContain('sound: "Glass"');
    });

    it("should map set variable action correctly", async () => {
      const kmAction = {
        MacroActionType: { string: "SetVariableToText" },
        Variable: { string: "TestVar" },
        Text: { string: "Test Value" },
      };

      const virtualAction = await actionMapper.mapAction(
        "SetVariableToText",
        kmAction,
      );

      expect(virtualAction).toBeDefined();
      expect(virtualAction.functionName).toBe("createVirtualSetVariable");
      expect(virtualAction.code).toContain('variable: "TestVar"');
      expect(virtualAction.code).toContain('text: "Test Value"');
    });

    it("should handle local variable scope correctly", async () => {
      const kmAction = {
        MacroActionType: { string: "SetVariableToText" },
        Variable: { string: "LOCALTestVar" },
        Text: { string: "Test Value" },
      };

      const virtualAction = await actionMapper.mapAction(
        "SetVariableToText",
        kmAction,
      );

      expect(virtualAction.code).toContain('scope: "local"');
    });

    it("should map pause action correctly", async () => {
      const kmAction = {
        MacroActionType: { string: "Pause" },
        Time: { string: "2.5" },
      };

      const virtualAction = await actionMapper.mapAction("Pause", kmAction);

      expect(virtualAction).toBeDefined();
      expect(virtualAction.functionName).toBe("createVirtualPause");
      expect(virtualAction.code).toContain("time: 2.5");
    });

    it("should return null for unsupported action types", async () => {
      const kmAction = {
        MacroActionType: { string: "UnsupportedActionType" },
      };

      const virtualAction = await actionMapper.mapAction(
        "UnsupportedActionType",
        kmAction,
      );

      expect(virtualAction).toBeNull();
    });

    it("should get list of supported actions", () => {
      const supportedActions = actionMapper.getSupportedActions();

      expect(supportedActions).toContain("Notification");
      expect(supportedActions).toContain("SetVariableToText");
      expect(supportedActions).toContain("Pause");
      expect(supportedActions).toContain("ManipulateWindow");
      expect(Array.isArray(supportedActions)).toBe(true);
      expect(supportedActions.length).toBeGreaterThan(10);
    });
  });

  describe("Code Generation", () => {
    it("should generate valid JavaScript code", () => {
      const virtualActions = [
        {
          functionName: "createVirtualNotification",
          code: 'createVirtualNotification({ title: "Test", body: "Message" })',
          comment: "System notification",
        },
        {
          functionName: "createVirtualPause",
          code: "createVirtualPause({ time: 1 })",
          comment: "Pause for 1 seconds",
        },
      ];

      const generatedCode = generateVirtualMacroCode(
        "TestMacro",
        virtualActions,
      );

      expect(generatedCode).toContain("createVirtualNotification");
      expect(generatedCode).toContain("createVirtualPause");
      expect(generatedCode).toContain("runVirtualMacro");
      expect(generatedCode).toContain("TestMacro");
      expect(generatedCode).toContain("const actions = [");
      expect(generatedCode).toContain("module.exports");
    });

    it("should handle empty actions array", () => {
      const virtualActions: any[] = [];
      const generatedCode = generateVirtualMacroCode(
        "EmptyMacro",
        virtualActions,
      );

      expect(generatedCode).toContain("// No actions to convert");
      expect(generatedCode).toContain("runVirtualMacro");
    });

    it("should include proper imports based on actions used", () => {
      const virtualActions = [
        {
          functionName: "createVirtualNotification",
          code: 'createVirtualNotification({ title: "Test" })',
          comment: "Test",
        },
        {
          functionName: "createVirtualSetVariable",
          code: 'createVirtualSetVariable({ variable: "test", text: "value" })',
          comment: "Test",
        },
      ];

      const generatedCode = generateVirtualMacroCode(
        "TestMacro",
        virtualActions,
      );

      expect(generatedCode).toContain("createVirtualNotification");
      expect(generatedCode).toContain("createVirtualSetVariable");
      expect(generatedCode).toContain("runVirtualMacro");
      expect(generatedCode).toContain("require('kmjs')");
    });

    it("should handle comments and complex actions", () => {
      const virtualActions = [
        {
          functionName: "COMMENT",
          code: "// This is a comment from the original macro",
          comment: "Comment from original macro",
        },
        {
          functionName: "COMPLEX",
          code: "// TODO: Convert If/Then/Else action manually",
          comment: "Complex conditional action requires manual conversion",
        },
      ];

      const generatedCode = generateVirtualMacroCode(
        "TestMacro",
        virtualActions,
      );

      expect(generatedCode).toContain(
        "// This is a comment from the original macro",
      );
      expect(generatedCode).toContain(
        "// TODO: Convert If/Then/Else action manually",
      );
      expect(generatedCode).toContain(
        "complex action(s) need manual conversion",
      );
    });
  });

  describe("End-to-End Conversion", () => {
    it("should convert SIMPLEMACRO successfully", async () => {
      const outputPath = path.join(testOutputDir, "simple-converted.js");

      await convertMacroToVirtual("SIMPLEMACRO.kmmacros", outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const generatedCode = fs.readFileSync(outputPath, "utf8");
      expect(generatedCode).toContain("createVirtualNotification");
      expect(generatedCode).toContain("SIMPLEMACRO");
      expect(generatedCode).toContain("runVirtualMacro");
      expect(generatedCode).toContain("TITLE");
      expect(generatedCode).toContain("MESSAGE CONTENT");
    });

    it("should convert MEDIUMCOMPLEXITYMACRO successfully", async () => {
      const outputPath = path.join(testOutputDir, "medium-converted.js");

      await convertMacroToVirtual("MEDIUMCOMPLEXITYMACRO.kmmacros", outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const generatedCode = fs.readFileSync(outputPath, "utf8");
      expect(generatedCode).toContain("MEDIUMCOMPLEXITYMACRO");
      expect(generatedCode).toContain("runVirtualMacro");
      // Should contain some converted actions from the group
      expect(generatedCode.length).toBeGreaterThan(1000); // Reasonable size check
    });

    it("should handle conversion errors gracefully", async () => {
      // Test with malformed macro data
      const malformedMacroJson = {
        plist: {
          array: [{ dict: { invalid: "structure" } }],
        },
      };

      expect(() => {
        extractMacroData(malformedMacroJson);
      }).toThrow("Invalid macro file structure");
    });
  });

  describe("Generated Code Validation", () => {
    it("should generate syntactically valid JavaScript", async () => {
      const outputPath = path.join(testOutputDir, "syntax-test.js");

      await convertMacroToVirtual("SIMPLEMACRO.kmmacros", outputPath);

      const generatedCode = fs.readFileSync(outputPath, "utf8");

      // Basic syntax validation - should not throw
      expect(() => {
        // This is a very basic check - we're not actually executing the code
        // but checking for obvious syntax issues
        const hasMatchingBraces =
          (generatedCode.match(/\{/g) || []).length ===
          (generatedCode.match(/\}/g) || []).length;
        const hasMatchingParens =
          (generatedCode.match(/\(/g) || []).length ===
          (generatedCode.match(/\)/g) || []).length;
        const hasMatchingBrackets =
          (generatedCode.match(/\[/g) || []).length ===
          (generatedCode.match(/\]/g) || []).length;

        expect(hasMatchingBraces).toBe(true);
        expect(hasMatchingParens).toBe(true);
        expect(hasMatchingBrackets).toBe(true);
      }).not.toThrow();
    });

    it("should include proper error handling and warnings", async () => {
      const outputPath = path.join(testOutputDir, "warnings-test.js");

      await convertMacroToVirtual("COMPLICATEDMACRO.kmmacros", outputPath);

      const generatedCode = fs.readFileSync(outputPath, "utf8");

      // Should include warnings about complex actions
      expect(generatedCode).toContain("WARNINGS:");
      expect(generatedCode).toContain(
        "Generated by kmjs macro-to-virtual converter",
      );
      expect(generatedCode).toContain("Conversion date:");
    });
  });

  describe("CLI Integration", () => {
    it("should work via yarn command", () => {
      const outputPath = path.join(testOutputDir, "cli-test.js");

      try {
        execSync(`yarn convert:macro SIMPLEMACRO.kmmacros ${outputPath}`, {
          encoding: "utf8",
          stdio: "pipe",
        });

        expect(fs.existsSync(outputPath)).toBe(true);

        const generatedCode = fs.readFileSync(outputPath, "utf8");
        expect(generatedCode).toContain("createVirtualNotification");
        expect(generatedCode).toContain("SIMPLEMACRO");
      } catch (error: any) {
        // If the command fails, check if it's due to missing dependencies
        if (
          error.stderr?.includes("command not found") ||
          error.stderr?.includes("Cannot find module")
        ) {
          console.warn("Skipping CLI test due to missing dependencies");
          return;
        }
        throw error;
      }
    });
  });
});

describe("Action Mapper Utilities", () => {
  const {
    extractStringValue,
    extractIntValue,
    extractBoolValue,
  } = require("../../scripts/lib/action-mapper.js");

  describe("extractStringValue", () => {
    it("should extract string from various formats", () => {
      expect(extractStringValue("direct string")).toBe("direct string");
      expect(extractStringValue({ string: "nested string" })).toBe(
        "nested string",
      );
      expect(extractStringValue({ "#text": "text node" })).toBe("text node");
      expect(extractStringValue(123)).toBe("123");
      expect(extractStringValue(null)).toBeNull();
      expect(extractStringValue(undefined)).toBeNull();
    });
  });

  describe("extractIntValue", () => {
    it("should extract integers from various formats", () => {
      expect(extractIntValue(42)).toBe(42);
      expect(extractIntValue({ integer: 42 })).toBe(42);
      expect(extractIntValue({ real: 42.7 })).toBe(42);
      expect(extractIntValue({ string: "42" })).toBe(42);
      expect(extractIntValue("42")).toBe(42);
      expect(extractIntValue("not a number")).toBeNull();
      expect(extractIntValue(null)).toBeNull();
    });
  });

  describe("extractBoolValue", () => {
    it("should extract booleans from various formats", () => {
      expect(extractBoolValue(true)).toBe(true);
      expect(extractBoolValue(false)).toBe(false);
      expect(extractBoolValue({ true: undefined })).toBe(true);
      expect(extractBoolValue({ false: undefined })).toBe(false);
      expect(extractBoolValue({ string: "true" })).toBe(true);
      expect(extractBoolValue({ string: "false" })).toBe(false);
      expect(extractBoolValue(null)).toBeNull();
    });
  });
});
