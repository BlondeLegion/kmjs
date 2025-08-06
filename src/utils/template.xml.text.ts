//FILE: src/utils/template.xml.text.ts

import type { ProcessingMode } from "../virtual_actions/types";

/**
 * Renders XML key/value pairs for an action that has a “Text” style source
 * with an optional TextProcessingMode flag.  When `mode` is undefined we omit
 * the key (which Keyboard Maestro treats as “Process Text Normally”).
 *
 * @param text Raw text content (may be empty string).
 * @param mode Optional processing mode.
 */
export function renderTextWithProcessingMode(
  text: string,
  mode?: ProcessingMode,
): string[] {
  const out: string[] = [];
  out.push("\t\t<key>Text</key>");
  out.push(text === "" ? "\t\t<string/>" : `\t\t<string>${text}</string>`);
  if (mode) {
    out.push("\t\t<key>TextProcessingMode</key>");
    out.push(`\t\t<string>${mode}</string>`);
  }
  return out;
}
