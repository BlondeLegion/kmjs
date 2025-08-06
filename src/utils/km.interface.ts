//FILE: src/utils/km.interface.ts

// child_process lazy import handled in functions
import { indent, generateKMTimeCode } from "./utils.xml";
import { getSafeSpawnSync } from "./utils.spawn";

/* ----------------------------- */
/* Constants
/* ----------------------------- */

// Plist header and footer for importing macros that were constructed synthetically.
const PLIST_HEADER =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ` +
  `"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
  `<plist version="1.0">\n<array>\n\t<dict>\n` +
  `\t\t<key>Activate</key>\n\t\t<string>Normal</string>\n` +
  `\t\t<key>CreationDate</key>\n\t\t<real>0</real>\n` +
  `\t\t<key>Macros</key>\n\t\t<array>\n`;

const PLIST_FOOTER =
  `\n\t\t</array>\n` +
  `\t\t<key>Name</key>\n\t\t<string>kmjs-test</string>\n` +
  `\t\t<key>ToggleMacroUID</key>\n\t\t<string>00000000-0000-0000-0000-000000000000</string>\n` +
  `\t\t<key>UID</key>\n\t\t<string>00000000-0000-0000-0000-000000000000</string>\n` +
  `\t</dict>\n</array>\n</plist>`;

/* ----------------------------- */
/* Helper Functions
/* ----------------------------- */

export let lastTmpPath: string | undefined;

/**
 * Take a single `<dict>…</dict>` block (your action.toXml()),
 * inject a Name so KM knows what to call it,
 * indent it three tabs deep, wrap it in a file,
 * import it, then delete the temp file.
 */
export function importDictXmlAsMacro(dictXml: string, macroName: string): void {
  // 1) Inject the macro’s Name _inside_ the <dict> element without using regex
  const openTag = "<dict>";
  const idx = dictXml.indexOf(openTag);
  if (idx === -1) {
    throw new Error("Invalid XML: missing <dict> start");
  }
  // split around the opening <dict>
  const before = dictXml.slice(0, idx + openTag.length);
  const after = dictXml.slice(idx + openTag.length);
  // inject a Name element immediately after
  const namedDict = `${before}\n\t<key>Name</key>\n\t<string>${macroName}</string>${after}`;

  // 2) indent the entire block three tabs deep using helper
  const body = indent(namedDict, 3);

  // 3) write a temp .kmmacros file
  const fs = require("fs");
  const path = require("path");
  const os = require("os");

  // Safe fs checks
  if (
    typeof fs.writeFileSync !== "function" ||
    typeof os.tmpdir !== "function"
  ) {
    throw new Error("File system operations not available in this environment");
  }

  const tmp = path.join(os.tmpdir(), `kmjs-test-${Date.now()}.kmmacros`);
  fs.writeFileSync(tmp, PLIST_HEADER + body + PLIST_FOOTER);

  // 4) debug: print it to eyeball it
  console.log("WROTE TEMP .kmmacros ⇒", tmp);
  console.log(fs.readFileSync(tmp, "utf8"));

  // 5) import it
  const spawnSync = getSafeSpawnSync();

  const res = spawnSync(
    "osascript",
    [
      "-e",
      `tell application \"Keyboard Maestro\" to importMacros (POSIX file \"${tmp}\" as alias)`,
    ],
    { encoding: "utf8" },
  );

  fs.unlinkSync(tmp);

  if (res.status !== 0) {
    throw new Error(
      `importMacros failed:\n${res.stderr.trim()}\n${res.stdout.trim()}`,
    );
  }
}

/**
 * Write an **entire** `.kmmacros` plist string to a temp
 * file and import it via AppleScript.  The file path is
 * recorded in `lastTmpPath` so the test-harness can copy
 * it into `tests/integration/failures/` on error.
 */
export function importPlistString(plistXml: string): void {
  const fs = require("fs");
  const path = require("path");
  const os = require("os");

  // Safe fs checks
  if (
    typeof fs.writeFileSync !== "function" ||
    typeof os.tmpdir !== "function"
  ) {
    throw new Error("File system operations not available in this environment");
  }

  const tmp = path.join(os.tmpdir(), `kmjs-test-${Date.now()}.kmmacros`);
  lastTmpPath = tmp;

  fs.writeFileSync(tmp, plistXml, "utf8");

  //  Debug - print the exact plist we’re sending to KM
  // console.log("\n⤴︎  .kmmacros written to", tmp);
  // console.log(chalk.gray(plistXml));

  const spawnSync = getSafeSpawnSync();

  const osa = spawnSync(
    "osascript",
    [
      "-e",
      `tell application "Keyboard Maestro" to importMacros (POSIX file "${tmp}" as alias)`,
    ],
    { encoding: "utf8" },
  );

  if (osa.status !== 0) {
    // Do NOT delete the file on failure
    throw new Error(
      `importMacros failed:\n${osa.stderr.trim() || osa.stdout.trim()}`,
    );
  }

  // Only delete the file if import succeeded
  fs.unlinkSync(tmp);
}

/**
 * Delete a macro by name.
 */
export function deleteMacroByName(name: string): void {
  try {
    const spawnSync = getSafeSpawnSync();
    spawnSync("osascript", [
      "-e",
      `tell application "Keyboard Maestro" to deleteMacro "${name}"`,
    ]);
  } catch (error) {
    console.warn("child_process.spawnSync not available, cannot delete macro");
  }
}

/**
 * Wrap a single `<dict>…</dict>` action block into a full
 * .kmmacros plist that KM will import as a macro named `macroName`.
 *
 * - Puts your action under `<key>Actions><array>…</array>`
 * - Injects `<key>Name>` and `<key>UID>` for *that* macro
 * - Leaves the outer group "kmjs-test" untouched (we import into a group)
 */
export function wrapAsKMMacros(actionXml: string, macroName: string): string {
  const uid = Date.now().toString();
  const timeCode = generateKMTimeCode();

  // Format the action XML with proper indentation (5 tabs for action dict content)
  const formattedActionXml = indent(actionXml.trim(), 5);

  /* ----------------------------------------------------------
   * Build the macro dictionary with proper KM-style formatting
   * -------------------------------------------------------- */
  const macroDict = [
    `\t\t\t<dict>`,
    `\t\t\t\t<key>Actions</key>`,
    `\t\t\t\t<array>`,
    formattedActionXml,
    `\t\t\t\t</array>`,
    `\t\t\t\t<key>CreationDate</key>`,
    `\t\t\t\t<real>${timeCode}</real>`,
    `\t\t\t\t<key>ModificationDate</key>`,
    `\t\t\t\t<real>${timeCode}</real>`,
    `\t\t\t\t<key>Name</key>`,
    `\t\t\t\t<string>${macroName}</string>`,
    `\t\t\t\t<key>Triggers</key>`,
    `\t\t\t\t<array/>`,
    `\t\t\t\t<key>UID</key>`,
    `\t\t\t\t<string>${uid}</string>`,
    `\t\t\t</dict>`,
  ].join("\n");

  return PLIST_HEADER + macroDict + PLIST_FOOTER;
}
