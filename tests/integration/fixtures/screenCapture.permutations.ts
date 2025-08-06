//FILE: tests/integration/fixtures/screenCapture.permutations.ts

import { createVirtualScreenCapture } from "../../../src/virtual_actions/kmjs.virtualAction.screenCapture";
import type { ScreenCaptureOptions } from "../../../src/virtual_actions/kmjs.virtualAction.screenCapture";
import type { ScreenArea } from "../../../src/virtual_actions/types";

// Sample screen areas (minimal for coverage, can be expanded)
const screenAreas: ScreenArea[] = [
  { type: "ScreenAll" },
  { type: "ScreenMain" },
  { type: "ScreenSecond" },
  { type: "ScreenIndex", index: 2 },
  { type: "WindowFront" },
  { type: "WindowName", name: "Test Window" },
  { type: "Area", left: 125, top: 125, width: 300, height: 300 },
];

// Clipboard destinations
const destinations: (
  | undefined
  | "TriggerClipboard"
  | { name: string; uid?: string }
)[] = [
  undefined, // SystemClipboard (default)
  "TriggerClipboard",
  { name: "Clipboard 5", uid: "C9303639-72AF-4524-B4CF-9017A31D0788" },
  { name: "Clipboard Custom" },
];

// Flag permutations
const alwaysNominalRes = [false, true];
const stopOnFailure = [false, true];
const notifyOnFailure = [true, false];

export function generateScreenCapturePermutations() {
  const perms: Array<{
    name: string;
    action: ReturnType<typeof createVirtualScreenCapture>;
    params: any;
  }> = [];
  let i = 0;
  for (const screenArea of screenAreas) {
    for (const destination of destinations) {
      for (const alwaysNominalResolution of alwaysNominalRes) {
        for (const stop of stopOnFailure) {
          for (const notify of notifyOnFailure) {
            const opts: ScreenCaptureOptions = {
              screenArea,
              destination,
              alwaysNominalResolution,
              stopOnFailure: stop,
              notifyOnFailure: notify,
            };
            perms.push({
              name: `ScreenCapture – ${i}`,
              action: createVirtualScreenCapture(opts),
              params: opts,
            });
            i++;
          }
        }
      }
    }
  }
  return perms;
}
