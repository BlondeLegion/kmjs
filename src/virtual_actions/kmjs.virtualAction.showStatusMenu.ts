//FILE: src/virtual_actions/kmjs.virtualAction.showStatusMenu.ts

import { formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
/**
 * Options for the ShowStatusMenu virtual action.
 * This action currently takes no parameters, but the interface is provided for future extensibility.
 */
export interface ShowStatusMenuOptions {}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro ShowStatusMenu action.
 * This action displays the Keyboard Maestro status menu. It takes no parameters.
 *
 * @param opts - ShowStatusMenuOptions (currently unused, for future extensibility)
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualShowStatusMenu()
 */
export function createVirtualShowStatusMenu(
  opts: ShowStatusMenuOptions = {},
): VirtualAction {
  // The only non-default key is IsDisclosed, which is always false in ground truth.
  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>IsDisclosed</key>",
    "\t\t<false/>", // Unknown what this does, but it's always false in ground truth, and cannot be configured in the KM UI.
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>SystemAction</string>",
    "\t\t<key>SystemAction</key>",
    "\t\t<string>ShowStatusMenu</string>",
    "\t</dict>",
  ];
  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
