#!/usr/bin/env node
/**
 * @file import-macros.js
 * @description Import every .kmmacros file in the root macros/ folder into
 * the local KM library using the importMacros AppleScript cmd.
 *
 * Run with: yarn macros:import
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const chalk = require("chalk").default;

// Point to the src/macros folder
const macrosDir = path.resolve(__dirname, "../src/macros");
console.log(chalk.gray(`Looking for .kmmacros files in: ${macrosDir}`));

// Read directory
let files;
try {
  files = fs.readdirSync(macrosDir);
} catch (err) {
  console.error(chalk.red(`Could not read macrosDir: ${err.message}`));
  process.exit(1);
}

// Filter for .kmmacros
const macroFiles = files.filter((f) => f.endsWith(".kmmacros"));
if (macroFiles.length === 0) {
  console.log(chalk.yellow("No .kmmacros files found."));
  process.exit(0);
}

for (const file of macroFiles) {
  const fullPath = path.join(macrosDir, file);
  console.log(chalk.blue(`↪︎ Processing file: ${fullPath}`));

  // Log file size
  const stat = fs.statSync(fullPath);
  console.log(chalk.blue(`   Size: ${stat.size} bytes`));

  // Determine macro name and delete any existing instance before importing
  const macroName = path.basename(file, ".kmmacros");
  console.log(
    chalk.yellow(
      `--> Deleting existing macro "${macroName}" in Keyboard Maestro if present…`,
    ),
  );
  const delRes = spawnSync(
    "osascript",
    ["-e", `tell application "Keyboard Maestro" to deleteMacro "${macroName}"`],
    { encoding: "utf8" },
  );
  if (delRes.status === 0) {
    console.log(chalk.green(`   Deleted existing macro "${macroName}".`));
  } else {
    console.log(
      chalk.gray(
        `   No existing macro "${macroName}" to delete or delete failed.`,
      ),
    );
  }

  // Build AppleScript arguments: importMacros using file alias
  const appleScriptArgs = [
    "-e",
    `tell application "Keyboard Maestro" to importMacros (POSIX file "${fullPath}" as alias)`,
  ];
  console.log(
    chalk.yellow(`--> Importing ${file} via importMacros (using file alias)…`),
  );
  // Debug: show the osascript arguments array
  console.log(
    chalk.gray(`   osascript args: ${JSON.stringify(appleScriptArgs)}`),
  );
  const res = spawnSync("osascript", appleScriptArgs, { encoding: "utf8" });

  if (res.error) {
    console.error(
      chalk.red(`❌ osascript spawn error for ${file}: ${res.error.message}`),
    );
  } else if (res.status !== 0) {
    console.error(
      chalk.red(`❌ importMacros failed for ${file}:\n${res.stderr.trim()}`),
    );
  } else {
    console.log(chalk.green(`✅ Successfully imported ${file}`));
  }
}

console.log(
  chalk.magenta("✅ All macros processed. Verify in Keyboard Maestro."),
);
