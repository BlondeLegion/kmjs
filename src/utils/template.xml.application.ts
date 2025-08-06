//FILE: src/utils/template.xml.application.ts

import { escapeForXml, kmKeyOrder } from "./utils.xml";
import type {
  SpecificAppOptions,
  ApplicationTarget,
  MoveAndResizePreset,
} from "../virtual_actions/types/types.ui";

/**
 * Generates the XML for an Application key-value pair used in KM actions.
 * This is shared between Quit, ManipulateWindow, and other actions that target applications.
 *
 * @param target - Whether to target the front app or a specific one
 * @param specific - If targeting a specific app, provide identification options
 * @returns Array of XML lines for the Application section
 */
export function generateApplicationXml(
  target: ApplicationTarget = "Front",
  specific: SpecificAppOptions = {},
): string[] {
  if (target === "Specific") {
    const { name, bundleIdentifier, path, match, newFile } = specific;
    // Create object and use canonical ordering
    const appData: any = {};
    if (bundleIdentifier) appData.BundleIdentifier = bundleIdentifier;
    if (match) appData.Match = match;
    if (name) appData.Name = name;
    if (newFile) appData.NewFile = newFile;
    if (path) appData.Path = path;
    const orderedKeys = kmKeyOrder(Object.keys(appData), "application");
    return [
      "<dict>",
      ...orderedKeys.flatMap((key) => [
        `<key>${key}</key>`,
        `<string>${escapeForXml(appData[key])}</string>`,
      ]),
      "</dict>",
    ];
  } else {
    // Frontmost app: empty dict
    return ["<dict/>"];
  }
}

/**
 * Gets the default expressions for MoveAndResize presets.
 * Returns [horizontal, vertical, width, height] expressions.
 */
export function getMoveAndResizeDefaults(
  preset: MoveAndResizePreset,
): [string, string, string, string] {
  switch (preset) {
    case "Custom":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)",
        "SCREENVISIBLE(Main,Height)",
      ];
    case "FullScreen":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)",
        "SCREENVISIBLE(Main,Height)",
      ];
    case "LeftColumn":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)*50%",
        "SCREENVISIBLE(Main,Height)",
      ];
    case "RightColumn":
      return [
        "SCREENVISIBLE(Main,MidX)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)*50%",
        "SCREENVISIBLE(Main,Height)",
      ];
    case "TopHalf":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)",
        "SCREENVISIBLE(Main,Height)*50%",
      ];
    case "BottomHalf":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,MidY)",
        "SCREENVISIBLE(Main,Width)",
        "SCREENVISIBLE(Main,Height)*50%",
      ];
    case "TopLeft":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)*50%",
        "SCREENVISIBLE(Main,Height)*50%",
      ];
    case "TopRight":
      return [
        "SCREENVISIBLE(Main,MidX)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)*50%",
        "SCREENVISIBLE(Main,Height)*50%",
      ];
    case "BottomLeft":
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,MidY)",
        "SCREENVISIBLE(Main,Width)*50%",
        "SCREENVISIBLE(Main,Height)*50%",
      ];
    case "BottomRight":
      return [
        "SCREENVISIBLE(Main,MidX)",
        "SCREENVISIBLE(Main,MidY)",
        "SCREENVISIBLE(Main,Width)*50%",
        "SCREENVISIBLE(Main,Height)*50%",
      ];
    default:
      return [
        "SCREENVISIBLE(Main,Left)",
        "SCREENVISIBLE(Main,Top)",
        "SCREENVISIBLE(Main,Width)",
        "SCREENVISIBLE(Main,Height)",
      ];
  }
}
