//FILE: tests/integration/fixtures/moveAndClick.permutations.ts

import { createVirtualMoveAndClick } from "../../../src/virtual_actions/kmjs.virtualAction.moveAndClick";
import type { MoveAndClickOptions } from "../../../src/virtual_actions/kmjs.virtualAction.moveAndClick";

/**
 * Generates permutations for the MoveAndClick virtual action.
 * Only window/screen/mouse/absolute relative options are included (no image search).
 */
export function generateMoveAndClickPermutations() {
  //   const clickKinds = ["Click", "DoubleClick", "Move", "Release"];
  const clickKinds = ["Click", "Move", "Release"];
  //   const mouseButtons = ["Left", "Right", "Center"];
  const mouseButtons = ["Left"];
  const relatives = ["Window", "Screen", "Mouse", "Absolute"];
  //   const relativeCorners = [
  //     "TopLeft",
  //     "Center",
  //     "TopRight",
  //     "BottomLeft",
  //     "BottomRight",
  //   ];
  const relativeCorners = ["TopLeft", "Center"];
  const mouseDrags = ["None", "To", "Absolute", "Relative", "Hold"];
  const positions = [0, 100, -50];
  const dragTargets = [0, 42];
  const restoreMouseLocations = [true, false];
  const clickModifiers = [0, 256, 768, "Cmd+Shift"];

  const permutations: {
    name: string;
    action: ReturnType<typeof createVirtualMoveAndClick>;
    params: MoveAndClickOptions;
  }[] = [];
  let idx = 0;

  for (const clickKind of clickKinds) {
    for (const button of mouseButtons) {
      for (const relative of relatives) {
        for (const relativeCorner of relativeCorners) {
          for (const mouseDrag of mouseDrags) {
            for (const horizontal of positions) {
              for (const vertical of positions) {
                for (const dragTargetX of dragTargets) {
                  for (const dragTargetY of dragTargets) {
                    for (const restoreMouseLocation of restoreMouseLocations) {
                      for (const clickModifier of clickModifiers) {
                        // Prune nonsensical drag variants (like click+drag)
                        if (
                          (clickKind === "Click" ||
                            clickKind === "DoubleClick") &&
                          (mouseDrag === "From" ||
                            mouseDrag === "Drag" ||
                            mouseDrag === "Release")
                        ) {
                          continue;
                        }
                        const opts: MoveAndClickOptions = {
                          clickKind: clickKind as any,
                          button: button as any,
                          clickModifiers: clickModifier as any,
                          horizontal,
                          vertical,
                          relative: relative as any,
                          relativeCorner: relativeCorner as any,
                          mouseDrag: mouseDrag as any,
                          dragTargetX,
                          dragTargetY,
                          restoreMouseLocation,
                        };
                        permutations.push({
                          name: `MoveAndClick – Permutation ${idx}`,
                          action: createVirtualMoveAndClick(opts),
                          params: opts,
                        });
                        idx++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return permutations;
}
