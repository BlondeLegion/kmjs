//FILE: src/virtual_actions/kmjs.virtualAction.insertText.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import { renderSetVariableProcessingModeXml } from "../utils/template.xml.variable";
import {
  encodeStyledTextData,
  generateBasicRtf,
  stripRtfToPlainText,
} from "../utils/utils.styledText";
import {
  resolveTokenPreset,
  type TokenPresetMode,
} from "../utils/template.xml.token";
import type { VirtualAction } from "./types";
import type { ProcessingMode } from "./types/types.data";

/**
 * Action modes for Insert Text action.
 * - "ByTyping": Insert text by typing (simulates keystrokes)
 * - "ByPasting": Insert text by pasting (uses clipboard)
 * - "ByPastingStyles": Insert text by pasting with styles (uses styled text)
 * - "DisplayWindow": Display text in a window
 * - "DisplayBriefly": Display text briefly (notification-style)
 * - "DisplayLarge": Display text in large format
 */
export type InsertTextAction =
  | "ByTyping"
  | "ByPasting"
  | "ByPastingStyles"
  | "DisplayWindow"
  | "DisplayBriefly"
  | "DisplayLarge";

/**
 * Options for Insert Text action.
 */
export interface InsertTextOptions {
  /** The text to insert or display. */
  text: string;

  /**
   * Token preset for convenience. Any token key from KM_TOKENS for IntelliSense-supported token insertion.
   * When provided, overrides the text parameter.
   */
  tokenPreset?: TokenPresetMode;

  /**
   * Action mode - how the text should be inserted or displayed.
   * @default "ByTyping"
   */
  action?: InsertTextAction;

  /**
   * Processing mode for the text.
   * - undefined: Process Text Normally (default)
   * - "TextTokensOnly": Process Text Tokens Only
   * - "Nothing": Process Nothing
   */
  processingMode?: ProcessingMode;

  /**
   * Whether to include styled text data for actions that support it.
   * Only applies to "ByPastingStyles" and "DisplayWindow" actions.
   * When true, generates <StyledText><data>...</data></StyledText> from RTF.
   * @default false
   */
  includeStyledText?: boolean;

  /**
   * RTF string for styled text. Only used when includeStyledText is true.
   * If not provided, a basic RTF wrapper will be created around the text.
   */
  rtfContent?: string;

  /**
   * Target application for ByTyping action.
   * - "Front": Target front application (default)
   * - Custom targeting can be added later if needed
   */
  targetingType?: "Front";
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Insert Text action.
 *
 * This action can insert text by typing, pasting, or display it in various ways.
 * It supports styled text for certain action modes and text processing options.
 *
 * @param opts - InsertTextOptions for text content, action mode, processing, and styling.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic text insertion by typing
 * createVirtualInsertText({ text: "Hello World" })
 *
 * @example
 * // Display text in window with styled text
 * createVirtualInsertText({
 *   text: "Styled Text",
 *   action: "DisplayWindow",
 *   includeStyledText: true
 * })
 *
 * @example
 * // Insert by pasting with text tokens only
 * createVirtualInsertText({
 *   text: "Variable: %Variable%MyVar%",
 *   action: "ByPasting",
 *   processingMode: "TextTokensOnly"
 * })
 *
 * @example
 * // Token presets
 * createVirtualInsertText({ text: "", tokenPreset: "ARandomUniqueID" })
 * createVirtualInsertText({ text: "", tokenPreset: "FrontApplicationName", action: "ByPasting" })
 */
export function createVirtualInsertText(
  opts: InsertTextOptions,
): VirtualAction {
  const {
    text,
    tokenPreset,
    action = "ByTyping",
    processingMode,
    includeStyledText = false,
    rtfContent,
    targetingType = "Front",
  } = opts;

  // Resolve token preset
  const resolvedText = resolveTokenPreset(text, tokenPreset);

  // Build styled text data for actions that support it
  const supportsStyledText =
    action === "ByPastingStyles" || action === "DisplayWindow";
  let styledTextXml = "";
  let finalText = resolvedText;

  if (includeStyledText && supportsStyledText) {
    // Generate RTF content if not provided
    let finalRtfContent = rtfContent;
    if (!finalRtfContent) {
      finalRtfContent = generateBasicRtf(resolvedText);
    }

    try {
      // Encode the RTF as base64 styled text data
      const styledTextData = encodeStyledTextData(finalRtfContent);
      const indentedData = styledTextData
        .split("\n")
        .map((line) => `\t\t${line}`)
        .join("\n");

      styledTextXml = [
        "\t\t<key>StyledText</key>",
        "\t\t<data>",
        indentedData,
        "\t\t</data>",
      ].join("\n");

      // When using custom RTF, extract the plain text from it for the Text field
      // This matches Keyboard Maestro's behavior
      if (rtfContent) {
        finalText = stripRtfToPlainText(finalRtfContent);
      }
    } catch (error) {
      // If styled text encoding fails, fall back to plain text
      console.warn(
        `[insertText] Failed to encode styled text, falling back to plain text: ${error}`,
      );
    }
  }

  // Build target application XML for ByTyping action
  const targetingXml =
    action === "ByTyping"
      ? [
          "\t\t<key>TargetApplication</key>",
          "\t\t<dict/>",
          "\t\t<key>TargetingType</key>",
          `\t\t<string>${targetingType}</string>`,
        ].join("\n")
      : "";

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    `\t\t<string>${action}</string>`,
    ...generateActionUIDXml(),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>InsertText</string>",
    ...(processingMode
      ? renderSetVariableProcessingModeXml(processingMode)
      : []),
    ...(styledTextXml ? [styledTextXml] : []),
    ...(targetingXml ? [targetingXml] : []),
    "\t\t<key>Text</key>",
    `\t\t<string>${escapeForXml(finalText)}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
