//FILE: tests/integration/fixtures/manipulateWindow.permutations.ts

/**
 * Generates exhaustive permutations for the ManipulateWindow virtual action.
 */
import { createVirtualManipulateWindow } from "../../../src/virtual_actions/kmjs.virtualAction.manipulateWindow";
import {
  specificApps,
  sampleValues,
  sampleCustomValues,
} from "../utils/permutations.templates";
import type {
  ApplicationTarget,
  WindowManipulation,
  MoveAndResizePreset,
  WindowTarget,
} from "../../../src/virtual_actions/types/";

const bools = [undefined, true, false] as const;

export function generateManipulateWindowPermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualManipulateWindow>;
    params: any;
  }> = [];
  let n = 0;

  const manipulations: WindowManipulation[] = [
    "ResizeWindowByPercent", // ScaleBy
    "ResizeWindowBy",
    "ResizeWindowTo",
    "MoveWindowBy",
    "MoveWindowTo",
    "MoveAndResize",
    "CenterWindow",
    "CenterWindowAt",
    "CloseWindow",
    "ZoomWindow",
    "ReallyMinimizeWindow",
    "UnminimizeWindow",
    "MinimizeWindow", // ToggleMinimize
    "SelectWindow", // BringToFront
  ];

  const moveAndResizePresets: MoveAndResizePreset[] = [
    "Custom",
    "FullScreen",
    "LeftColumn",
    "RightColumn",
    "TopHalf",
    "BottomHalf",
    "TopLeft",
    "TopRight",
    "BottomLeft",
    "BottomRight",
  ];

  const windowTargets: WindowTarget[] = [
    "FrontWindow",
    "NamedWindow",
    "WindowNameContaining",
    "WindowNameMatching",
    "WindowIndex",
    "KMWindowID",
    "KMLastWindow",
  ];

  const applicationTargets: ApplicationTarget[] = ["Front", "Specific"];

  for (const manipulation of manipulations) {
    for (const windowTarget of windowTargets) {
      // Determine which application targets to test
      const appTargets =
        windowTarget === "KMWindowID" || windowTarget === "KMLastWindow"
          ? ["Front" as ApplicationTarget] // Only Front for KM-specific targets
          : applicationTargets;

      for (const applicationTarget of appTargets) {
        const apps =
          applicationTarget === "Specific" ? specificApps : [undefined as any];

        for (const specificApplication of apps) {
          // Handle different manipulation types
          if (
            [
              "ResizeWindowByPercent",
              "ResizeWindowBy",
              "ResizeWindowTo",
              "MoveWindowBy",
              "MoveWindowTo",
            ].includes(manipulation)
          ) {
            // Test with different value combinations
            for (const values of sampleValues) {
              for (const stopOnFailure of bools) {
                for (const notifyOnFailure of bools) {
                  const opts: any = {
                    manipulation,
                    values,
                    windowTarget,
                    applicationTarget,
                    stopOnFailure,
                    notifyOnFailure,
                  };

                  if (applicationTarget === "Specific") {
                    opts.specificApplication = specificApplication;
                  }

                  // Add window-specific parameters
                  if (
                    windowTarget === "NamedWindow" ||
                    windowTarget === "WindowNameContaining" ||
                    windowTarget === "WindowNameMatching"
                  ) {
                    opts.windowIdentifier = "Test Window";
                  } else if (windowTarget === "WindowIndex") {
                    opts.windowIndex = 1;
                  } else if (windowTarget === "KMWindowID") {
                    opts.windowIdentifier = "123456";
                  }

                  list.push({
                    name: `ManipulateWindow – Permutation ${n}`,
                    action: createVirtualManipulateWindow(opts),
                    params: opts,
                  });
                  n++;
                }
              }
            }
          } else if (manipulation === "MoveAndResize") {
            // Test different MoveAndResize presets
            for (const moveAndResizePreset of moveAndResizePresets) {
              for (const stopOnFailure of bools) {
                for (const notifyOnFailure of bools) {
                  const opts: any = {
                    manipulation,
                    moveAndResizePreset,
                    windowTarget,
                    applicationTarget,
                    stopOnFailure,
                    notifyOnFailure,
                  };

                  if (applicationTarget === "Specific") {
                    opts.specificApplication = specificApplication;
                  }

                  // Add window-specific parameters
                  if (
                    windowTarget === "NamedWindow" ||
                    windowTarget === "WindowNameContaining" ||
                    windowTarget === "WindowNameMatching"
                  ) {
                    opts.windowIdentifier = "Test Window";
                  } else if (windowTarget === "WindowIndex") {
                    opts.windowIndex = 1;
                  } else if (windowTarget === "KMWindowID") {
                    opts.windowIdentifier = "123456";
                  }

                  // Test with custom values for Custom preset
                  if (moveAndResizePreset === "Custom") {
                    for (const customValues of sampleCustomValues) {
                      const customOpts = { ...opts, customValues };
                      list.push({
                        name: `ManipulateWindow – Permutation ${n}`,
                        action: createVirtualManipulateWindow(customOpts),
                        params: customOpts,
                      });
                      n++;
                    }
                  } else {
                    list.push({
                      name: `ManipulateWindow – Permutation ${n}`,
                      action: createVirtualManipulateWindow(opts),
                      params: opts,
                    });
                    n++;
                  }
                }
              }
            }
          } else if (manipulation === "CenterWindowAt") {
            // Test CenterAt with custom values
            for (const customValues of sampleCustomValues) {
              for (const stopOnFailure of bools) {
                for (const notifyOnFailure of bools) {
                  const opts: any = {
                    manipulation,
                    customValues,
                    windowTarget,
                    applicationTarget,
                    stopOnFailure,
                    notifyOnFailure,
                  };

                  if (applicationTarget === "Specific") {
                    opts.specificApplication = specificApplication;
                  }

                  // Add window-specific parameters
                  if (
                    windowTarget === "NamedWindow" ||
                    windowTarget === "WindowNameContaining" ||
                    windowTarget === "WindowNameMatching"
                  ) {
                    opts.windowIdentifier = "Test Window";
                  } else if (windowTarget === "WindowIndex") {
                    opts.windowIndex = 1;
                  } else if (windowTarget === "KMWindowID") {
                    opts.windowIdentifier = "123456";
                  }

                  list.push({
                    name: `ManipulateWindow – Permutation ${n}`,
                    action: createVirtualManipulateWindow(opts),
                    params: opts,
                  });
                  n++;
                }
              }
            }
          } else {
            // Simple operations without additional parameters
            for (const stopOnFailure of bools) {
              for (const notifyOnFailure of bools) {
                const opts: any = {
                  manipulation,
                  windowTarget,
                  applicationTarget,
                  stopOnFailure,
                  notifyOnFailure,
                };

                if (applicationTarget === "Specific") {
                  opts.specificApplication = specificApplication;
                }

                // Add window-specific parameters
                if (
                  windowTarget === "NamedWindow" ||
                  windowTarget === "WindowNameContaining" ||
                  windowTarget === "WindowNameMatching"
                ) {
                  opts.windowIdentifier = "Test Window";
                } else if (windowTarget === "WindowIndex") {
                  opts.windowIndex = 1;
                } else if (windowTarget === "KMWindowID") {
                  opts.windowIdentifier = "123456";
                }

                list.push({
                  name: `ManipulateWindow – Permutation ${n}`,
                  action: createVirtualManipulateWindow(opts),
                  params: opts,
                });
                n++;
              }
            }
          }
        }
      }
    }
  }

  return list;
}
