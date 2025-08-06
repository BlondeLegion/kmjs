//FILE: src/kmjs.runMacro.ts

/**
 * @file kmjs.runMacro.ts
 * @module kmjs.runMacro
 * @description Run a Keyboard Maestro macro via JXA/osascript.
 *
 * Spawns an osascript process, invokes the specified macro UUID or name
 * with an optional parameter, and returns whatever the macro’s final
 * 'Return' action outputs as a string.
 *
 * @example
 * import { runMacro } from 'kmjs';
 * const result = runMacro({ macroId: '...', parameter: { foo: 'bar' } });
 */
// Lazy import to avoid CEP environment issues
import chalk from "chalk";
import {
  startWatching,
  getErrors,
  stripTimestamps,
  stopWatching,
} from "./utils/km.engineLog";
import { getSafeSpawnSync } from "./utils/utils.spawn";

/**
 * Parameters accepted by {@link runMacro}.
 */
export interface RunMacroOptions {
  /** Keyboard Maestro macro UUID or name. */
  macroId: string;
  /** Parameter to pass to the macro (objects are JSON‑stringified). */
  parameter?: unknown;
}

/**
 * Escape a value so it can be embedded inside the single‑quoted JXA template.
 * @param str - String to escape for JXA
 * @returns Escaped string
 */
function escapeForJXA(str: string): string {
  return str
    .replace(/\\/g, "\\\\") // backslashes
    .replace(/'/g, "\\'") // single quotes
    .replace(/\n/g, "\\n") // newlines
    .replace(/\r/g, "\\r"); // carriage returns
}

/**
 * Execute a Keyboard Maestro macro.
 *
 * @param options.macroId - UUID or name of the macro.
 * @param options.parameter - Optional parameter to pass; objects are JSON-stringified.
 * @returns The string output from the macro’s final 'Return' action.
 * @throws If the osascript process fails or the macro errors.
 */
export function runMacro({ macroId, parameter = "" }: RunMacroOptions): string {
  const paramString =
    typeof parameter === "object"
      ? JSON.stringify(parameter)
      : String(parameter);

  const jxa = `
(function () {
  var kme = Application('Keyboard Maestro Engine');
  var result = kme.doScript('${macroId}', { withParameter: '${escapeForJXA(paramString)}' });
  return (result !== undefined && result !== null) ? String(result) : '';
})();`;

  // 🔍 Debug logging:
  console.log(chalk.magenta(`[kmjs.runMacro] Macro ID: ${macroId}`));
  console.log(chalk.gray(`[kmjs.runMacro] Param: ${paramString}`));
  console.log(chalk.gray(`[kmjs.runMacro] JXA →\n${jxa}`));

  startWatching();

  const spawnSync = getSafeSpawnSync();

  const { status, stdout, stderr, error } = spawnSync(
    "osascript",
    ["-l", "JavaScript", "-e", jxa],
    { encoding: "utf8" },
  );

  if (error) {
    console.error(chalk.red("[kmjs.runMacro] spawnSync error:"), error);
    stopWatching();
    throw error;
  }
  if (status !== 0) {
    console.error(chalk.red(`[kmjs.runMacro] osascript stderr:\n${stderr}`));
    stopWatching();
    throw new Error(`osascript failed: ${stderr.trim()}`);
  }

  const engineErrors = stripTimestamps(getErrors());
  if (engineErrors.length) {
    const divider = chalk.bgRed(" ".repeat(48));
    console.log();
    console.log(divider);
    console.log(chalk.whiteBright.bgRed.bold("[kmjs.runMacro] Engine Errors:"));
    engineErrors.forEach((err, idx) => {
      const bullet = chalk.redBright("  • ");
      const msg =
        idx % 2 === 0
          ? chalk.yellowBright.bold(err)
          : chalk.whiteBright.bold(err);
      console.log(bullet + msg);
    });
    console.log(divider);
    console.log();
  }
  stopWatching();

  console.log(chalk.green(`[kmjs.runMacro] stdout: ${stdout.trim()}`));
  return stdout.trim();
}
