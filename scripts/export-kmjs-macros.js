#!/usr/bin/env node
/**
 * @file export-macros.js
 * @description Export individual Keyboard Maestro macros to .kmmacros files
 * by fetching their XML via AppleScript and wrapping in the proper plist array.
 *
 * Run with: yarn macros:export
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const chalk = require("chalk").default;

// Plist header and footer to wrap a single <dict> from KM into a valid .kmmacros
const PLIST_HEADER =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ` +
  `"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
  `<plist version="1.0">\n` +
  `<array>\n` +
  `\t<dict>\n` +
  `\t\t<key>Activate</key>\n` +
  `\t\t<string>Normal</string>\n` +
  `\t\t<key>CreationDate</key>\n` +
  `\t\t<real>773971480.996575</real>\n` +
  `\t\t<key>Macros</key>\n` +
  `\t\t<array>\n`;
const PLIST_FOOTER =
  `\t\t</array>\n` +
  `\t\t<key>Name</key>\n` +
  `\t\t<string>kmjs</string>\n` +
  `\t\t<key>ToggleMacroUID</key>\n` +
  `\t\t<string>E7C193A6-2E86-4DA2-942C-1D80488D3D87</string>\n` +
  `\t\t<key>UID</key>\n` +
  `\t\t<string>E58AD1AD-46AC-4DED-977B-BF620C3AE89B</string>\n` +
  `\t</dict>\n` +
  `</array>\n` +
  `</plist>\n`;

const outDir = path.resolve(__dirname, "../src/macros");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log(chalk.gray(`Export directory: ${outDir}`));

// -------------------------------
//  New, very simple export logic
// -------------------------------

// Automatically discover all .kmmacros files in the export directory
const MACROS = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith(".kmmacros"))
  .map((f) => path.basename(f, ".kmmacros"));
if (MACROS.length === 0) {
  console.log(chalk.yellow("No macros found to export."));
  process.exit(0);
}

for (const name of MACROS) {
  console.log(chalk.blue(`--> Exporting macro "${name}" …`));
  console.log(
    chalk.gray(
      `   osascript will fetch 'xml of macro named "${name}"' and wrap it`,
    ),
  );

  // Ask KM for this one macro's raw <dict> XML by name.
  const res = spawnSync(
    "osascript",
    [
      "-e",
      'tell application "Keyboard Maestro"',
      "-e",
      `  return xml of first macro whose name is "${name}"`,
      "-e",
      "end tell",
    ],
    { encoding: "utf8" },
  );

  // Diagnostics ----------------------------------------------------
  console.log(chalk.gray(`   Diagnostic: status=${res.status}`));
  console.log(chalk.gray(`   stderr:\n${(res.stderr || "").trim()}`.trim()));

  if (res.status !== 0 || res.error) {
    console.error(chalk.red(`❌ osascript failed for "${name}".`));
    if (res.error) console.error(chalk.red(res.error.message));
    continue;
  }
  const fullXml = res.stdout.trim();

  // Extract the inner <dict> XML, whether it's returned directly or wrapped in a full plist.
  let dictXml;
  if (fullXml.startsWith("<dict>")) {
    dictXml = fullXml;
  } else if (fullXml.startsWith("<?xml")) {
    const start = fullXml.indexOf("<dict>");
    const end = fullXml.lastIndexOf("</dict>") + "</dict>".length;
    if (start === -1 || end === -1) {
      console.error(
        chalk.red(`❌ Couldn't extract <dict> content for "${name}".`),
      );
      continue;
    }
    dictXml = fullXml.substring(start, end);
  } else {
    console.error(chalk.red(`❌ Unexpected XML returned for "${name}".`));
    continue;
  }

  // Indent macro XML with two tabs per line to match reference backup
  const indentedDictXml = dictXml
    .split("\n")
    .map((line) => "\t\t\t" + line)
    .join("\n");

  // Wrap the extracted <dict> in the full group plist wrapper
  const wrapped = PLIST_HEADER + indentedDictXml + "\n" + PLIST_FOOTER;
  const outPath = path.join(outDir, `${name}.kmmacros`);
  fs.writeFileSync(outPath, wrapped, "utf8");
  const { size } = fs.statSync(outPath);
  console.log(chalk.green(`✅ Wrote ${name}.kmmacros (${size} bytes)`));
}

console.log(
  chalk.magenta("✅ All macros exported. Verify your src/macros folder."),
);
