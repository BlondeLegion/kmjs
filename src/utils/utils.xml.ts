//FILE: src/utils/utils.xml.ts

import type { ScreenArea } from "../virtual_actions/types";

/**
 * Escape special characters for safe inclusion in XML text nodes.
 * @param str - Raw string to escape.
 * @returns A string with XML entities substituted.
 */
export function escapeForXml(str: string): string {
  return str.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c as "<" | ">" | "&" | "'" | '"']!,
  );
}

/**
 * Indents each line of a given text block by a specified number of tabs.
 * @param text - Multiline string to indent.
 * @param tabs - Number of tab characters to insert on each line.
 * @returns Indented multiline string.
 */
export function indent(text: string, tabs = 1): string {
  const pad = "\t".repeat(tabs);
  return text
    .trim()
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

/**
 * Formats XML action content with proper KM-style nested indentation.
 * Applies appropriate indentation levels: dict at 1 tab, contents at 2 tabs.
 * Preserves multiline string content without adding extra indentation.
 * @param content - The XML content to format
 * @returns Properly indented XML string matching KM's format
 */
export function formatXmlAction(content: string): string {
  const lines = content.trim().split("\n");
  let insideMultilineString = false;

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Detect multiline string patterns
      if (trimmed.startsWith("<string>") && !trimmed.endsWith("</string>")) {
        // Starting a multiline string
        insideMultilineString = true;
        return "\t\t" + trimmed;
      } else if (insideMultilineString && trimmed === "</string>") {
        // Ending a multiline string
        insideMultilineString = false;
        return "\t\t" + trimmed;
      } else if (insideMultilineString) {
        // Inside a multiline string - don't add extra indentation
        return line;
      }

      // <dict> and </dict> get 1 tab
      if (trimmed === "<dict>" || trimmed === "</dict>") {
        return "\t" + trimmed;
      }

      // Everything else inside dict gets 2 tabs
      return "\t\t" + trimmed;
    })
    .join("\n");
}

/**
 * Sorts object keys in Keyboard Maestro's canonical order.
 * This handles the general XML dict ordering requirements across all KM actions.
 * @param keys - Array of keys to sort
 * @param context - Optional context hint for specialized ordering (e.g. 'condition', 'action', 'application')
 * @returns Sorted array with keys in KM's canonical order
 */
export function kmKeyOrder(keys: string[], context?: string): string[] {
  if (context === "condition") {
    const flagKeys = [
      "IsFrontApplication",
      "IsFrontWindow",
      "IsFront",
      // feel free to add more here later
    ];
    return keys.sort((a, b) => {
      const aIsFlag = flagKeys.includes(a);
      const bIsFlag = flagKeys.includes(b);
      // ConditionType just before flags
      if (a === "ConditionType" && bIsFlag) return -1;
      if (b === "ConditionType" && aIsFlag) return 1;
      // ConditionType after regular fields but before flags
      // if (a === "ConditionType") return 1;
      // if (b === "ConditionType") return -1;
      // flags always go last (keep their relative order)
      if (aIsFlag && !bIsFlag) return 1;
      if (bIsFlag && !aIsFlag) return -1;
      // alphabetical fallback
      return a.localeCompare(b, "en");
    });
  }

  return keys.sort((a, b) => {
    // For action contexts, MacroActionType typically comes early
    if (context === "action") {
      if (a === "MacroActionType") return -1;
      if (b === "MacroActionType") return 1;
      // ActionUID if present
      if (a === "ActionUID") return -1;
      if (b === "ActionUID") return 1;
      // Then alphabetical
      return a.localeCompare(b, "en");
    }

    // For application contexts, sort specific keys first
    if (context === "application") {
      const appKeyOrder = [
        "BundleIdentifier",
        "Match",
        "Name",
        "NewFile",
        "Path",
      ];
      const aIndex = appKeyOrder.indexOf(a);
      const bIndex = appKeyOrder.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b, "en");
    }

    // Default: alphabetical sorting
    return a.localeCompare(b, "en");
  });
}

/**
 * Renders an array with proper formatting. If content is empty, returns <array/>.
 * If content exists, returns <array>\n{content}\n</array> with proper indentation.
 * @param content - The content to put inside the array
 * @param indentLevel - Number of tabs to indent the array tags
 * @returns Properly formatted array XML
 */
export function formatArrayXml(content: string, indentLevel = 1): string {
  const indent = "\t".repeat(indentLevel);

  if (!content || content.trim() === "") {
    return `${indent}<array/>`;
  }

  return `${indent}<array>\n${content}\n${indent}</array>`;
}

/**
 * Generates a Keyboard Maestro time code for CreationDate/ModificationDate.
 * Returns seconds since epoch as a float, e.g. 774213049.26031303
 */
export function generateKMTimeCode(): number {
  return Date.now() / 1000;
}
