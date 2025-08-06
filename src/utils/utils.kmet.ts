// FILE: src/utils/utils.kmet.ts

// -------------------------------------------------------------------------------------------------
// KMET (Keyboard Maestro Edit‑as‑Text) — Node/TypeScript helpers
// -------------------------------------------------------------------------------------------------
// This module condenses the functionality of Dan Thomas's excellent "KMET: Edit KM Objects as Text"
// macro library (v1.3)¹ into a single, strongly‑typed utility that can be consumed by JavaScript/
// TypeScript projects.  It focuses on the *text* transformation pieces rather than the KM‑UI glue
// (copy‑as‑XML menus, GUI scripting, etc.), which are better handled by existing KMJS helpers.
//
// ¹ https://forum.keyboardmaestro.com/t/kmet-edit-km-objects-as-text-search-replace-version-1-3/22549
//
// Credits:
//   • Dan Thomas — original KMET macros and JavaScript for Automation logic.
//   • KM community members who contributed testing and refinements.
// -------------------------------------------------------------------------------------------------
// Key capabilities exposed here:
//   • encodeTextForJson / encodeTextForXml – escape arbitrary strings so they can be embedded in JSON
//     or XML literal values inside KM actions/macros.
//   • xmlToJson / jsonToXml                – loss‑tolerant bidirectional conversion between KM's
//     plist‑XML snippets and a more readable JSON form, using fast‑xml‑parser under the hood.
//   • searchReplaceInText                  – one‑shot RegExp or literal search‑and‑replace that plays
//     nicely with either XML or JSON blocks (handy for variable refactors).
//   • CLI (ts‑node)                        – run `yarn kmet` for a mini‑tool that wraps the helpers
//     for quick one‑off terminal use (encode, decode, convert, replace, etc.).
//
// All functions log through chalk‑colourised messages so that errors/warnings stand out during
// development but remain silent when imported as a library.
// -------------------------------------------------------------------------------------------------
// Usage examples:
//   import {
//     encodeTextForJson,
//     encodeTextForXml,
//     xmlToJson,
//     jsonToXml,
//     searchReplaceInText,
//   } from "./utils/utils.kmet";
//
//   const escaped = encodeTextForXml("< & > ' \"");
//   const json    = xmlToJson(kmXmlSnippet);
//   const xml     = jsonToXml(jsonObject);
//   const updated = searchReplaceInText(json, /Local_/g, "Global_");
// -------------------------------------------------------------------------------------------------

import chalk from "chalk";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
// Import base XML escaping function to avoid code duplication
// This provides standard XML entity escaping for <>&'" characters
import { escapeForXml } from "./utils.xml";

// ------------------------------
// XML Parser Configuration
// ------------------------------
// These options configure fast-xml-parser to handle Keyboard Maestro's plist XML format
// in a way that preserves the structure and allows round-trip conversion

/**
 * Configuration for parsing XML to JavaScript objects.
 * Tailored for Keyboard Maestro's plist XML structure.
 */
const XML_PARSE_OPTIONS = {
  /** Preserve XML attributes during parsing (essential for KM XML) */
  ignoreAttributes: false,
  /** Prefix for attribute names to distinguish from element content */
  attributeNamePrefix: "@_", // e.g., id="1" becomes "@_id": "1"
  /** Name for text content nodes when mixed with attributes */
  textNodeName: "#text", // e.g., <item id="1">text</item> becomes { "@_id": "1", "#text": "text" }
  /** Don't trim whitespace from values (preserves KM formatting) */
  trimValues: false,
  /** Don't parse tag values as numbers/booleans (keep as strings) */
  parseTagValue: false,
  /** Don't parse attribute values as numbers/booleans (keep as strings) */
  parseAttributeValue: false,
};

/**
 * Configuration for building XML from JavaScript objects.
 * Matches Keyboard Maestro's formatting conventions.
 */
const XML_BUILD_OPTIONS = {
  /** Include attributes in XML output */
  ignoreAttributes: false,
  /** Attribute prefix must match parsing configuration */
  attributeNamePrefix: "@_",
  /** Text node name must match parsing configuration */
  textNodeName: "#text",
  /** Pretty-print XML with proper indentation */
  format: true,
  /** Use tabs for indentation (matches KM's style) */
  indentBy: "\t",
  /** Don't suppress empty nodes (preserves KM structure) */
  suppressEmptyNode: false,
};

// Lazy-loaded parser and builder instances to avoid CEP environment issues
let xmlParser: XMLParser | null = null;
let xmlBuilder: XMLBuilder | null = null;

function getXmlParser(): XMLParser {
  if (!xmlParser) {
    xmlParser = new XMLParser(XML_PARSE_OPTIONS);
  }
  return xmlParser;
}

function getXmlBuilder(): XMLBuilder {
  if (!xmlBuilder) {
    xmlBuilder = new XMLBuilder(XML_BUILD_OPTIONS);
  }
  return xmlBuilder;
}

// -------------------------------------------------------------------------------------------------
// Text Encoding Functions
// -------------------------------------------------------------------------------------------------
// These functions prepare raw text for safe inclusion in JSON or XML contexts.
// They handle special characters that would otherwise break the target format.

/**
 * Escape a raw string so it is safe for inclusion inside **JSON** double‑quoted literals.
 *
 * This function uses JSON.stringify's built-in escaping mechanism to handle all JSON
 * special characters (quotes, backslashes, control characters, etc.) and then strips
 * the outer quotes to return just the escaped content.
 *
 * @param raw - The raw string that may contain JSON special characters
 * @returns The escaped string ready for embedding in JSON, without outer quotes
 * @throws {Error} If the input cannot be JSON-encoded (extremely rare)
 *
 * @example
 * ```typescript
 * encodeTextForJson('He said "Hello" and used \\backslash')
 * // Returns: 'He said \\"Hello\\" and used \\\\backslash'
 * ```
 */
export function encodeTextForJson(raw: string): string {
  try {
    // JSON.stringify handles all JSON escaping rules correctly
    // We slice(1, -1) to remove the outer quotes that stringify adds
    return JSON.stringify(raw).slice(1, -1);
  } catch (err) {
    // Log error with context for debugging
    const msg = `[utils.kmet] Failed to encode text for JSON – ${(err as Error).message}`;
    console.error(chalk.red(msg));
    throw err;
  }
}

/**
 * Escape a raw string so it is safe for inclusion inside **XML** text nodes or attribute values.
 *
 * This function extends the base XML escaping from utils.xml with additional backslash
 * handling required for JavaScript for Automation (JXA) compatibility in Keyboard Maestro.
 *
 * The escaping process:
 * 1. Apply standard XML entity escaping for <>&'" characters
 * 2. Double-escape backslashes for JXA string handling
 *
 * @param raw - The raw string that may contain XML special characters
 * @returns The escaped string ready for embedding in XML
 *
 * @example
 * ```typescript
 * encodeTextForXml('<tag attr="value">Path\\to\\file & more</tag>')
 * // Returns: '&lt;tag attr=&quot;value&quot;&gt;Path\\\\to\\\\file &amp; more&lt;/tag&gt;'
 * ```
 */
export function encodeTextForXml(raw: string): string {
  // First apply standard XML escaping from our shared utility
  // This handles: < > & ' " characters
  const xmlEscaped = escapeForXml(raw);

  // Then handle backslashes for JXA compatibility
  // JXA requires double-escaped backslashes in string literals
  return xmlEscaped.replace(/\\/g, "\\\\");
}

// -------------------------------------------------------------------------------------------------
// XML ⇄ JSON Conversion Functions
// -------------------------------------------------------------------------------------------------
// These functions provide bidirectional conversion between Keyboard Maestro's plist XML format
// and a more human-readable JSON representation for easier editing and manipulation.

/**
 * Options for controlling XML to JSON conversion output format.
 */
export interface XmlToJsonOptions {
  /**
   * Whether to pretty-print the JSON output with indentation.
   * @default true - Uses 2-space indentation for readability
   */
  pretty?: boolean;
}

/**
 * Convert a **Keyboard Maestro plist‑XML snippet** to JSON.
 *
 * This function parses KM's XML format (which uses Apple's plist structure) and converts
 * it to a JSON representation that's easier to read and manipulate programmatically.
 *
 * The conversion preserves:
 * - XML attributes (prefixed with @_)
 * - Text content (stored as #text when mixed with attributes)
 * - Nested structure and arrays
 * - Original data types as strings (no automatic type conversion)
 *
 * @param xml - The XML string to convert (typically a KM action or macro snippet)
 * @param options - Configuration options for the conversion
 * @returns JSON string representation of the XML structure
 * @throws {Error} If the XML is malformed or cannot be parsed
 *
 * @example
 * ```typescript
 * const kmXml = '<dict><key>MacroActionType</key><string>Notification</string></dict>';
 * const json = xmlToJson(kmXml);
 * // Returns formatted JSON with dict.key and dict.string arrays
 * ```
 */
export function xmlToJson(xml: string, options: XmlToJsonOptions = {}): string {
  try {
    // Parse XML into JavaScript object using our configured parser
    const jsObj = getXmlParser().parse(xml);

    // Convert to JSON string with optional pretty-printing
    // Default to 2-space indentation for readability, or compact if pretty=false
    return JSON.stringify(jsObj, null, (options.pretty ?? true) ? 2 : 0);
  } catch (err) {
    // Provide context about what failed for easier debugging
    const msg = `[utils.kmet] xmlToJson() failed – ${(err as Error).message}`;
    console.error(chalk.red(msg));
    throw err;
  }
}

/**
 * Options for controlling JSON to XML conversion output format.
 */
export interface JsonToXmlOptions {
  /**
   * Whether to minify the XML output (remove indentation and newlines).
   * @default false - Pretty-prints with tab indentation to match KM style
   */
  minify?: boolean;
}

/**
 * Convert **JSON** (string or object) back to plist‑XML suitable for Keyboard Maestro.
 *
 * This function takes a JSON representation (either as a string or JavaScript object)
 * and converts it back to the plist XML format that Keyboard Maestro expects.
 *
 * The conversion handles:
 * - Attribute reconstruction (from @_ prefixed properties)
 * - Text content reconstruction (from #text properties)
 * - Proper XML formatting with KM-style indentation
 * - Array serialization to repeated XML elements
 *
 * @param json - The JSON to convert (string or object)
 * @param options - Configuration options for the conversion
 * @returns XML string in KM's plist format
 * @throws {Error} If the JSON is malformed or cannot be converted
 *
 * @example
 * ```typescript
 * const jsonObj = { dict: { key: "MacroActionType", string: "Notification" } };
 * const xml = jsonToXml(jsonObj);
 * // Returns properly formatted KM XML with tabs and structure
 * ```
 */
export function jsonToXml(
  json: string | Record<string, unknown>,
  options: JsonToXmlOptions = {},
): string {
  try {
    // Parse JSON string to object if needed, or use object directly
    const jsObj = typeof json === "string" ? JSON.parse(json) : json;

    // Choose builder based on minification preference
    // Minified version removes formatting for compact output
    const builder = options.minify
      ? new XMLBuilder({ ...XML_BUILD_OPTIONS, format: false })
      : getXmlBuilder();

    // Build XML from JavaScript object
    return builder.build(jsObj);
  } catch (err) {
    // Provide context about what failed for easier debugging
    const msg = `[utils.kmet] jsonToXml() failed – ${(err as Error).message}`;
    console.error(chalk.red(msg));
    throw err;
  }
}

// -------------------------------------------------------------------------------------------------
// Text Search & Replace Functions
// -------------------------------------------------------------------------------------------------
// These functions provide safe text manipulation within XML/JSON structures without breaking
// the underlying format. Useful for bulk operations like variable renaming.

/**
 * Options for controlling search and replace behavior.
 */
export interface SearchReplaceOptions {
  /**
   * Treat the search pattern as literal text instead of a regular expression.
   * When true, special regex characters are automatically escaped.
   * @default false - Patterns are treated as regular expressions
   */
  literal?: boolean;

  /**
   * Enable case-insensitive matching.
   * Only applies when using literal patterns or when the pattern is a string.
   * @default false - Case-sensitive matching
   */
  ignoreCase?: boolean;
}

/**
 * Perform a search‑and‑replace on an XML/JSON string *without* breaking its structure.
 *
 * This function operates at the text level, making it safe for bulk operations like
 * variable renaming across KM macros. It's designed to work with both XML and JSON
 * content while preserving the underlying structure.
 *
 * **Important**: This function works on raw text, so callers must ensure that
 * replacements don't break XML/JSON syntax (e.g., don't replace quotes or brackets
 * that are part of the structure).
 *
 * The function supports:
 * - Literal string replacement (with automatic regex escaping)
 * - Regular expression replacement with capture groups
 * - Case-sensitive and case-insensitive matching
 * - Global replacement (all occurrences)
 *
 * @param input - The XML/JSON string to search within
 * @param searchPattern - String or RegExp to search for
 * @param replacement - Replacement string (supports $1, $2, etc. for regex capture groups)
 * @param opts - Options controlling search behavior
 * @returns The input string with all matches replaced
 *
 * @example
 * ```typescript
 * // Literal replacement (safe for special characters)
 * searchReplaceInText(xmlString, "Local_OldVar", "Global_NewVar", { literal: true });
 *
 * // Regex replacement with capture groups
 * searchReplaceInText(xmlString, /Local_(\w+)/g, "Global_$1");
 *
 * // Case-insensitive literal replacement
 * searchReplaceInText(jsonString, "oldvalue", "newvalue", { literal: true, ignoreCase: true });
 * ```
 */
export function searchReplaceInText(
  input: string,
  searchPattern: string | RegExp,
  replacement: string,
  opts: SearchReplaceOptions = {},
): string {
  let pattern: RegExp;

  // Handle literal string patterns vs regex patterns
  if (opts.literal || typeof searchPattern === "string") {
    // For literal patterns, we need to escape special regex characters
    // to prevent them from being interpreted as regex syntax
    const escaped = (
      typeof searchPattern === "string" ? searchPattern : String(searchPattern)
    ).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& represents the matched character

    // Create regex with appropriate flags
    // 'g' for global (replace all), 'i' for case-insensitive if requested
    pattern = new RegExp(escaped, opts.ignoreCase ? "gi" : "g");
  } else {
    // Use the provided RegExp directly
    pattern = searchPattern as RegExp;
  }

  // Perform the replacement using the constructed pattern
  return input.replace(pattern, replacement);
}

// -------------------------------------------------------------------------------------------------
// Command Line Interface (CLI)
// -------------------------------------------------------------------------------------------------
// This section provides a simple CLI wrapper around the KMET functions for quick terminal use.
// The CLI supports encoding, conversion, and search/replace operations on files.

/**
 * Parse command line arguments into a structured options object.
 *
 * This function processes process.argv to extract flags and their values,
 * supporting both --flag=value and --flag value formats.
 *
 * @param argv - Command line arguments array (typically process.argv)
 * @returns Object mapping flag names to their values (string or boolean)
 */
function parseCliFlags(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};

  // Start from index 2 to skip 'node' and script name
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    // Only process arguments that start with --
    if (arg.startsWith("--")) {
      const [k, v] = arg.split("=");

      if (v !== undefined) {
        // Handle --flag=value format
        out[k.slice(2)] = v; // Remove -- prefix
      } else {
        // Handle --flag value format or boolean flags
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
          // Next argument is the value
          out[k.slice(2)] = next;
          i++; // Skip the value argument in next iteration
        } else {
          // Boolean flag (no value)
          out[k.slice(2)] = true;
        }
      }
    }
  }

  return out;
}

/**
 * Display CLI help information with usage examples and flag descriptions.
 *
 * This function outputs comprehensive help text including:
 * - Usage examples for common operations
 * - Description of all available flags
 * - Expected input/output formats
 */
function cliHelp(): void {
  console.log(`
${chalk.bold("KMET CLI – quick Keyboard Maestro text‑object helper")}

Examples:
  ${chalk.cyan("yarn kmet --encode-json --text 'He said \"hello\" <&>'")}
  ${chalk.cyan("yarn kmet --encode-xml  --text '5 < 7 & 7 > 5'")}
  ${chalk.cyan("yarn kmet --xml2json --file ./object.xml > object.json")}
  ${chalk.cyan("yarn kmet --json2xml --file ./object.json > object.xml")}
  ${chalk.cyan("yarn kmet --replace --file ./macro.json --find Local_ --to Global_ > out.json")}

Flags:
  --encode-json           Escape a plain string for JSON embedding.
  --encode-xml            Escape a plain string for XML embedding.
  --xml2json              Convert plist‑XML → JSON.
  --json2xml              Convert JSON → plist‑XML.
  --replace               Search & replace within file contents.
  --text   <string>       Raw text for encode operations.
  --file   <path>         Path to input file (XML or JSON).
  --find   <pattern>      String/RegExp (default literal string) to search for.
  --to     <string>       Replacement string (used with --replace).
  --regex                 Treat --find as a regular expression.
  --ignore-case           Case‑insensitive search.
`);
}

/**
 * Main CLI execution function that processes arguments and performs requested operations.
 *
 * This async function:
 * 1. Parses command line arguments
 * 2. Determines which operation to perform
 * 3. Executes the operation with appropriate error handling
 * 4. Outputs results to stdout or shows help
 *
 * Operations supported:
 * - Text encoding for JSON/XML
 * - File conversion between XML and JSON
 * - Search and replace in files
 *
 * @throws {Error} If file operations fail or required arguments are missing
 */
async function runCli(): Promise<void> {
  // Import fs/promises dynamically to avoid loading it unless CLI is used
  const fs = await import("fs/promises");
  const args = parseCliFlags(process.argv);

  // Handle JSON encoding operation
  if (args["encode-json"]) {
    if (!args.text) return cliHelp(); // Show help if required argument missing
    console.log(encodeTextForJson(String(args.text)));
    return;
  }

  // Handle XML encoding operation
  if (args["encode-xml"]) {
    if (!args.text) return cliHelp(); // Show help if required argument missing
    console.log(encodeTextForXml(String(args.text)));
    return;
  }

  // Handle XML to JSON conversion
  if (args["xml2json"]) {
    if (!args.file) return cliHelp(); // Show help if required argument missing
    const xml = await fs.readFile(String(args.file), "utf8");
    console.log(xmlToJson(xml));
    return;
  }

  // Handle JSON to XML conversion
  if (args["json2xml"]) {
    if (!args.file) return cliHelp(); // Show help if required argument missing
    const json = await fs.readFile(String(args.file), "utf8");
    console.log(jsonToXml(json));
    return;
  }

  // Handle search and replace operation
  if (args.replace) {
    // Validate required arguments
    if (!args.file || !args.find || args.to === undefined) return cliHelp();

    // Read input file
    const text = await fs.readFile(String(args.file), "utf8");

    // Perform search and replace with appropriate pattern type
    const updated = searchReplaceInText(
      text,
      // Create regex if --regex flag is set, otherwise use literal string
      args.regex
        ? new RegExp(String(args.find), args["ignore-case"] ? "gi" : "g")
        : String(args.find),
      String(args.to),
      {
        literal: !args.regex, // Literal mode unless --regex is specified
        ignoreCase: !!args["ignore-case"], // Case-insensitive if flag is set
      },
    );

    console.log(updated);
    return;
  }

  // No valid operation specified, show help
  cliHelp();
}

// -------------------------------------------------------------------------------------------------
// CLI Entry Point
// -------------------------------------------------------------------------------------------------
// This section handles CLI execution when the script is run directly (not imported as a module).

// Check if this script is being run directly (not imported)
// Use try-catch to avoid issues in environments where require.main might not exist
try {
  if (require.main === module) {
    // Execute CLI with proper error handling
    runCli().catch((err) => {
      // Log any uncaught errors with context and exit with error code
      console.error(chalk.red("[KMET CLI] Uncaught error:"), err);
      process.exit(1);
    });
  }
} catch (error) {
  // Silently ignore if require.main is not available (e.g., in CEP environments)
}
