//FILE: tests/integration/fixtures/typeKeystroke.permutations.ts

/**
 * Generates comprehensive permutations for the TypeKeystroke virtual action.
 * Focus: cover all behavior flows (single, repeat, hold with/without time)
 * and keystroke input forms (string, numeric keycode, mapping).
 */
import { createVirtualTypeKeystroke } from "../../../src/virtual_actions/kmjs.virtualAction.typeKeystroke";

// Representative keystroke forms:
//  1) String shortcut (uses your normalizer)
//  2) Raw keyCode (e.g. Return key 36)
//  3) Map mask→keyCode form
const keystrokeForms: any[] = [
  "Cmd+S", // string
  36, // Return keyCode
  { 1048576: 0 }, // mask (⌘) + keyCode 0 ("A") – example map
];

// Hold times (implies pressAndHold logic with pause)
const holdTimes = [0.1, 1] as const;

export function generateTypeKeystrokePermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualTypeKeystroke>;
    params: any;
  }> = [];
  let i = 0;

  for (const form of keystrokeForms) {
    // 1) Default single keystroke
    list.push({
      name: `TypeKeystroke – Single ${i}`,
      action: createVirtualTypeKeystroke({ keystroke: form }),
      params: { flow: "single", keystroke: form },
    });
    i++;

    // 2) Press & Repeat (only valid alone)
    list.push({
      name: `TypeKeystroke – Repeat ${i}`,
      action: createVirtualTypeKeystroke({
        keystroke: form,
        pressAndRepeat: true,
      }),
      params: { flow: "repeat", keystroke: form },
    });
    i++;

    // 3) Press & Hold without explicit time
    list.push({
      name: `TypeKeystroke – HoldImplicit ${i}`,
      action: createVirtualTypeKeystroke({
        keystroke: form,
        pressAndHold: true,
      }),
      params: { flow: "holdImplicit", keystroke: form },
    });
    i++;

    // 4) Press & Hold with explicit holdTime variations
    for (const holdTime of holdTimes) {
      list.push({
        name: `TypeKeystroke – HoldTime ${i}`,
        action: createVirtualTypeKeystroke({
          keystroke: form,
          holdTime,
        }),
        params: { flow: "holdTime", keystroke: form, holdTime },
      });
      i++;
    }
  }

  return list;
}
