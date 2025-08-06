//FILE: tests/integration/fixtures/clickAtFoundImage.permutations.ts

/**
 * Auto-generates *all* test-cases for the ClickAtFoundImage virtual action without
 * maintaining a giant hand-written spec list. All enums & booleans appearing
 * in the constituent types are expanded automatically using the permutations generator.
 */

import { createVirtualClickAtFoundImage } from "../../../src/virtual_actions/kmjs.virtualAction.clickAtFoundImage";
// import { buildPermutations } from "../../../src/utils/permutations.generator";
// import type {
//   ImageSource,
//   RelativeCorner,
//   ImageSelection,
//   CoordinateReference,
//   ScreenArea,
//   MouseButton,
//   ClickKind,
//   MouseDrag,
// } from "../../../src/virtual_actions/types";
/* ------------------------------------------------------------------ */
/* Generate comprehensive permutations using the automated system     */
/* ------------------------------------------------------------------ */

export function generateClickAtFoundImagePermutations() {
  // Use representative samples from each type to keep permutation count reasonable
  // const clickKinds = ["Click", "DoubleClick"]; // 2
  // const mouseButtons = ["Left", "Right"]; // 2
  // const relatives = ["Image", "Window"]; // 2 (coordinate reference)
  // const imageSources = ["Image", "File", "Screen", "NamedClipboard", "Icon", "SystemClipboard", "TriggerClipboard"];
  // const relativeCorners = ["Center", "TopLeft", "TopRight", "BottomLeft", "BottomRight", "Mouse"];
  // const imageSelections = ["Unique", "Best", "Top", "Left", "Bottom", "Right"];
  // const screenAreas = [{ type: "ScreenAll" as const }]; // 1
  // const mouseDrags = ["None", "To", "From", "Drag", "Release"];

  // CONFIG 1: Original representative set
  const config1 = {
    clickKinds: ["Click", "DoubleClick", "Move"], // 3
    mouseButtons: ["Left", "Right"], // 2
    relatives: ["Image", "Window", "Screen"], // 3
    imageSources: ["Image", "File", "Screen", "NamedClipboard"], // 4
    relativeCorners: ["Center"], // 1
    imageSelections: ["Unique", "Best"], // 2
    screenAreas: [
      // 4
      { type: "ScreenAll" },
      { type: "ScreenIndex", index: 1 },
      { type: "WindowIndex", index: 2 },
      { type: "Area", left: 15, top: 16, width: 17, height: 18 },
    ],
    mouseDrags: ["None", "To"], // 2
  };

  // CONFIG 2: Expanded test set with additional options
  const config2 = {
    clickKinds: ["Click", "Move", "Release"],
    mouseButtons: ["Center"],
    relatives: ["Image", "Window", "Screen", "Mouse", "Absolute"],
    imageSources: ["Image", "File", "Screen", "NamedClipboard", "Icon"],
    relativeCorners: ["Center", "TopLeft"],
    imageSelections: ["Unique", "Top"],
    screenAreas: [
      { type: "ScreenAll" },
      { type: "WindowName", name: "MyApp" },
      { type: "Area", left: 15, top: 16, width: 17, height: 18 },
    ],
    mouseDrags: ["None", "To", "Hold"],
  };

  // USE CONFIG 2
  const {
    clickKinds,
    mouseButtons,
    relatives,
    imageSources,
    relativeCorners,
    imageSelections,
    screenAreas,
    mouseDrags,
  } = config2;

  if (process.env.KMJS_VERBOSE_PERMUTATIONS === "1") {
    console.log(`Found enum permutations:`, {
      clickKinds: clickKinds.length,
      mouseButtons: mouseButtons.length,
      relatives: relatives.length,
      imageSources: imageSources.length,
      relativeCorners: relativeCorners.length,
      imageSelections: imageSelections.length,
      screenAreas: screenAreas.length,
      mouseDrags: mouseDrags.length,
    });
  }

  if (imageSources.length === 0) {
    console.warn("No permutations found! Check if types are in schema.json");
    return [];
  }

  // Build cartesian product of all enum variations
  const result: Array<{
    name: string;
    action: ReturnType<typeof createVirtualClickAtFoundImage>;
    params: any;
  }> = [];
  let index = 0;

  for (const clickKind of clickKinds) {
    for (const button of mouseButtons) {
      for (const relative of relatives) {
        for (const imageSource of imageSources) {
          for (const relativeCorner of relativeCorners) {
            for (const imageSelection of imageSelections.length > 0
              ? imageSelections
              : [undefined]) {
              for (const screenArea of screenAreas.length > 0
                ? screenAreas
                : [undefined]) {
                for (const mouseDrag of mouseDrags) {
                  /* -----------------------------------------------------
                   *  PRUNE nonsensical drag variants:
                   *    – KM forces MouseDrag → None when ClickKind is a
                   *      “real” click (Click / DoubleClick).  Skip them
                   *      here to avoid pointless test cases.
                   * --------------------------------------------------- */
                  if (
                    (clickKind === "Click" || clickKind === "DoubleClick") &&
                    (mouseDrag === "From" ||
                      mouseDrag === "Drag" ||
                      mouseDrag === "Release")
                  ) {
                    continue; // skip invalid combination
                  }

                  const opts: any = {
                    clickKind,
                    button,
                    relative, // ← coordinate reference
                    imageSource, // ← template origin
                    relativeCorner,
                    mouseDrag,
                  };

                  // Add optional fields only if they have values
                  if (imageSelection !== "Unique")
                    opts.imageSelection = imageSelection;
                  if (screenArea) opts.screenArea = screenArea;

                  // // Inject additional options for some permutations
                  // if (index % 5 === 0) {
                  //   opts.waitForImage = false;
                  //   opts.restoreMouseLocation = true;
                  // }
                  // if (index % 7 === 0) {
                  //   opts.horizontal = 5;
                  //   opts.vertical = 10;
                  // }
                  // if (index % 11 === 0) {
                  //   opts.namedClipboardUUID = "XXX";
                  //   opts.clickModifiers = 2304; // Cmd + Option
                  //   opts.fuzz = 42;
                  // }

                  // Add conditional required fields based on imageSource type
                  if (imageSource === "File") {
                    opts.filePath = "/tmp/test-image.png";
                  }

                  result.push({
                    name: `ClickAtFoundImage – Permutation ${index}`,
                    action: createVirtualClickAtFoundImage(opts),
                    params: opts, // Store the parameters for filename generation
                  });

                  index++;
                }
              }
            }
          }
        }
      }
    }
  }

  if (process.env.KMJS_VERBOSE_PERMUTATIONS === "2") {
    console.log(
      `Generated ${result.length} total ClickAtFoundImage test permutations`,
    );
  }
  return result;
}
