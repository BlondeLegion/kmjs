//FILE: src/virtual_actions/kmjs.virtualAction.selectMenuItem.ts

import { formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import { generateApplicationXml } from "../utils/template.xml.application";
import {
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
import type { ApplicationTarget, SpecificAppOptions } from "./types/types.ui";
import type { StopOnFailure, NotifyOnFailure } from "./types/types.system";

/**
 * Options for the selectMenuItem (SelectMenuItem) virtual action.
 * - target: Which application to target (front or specific)
 * - specific: If targeting a specific app, provide identification options
 * - menuPath: The full menu path as an array of strings (e.g. ["File", "Export", "PDF"])
 * - stopOnFailure: If false, failure does not abort macro (default true)
 * - notifyOnFailure: If false, do not notify on failure (default true)
 *
 * NOTE: ApplicationTarget is defined above.
 */
export interface selectMenuOptions {
  /** Application targeting: frontmost or specific app. */
  target?: ApplicationTarget;
  /** If targeting a specific app, provide identification options. */
  specific?: SpecificAppOptions;
  /** The full menu path as an array of strings (e.g. ["File", "Export", "PDF"]). */
  menuPath: string[];
  /** If false, failure does not abort macro (default true). */
  stopOnFailure?: StopOnFailure;
  /** If false, do not notify on failure (default true). */
  notifyOnFailure?: NotifyOnFailure;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro SelectMenuItem action.
 *
 * @param opts - selectMenuOptions for application targeting, menu title/item, and failure options.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualselectMenuItem({
 *   target: "Specific",
 *   specific: { name: "Safari", bundleIdentifier: "com.apple.Safari" },
 *   menuPath: ["Safari", "About Safari"],
 *   stopOnFailure: false,
 *   notifyOnFailure: false,
 * })
 */
export function createVirtualselectMenuItem(
  opts: selectMenuOptions,
): VirtualAction {
  const {
    target = "Front",
    specific = {},
    menuPath,
    stopOnFailure,
    notifyOnFailure,
  } = opts;

  if (!menuPath || !Array.isArray(menuPath) || menuPath.length === 0) {
    throw new Error("menuPath (array of menu/submenu strings) is required");
  }

  // Build the <dict> for the Application key with canonical ordering
  const appLines = generateApplicationXml(target, specific);

  // Build the Menu array (arbitrary depth)
  const menuXml = [
    "\t\t<key>Menu</key>",
    "\t\t<array>",
    ...menuPath.map((s) => `\t\t\t<string>${s ?? ""}</string>`),
    "\t\t</array>",
  ];

  // Only emit StopOnFailure if explicitly false (KM omits when true)
  function renderSelectMenuStopOnFailureXml(stopOnFailure?: boolean): string[] {
    if (stopOnFailure === false) {
      return ["\t\t<key>StopOnFailure</key>", "\t\t<false/>"];
    }
    return [];
  }

  // Assemble the full XML fragment in canonical KM order
  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>SelectMenuItem</string>",
    ...menuXml,
    ...renderNotifyOnFailureXml(notifyOnFailure),
    ...renderSelectMenuStopOnFailureXml(stopOnFailure),
    "\t\t<key>TargetApplication</key>",
    ...appLines.map((line) => `\t\t${line}`),
    "\t\t<key>TargetingType</key>",
    `\t\t<string>${target}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
