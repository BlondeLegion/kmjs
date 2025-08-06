//FILE: src/tests/utils/permutations.templates.ts

/**
 * A rule describing how to neutralize a volatile XML key/value pair so that
 * ephemeral differences (UIDs, timestamps, etc.) do not cause test failures.
 */
export interface XmlNormalizationRule {
  /** Human label (for future logging / debugging if desired). */
  label: string;
  /**
   * Regex that matches the entire *key+value* sequence you want to sanitize.
   * Must be global-safe. Replacement should keep original key structure.
   */
  pattern: RegExp;
  /** Replacement text (should be same shape so diffing stays aligned). */
  replacement: string | ((match: string, ...args: any[]) => string);
}

/**
 * Add new rules here (e.g. CreationDate, ModificationDate) as needed.
 * They will be applied in order.
 */
export const XML_NORMALIZATION_RULES: XmlNormalizationRule[] = [
  {
    label: "ActionUID",
    // Matches: <key>ActionUID</key>\s*<integer>1234567890</integer>
    pattern: /<key>ActionUID<\/key>\s*<integer>\d+<\/integer>/g,
    replacement: "<key>ActionUID</key>\n\t\t<integer>__IGNORED__</integer>",
  },
  // Clipboard UID normalization: allow it to be missing entirely (temporary)
  {
    label:
      "DestinationNamedClipboardUID (allow missing, remove trailing whitespace)",
    // Remove the UID line and any trailing whitespace or blank line
    pattern:
      /\n?\s*<key>DestinationNamedClipboardUID<\/key>\s*<string>[^<]*<\/string>\s*/g,
    replacement: "",
  },
  {
    label: "Ensure newline between </string> and <key>",
    pattern: /(<\/string>)(<key>)/g,
    replacement: "$1\n$2",
  },
  {
    label: "Indent <key> tags after newline",
    pattern: /\n<key>/g,
    replacement: "\n\t<key>",
  },
  {
    label: "Normalize all leading whitespace before <key> to a single tab",
    pattern: /^\s*<key>/gm,
    replacement: "\t<key>",
  },
  {
    label: "Base64 data normalization",
    // Normalize base64 data by removing all whitespace and re-wrapping consistently
    pattern: /<data>\s*([A-Za-z0-9+/=\s]+?)\s*<\/data>/g,
    replacement: (match: string, base64Content: string) => {
      // Remove all whitespace from base64 content
      const cleanBase64 = base64Content.replace(/\s+/g, "");
      // Re-wrap at 76 characters with consistent indentation
      const wrapped =
        cleanBase64.match(/.{1,76}/g)?.join("\n\t\t") || cleanBase64;
      return `<data>\n\t\t${wrapped}\n\t</data>`;
    },
  },
  // Example placeholders for future expansion (commented out):
  // {
  //   label: "CreationDate",
  //   pattern: /<key>CreationDate<\/key>\s*<real>\d+(\.\d+)?<\/real>/g,
  //   replacement: "<key>CreationDate</key>\n\t\t<real>__IGNORED__</real>",
  // },
  // {
  //   label: "ModificationDate",
  //   pattern: /<key>ModificationDate<\/key>\s*<real>\d+(\.\d+)?<\/real>/g,
  //   replacement: "<key>ModificationDate</key>\n\t\t<real>__IGNORED__</real>",
  // },
];

/**
 * Normalizes volatile fragments (UIDs, timestamps, etc.) so that comparisons
 * only fail for semantically meaningful differences.
 *
 * @param xml Raw XML string
 * @returns Normalized XML
 */
export function normalizeXmlForComparison(xml: string): string {
  if (!xml) return xml;
  let out = xml;
  for (const rule of XML_NORMALIZATION_RULES) {
    if (typeof rule.replacement === "function") {
      out = out.replace(rule.pattern, rule.replacement);
    } else {
      out = out.replace(rule.pattern, rule.replacement);
    }
  }
  return out;
}
