//FILE: src/virtual_actions/kmjs.virtualAction.setClipboardToText.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import { renderSetVariableProcessingModeXml } from "../utils/template.xml.variable";
import { generateClipboardDestinationXml } from "../utils/template.xml.clipboard";
import {
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import {
  encodeStyledTextData,
  generateBasicRtf,
  stripRtfToPlainText,
} from "../utils/utils.styledText";
import { KM_TOKENS } from "../tokens";
import type { VirtualAction } from "./types";
import type { ProcessingMode, ClipboardDestination } from "./types/types.data";
import type { StopOnFailure, NotifyOnFailure } from "./types/types.system";

/**
 * Preset modes for Set Clipboard to Text action (convenience, not in KM UI).
 * - undefined: normal
 * - "delete": sets Text to "%Delete%" (KM GUI suggested option)
 * - "positionCursor": sets Text to "%|%" (KM GUI suggested option)
 * - Any key from KM_TOKENS: sets Text to the corresponding token value
 *
 * @example
 * // KM GUI suggested presets
 * presetMode: "delete" // → "%Delete%"
 * presetMode: "positionCursor" // → "%|%"
 *
 * // Token presets
 * presetMode: "ARandomUniqueID" // → "%RandomUUID%"
 * presetMode: "FrontApplicationName" // → "%Application%1%"
 * presetMode: "CurrentMouseLocation" // → "%CurrentMouse%"
 */
export type SetClipboardToTextPresetMode =
  | undefined
  | "delete"
  | "positionCursor"
  | keyof typeof KM_TOKENS;

/**
 * Options for Set Clipboard to Text action.
 */
export interface SetClipboardToTextOptions {
  /** The text to set the clipboard to. */
  text?: string;

  /**
   * Preset mode for convenience. Can be KM GUI suggested presets ("delete", "positionCursor")
   * or any token key from KM_TOKENS for IntelliSense-supported token insertion.
   */
  presetMode?: SetClipboardToTextPresetMode;

  /**
   * Processing mode for the text.
   * - undefined: Process Text Normally (default)
   * - "TextTokensOnly": Process Text Tokens Only
   * - "Nothing": Process Nothing
   */
  processingMode?: ProcessingMode;

  /**
   * Whether to include styled text data.
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
   * Clipboard destination.
   * - undefined: System clipboard (default)
   * - "TriggerClipboard": Use trigger clipboard
   * - NamedClipboardDestination: Use named clipboard
   */
  destination?: ClipboardDestination;

  /** If false, failure does not abort macro (default true). */
  stopOnFailure?: StopOnFailure;

  /** If false, do not notify on failure (default true). */
  notifyOnFailure?: NotifyOnFailure;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Set Clipboard to Text action.
 *
 * This action sets the clipboard content to the specified text, with support for
 * styled text, text processing options, and different clipboard destinations.
 *
 * @param opts - SetClipboardToTextOptions for text content, processing, styling, and destination.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic clipboard text setting
 * createVirtualSetClipboardToText({ text: "Hello World" })
 *
 * @example
 * // Set clipboard with styled text
 * createVirtualSetClipboardToText({
 *   text: "Styled Text",
 *   includeStyledText: true
 * })
 *
 * @example
 * // Set named clipboard with text tokens only
 * createVirtualSetClipboardToText({
 *   text: "Variable: %Variable%MyVar%",
 *   processingMode: "TextTokensOnly",
 *   destination: { name: "MyClipboard", uid: "12345" }
 * })
 *
 * @example
 * // KM GUI suggested presets
 * createVirtualSetClipboardToText({ presetMode: "delete" })
 * createVirtualSetClipboardToText({ presetMode: "positionCursor" })
 *
 * @example
 * // Token presets
 * createVirtualSetClipboardToText({ presetMode: "ARandomUniqueID" })
 * createVirtualSetClipboardToText({ presetMode: "FrontApplicationName" })
 * createVirtualSetClipboardToText({ presetMode: "CurrentMouseLocation" })
 */
export function createVirtualSetClipboardToText(
  opts: SetClipboardToTextOptions = {},
): VirtualAction {
  const {
    text = "",
    presetMode,
    processingMode,
    includeStyledText = false,
    rtfContent,
    destination,
    stopOnFailure,
    notifyOnFailure,
  } = opts;

  // Handle preset modes
  let finalText = text;
  if (presetMode === "delete") {
    finalText = "%Delete%";
  } else if (presetMode === "positionCursor") {
    finalText = "%|%";
  } else if (presetMode && presetMode in KM_TOKENS) {
    // Use token from KM_TOKENS
    finalText = KM_TOKENS[presetMode as keyof typeof KM_TOKENS];
  }

  // Build styled text data if requested
  let styledTextXml = "";

  if (includeStyledText) {
    // Generate RTF content if not provided
    let finalRtfContent = rtfContent;
    if (!finalRtfContent) {
      finalRtfContent = generateBasicRtf(text);
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
        `[setClipboardToText] Failed to encode styled text, falling back to plain text: ${error}`,
      );
    }
  }

  // Build clipboard destination XML
  const clipboardDestinationXml = generateClipboardDestinationXml(destination);

  // Handle special clipboard destination keys for SetClipboardToText action
  let targetClipboardXml: string[] = [];
  if (destination === "TriggerClipboard") {
    targetClipboardXml = [
      "\t\t<key>TargetUseTriggerClipboard</key>",
      "\t\t<true/>",
    ];
  } else if (
    destination &&
    typeof destination === "object" &&
    "name" in destination
  ) {
    targetClipboardXml = [
      "\t\t<key>TargetNamedClipboardRedundantDisplayName</key>",
      `\t\t<string>${destination.name}</string>`,
      ...(destination.uid
        ? [
            "\t\t<key>TargetNamedClipboardUID</key>",
            `\t\t<string>${destination.uid}</string>`,
          ]
        : []),
      "\t\t<key>TargetUseNamedClipboard</key>",
      "\t\t<true/>",
    ];
  }

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>JustDisplay</key>",
    "\t\t<false/>",
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>SetClipboardToText</string>",
    ...renderNotifyOnFailureXml(notifyOnFailure),
    ...(processingMode
      ? renderSetVariableProcessingModeXml(processingMode)
      : []),
    ...renderStopOnFailureXml(stopOnFailure),
    ...(styledTextXml ? [styledTextXml] : []),
    ...targetClipboardXml,
    "\t\t<key>Text</key>",
    `\t\t<string>${escapeForXml(finalText)}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
