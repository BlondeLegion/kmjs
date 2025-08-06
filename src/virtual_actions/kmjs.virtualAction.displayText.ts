//FILE: src/virtual_actions/kmjs.virtualAction.displayText.ts

/**
 * DISPLAY TEXT WRAPPERS
 *
 * This module provides convenience functions around the InsertText virtual action
 * to display text in common KM modes: briefly (notification-style) or in a window.
 * It leverages createVirtualInsertText under the hood, reducing boilerplate for callers.
 *
 * Inline documentation is provided for parameters and behavior to assist new contributors
 * and automated agents in understanding the purpose of each wrapper.
 */

import type { VirtualAction } from "./types";
import type { ProcessingMode } from "./types/types.data";
import { createVirtualInsertText } from "./kmjs.virtualAction.insertText";
import {
  resolveTokenPreset,
  type TokenPresetMode,
} from "../utils/template.xml.token";

/**
 * Options for DisplayText virtual action wrapper.
 */
export interface DisplayTextOptions {
  /** The text to display. */
  text: string;

  /**
   * Token preset for convenience. Any token key from KM_TOKENS for IntelliSense-supported token insertion.
   * When provided, overrides the text parameter.
   */
  tokenPreset?: TokenPresetMode;

  /**
   * Optional text processing mode.
   * - undefined: Process text normally (default)
   * - "TextTokensOnly": Process text tokens only
   * - "Nothing": Process nothing
   */
  processingMode?: ProcessingMode;

  /**
   * Whether to include styled text data (only applies to DisplayWindow).
   * @default false
   */
  includeStyledText?: boolean;

  /**
   * Optional RTF content when includeStyledText is true.
   */
  rtfContent?: string;
}

/**
 * Constructs a VirtualAction to display text briefly (notification-style, self-dimssing after a short timeframe).
 *
 * Appropirate for quick messages, small in nature and importance.
 *
 * This is a wrapper around the InsertText action, preconfigured for
 * the 'DisplayBriefly' mode.
 *
 * @param opts - Options including the text to display and optional processing.
 * @returns A VirtualAction emitting the corresponding KM XML.
 *
 * @example
 * // Basic usage
 * createVirtualDisplayTextBriefly({ text: "Hello World" })
 *
 * @example
 * // Token presets
 * createVirtualDisplayTextBriefly({ text: "", tokenPreset: "ARandomUniqueID" })
 * createVirtualDisplayTextBriefly({ text: "", tokenPreset: "FrontApplicationName" })
 */
export function createVirtualDisplayTextBriefly(
  opts: DisplayTextOptions,
): VirtualAction {
  const finalText = resolveTokenPreset(opts.text, opts.tokenPreset);

  return createVirtualInsertText({
    text: finalText,
    action: "DisplayBriefly",
    processingMode: opts.processingMode,
    includeStyledText: false,
  });
}

/**
 * Constructs a VirtualAction to display text in a window.
 *
 * Creates a pop-up modal window appropriate for displaying large amounts of information.
 *
 * This is a wrapper around the InsertText action, preconfigured for
 * the 'DisplayWindow' mode. Supports optional styled text.
 *
 * @param opts - Options including the text to display, processing, and styling.
 * @returns A VirtualAction emitting the corresponding KM XML.
 *
 * @example
 * // Basic usage
 * createVirtualDisplayTextWindow({ text: "Hello World" })
 *
 * @example
 * // Token presets
 * createVirtualDisplayTextWindow({ text: "", tokenPreset: "CurrentMouseLocation" })
 * createVirtualDisplayTextWindow({ text: "", tokenPreset: "FrontApplicationName" })
 */
export function createVirtualDisplayTextWindow(
  opts: DisplayTextOptions,
): VirtualAction {
  const finalText = resolveTokenPreset(opts.text, opts.tokenPreset);

  return createVirtualInsertText({
    text: finalText,
    action: "DisplayWindow",
    processingMode: opts.processingMode,
    includeStyledText: opts.includeStyledText ?? false,
    rtfContent: opts.rtfContent,
  });
}
