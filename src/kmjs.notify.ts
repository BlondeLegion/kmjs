//FILE: src/kmjs.notify.ts

/**
 * @file kmjs.notify.ts
 * @module kmjs.notify
 * @description Sends a notification using a virtual Keyboard Maestro Notification action.
 *
 * The return value of this function corresponds to the final 'Return'
 * action if you add one to the virtual macro.
 *
 * @example
 * import { notify } from 'kmjs';
 * notify({ title: 'Done', body: 'Finished', sound: 'Ping' });
 */

import chalk from "chalk";
import { createVirtualNotification } from "./virtual_actions/kmjs.virtualAction.notification";
import { runVirtualMacro } from "./kmjs.runVirtualMacro";
import type { NotificationOptions } from "./virtual_actions/kmjs.virtualAction.notification";
import type { KMSound } from "./virtual_actions/types/types.system";

/**
 * Options for sending a Keyboard Maestro notification via KMJS.
 *
 * @property title - Notification title (required)
 * @property body - Notification body text (required)
 * @property subtitle - Optional subtitle (shown smaller, below title)
 * @property sound - Optional sound effect (built-in KM sound name or custom file path)
 */
export interface NotifyOptions extends Omit<NotificationOptions, never> {
  /** Notification title. */
  title: string;
  /** Notification body. */
  body: string;
  /** Optional subtitle (shown smaller, below title). */
  subtitle?: string;
  /** Optional KM sound effect name (see KMSound) or custom file path. */
  sound?: KMSound | string;
}

/**
 * Convenience function to immediately display a Keyboard Maestro notification using a virtual action.
 *
 * This is a fire-and-forget utility: import and call it directly to show a notification in KM.
 * It automatically generates and executes a transient macro containing a single notification action.
 *
 * @param options - Notification options (title, body, optional subtitle, sound)
 * @returns void
 *
 * @example
 * import { notify } from 'kmjs';
 * notify({ title: 'Done', body: 'Finished', sound: 'Glass' });
 * notify({ title: 'Alert', body: 'Something happened', subtitle: 'Heads up!' });
 */
export function notify({
  title,
  body,
  subtitle = "",
  sound = "",
}: NotifyOptions): void {
  console.log(
    chalk.magenta(`→ [kmjs.notify] Using virtual notification action`),
  );

  const action = createVirtualNotification({ title, body, subtitle, sound });
  console.log(chalk.blue("Sending virtual Keyboard Maestro notification…"));
  runVirtualMacro([action], "notify");
  console.log(chalk.green("Notification sent."));
}

/* ------------------------------------------------------------------ */
/* Optional CLI usage:                                                */
/* node dist/kmjs.notify.js "Hello" "World" "Hero"                    */
/* ------------------------------------------------------------------ */
// Safe CLI entry point for environments where require.main might not exist
try {
  if (require.main === module) {
    const argv =
      typeof process !== "undefined" && process.argv
        ? process.argv.slice(2)
        : [];
    const [title, body, sound] = argv;
    if (!title || !body) {
      console.error("Usage: node kmjs.notify.js <title> <body> [sound]");
      if (typeof process !== "undefined" && process.exit) process.exit(1);
    } else {
      try {
        notify({ title, body, sound });
      } catch (err) {
        console.error("Error sending notification:", (err as Error).message);
        if (typeof process !== "undefined" && process.exit) process.exit(1);
      }
    }
  }
} catch (error) {
  // Silently ignore if require.main is not available (e.g., in CEP environments)
}
