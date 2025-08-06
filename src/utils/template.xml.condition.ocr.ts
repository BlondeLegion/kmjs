//FILE: src/utils/template.xml.condition.ocr.ts

/**
 * @fileoverview OCR (Optical Character Recognition) condition template utilities for Keyboard Maestro XML generation.
 *
 * This module provides utilities for normalizing and rendering OCR-based conditions in Keyboard Maestro macros.
 * OCR conditions allow macros to detect and respond to text found on screen through image recognition.
 *
 * @module template.xml.condition.ocr
 * @since 1.0.0
 */

import { screenAreaToXml } from "./template.xml.ui";

/**
 * Normalizes an OCR condition object by removing unnecessary properties based on the image source type.
 *
 * OCR conditions in Keyboard Maestro can use different image sources (File, NamedClipboard, Screen, etc.),
 * and each source type requires different XML properties. This function ensures that only the relevant
 * properties are included in the final XML output by removing properties that don't apply to the
 * specified image source.
 *
 * ## Image Source Types and Their Properties:
 *
 * - **File**: Uses `ImagePath`, removes clipboard and screen area properties
 * - **NamedClipboard**: Uses clipboard properties, removes file path and screen area
 * - **Screen**: Uses `ImageScreenArea`, removes file path and clipboard properties
 * - **SystemClipboard/TriggerClipboard/Icon/Image**: Uses minimal properties, removes most others
 *
 * @param cond - The OCR condition object to normalize
 * @param cond.ConditionType - Must be "OCR" for this function to process the condition
 * @param cond.ImageSource - The source type for the OCR image ("File", "NamedClipboard", "Screen", etc.)
 * @param cond.ImagePath - File path (used when ImageSource is "File")
 * @param cond.ImageNamedClipboardName - Named clipboard identifier (used when ImageSource is "NamedClipboard")
 * @param cond.ImageNamedClipboardRedundandDisplayName - Display name for named clipboard
 * @param cond.ImageScreenArea - Screen area definition (used when ImageSource is "Screen")
 *
 * @returns The normalized condition object with unnecessary properties removed
 *
 * @example
 * ```typescript
 * // File-based OCR condition
 * const fileCondition = {
 *   ConditionType: "OCR",
 *   ImageSource: "File",
 *   ImagePath: "/path/to/template.png",
 *   ImageNamedClipboardName: "unused", // Will be removed
 *   ImageScreenArea: { type: "ScreenAll" } // Will be removed
 * };
 *
 * const normalized = normaliseOCRCondition(fileCondition);
 * // Result: { ConditionType: "OCR", ImageSource: "File", ImagePath: "/path/to/template.png" }
 * ```
 *
 * @example
 * ```typescript
 * // Screen-based OCR condition
 * const screenCondition = {
 *   ConditionType: "OCR",
 *   ImageSource: "Screen",
 *   ImagePath: "/unused/path.png", // Will be removed
 *   ImageScreenArea: { type: "ScreenAll" }
 * };
 *
 * const normalized = normaliseOCRCondition(screenCondition);
 * // Result: { ConditionType: "OCR", ImageSource: "Screen", ImageScreenArea: { type: "ScreenAll" } }
 * ```
 *
 * @example
 * ```typescript
 * // Non-OCR condition (passes through unchanged)
 * const otherCondition = { ConditionType: "Variable", Variable: "MyVar" };
 * const result = normaliseOCRCondition(otherCondition);
 * // Result: { ConditionType: "Variable", Variable: "MyVar" } (unchanged)
 * ```
 */
export function normaliseOCRCondition(cond: any): any {
  // Only process OCR conditions, pass through others unchanged
  if (cond.ConditionType !== "OCR") return cond;

  const src = cond.ImageSource;

  // Remove properties that don't apply to File-based image sources
  if (src === "File") {
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
    delete cond.ImageScreenArea;
  }
  // Remove properties that don't apply to NamedClipboard-based image sources
  else if (src === "NamedClipboard") {
    delete cond.ImagePath;
    delete cond.ImageScreenArea;
  }
  // Remove properties that don't apply to Screen-based image sources
  else if (src === "Screen") {
    delete cond.ImagePath;
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
  }
  // Remove properties that don't apply to clipboard/icon/image sources
  else if (
    src === "SystemClipboard" ||
    src === "TriggerClipboard" ||
    src === "Icon" ||
    src === "Image"
  ) {
    delete cond.ImagePath;
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
    delete cond.ImageScreenArea;

    // For default "Image" source, remove the ImageSource property entirely
    if (src === "Image") {
      delete cond.ImageSource;
    }
  }

  // Clean up any undefined properties that may have been set
  Object.keys(cond).forEach((k) => {
    if (cond[k] === undefined) delete cond[k];
  });

  return cond;
}

/**
 * Renders the ImageScreenArea XML for OCR conditions that use screen-based image sources.
 *
 * This function generates the XML representation of a screen area definition specifically
 * for OCR conditions. It uses the shared `screenAreaToXml` utility and formats the output
 * with proper indentation for inclusion in Keyboard Maestro XML.
 *
 * The ImageScreenArea defines the region of the screen where OCR text detection should occur.
 * This is particularly useful for limiting OCR processing to specific areas of the screen
 * for better performance and accuracy.
 *
 * @param value - The screen area definition object
 * @param value.type - The type of screen area ("ScreenAll", "ScreenMain", "ScreenWithMouse", etc.)
 * @param value.frame - Optional frame coordinates for custom screen areas
 * @param value.screen - Optional screen identifier for multi-monitor setups
 *
 * @returns Array of XML strings representing the ImageScreenArea, properly indented for inclusion in conditions
 *
 * @example
 * ```typescript
 * // Full screen OCR area
 * const fullScreen = { type: "ScreenAll" };
 * const xml = renderOCRImageScreenAreaXml(fullScreen);
 * // Returns:
 * // [
 * //   "\t<key>ImageScreenArea</key>",
 * //   "\t<dict>",
 * //   "\t\t<key>Type</key>",
 * //   "\t\t<string>ScreenAll</string>",
 * //   "\t</dict>"
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Custom screen area with specific coordinates
 * const customArea = {
 *   type: "ScreenCustom",
 *   frame: { x: 100, y: 100, width: 500, height: 300 }
 * };
 * const xml = renderOCRImageScreenAreaXml(customArea);
 * // Returns properly formatted XML for the custom screen area
 * ```
 *
 * @example
 * ```typescript
 * // Main screen only (useful for multi-monitor setups)
 * const mainScreen = { type: "ScreenMain" };
 * const xml = renderOCRImageScreenAreaXml(mainScreen);
 * // Returns XML targeting only the main display
 * ```
 *
 * @see {@link screenAreaToXml} - The underlying utility function for screen area XML generation
 */
export function renderOCRImageScreenAreaXml(value: any): string[] {
  // Use shared renderer for correct key mapping and consistent XML structure
  const xml = screenAreaToXml("ImageScreenArea", value);

  // Split into lines, remove empty lines, and add proper indentation
  return xml
    .split("\n")
    .filter(Boolean) // Remove empty lines
    .map((l) => "\t" + l); // Add one level of indentation for condition context
}
