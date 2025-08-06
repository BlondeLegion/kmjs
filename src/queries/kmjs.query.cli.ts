//FILE: src/queries/kmjs.query.cli.ts

/**
 * @file src/queries/kmjs.query.cli.ts
 * @description CLI utility to run any query function from the command line.
 * Usage:
 *   ts-node src/queries/kmjs.query.cli.ts <queryName> [args]
 * Example:
 *   ts-node src/queries/kmjs.query.cli.ts getMousePosition true
 */

import chalk from "chalk";
import { queries } from "./index";

function printUsage() {
  console.log(
    chalk.yellow(
      "Usage: ts-node src/queries/kmjs.query.cli.ts <queryName> [args]",
    ),
  );
  console.log(
    chalk.cyan("Available queries:"),
    chalk.white(Object.keys(queries).join(", ")),
  );
}

async function main() {
  // Safe process.argv access for CEP environments
  const argv =
    typeof process !== "undefined" && process.argv ? process.argv : [];
  const [, , queryName, ...args] = argv;
  if (!queryName || !(queryName in queries)) {
    printUsage();
    if (typeof process !== "undefined" && process.exit) process.exit(1);
    return;
  }

  try {
    // All queries are now called generically
    const result = (queries as Record<string, any>)[queryName](...args);
    console.log(
      chalk.green("Result:"),
      chalk.whiteBright(JSON.stringify(result, null, 2)),
    );
  } catch (error) {
    console.error(
      chalk.red("Error:"),
      chalk.white(error instanceof Error ? error.message : String(error)),
    );
    if (typeof process !== "undefined" && process.exit) process.exit(1);
  }
}

// Safe CLI entry point for environments where require.main might not exist
try {
  if (require.main === module) {
    main();
  }
} catch (error) {
  // Silently ignore if require.main is not available (e.g., in CEP environments)
}
