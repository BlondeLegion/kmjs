//FILE: src/virtual_actions/kmjs.virtualAction.switchCase.ts

import type { VirtualAction } from "./types";
import type { ProcessingMode } from "./types/types.data";
import { renderTextWithProcessingMode } from "../utils/template.xml.text";
import { formatXmlAction } from "../utils/utils.xml";

/**
 * The “Switch / Case” action evaluates a *source* value against a list of textual
 * comparisons. Each case has an operator ("Contains", "Is", "IsAfter", "Otherwise", etc.)
 * and an optional TestValue string plus an array of nested actions.
 *
 * XML shape (minimal):
 *
 * <dict>
 *   <key>ActionUID</key><integer>...</integer>
 *   <key>CaseEntries</key>
 *   <array>
 *     <dict>
 *       <key>Actions</key><array/>         ← nested actions
 *       <key>ConditionType</key><string>Contains</string>
 *       <key>TestValue</key><string>Example</string>
 *     </dict>
 *   </array>
 *   <key>MacroActionType</key><string>Switch</string>
 *   <key>Source</key><string>Clipboard</string>
 * </dict>
 */
/* -------------------------------------------------------------------------- */
/*  Public Types                                                              */
/* -------------------------------------------------------------------------- */

/** Operators supported by Keyboard Maestro's Switch/Case (extended TextualConditionOperator). */
export type SwitchCaseOperator =
  | "IsEmpty"
  | "IsNotEmpty"
  | "Is"
  | "IsNot"
  | "Contains"
  | "DoesNotContain"
  | "StartsWith"
  | "EndsWith"
  | "IsBefore"
  | "IsAfter"
  | "Matches"
  | "DoesNotMatch"
  | "LessThan"
  | "LessThanOrEqual"
  | "Equal"
  | "GreaterThanOrEqual"
  | "GreaterThan"
  | "NotEqual"
  | "Otherwise";
/** Source selector for the switch. */
export type SwitchSource =
  | "Clipboard"
  | "NamedClipboard"
  | "TriggerClipboard"
  | "Variable"
  | "Text"
  | "Calculation"
  | "EnvironmentVariable"
  | "File";

export interface SwitchCaseEntry {
  operator: SwitchCaseOperator;
  /** Comparison text. Can be empty string; KM always serialises the key. */
  testValue?: string;
  /** Nested actions executed when this case matches. */
  actions?: VirtualAction[];
}

export interface SwitchCaseOptions {
  /** Source value used for comparison. */
  source: SwitchSource;
  /**
   * For `source === "Variable"`.
   * Keyboard Maestro expects <key>Variable</key><string>${name}</string>
   */
  variable?: string;
  /** For `source === "Text"`. */
  text?: string;
  /** For `source === "Text"`, optionally control processing mode. Omit for “Process Text Normally”. */
  textProcessingMode?: ProcessingMode;
  /** For `source === "Calculation"`. */
  calculation?: string;
  /** For `source === "EnvironmentVariable"`. */
  environmentVariable?: string;
  /** For `source === "File"`. */
  path?: string;
  /** For `source === "NamedClipboard"`. (UID + display name not yet reverse-engineered – user supplies raw string.) */
  namedClipboard?: {
    uid: string;
    redundantDisplayName: string;
  };
  /** Case list. Must contain at least one entry; GUI always has one. */
  cases: SwitchCaseEntry[];
}

/* -------------------------------------------------------------------------- */
/*  Implementation                                                            */
/* -------------------------------------------------------------------------- */

export function createVirtualSwitchCase(
  opts: SwitchCaseOptions,
): VirtualAction {
  const {
    source,
    variable,
    text = "",
    textProcessingMode,
    calculation = "",
    environmentVariable = "",
    path = "",
    namedClipboard,
    cases,
  } = opts;
  if (!cases || cases.length === 0) {
    throw new Error("SwitchCase requires at least one case entry.");
  }

  // Serialise case entries
  const caseXml = cases
    .map((c) => {
      const actionsXml = (c.actions ?? [])
        .map((a) =>
          a
            .toXml()
            .split("\n")
            .map((line) => "\t\t\t\t\t" + line)
            .join("\n"),
        )
        .join("\n");
      const actionsSection =
        c.actions && c.actions.length
          ? ["\t\t\t\t<array>", actionsXml, "\t\t\t\t</array>"].join("\n")
          : "\t\t\t\t<array/>";

      // KM always serialises TestValue; use empty string if undefined
      const testValue = c.testValue ?? "";

      return [
        "\t\t\t<dict>",
        "\t\t\t\t<key>Actions</key>",
        actionsSection,
        "\t\t\t\t<key>ConditionType</key>",
        `\t\t\t\t<string>${c.operator}</string>`,
        "\t\t\t\t<key>TestValue</key>",
        testValue === ""
          ? "\t\t\t\t<string/>"
          : `\t\t\t\t<string>${testValue}</string>`,
        "\t\t\t</dict>",
      ].join("\n");
    })
    .join("\n");

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>ActionUID</key>",
    `\t\t<integer>${Math.floor(Date.now() / 1000)}</integer>`,
    // For Calculation sources KM serialises the <Calculation> key *before* CaseEntries.
    ...(source === "Calculation"
      ? [
          "\t\t<key>Calculation</key>",
          calculation ? `\t\t<string>${calculation}</string>` : "\t\t<string/>",
        ]
      : []),
    "\t\t<key>CaseEntries</key>",
    cases.length ? "\t\t<array>" : "\t\t<array/>",
    ...(cases.length ? [caseXml, "\t\t</array>"] : []),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>Switch</string>",
    // For File sources KM places <Path> *before* <Source>
    ...(source === "File"
      ? [
          "\t\t<key>Path</key>",
          path === "" ? "\t\t<string/>" : `\t\t<string>${path}</string>`,
        ]
      : []),
    "\t\t<key>Source</key>",
    `\t\t<string>${source}</string>`,
    // Source-specific keys
    ...(source === "Variable"
      ? [
          "\t\t<key>Variable</key>",
          variable && variable !== ""
            ? `\t\t<string>${variable}</string>`
            : "\t\t<string/>",
        ]
      : source === "Text"
        ? renderTextWithProcessingMode(text, textProcessingMode)
        : source === "EnvironmentVariable"
          ? [
              "\t\t<key>Text</key>",
              environmentVariable === ""
                ? "\t\t<string/>"
                : `\t\t<string>${environmentVariable}</string>`,
            ]
          : source === "NamedClipboard" && namedClipboard
            ? [
                "\t\t<key>ClipboardSourceNamedClipboardUID</key>",
                `\t\t<string>${namedClipboard.uid}</string>`,
                "\t\t<key>ClipboardSourceNamedClipboardRedundantDisplayName</key>",
                `\t\t<string>${namedClipboard.redundantDisplayName}</string>`,
              ]
            : []),
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
