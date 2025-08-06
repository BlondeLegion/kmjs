//FILE: tests/integration/fixtures/notification.permutations.ts

/**
 * Generates permutations for the Notification virtual action.
 * No custom file paths, so the PlaySound helper is never injected.
 * Again: no explicit TestPermutation import or annotation.
 */

import { createVirtualNotification } from "../../../src/virtual_actions/kmjs.virtualAction.notification";

const titles = ["Update Available", "Build Complete"] as const;
const subtitles = ["", "All tests passed"] as const;
const bodies = ["Check the details.", "Everything looks good!"] as const;
/** Built-in sounds only — empty string means “no sound” */
const sounds = ["", "Ping", "Tink"] as const;

export function generateNotificationPermutations() {
  const perms: Array<{
    name: string;
    action: ReturnType<typeof createVirtualNotification>;
    params: any;
  }> = [];
  let i = 0;

  for (const title of titles) {
    for (const subtitle of subtitles) {
      for (const body of bodies) {
        for (const sound of sounds) {
          const opts = { title, subtitle, body, sound };
          perms.push({
            name: `Notification – Permutation ${i}`,
            action: createVirtualNotification(opts),
            params: opts,
          });
          i++;
        }
      }
    }
  }

  return perms;
}
