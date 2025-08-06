//FILE: src/virtual_actions/kmjs.virtualAction.showSpecificApp.ts

import { formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import { generateApplicationXml } from "../utils/template.xml.application";
import type { VirtualAction } from "./types";
import type { SpecificAppOptions, ApplicationTarget } from "./types/types.ui";

/**
 * Options for the ShowSpecificApp virtual action.
 * - target: Always "Specific" (for future extensibility, default is "Specific")
 * - specific: App identification options (name, bundleIdentifier, path, match, newFile)
 */
export interface ShowSpecificAppOptions {
  /** Which application to show (always Specific for this action) */
  target?: ApplicationTarget; // default: "Specific"
  /** App identification options */
  specific: SpecificAppOptions;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro ShowSpecificApp action.
 *
 * @param opts - ShowSpecificAppOptions for app selection
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualShowSpecificApp({ specific: { name: "Finder", bundleIdentifier: "com.apple.finder", path: "/System/Library/CoreServices/Finder.app" } })
 */
export function createVirtualShowSpecificApp(
  opts: ShowSpecificAppOptions,
): VirtualAction {
  const { target = "Specific", specific } = opts;
  const appLines = generateApplicationXml(target, specific);

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>Application</key>",
    ...appLines.map((line) => `\t\t${line}`),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>ShowSpecificApp</string>",
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
