//FILE: src/utils/km.testing.ts

// Lazy import to avoid CEP environment issues
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import chalk from "chalk";
import type { VirtualAction } from "../virtual_actions/index";
// import { buildEphemeralMacroXml } from "../kmjs.runVirtualMacro";
import { getErrors, startWatching, stopWatching } from "./km.engineLog";

// Lazy imports to avoid CEP environment issues
import {
  wrapAsKMMacros,
  importPlistString,
  deleteMacroByName,
} from "./km.interface";
import { getSafeSpawnSync } from "./utils.spawn";

// -------------------------
// Types and Constants
// -------------------------

const TEST_MACRO_GROUP_NAME = "kmjs-test";
const TEST_MACRO_NAME_PREFIX = "kmjs-test-";

// ---------------------------------------------------------------------------
//  One-time initialisation helpers
// ---------------------------------------------------------------------------

let groupInitialised = false;

function initGroupOnce(): void {
  if (groupInitialised) return;
  ensureTestMacroGroup();
  cleanupTestMacros(); // ← wipe the group only once per run
  groupInitialised = true;
}

/**
 * Represents the result of a single permutation test against the KM engine.
 */
export interface PermutationTestResult {
  /** A descriptive name for the test permutation. */
  name: string;
  /** The generated XML for the action being tested. */
  generatedXml: string;
  /** The XML retrieved from KM after importing the action. */
  retrievedXml?: string;
  /** Whether the generated and retrieved XML match. */
  passed: boolean;
  /** Any errors from the KM Engine Log. */
  engineErrors: string[];
  /** Any errors from the AppleScript execution itself. */
  scriptError?: string;
  /** General error message for failed tests. */
  error?: string;
}

// -------------------------
// AppleScript Helpers
// -------------------------

/** Execute a JXA snippet, automatically wrapping it in
 *  `(function () { … })();` so `return` is legal.            */
function runJxa(script: string): string {
  const wrapped = `(function () {\n${script}\n})();`;

  const spawnSync = getSafeSpawnSync();

  const result = spawnSync("osascript", ["-l", "JavaScript", "-e", wrapped], {
    encoding: "utf8",
  });
  if (result.status !== 0 || result.error) {
    const errorMsg =
      result.stderr || result.error?.message || "Unknown JXA error";
    throw new Error(errorMsg);
  }
  return result.stdout.trim();
}

// /**
//  * Normalizes XML for reliable comparison.
//  * - Parses and rebuilds with consistent formatting.
//  * - Removes the ActionUID key, which KM always changes on import.
//  * - Extracts just the action dict if full plist is provided.
//  * @param xmlString - The raw XML string.
//  * @returns A normalized XML string.
//  */
// function normalizeActionXml(xmlString: string): string {
//   if (!xmlString) return "";

//   let actionXml = xmlString;

//   // If this is a full plist, extract just the action dict
//   if (
//     xmlString.includes('<?xml version="1.0"') &&
//     xmlString.includes("<plist")
//   ) {
//     const dictStart = xmlString.indexOf("<dict>");
//     const dictEnd = xmlString.lastIndexOf("</dict>") + "</dict>".length;
//     if (dictStart !== -1 && dictEnd !== -1) {
//       actionXml = xmlString.substring(dictStart, dictEnd);
//     }
//   }

//   const parser = new XMLParser({
//     ignoreAttributes: false,
//     allowBooleanAttributes: true,
//     // force array form for these keys
//     isArray: (_name, _jpath, _parent, _isLeaf) =>
//       ["dict.key", "dict.integer", "dict.string"].includes(_jpath),
//   });
//   const builder = new XMLBuilder({
//     format: true,
//     indentBy: "  ",
//     suppressEmptyNode: true,
//     ignoreAttributes: false,
//   });

//   let obj;
//   try {
//     obj = parser.parse(actionXml);
//     // In case the parser still gave us a scalar
//     const d = obj.dict;
//     if (d) {
//       if (d.key && !Array.isArray(d.key)) d.key = [d.key];
//       if (d.integer && !Array.isArray(d.integer)) d.integer = [d.integer];
//       if (d.string && !Array.isArray(d.string)) d.string = [d.string];
//     }
//     // remove ActionUID as before…
//     if (obj.dict && obj.dict.key && obj.dict.key.includes("ActionUID")) {
//       const uidIndex = obj.dict.key.indexOf("ActionUID");
//       obj.dict.key.splice(uidIndex, 1);
//       if (obj.dict.integer) obj.dict.integer.splice(uidIndex, 1);
//     }
//     return builder.build(obj).trim();
//   } catch (e) {
//     console.warn(
//       chalk.yellow("Could not normalize XML, returning original."),
//       e,
//     );
//     return actionXml.trim();
//   }
// }

/**
 * Normalizes a KM action XML dict:
 *  – extracts the first <dict>…</dict> if a full plist
 *  – removes ActionUID key+value pair
 *  – preserves original key ordering & pretty indentation
 */
function normalizeActionXml(xmlString: string): string {
  if (!xmlString) return "";

  // 1. Extract only the first <dict>...</dict> (original behavior)
  let actionXml = xmlString;
  if (xmlString.includes("<plist")) {
    const start = xmlString.indexOf("<dict>");
    const end = xmlString.lastIndexOf("</dict>") + "</dict>".length;
    if (start !== -1 && end !== -1) {
      actionXml = xmlString.slice(start, end);
    }
  }

  try {
    // 2. Parse with preserveOrder
    const parser = new XMLParser({
      preserveOrder: true,
      ignoreAttributes: false,
      allowBooleanAttributes: true,
      trimValues: true,
      // Do NOT auto-convert numbers so integer nodes stay integers if you prefer;
      // leaving defaults is fine because we mainly manipulate node types.
    });

    const ast = parser.parse(actionXml); // array of nodes

    // Helper to identify a <key> node with text === 'ActionUID'
    const isActionUIDKeyNode = (node: any) =>
      node &&
      node.key === undefined && // when preserveOrder:true, each node is an object with single key: tagName
      Object.keys(node).length === 1 &&
      node.hasOwnProperty("key") === false &&
      false; // (placeholder; see below)

    // Actual inspection: node like { key: 'ActionUID' } OR { key: [ { '#text': 'ActionUID' } ] } depending on version.
    // Safer generic test:
    function nodeIsKeyWithValue(node: any, value: string): boolean {
      if (!node || typeof node !== "object") return false;
      if (!node.key) return false;
      // possible shapes:
      // { key: 'ActionUID' }
      // { key: [ { '#text': 'ActionUID' } ] }
      if (typeof node.key === "string") return node.key === value;
      if (Array.isArray(node.key) && node.key.length === 1) {
        const t = node.key[0];
        if (typeof t === "string") return t === value;
        if (t && typeof t === "object" && t["#text"])
          return t["#text"] === value;
      }
      return false;
    }

    // 3. Remove the ActionUID key + the next value node (integer/string)
    const filtered: any[] = [];
    for (let i = 0; i < ast.length; i++) {
      const n = ast[i];
      if (nodeIsKeyWithValue(n, "ActionUID")) {
        // skip this and next node (value) if present
        i += 1;
        continue;
      }
      filtered.push(n);
    }

    // 4. Rebuild
    const builder = new XMLBuilder({
      preserveOrder: true,
      format: true,
      indentBy: "  ",
      ignoreAttributes: false,
      suppressEmptyNode: true,
    });

    // Build XML and then normalize indentation inside multiline <string> blocks
    let normalizedXml = builder.build(filtered).trim();
    // Remove indentation (spaces or tabs) at start of lines inside all <string> content
    normalizedXml = normalizedXml.replace(
      /<string>([\s\S]*?)<\/string>/g,
      (match: string, inner: string): string => {
        const cleaned = inner.replace(/\n[ \t]+/g, "\n");
        return `<string>${cleaned}</string>`;
      },
    );
    // Collapse newlines inside all Text <string> content to match KM behavior
    normalizedXml = normalizedXml.replace(
      /(<key>Text<\/key>\s*<string>)([\s\S]*?)(<\/string>)/g,
      (
        _match: string,
        prefix: string,
        inner: string,
        suffix: string,
      ): string => {
        return `${prefix}${inner.replace(/\n/g, "")}${suffix}`;
      },
    );
    return normalizedXml;
  } catch (e) {
    // Fallback: naive removal via regex (keeps original indentation/order)
    return actionXml
      .replace(
        /<key>ActionUID<\/key>\s*<(?:integer|string)>[\s\S]*?<\/(?:integer|string)>/,
        "",
      )
      .trim();
  }
}

// -------------------------
// Testing API
// -------------------------

/**
 * Ensures the dedicated test macro group exists in Keyboard Maestro.
 * If it doesn't exist, it will be created.
 */
export function ensureTestMacroGroup(): void {
  const script = `
    const kme = Application("Keyboard Maestro");
    if (!kme.macroGroups.byName("${TEST_MACRO_GROUP_NAME}").exists()) {
      kme.make({new: 'macroGroup', withProperties: {name: "${TEST_MACRO_GROUP_NAME}"}});
    }
  `;
  try {
    runJxa(script);
  } catch (e) {
    console.error(
      chalk.red("Fatal: Could not ensure test macro group exists."),
      e,
    );
    throw e;
  }
}

/**
 * Deletes all macros within the dedicated test group to ensure a clean state.
 * This should be run before a test suite begins.
 */
export function cleanupTestMacros(): void {
  console.log(
    chalk.gray(`Cleaning up macros in group: "${TEST_MACRO_GROUP_NAME}"...`),
  );
  const script = `
    const kme = Application("Keyboard Maestro");
    const group = kme.macroGroups.byName("${TEST_MACRO_GROUP_NAME}");
    if (group.exists()) {
      const macros = group.macros();
      let deleted = 0;
      macros.forEach(m => {
        m.delete();
        deleted++;
      });
      return deleted;
    }
    return 0;
  `;
  try {
    const deletedCountStr = runJxa(script);
    const deletedCount = parseInt(deletedCountStr) || 0;
    if (deletedCount > 0) {
      console.log(chalk.gray(`Deleted ${deletedCount} test macros.`));
      // deletedCount > 0 is enough — no need to poll

      // deletedCount > 0 is enough — no need to poll
    }
  } catch (e) {
    // Non-fatal, as the group might not exist yet.
    console.warn(
      chalk.yellow("Could not clean up test macros (this is often safe)."),
      e,
    );
  }
}

/**
 * Imports a virtual action into Keyboard Maestro for validation.
 *
 * This function performs a round-trip test:
 * 1. Creates a temporary macro containing the single virtual action.
 * 2. Imports this macro into the dedicated test group in KM.
 * 3. Exports the just-imported action's XML back out of KM.
 * 4. Deletes the temporary macro from KM.
 * 5. Returns the XML retrieved from KM.
 *
 * @param action - The VirtualAction to test.
 * @param testId - A unique identifier for this test run.
 * @param filePath - The path to the .kmmacros file that was imported.
 * @returns The raw XML of the action as it exists inside Keyboard Maestro.
 * @throws If any AppleScript command fails.
 */
export function importAndRetrieveActionXml(
  action: VirtualAction,
  testId: string,
  filePath: string,
): string {
  // Ensure the group exists & is empty (only on the very first test run)
  initGroupOnce();

  // 1) inject the .kmmacros into KM
  const macroName = `${TEST_MACRO_NAME_PREFIX}${testId}`;
  const fs = require("fs");

  // Safe fs check
  if (typeof fs.readFileSync !== "function") {
    throw new Error("File system operations not available in this environment");
  }

  importPlistString(fs.readFileSync(filePath, "utf8"));

  // 2) wait up to ~200ms for KM to actually create it, then grab its XML
  const retrievedRaw = runJxa(`
    const kme = Application("Keyboard Maestro");
    const group = kme.macroGroups.byName("${TEST_MACRO_GROUP_NAME}");
    
    for (let i = 0; i < 20; i++) {
      if (group.exists()) {
        const macros = group.macros();
        for (let j = 0; j < macros.length; j++) {
          if (macros[j].name() === "${macroName}") {
            return macros[j].actions()[0].xml();
          }
        }
      }
      delay(0.01);
    }
    throw new Error("Macro not found after import: ${macroName}");
  `);

  // 3) delete just this macro now that we’ve extracted its XML
  deleteMacroByName(macroName);

  // 4) hand back the raw XML (we normalize it later)
  return retrievedRaw;
}

/**
 * Runs a full validation test on a single virtual action permutation.
 * This is the main control flow for a single test case.
 *
 * @param name - A descriptive name for the permutation being tested.
 * @param action - The `VirtualAction` instance to test.
 * @returns A `PermutationTestResult` object.
 */
export function validateActionPermutation(
  name: string,
  action: VirtualAction,
): PermutationTestResult {
  // guarantee the group has been initialised (cheap no-op after the first call)
  initGroupOnce();

  // group is already created & cleaned in beforeAll() by the test harness

  const result: PermutationTestResult = {
    name,
    generatedXml: "",
    retrievedXml: "",
    passed: false,
    engineErrors: [],
  };

  let tmp: string | undefined;
  try {
    result.generatedXml = normalizeActionXml(action.toXml());

    startWatching();
    // Save the macro file for every test before import
    const testId = name.replace(/[^a-zA-Z0-9]/g, "_");
    const macroName = `${TEST_MACRO_NAME_PREFIX}${testId}`;
    const wrapped = wrapAsKMMacros(action.toXml(), macroName);
    // Write the .kmmacros file and copy to failures dir
    const fs = require("fs");
    const os = require("os");
    const path = require("path");

    // Safe fs/os checks
    if (
      typeof fs.writeFileSync !== "function" ||
      typeof os.tmpdir !== "function"
    ) {
      throw new Error(
        "File system operations not available in this environment",
      );
    }

    tmp = os.tmpdir() + `/kmjs-test-${Date.now()}.kmmacros`;
    fs.writeFileSync(tmp, wrapped, "utf8");

    const existsSync =
      typeof fs.existsSync === "function" ? fs.existsSync : () => false;
    const mkdirSync =
      typeof fs.mkdirSync === "function" ? fs.mkdirSync : () => {};
    const copyFileSync =
      typeof fs.copyFileSync === "function" ? fs.copyFileSync : () => {};

    if (!existsSync(FAILURES_DIR)) mkdirSync(FAILURES_DIR, { recursive: true });
    const dest = path.join(FAILURES_DIR, `${macroName}.kmmacros`);
    copyFileSync(tmp, dest);
    // Now import (freshly empty group)
    result.retrievedXml = normalizeActionXml(
      importAndRetrieveActionXml(action, testId, tmp),
    );
    result.engineErrors = getErrors();
    stopWatching();
    result.passed =
      result.generatedXml === result.retrievedXml &&
      result.engineErrors.length === 0;
    // Clean up temp file
    if (existsSync(tmp)) {
      const unlinkSync =
        typeof fs.unlinkSync === "function" ? fs.unlinkSync : () => {};
      unlinkSync(tmp);
    }
  } catch (e) {
    result.passed = false;
    result.scriptError = e instanceof Error ? e.message : String(e);
  } finally {
    // nothing — cleanup happens in afterAll()
  }

  return result;
}

/**
 * Path to the directory where test failures are logged.
 * Uses lazy loading to avoid CEP environment issues.
 */
export const FAILURES_DIR = (() => {
  try {
    const path = require("path");
    return path.resolve(__dirname, "../../tests/integration/failures");
  } catch {
    return "/tmp/kmjs-test-failures";
  }
})();

/**
 * Cleans up the failures directory by removing it if it exists.
 * Creates a fresh empty directory for new test runs.
 */
export function cleanupFailuresDir(): void {
  const fs = require("fs");

  // Safe fs checks
  const existsSync =
    typeof fs.existsSync === "function" ? fs.existsSync : () => false;
  const rmSync = typeof fs.rmSync === "function" ? fs.rmSync : () => {};
  const mkdirSync =
    typeof fs.mkdirSync === "function" ? fs.mkdirSync : () => {};

  if (existsSync(FAILURES_DIR)) {
    console.log(chalk.gray("Cleaning up previous test failure files..."));
    rmSync(FAILURES_DIR, { recursive: true, force: true });
  }
  // Ensure the directory exists for new failures
  mkdirSync(FAILURES_DIR, { recursive: true });
}
