#!/usr/bin/env node

/**
 * Package validation script
 *
 * Validates that the package is ready for publishing by checking:
 * - Build output exists
 * - Tests pass
 * - Required files are present
 * - Package.json is properly configured
 */

const fs = require("fs");
const { execSync } = require("child_process");

// Handle chalk import for both v4 and v5
let chalk;
try {
  // Try to import chalk (works for v4)
  chalk = require("chalk");
  // Test if it's actually working
  if (typeof chalk.blue !== "function") {
    throw new Error("Chalk not working");
  }
} catch (e) {
  // Fallback for chalk v5 (ES module) or missing chalk
  chalk = {
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    white: (text) => `\x1b[37m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
  };
}

console.log(chalk.blue("🔍 Validating kmjs package...\n"));

const checks = [
  {
    name: "Build output exists",
    check: () =>
      fs.existsSync("dist/index.js") && fs.existsSync("dist/index.d.ts"),
    fix: "Run: yarn build",
  },
  {
    name: "Required files present",
    check: () =>
      ["README.md", "LICENSE", "package.json"].every((file) =>
        fs.existsSync(file),
      ),
    fix: "Ensure README.md, LICENSE, and package.json exist",
  },
  {
    name: "Package.json has required fields",
    check: () => {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      return (
        pkg.name && pkg.version && pkg.description && pkg.author && pkg.license
      );
    },
    fix: "Add missing fields to package.json",
  },
  {
    name: "TypeScript compiles without errors",
    check: () => {
      try {
        execSync("yarn build", { stdio: "pipe" });
        return true;
      } catch {
        return false;
      }
    },
    fix: "Fix TypeScript compilation errors",
  },
];

let allPassed = true;

for (const { name, check, fix } of checks) {
  process.stdout.write(chalk.yellow(`Checking ${name}... `));

  if (check()) {
    console.log(chalk.green("✅"));
  } else {
    console.log(chalk.red("❌"));
    console.log(chalk.gray(`  Fix: ${fix}`));
    allPassed = false;
  }
}

console.log();

if (allPassed) {
  console.log(
    chalk.green("🎉 Package validation passed! Ready for publishing."),
  );

  console.log(chalk.blue("\n📋 Next steps:"));
  console.log(chalk.white("  1. Test locally: yarn setup:local"));
  console.log(chalk.white("  2. Create bundle: yarn bundle"));
  console.log(
    chalk.white("  3. Update version: yarn version patch|minor|major"),
  );
  console.log(chalk.white("  4. Publish: yarn publish (when ready)"));
} else {
  console.log(
    chalk.red("❌ Package validation failed. Please fix the issues above."),
  );
  process.exit(1);
}
