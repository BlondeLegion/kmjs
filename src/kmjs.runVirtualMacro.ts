//FILE: src/kmjs.runVirtualMacro.ts

/**
 * Build a transient macro from an array of VirtualAction and “do script” it.
 */
// Lazy import to avoid CEP environment issues
import chalk from "chalk";
import { indent } from "./utils/utils.xml";
import type { VirtualAction } from "./virtual_actions/types";
import { PLIST_HEADER, PLIST_FOOTER } from "./utils/template.xml.generic";
import { createVirtualReturn } from "./virtual_actions/kmjs.virtualAction.return";
import {
  startWatching,
  reportErrors,
  stopWatching,
} from "./utils/km.engineLog";
import { getSafeSpawnSync } from "./utils/utils.spawn";

const LOG_XML = true;

/**
 * Wraps an array of VirtualAction XML fragments into a complete .kmmacros plist.
 *
 * This function takes an array of VirtualAction instances, converts each to its XML
 * representation, and wraps them all inside the standard plist XML structure required
 * by Keyboard Maestro for ephemeral macros.
 *
 * If addReturnActionXML is provided, appends a Keyboard Maestro Return action as the last action
 * as a convenience feature of KMJS.
 *
 * @param actions - List of VirtualAction instances to include in the macro.
 * @param addReturnActionXML - Optional string to include in a Return action (adds a Return action at the end)
 * @returns A full XML string representing the ephemeral macro.
 */
export function buildEphemeralMacroXml(
  actions: VirtualAction[],
  addReturnActionXML?: string,
): string {
  const allActions = addReturnActionXML
    ? [...actions, createVirtualReturn({ text: addReturnActionXML })]
    : actions;
  const body = allActions.map((a) => a.toXml()).join("\n");
  return PLIST_HEADER + body + "\n" + PLIST_FOOTER;
}

/**
 * Executes a transient virtual macro in Keyboard Maestro by sending it XML via osascript.
 *
 * This function builds the ephemeral macro XML from the given VirtualAction array,
 * sends it to Keyboard Maestro Engine using JavaScript for Automation (JXA),
 * waits briefly to allow the macro to execute, and then checks for any errors
 * emitted by the engine during execution.
 *
 * If addReturnActionXML is provided, appends a Keyboard Maestro Return action as the last action
 * as a convenience feature of KMJS (but does not capture the return value).
 *
 * If captureReturnValue is true, the function will capture and return the result from the macro execution.
 *
 * @param actions - Array of VirtualAction objects to run.
 * @param name - Optional macro name for logging.
 * @param addReturnActionXML - Optional string to include in a Return action (adds a Return action at the end)
 * @param captureReturnValue - Whether to capture and return the macro's result
 * @returns The macro result if captureReturnValue is true, otherwise void
 */
export function runVirtualMacro(
  actions: VirtualAction[],
  name?: string,
  addReturnActionXML?: string,
  captureReturnValue?: boolean,
): string | void {
  if (actions.length === 0 && !addReturnActionXML) {
    console.log(chalk.yellow("No actions supplied — nothing to run."));
    return;
  }

  // construct the XML for the virtual macro
  const xml = buildEphemeralMacroXml(actions, addReturnActionXML);

  const macroLabel = name ? `virtual macro '${name}'` : "virtual macro";
  console.log(
    chalk.gray(
      `--> Executing ${macroLabel} with ${actions.length}${addReturnActionXML ? "+Return" : ""} action(s)…`,
    ),
  );

  // Start watching the Keyboard Maestro Engine log for errors
  startWatching();

  // Use osascript to run the macro - modify JXA based on whether we need to capture return value
  const jxaScript = captureReturnValue
    ? `(function () {
        var kme = Application('Keyboard Maestro Engine');
        var result = kme.doScript(${JSON.stringify(xml)});
        return (result !== undefined && result !== null) ? String(result) : '';
      })();`
    : `Application('Keyboard Maestro Engine').doScript(${JSON.stringify(xml)})`;

  const spawnSync = getSafeSpawnSync();

  const osa = spawnSync("osascript", ["-l", "JavaScript", "-e", jxaScript], {
    encoding: "utf8",
  });

  // Check for errors in the osascript execution as the first attempt to procure errors
  if (osa.error) {
    console.error(chalk.red("Spawn error:"), osa.error);
    stopWatching();
    if (captureReturnValue) {
      throw osa.error;
    }
    return;
  } else {
    if (osa.stderr.trim()) {
      console.error(chalk.red("[KM ERROR]"), osa.stderr.trim());
      stopWatching();
      if (captureReturnValue) {
        throw new Error(`KM Error: ${osa.stderr.trim()}`);
      }
      return;
    }
    if (osa.status !== 0) {
      console.error(chalk.red("Non-zero exit code:", osa.status));
      stopWatching();
      if (captureReturnValue) {
        throw new Error(`Non-zero exit code: ${osa.status}`);
      }
      return;
    }
  }

  // Now check the Keyboard Maestro Engine log for any errors that occurred during execution
  if (!reportErrors(xml)) {
    if (name) {
      console.log(chalk.green(`✅ ${macroLabel} executed successfully.`));
      console.log(
        chalk.green(
          `No Keyboard Maestro engine errors detected for '${name}'.`,
        ),
      );
    } else {
      console.log(chalk.green("✅ Virtual macro executed successfully."));
      console.log(chalk.green("No Keyboard Maestro engine errors detected."));
    }
  }
  stopWatching();

  if (LOG_XML) {
    console.log(chalk.magenta("[VirtualMacro XML]"));
    console.log(chalk.grey(xml));
  }

  // Return the captured result if requested
  if (captureReturnValue) {
    const result = osa.stdout.trim();
    console.log(chalk.green(`[runVirtualMacro] Result: ${result}`));
    return result;
  }
}
