#!/usr/bin/env node
/**
 * @file get-selected-macro.js
 * @description Outputs the UUID of the currently selected Keyboard Maestro macro.
 *
 * Usage:
 *   yarn macros:uuid
 */
const { execSync } = require("child_process");

try {
  const uuid = execSync(
    `osascript -e 'tell application "Keyboard Maestro"' \
-e 'set macroUUIDs to selectedMacros' \
-e 'if (count of macroUUIDs) is 0 then return ""' \
-e 'return item 1 of macroUUIDs' \
-e 'end tell'`,
    { encoding: "utf8" },
  ).trim();
  console.log(uuid);
} catch (err) {
  console.error("Failed to get selected macro UUID:", err.message);
  process.exit(1);
}
