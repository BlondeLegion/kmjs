import { createVirtualScrollWheelEvent } from "../../../src/virtual_actions/kmjs.virtualAction.scrollWheelEvent";
import type { ScrollDirection } from "../../../src/virtual_actions/types/types.input";

export function generateScrollWheelEventPermutations() {
  const scrollAmounts = [30, 60];
  const directions: ScrollDirection[] = ["Up", "Down", "Left", "Right"];
  const stopOnFailure = [undefined, true];
  const notifyOnFailure = [undefined, false];

  const result: Array<{
    name: string;
    action: ReturnType<typeof createVirtualScrollWheelEvent>;
    params: {
      scrollAmount: number;
      direction: ScrollDirection;
      stopOnFailure: boolean | undefined;
      notifyOnFailure: boolean | undefined;
    };
  }> = [];
  let idx = 0;
  for (const amount of scrollAmounts) {
    for (const direction of directions) {
      for (const stop of stopOnFailure) {
        for (const notify of notifyOnFailure) {
          result.push({
            name: `ScrollWheelEvent – Permutation ${idx}`,
            action: createVirtualScrollWheelEvent({
              scrollAmount: amount,
              direction,
              stopOnFailure: stop,
              notifyOnFailure: notify,
              actionUID: 1753949079 + idx,
            }),
            params: {
              scrollAmount: amount,
              direction,
              stopOnFailure: stop,
              notifyOnFailure: notify,
            },
          });
          idx++;
        }
      }
    }
  }
  return result;
}
