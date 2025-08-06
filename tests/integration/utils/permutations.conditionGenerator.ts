//FILE: src/tests/utils/permutations.conditionGenerator.ts

/* ========================================================================== *
 *  permutations.generator.ts
 *  ---------------------------------
 *  A tiny generic engine that expands every enum/boolean property found in a
 *  JSON-schema definition into a full set of permutation objects.
 *
 *  It is **type-agnostic**: pass any schema that originated from
 *  typescript-json-schema and the name of the type you want permutations for.
 *
 *  ©2025 kmjs — MIT licence
 * ========================================================================== */

import fs from "fs";
import path from "path";
import { specificApps } from "./permutations.templates";
import type { AppMatchType } from "../../../src/virtual_actions/types/types.ui";

// ---------------------------------------------------------------------------
// Configuration — adjust to taste
// ---------------------------------------------------------------------------

/** Path to the schema produced by `yarn test:generate-test-schema`. */
const SCHEMA_PATH = path.resolve(__dirname, "../permutations/schema.json");

/**
 * A hard ceiling – if the cartesian product of all enums/booleans for any one
 * type explodes past this value, the generator will bail out for that type and
 * warn.  Raise it if you really need exhaustive coverage.
 */
const MAX_PERMUTATIONS_PER_TYPE = 1_000;

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

type Schema = Record<string, any>;
const schema: Schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

/**
 * Extract the schema‐representation for a definition by name.
 */
function def(name: string): Schema {
  const d = schema.definitions?.[name];
  if (d) return d;

  /* ── Fallback: synthesize stubs for types that the JSON schema
     generator emits *inline* (FrontWindow / AnyWindow) so the rest of
     the permutation engine can treat them like normal definitions. ── */

  if (name === "FrontWindowCondition") {
    return {
      type: "object",
      properties: {
        ConditionType: { const: "FrontWindow", type: "string" },
        FrontWindowConditionType: {
          enum: [
            "DoesNotExist",
            "Exists",
            "ExistsButIsNotFullScreen",
            "ExistsButTitleDoesNotContain",
            "ExistsButTitleDoesNotMatch",
            "ExistsButTitleIsNot",
            "IsFullScreen",
            "IsNotFullScreen",
            "TitleContains",
            "TitleDoesNotContain",
            "TitleDoesNotMatch",
            "TitleIs",
            "TitleIsNot",
            "TitleMatches",
          ],
          type: "string",
        },
        FrontWindowTitle: { type: "string" },
        IsFrontApplication: { type: "boolean" },
        Application: { $ref: "#/definitions/SpecificAppOptions" },
      },
      required: [
        "ConditionType",
        "FrontWindowConditionType",
        "IsFrontApplication",
      ],
    };
  }

  if (name === "AnyWindowCondition") {
    return {
      type: "object",
      properties: {
        ConditionType: { const: "AnyWindow", type: "string" },
        AnyWindowConditionType: {
          $ref: "#/definitions/StringConditionOperator",
        },
        AnyWindowTitle: { type: "string" },
        IsFrontApplication: { type: "boolean" },
        Application: { $ref: "#/definitions/SpecificAppOptions" },
      },
      required: [
        "ConditionType",
        "AnyWindowConditionType",
        "AnyWindowTitle",
        "IsFrontApplication",
      ],
    };
  }

  throw new Error(`Type "${name}" not found in schema.json`);
}

/** If the schema node is a $ref, return the referenced definition. */
function resolve(node: Schema): Schema {
  if (node && typeof node.$ref === "string") {
    const name = node.$ref.replace("#/definitions/", "");
    return schema.definitions?.[name] ?? node;
  }
  return node;
}

/**
 * When a property’s schema node is an enum → return all members;
 * when it is boolean → return `[true, false]`;
 * otherwise return `undefined` (we won’t vary that field).
 */
function enumerableValues(node: Schema): any[] | undefined {
  const n = resolve(node);
  if (Array.isArray(n.enum)) return n.enum;
  if (n.type === "boolean") return [true, false];
  return undefined;
}

/**
 * Shim in a *reasonable* sample value for non-enum properties so the object we
 * hand to KM is always syntactically valid.
 */
function sampleFor(
  prop: string,
  node: Schema,
  /** whether the property is required in the parent type */ isRequired = false,
): any {
  const n = resolve(node);
  if (n.default !== undefined) return n.default;

  switch (n.type) {
    case "string":
      // If the resolved node has an enum pick its *first* member
      if (Array.isArray(n.enum) && n.enum.length) return n.enum[0];
      // Never generate sample values for ConditionType - it should always be set explicitly
      if (prop === "ConditionType") {
        throw new Error(
          "ConditionType should be set explicitly, not generated as sample",
        );
      }
      return prop === "Path"
        ? "/tmp/sample.txt"
        : prop === "ClipboardText"
          ? "Sample Text"
          : prop === "Text" && n.description?.includes("calculation")
            ? "1 + 1"
            : prop === "Text"
              ? "2"
              : prop.toLowerCase() + "_sample";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return true;
    case "object":
      // We *always* want a non-empty <dict> for the Application field,
      // otherwise KM collapses it to <dict/>.
      if (prop === "Application") {
        return {
          BundleIdentifier: "com.example.app",
          Match: "BundleID",
          Name: "Example App",
        };
      }
      // For any other object:
      if (!isRequired) return undefined;
      const o: Record<string, any> = {};
      for (const [k, v] of Object.entries(n.properties ?? {}))
        o[k] = sampleFor(k, v as Schema, false);
      return o;
    default:
      return null;
  }
}

/**
 * Reads the correct ConditionType keyword from the schema's enum for a given definition name.
 */
function getConditionTypeKeyword(defName: string): string {
  /*  ← use the same helper that already returns a synthetic stub when
        the type is missing from schema.json                        */
  const defObj = def(defName);
  const ctProp = defObj?.properties?.ConditionType;
  if (!ctProp) {
    throw new Error(`Type ${defName} has no ConditionType property`);
  }
  // 1) if the schema used a "const", use that
  if (typeof ctProp.const === "string") {
    return ctProp.const;
  }
  // 2) otherwise if it used an "enum", take the first member
  if (Array.isArray(ctProp.enum) && ctProp.enum.length > 0) {
    return ctProp.enum[0];
  }
  throw new Error(`Could not find ConditionType const or enum for ${defName}`);
}

/**
 * Core – builds an *array of fully-formed objects* for the requested type.
 *
 * Properties that are enums or booleans are expanded into their cartesian
 * product; every other property receives a static sample value.
 */
export function buildPermutations<T = any>(typeName: string): T[] {
  const root = def(typeName);

  // Handle simple enum types (like ClickKind, MouseButton, etc.)
  if (root.enum && Array.isArray(root.enum)) {
    return root.enum as T[];
  }

  // Handle union types (like ScreenArea with anyOf)
  if (root.anyOf && Array.isArray(root.anyOf)) {
    const unionVariants: T[] = [];
    for (const variant of root.anyOf) {
      const resolved = resolve(variant);
      if (resolved.properties) {
        // For object variants, create a sample object
        const obj: Record<string, any> = {};
        for (const [key, prop] of Object.entries(resolved.properties)) {
          obj[key] = sampleFor(
            key,
            prop as Schema,
            resolved.required?.includes(key) || false,
          );
        }
        unionVariants.push(obj as T);
      } else if (resolved.enum) {
        // For enum variants, add each enum value
        unionVariants.push(...(resolved.enum as T[]));
      }
    }
    return unionVariants;
  }

  const props: Record<string, Schema> = root.properties ?? {};
  const required: string[] = root.required ?? [];
  const keys = Object.keys(props);

  // Split keys into varying vs static
  // Do NOT enumerate IsFrontApplication – we’ll handle it manually.
  const varyingKeys = keys.filter(
    (k) =>
      k !== "IsFrontApplication" && enumerableValues(props[k]) !== undefined,
  );
  const staticKeys = keys.filter((k) => !varyingKeys.includes(k));

  // Pre-compute static defaults (excluding ConditionType which we set explicitly)
  const base: Record<string, any> = {};
  for (const k of staticKeys) {
    if (k !== "ConditionType") {
      // Only fabricate sample object if required
      base[k] = sampleFor(k, props[k], required.includes(k));
      if (base[k] === undefined) delete base[k];
    }
  }

  // Short-circuit if nothing varies
  if (varyingKeys.length === 0) {
    // ── Special-case single-variant CalculationCondition ───────────────
    if (typeName === "CalculationCondition") {
      return [
        {
          ConditionType: getConditionTypeKeyword(typeName),
          // KM expects a mathematical expression here:
          Text: "1 + 1",
        } as unknown as T,
      ];
    }

    // ── Fallback for all other single-variant types ─────────────────────
    try {
      return [
        {
          ConditionType: getConditionTypeKeyword(typeName),
          ...base,
        } as unknown as T,
      ];
    } catch (error) {
      // If we can't determine ConditionType, return empty array
      console.warn(
        `[kmjs permutations] Could not determine ConditionType for ${typeName}: ${error}`,
      );
      return [];
    }
  }

  // Cartesian product
  const combinations: Record<string, any>[] = [{}];
  for (const key of varyingKeys) {
    const next: Record<string, any>[] = [];
    for (const variant of enumerableValues(props[key])!) {
      for (const combo of combinations) next.push({ ...combo, [key]: variant });
    }
    if (next.length > MAX_PERMUTATIONS_PER_TYPE) {
      console.warn(
        `[kmjs permutations] type "${typeName}" would produce ${
          next.length
        } variants – skipping (threshold = ${MAX_PERMUTATIONS_PER_TYPE}).`,
      );
      return []; // caller decides what to do
    }
    combinations.splice(0, combinations.length, ...next);
  }

  // ────────────────────────────────────────────────────────────────────
  //  FrontWindowCondition / AnyWindowCondition
  //  – build variants entirely from their own semantics
  // ────────────────────────────────────────────────────────────────────
  if (
    typeName === "FrontWindowCondition" ||
    typeName === "AnyWindowCondition"
  ) {
    // Use the first entry from specificApps (Finder) for canonical app reference
    const appSample = {
      BundleIdentifier: specificApps[0].bundleIdentifier,
      Name: specificApps[0].name,
      NewFile: specificApps[0].newFile,
    };

    // Operators that need a title **value** vs. those that just need the key
    const TITLE_REQUIRED = new Set([
      "TitleIs",
      "TitleIsNot",
      "TitleContains",
      "TitleDoesNotContain",
      "TitleMatches",
      "TitleDoesNotMatch",
    ]);
    const TITLE_OPTIONAL = new Set([
      "ExistsButTitleIsNot",
      "ExistsButTitleDoesNotContain",
      "ExistsButTitleDoesNotMatch",
    ]);

    return combinations.flatMap((varying) => {
      const opKey =
        typeName === "FrontWindowCondition"
          ? "FrontWindowConditionType"
          : "AnyWindowConditionType";
      const op = (varying as any)[opKey];

      // Build a clean base object (no optional props yet)
      const core: Record<string, any> = {
        ConditionType: getConditionTypeKeyword(typeName),
        ...varying,
      };

      // ---- Title handling --------------------------------------------
      if (typeName === "FrontWindowCondition") {
        if (TITLE_REQUIRED.has(op)) {
          // KM expects a non-empty title for these predicates
          core.FrontWindowTitle = "frontwindowtitle_sample";
        } else if (TITLE_OPTIONAL.has(op)) {
          // KM keeps the key but allows an empty string
          core.FrontWindowTitle = "";
        } else {
          delete core.FrontWindowTitle; // no key at all
        }
      } else {
        // AnyWindowCondition always serialises AnyWindowTitle (can be empty string)
        // Set a sample value for AnyWindowTitle for all permutations
        core.AnyWindowTitle = "anywindowtitle_sample";
      }

      // ---- Build the two mutually-exclusive variants ------------------
      // 1. Front-application variant (NO Application dict)
      const frontVariant = {
        ...core,
        IsFrontApplication: true,
      };
      delete (frontVariant as any).Application;

      // 2. Specific-application variant (WITH Application dict)
      const specificVariant = {
        ...core,
        IsFrontApplication: false,
        Application: appSample,
      };

      return [frontVariant, specificVariant] as unknown as T[];
    });
  }

  // Special-case ActionResultCondition: provide numeric text for numeric operators
  if (typeName === "ActionResultCondition") {
    return combinations.map((varying) => {
      const operator = varying.ActionResultConditionType as string;
      const numericOperators = [
        "LessThan",
        "LessThanOrEqual",
        "Equal",
        "GreaterThanOrEqual",
        "GreaterThan",
        "NotEqual",
      ];

      const common = {
        ConditionType: getConditionTypeKeyword(typeName),
        ...base,
        ...varying,
      } as Record<string, any>;

      // ── decide what text belongs (if any) ──────────────────────────────
      if (operator === "IsOK" || operator === "IsNotOK") {
        // Remove ActionResultText entirely for IsOK/IsNotOK
        // delete common.ActionResultText;
        // DO NOT UNCOMMENT
      } else if (numericOperators.includes(operator)) {
        common.ActionResultText = "0"; // numeric comparison
      } else {
        common.ActionResultText = "ExampleTextString"; // generic textual compare
      }

      return common as unknown as T;
    });
  }

  // Special-case ClipboardCondition: provide appropriate text for operators
  if (typeName === "ClipboardCondition") {
    return combinations.map((varying) => {
      // pull out the boolean so we can re-attach it after we override text
      const { ClipboardSourceUseTriggerClipboard: useTrigger, ...rest } =
        varying;
      const common = {
        ConditionType: getConditionTypeKeyword(typeName),
        ...base,
        ...rest,
      } as Record<string, any>;

      const operator = varying.ClipboardConditionType as string;
      const numericOperators = [
        "LessThan",
        "LessThanOrEqual",
        "Equal",
        "GreaterThanOrEqual",
        "GreaterThan",
        "NotEqual",
      ];

      // ── decide what text belongs (if any) ──────────────────────────────
      if (numericOperators.includes(operator)) {
        common.ClipboardText = "123"; // numeric comparison
      } else {
        common.ClipboardText = "Sample Text"; // generic textual compare
      }
      // put the trigger-clipboard flag back
      // common.ClipboardSourceUseTriggerClipboard = useTrigger;
      // include the trigger-clipboard flag only when it is explicitly true
      if (useTrigger === true) {
        common.ClipboardSourceUseTriggerClipboard = true;
      }

      return common as unknown as T;
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  //  FoundImageCondition  (If/Then/Else “ScreenImage”)
  //  – enumerate every ScreenArea variant Keyboard Maestro offers
  // ──────────────────────────────────────────────────────────────────────
  if (typeName === "FoundImageCondition") {
    const screenAreaSamples: import("../../../src/virtual_actions/types/types.ui").ScreenArea[] =
      [
        { type: "ScreenAll" },
        { type: "ScreenIndex", index: 1 },
        { type: "WindowName", name: "Main" },
        { type: "WindowNameContaining", name: "Contain" },
        { type: "WindowNameMatching", name: "Match.*" },
        { type: "WindowIndex", index: 1 },
        { type: "Area", left: 10, top: 20, width: 300, height: 200 },
      ];

    return combinations.flatMap((varying) =>
      screenAreaSamples.map((sa) => {
        const cond: Record<string, any> = {
          ConditionType: "ScreenImage",
          ScreenArea: sa,
          Fuzz: 50,
          DisplayMatches: false,
          ...base,
          ...varying,
        };
        return cond as unknown as T;
      }),
    );
  }

  // Special-case CalculationCondition: provide mathematical expression
  // (now handled above in single-variant branch)

  // Special-case KeyCondition: generate valid key codes and condition types
  if (typeName === "KeyCondition") {
    // Representative key codes: 5 (G), 46 (M), 32767 (Any Key)
    const keyCodes = [5, 46, 32767];
    const keyConditionTypes = ["Down", "Up"];
    return keyCodes.flatMap((keyCode) =>
      keyConditionTypes.map((keyConditionType) => ({
        ConditionType: "Key",
        KeyCode: keyCode,
        KeyConditionType: keyConditionType,
      })),
    ) as unknown as T[];
  }

  // Special-case ApplicationCondition: generate permutations for all specificApps and ApplicationConditionType
  if (typeName === "ApplicationCondition") {
    const conditionTypes = [
      "Running",
      "NotRunning",
      "Active",
      "NotActive",
      "RunningButNotActive",
      "Hidden",
      "NotHidden",
      "RunningButHidden",
    ];
    return specificApps.flatMap((app) =>
      conditionTypes.map((conditionType) => ({
        ConditionType: "Application",
        ApplicationConditionType: conditionType,
        Application: {
          BundleIdentifier: app.bundleIdentifier,
          Name: app.name,
          Match: app.match,
          NewFile: app.newFile,
        },
      })),
    ) as unknown as T[];
  }

  // Special-case ModifiersCondition: generate all meaningful bitmask combinations
  if (typeName === "ModifiersCondition") {
    const bitmaskValues = [0, 256, 5632, 7936];
    const permutations: any[] = [];
    for (const down of bitmaskValues) {
      for (const up of bitmaskValues) {
        permutations.push({
          ConditionType: "Modifiers",
          ModifiersDown: down,
          ModifiersUp: up,
        });
      }
    }
    console.log(
      "[DEBUG] ModifiersCondition permutations generated:",
      permutations.length,
    );
    return permutations as unknown as T[];
  }

  // Special-case OCRCondition: generate valid permutations for each ImageSource
  if (typeName === "OCRCondition") {
    const imageSources = [
      "Image",
      "Icon",
      "SystemClipboard",
      "TriggerClipboard",
      "NamedClipboard",
      "File",
      "Screen",
    ];
    const languageSamples = ["Languages/eng", "Apple Text Recognition"];
    const ocrConditionTypes = ["IsEmpty", "IsNotEmpty", "Contains", "IsAfter"];
    const screenAreaSamples = [
      { type: "ScreenAll" },
      { type: "ScreenIndex", index: 1 },
      { type: "WindowName", name: "Main" },
      { type: "WindowNameContaining", name: "Contain" },
      { type: "WindowNameMatching", name: "Match.*" },
      { type: "WindowIndex", index: 1 },
      { type: "Area", left: 10, top: 20, width: 300, height: 200 },
    ];
    const result: any[] = [];
    for (const imageSource of imageSources) {
      for (const language of languageSamples) {
        for (const ocrType of ocrConditionTypes) {
          // Build base condition
          const cond: Record<string, any> = {
            ConditionType: "OCR",
            ImageSource: imageSource,
            Language: language,
            OCRConditionType: ocrType,
          };
          // Add keys based on ImageSource
          if (imageSource === "File") {
            cond.ImagePath = "imagepath_sample";
          } else if (imageSource === "NamedClipboard") {
            cond.ImageNamedClipboardName = "imagenamedclipboardname_sample";
            cond.ImageNamedClipboardRedundandDisplayName =
              "imagenamedclipboardredundanddisplayname_sample";
          } else if (imageSource === "Screen") {
            for (const sa of screenAreaSamples) {
              result.push({
                ...cond,
                ImageScreenArea: sa,
                ConditionResult:
                  ocrType === "Contains" || ocrType === "IsAfter"
                    ? "testContainsString"
                    : undefined,
              });
            }
            continue;
          }
          // Optionally add ConditionResult for Contains/IsAfter
          if (ocrType === "Contains" || ocrType === "IsAfter") {
            cond.ConditionResult =
              ocrType === "Contains" ? "testContainsString" : "isAfterExample";
          }
          result.push(cond);
        }
      }
    }
    return result as unknown as T[];
  }

  // Special-case PixelCondition: generate all possible combinations, even if some are invalid
  if (typeName === "PixelCondition") {
    // Use authoritative bad↔good tuples from the KM GUI
    const pixelPairs: { bad: string; good: string }[] = [
      { bad: "IsNot", good: "Is" },
      { bad: "IsBrighter", good: "IsNot" },
      { bad: "IsDarker", good: "IsBrighter" },
      { bad: "IsMoreRed", good: "IsDarker" },
      { bad: "IsLessRed", good: "IsMoreRed" },
      { bad: "IsMoreGreen", good: "IsLessRed" },
      { bad: "IsLessGreen", good: "IsMoreGreen" },
      { bad: "IsMoreBlue", good: "IsLessGreen" },
      { bad: "IsLessBlueIsNot", good: "IsMoreBlue" },
      { bad: "IsLessBlue", good: "IsLessBlue" }, // identical pair
    ];
    const positions = [
      { h: "0", v: "0" },
      { h: "59", v: "1000" },
      { h: "61", v: "999" },
    ];
    const colors = [
      { r: 0, g: 128, b: 128 },
      { r: 0, g: 44, b: 128 },
      { r: 191, g: 191, b: 191 },
    ];
    const result: any[] = [];
    let permutationIndex = 0;
    for (const { bad: pixelType, good: pixelTypeGood } of pixelPairs) {
      for (const pos of positions) {
        for (const col of colors) {
          result.push({
            ConditionType: "Pixel",
            HorizontalPositionExpression: pos.h,
            VerticalPositionExpression: pos.v,
            PixelConditionType: pixelType,
            PixelConditionTypeGood: pixelTypeGood,
            Red: col.r,
            Green: col.g,
            Blue: col.b,
          });
        }
      }
    }
    return result as unknown as T[];
  }

  // Special-case ScriptCondition: exercise IncludedVariables forms
  if (typeName === "ScriptCondition") {
    return combinations.flatMap((varying) => {
      const baseCond = {
        ConditionType: getConditionTypeKeyword(typeName),
        ...base,
        ...varying,
      };
      return [
        { ...baseCond, IncludedVariables: [] }, // none
        { ...baseCond, IncludedVariables: ["9999"] }, // all
        { ...baseCond, IncludedVariables: ["ExampleVariableOne"] }, // one
        {
          ...baseCond,
          IncludedVariables: [
            "ExampleVariableOne",
            "ExampleVariableTwo",
            "ExampleVariableThree",
          ],
        }, // multiple
      ] as unknown as T[];
    });
  }

  // All other condition types
  return combinations.map(
    (varying) =>
      ({
        ConditionType: getConditionTypeKeyword(typeName),
        ...base,
        ...varying,
      }) as unknown as T,
  );
}
