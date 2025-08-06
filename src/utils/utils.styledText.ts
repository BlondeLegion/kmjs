// FILE: src/utils/utils.styledText.ts
// RUNTIME: Node 18+ (commonjs) – matches your project
//
// -------------------------------------------------------------------------------------------------
// Purpose
// -------------------------------------------------------------------------------------------------
// Utilities for dealing with Keyboard Maestro's <StyledText><data>...</data></StyledText> payloads.
// These payloads are Base-64 encoded RTF (technically an NSAttributedString archived to RTF/RTFD).
// We provide:
//
//   • decodeStyledTextData(...)  -> Base64 blob -> { rtf, text }
//   • encodeStyledTextData(...)  -> RTF string  -> Base64 blob (wrapped to 76-chars/line)
//   • updateStyledTextInXml(...) -> Given a KM Action XML, apply a transform to the RTF, and
//                                   write the updated Base-64 + <Text> plain string back.
//
// References:
//   • “KM8: XML of Display Text in Window Does Not Update by Script” forum thread
//     (NSAttributedString <-> RTF(D) <-> Base64 discussion & working AppleScript/ObjC sample).
//
// Credits:
//   • JMichaelTX (https://forum.keyboardmaestro.com/u/JMichaelTX/summary) for the exploration
//     work required to produce these functions.
//
// Caveats:
//   • We cannot reproduce Cocoa's NSAttributedString fidelity from Node.js. We treat the RTF as
//     opaque text. Replacing plain ASCII variable names inside the RTF is typically safe, but you
//     should not try to change fonts/colors/etc. here — do that inside KM or a native helper.
//   • Every time KM re-archives the NSAttributedString, the resulting data will differ
//     (as Peter Lewis mentions) — so don't compare Base-64 strings for equality across writes.
//
// -------------------------------------------------------------------------------------------------

import chalk from "chalk";
import { escapeForXml } from "./utils.xml";

/**
 * Result of decoding Keyboard Maestro's StyledText Base-64 payload.
 */
export interface DecodedStyledText {
  /** The decoded RTF string (raw). */
  rtf: string;
  /**
   * A best-effort "plain text" extraction from the RTF.
   * We *do not* implement a full RTF parser here — this is purely heuristic.
   */
  text: string;
}

/**
 * An error thrown by this module. We isolate our thrown errors behind a public, typed class
 * so callers can safely `instanceof StyledTextError`.
 */
export class StyledTextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StyledTextError";
  }
}

/**
 * Decode a Keyboard Maestro `<StyledText>` data blob (Base-64) into its RTF string.
 *
 * @param base64 - The Base-64 text found inside `<data> ... </data>` (whitespace/newlines OK).
 * @returns {DecodedStyledText} { rtf, text }
 */
export function decodeStyledTextData(base64: string): DecodedStyledText {
  try {
    // Normalize whitespace, KM often wraps @ 76 columns.
    const compact = base64.replace(/\s+/g, "");
    const buf = Buffer.from(compact, "base64");
    const rtf = buf.toString("utf8");

    // Heuristic "plain text" extraction (strip {\...}, \'xx, \controlwords, and braces).
    // This is intentionally simple — for quick variable-name manipulations and previews.
    const text = stripRtfToPlainText(rtf);

    return { rtf, text };
  } catch (err) {
    const msg = `[utils.styledText.decode] Failed to decode Base-64 StyledText. ${(err as Error).message}`;
    console.error(chalk.red(msg));
    throw new StyledTextError(msg);
  }
}

/**
 * Encode an **RTF string** into Keyboard Maestro's Base-64 blob.
 * The output is wrapped to 76 chars per line (a safe default for plist `<data>`).
 *
 * @param rtf - The raw RTF string to encode.
 * @param wrap - Whether to wrap the Base-64 at 76 columns (default: true).
 * @returns Base-64 text ready to drop inside `<data> ... </data>`.
 */
export function encodeStyledTextData(rtf: string, wrap = true): string {
  try {
    const b64 = Buffer.from(rtf, "utf8").toString("base64");
    return wrap ? wrapBase64(b64, 76) : b64;
  } catch (err) {
    const msg = `[utils.styledText.encode] Failed to encode RTF into Base-64. ${(err as Error).message}`;
    console.error(chalk.red(msg));
    throw new StyledTextError(msg);
  }
}

/**
 * Update a KM Action XML string’s `<StyledText>` + `<Text>` fields by running a function that
 * takes the decoded RTF and returns a new RTF string.
 *
 * **Important**: We do *string* parsing on the XML (regex-based). That’s safer here because
 * Keyboard Maestro’s plist structure can vary slightly per action. If you prefer a DOM/Plist
 * approach, you can wire up `fast-xml-parser` here (already in your deps).
 *
 * @param xml - Entire KM Action XML (a `<dict>` or full `.kmmacros`).
 * @param transformer - Function that receives the decoded RTF and returns the new RTF.
 * @returns Updated XML string.
 */
export function updateStyledTextInXml(
  xml: string,
  transformer: (rtf: string) => string,
): string {
  const styledTextMatch = STYLED_TEXT_RE.exec(xml);
  if (!styledTextMatch) {
    console.warn(
      chalk.yellow(
        "[utils.styledText.update] <StyledText><data>...</data> not found in given XML.",
      ),
    );
    return xml;
  }

  const rawData = styledTextMatch.groups?.data ?? "";
  const { rtf } = decodeStyledTextData(rawData);

  // Let the caller mutate the RTF however they like (typically variable name replacements).
  const newRtf = transformer(rtf);

  // Re-encode
  const newB64 = encodeStyledTextData(newRtf, true);

  // Update <StyledText> data
  let newXml = replaceAt(
    xml,
    styledTextMatch.index,
    styledTextMatch[0].length,
    buildStyledTextXml(newB64),
  );

  // Also update plain text <key>Text</key><string>...</string>
  const newPlain = stripRtfToPlainText(newRtf);
  newXml = setPlainTextString(newXml, newPlain);

  return newXml;
}

// -------------------------------------------------------------------------------------------------
// Internals
// -------------------------------------------------------------------------------------------------

/**
 * Simple regex to capture the `<StyledText>` data block.
 * We use named capturing group `data` so it's easy to grab the base64 payload.
 */
const STYLED_TEXT_RE =
  /<key>\s*StyledText\s*<\/key>\s*<data>(?<data>[\s\S]*?)<\/data>/im;

/**
 * Regex to locate the <key>Text</key> <string> ... </string> so we can keep it in sync.
 */
const PLAIN_TEXT_RE =
  /<key>\s*Text\s*<\/key>\s*<string>(?<text>[\s\S]*?)<\/string>/im;

/**
 * Build a full `<StyledText>` XML fragment with properly wrapped Base-64.
 */
function buildStyledTextXml(base64: string): string {
  return ["<key>StyledText</key>", "<data>", base64, "</data>"].join("\n");
}

/**
 * Replace a segment of a string using start & length (so we don't do multi-regex confusion).
 */
function replaceAt(
  src: string,
  start: number,
  len: number,
  insert: string,
): string {
  return src.slice(0, start) + insert + src.slice(start + len);
}

/**
 * Ensure the XML <key>Text</key><string>…</string> holds the *plain* version of the RTF.
 * If it doesn't exist, we do not add it (we keep changes as non-invasive as possible).
 */
function setPlainTextString(xml: string, newText: string): string {
  const match = PLAIN_TEXT_RE.exec(xml);
  if (!match) {
    console.warn(
      chalk.yellow(
        "[utils.styledText.update] <key>Text</key> not found. Leaving XML untouched.",
      ),
    );
    return xml;
  }
  const { 0: all, groups } = match;
  const oldText = groups?.text ?? "";

  // Escape XML entities for safety.
  const escaped = escapeForXml(newText);

  const replacement = all.replace(oldText, escaped);
  return xml.replace(all, replacement);
}

/**
 * Best-effort plain text extraction from RTF.
 * This is *not* a full RTF parser — it just strips basic control words, braces and hex escapes.
 *
 * @param rtf - The raw RTF string.
 * @returns "Plain" text.
 */
export function stripRtfToPlainText(rtf: string): string {
  // 1) Handle hex escapes first
  let s = rtf.replace(/\\'[0-9a-fA-F]{2}/g, (m) => {
    // Convert \'hh -> that byte
    const hex = m.slice(2);
    try {
      return Buffer.from(hex, "hex").toString("latin1");
    } catch {
      return "";
    }
  });

  // 2) Remove RTF header groups
  s = s.replace(/\{\\fonttbl[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, "");
  s = s.replace(/\{\\colortbl[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, "");

  // 3) Remove all control words
  s = s.replace(/\\[a-zA-Z]+\d*\s?/g, " ");

  // 4) Remove remaining braces
  s = s.replace(/[{}]/g, "");

  // 5) Collapse multiple spaces/newlines and trim
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Wrap a Base-64 string into fixed-length lines (default 76 chars) for plist <data>.
 */
export function wrapBase64(b64: string, width = 76): string {
  const out: string[] = [];
  for (let i = 0; i < b64.length; i += width) {
    out.push(b64.slice(i, i + width));
  }
  return out.join("\n");
}

/**
 * Generate a basic RTF wrapper around plain text.
 * This creates a minimal RTF document with the text properly escaped.
 *
 * @param text - The plain text to wrap in RTF
 * @returns RTF string ready for encoding
 */
export function generateBasicRtf(text: string): string {
  // Escape RTF special characters
  const escapedText = text
    .replace(/\\/g, "\\\\")
    .replace(/}/g, "\\}")
    .replace(/{/g, "\\{");

  return `{\\rtf1\\ansi\\deff0 ${escapedText}}`;
}
