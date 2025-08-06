//FILE: tests/integration/fixtures/playSound.permutations.ts

/**
 * Generates exhaustive permutations for the PlaySound virtual action.
 */
import { createVirtualPlaySound } from "../../../src/virtual_actions/kmjs.virtualAction.playSound";
import type { KMSound } from "../../../src/virtual_actions/types/types.system";

// Full built-in sounds (mirrors KMSound union) + one custom path variant.
const builtInSounds: KMSound[] = [
  "Basso",
  "Blow",
  "Bottle",
  "Default Sound",
  "Frog",
  "Funk",
  "Glass",
  "Hero",
  "Morse",
  "Ping",
  "Pop",
  "Purr",
  "Sosumi",
  "Submarine",
  "Tink",
];

const volumeSamples = [0, 50, 75, 100] as const;
const bools = [true, false] as const;

export function generatePlaySoundPermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualPlaySound>;
    params: any;
  }> = [];
  let i = 0;

  // Built-in sounds
  for (const sound of builtInSounds) {
    for (const asynchronously of bools) {
      for (const timeoutAborts of bools) {
        for (const volume of volumeSamples) {
          const opts: any = {
            sound,
            asynchronously,
            timeoutAborts,
            volume,
          };
          list.push({
            name: `PlaySound – Permutation ${i}`,
            action: createVirtualPlaySound(opts),
            params: opts,
          });
          i++;
        }
      }
    }
  }

  // Custom path variant – exercise path precedence over built-in
  for (const asynchronously of bools) {
    for (const timeoutAborts of bools) {
      for (const volume of volumeSamples) {
        const opts: any = {
          path: "/System/Library/Sounds/Glass.aiff",
          asynchronously,
          timeoutAborts,
          volume,
        };
        list.push({
          name: `PlaySound – CustomPath Permutation ${i}`,
          action: createVirtualPlaySound(opts),
          params: opts,
        });
        i++;
      }
    }
  }

  return list;
}
