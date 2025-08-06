#!/usr/bin/env node

/**
 * Setup script for local development with yarn link
 *
 * This script helps set up kmjs for local development by:
 * 1. Building the project
 * 2. Creating a yarn link
 * 3. Providing instructions for using it in other projects
 */

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

console.log(chalk.blue("🔧 Setting up kmjs for local development...\n"));

try {
  // Build the project
  console.log(chalk.yellow("📦 Building project..."));
  execSync("yarn build", { stdio: "inherit" });

  // Create yarn link
  console.log(chalk.yellow("🔗 Creating yarn link..."));
  execSync("yarn link", { stdio: "inherit" });

  console.log(chalk.green("\n✅ Setup complete!\n"));

  console.log(chalk.blue("📋 To use kmjs in another project:\n"));
  console.log(chalk.gray("  1. In your other project directory, run:"));
  console.log(chalk.white('     yarn link "kmjs"\n'));

  console.log(chalk.gray("  2. Import and use kmjs functions:"));
  console.log(
    chalk.white(
      `     import { runVirtualMacro, createVirtualNotification } from 'kmjs';\n`,
    ),
  );

  console.log(chalk.gray("  3. When you make changes to kmjs, just run:"));
  console.log(chalk.white("     yarn build\n"));

  console.log(chalk.gray("  4. To unlink from a project:"));
  console.log(chalk.white('     yarn unlink "kmjs"\n'));

  console.log(chalk.blue("🎯 Try the example:"));
  console.log(
    chalk.white(
      '   cd examples/basic-usage && yarn install && yarn link "kmjs" && yarn dev\n',
    ),
  );
} catch (error) {
  console.error(chalk.red("❌ Setup failed:"), error.message);
  process.exit(1);
}
