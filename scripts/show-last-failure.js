#!/usr/bin/env node
// scripts/show-last-failure.js
// Usage: node scripts/show-last-failure.js <ActionName>
// Example: node scripts/show-last-failure.js ManipulateWindow

const fs = require("fs");
const path = require("path");

const failuresDir = path.join(__dirname, "../tests/integration/failures");
const actionName = process.argv[2];

if (!actionName) {
  console.error("Usage: node scripts/show-last-failure.js <ActionName>");
  process.exit(1);
}

// Find all failure files for the action
const files = fs
  .readdirSync(failuresDir)
  .filter((f) => f.includes(actionName) && f.endsWith(".kmmacros"))
  .map((f) => ({
    file: f,
    mtime: fs.statSync(path.join(failuresDir, f)).mtime,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
  console.log(`No failure files found for action: ${actionName}`);
  process.exit(0);
}

const lastFailure = files[0].file;
const lastFailurePath = path.join(failuresDir, lastFailure);

console.log(`\n--- Last failure for ${actionName}: ${lastFailure} ---\n`);
console.log(fs.readFileSync(lastFailurePath, "utf8"));

// Try to print the error log if it exists (same base name, .log extension)
const logPath = lastFailurePath.replace(/\.kmmacros$/, ".log");
if (fs.existsSync(logPath)) {
  console.log(`\n--- Error log for ${lastFailure} ---\n`);
  console.log(fs.readFileSync(logPath, "utf8"));
}
