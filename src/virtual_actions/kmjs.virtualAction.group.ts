//FILE: src/virtual_actions/kmjs.virtualAction.group.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderTimeoutXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
import chalk from "chalk";

/**
 * Options for building a Group action.
 */
export interface GroupOptions {
  /**
   * Name of the group (displayed in Keyboard Maestro editor).
   */
  name: string;

  /**
   * Array of virtual actions that belong to this group.
   */
  actions: VirtualAction[];

  /**
   * Whether the macro should abort if the group times out.
   * @default true
   */
  timeOutAbortsMacro?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Group action.
 *
 * Groups are organizational containers that can hold multiple actions and provide
 * visual structure in the Keyboard Maestro editor. They can have names, colors,
 * and timeout behavior.
 *
 * @param opts - GroupOptions with name, actions array, and optional styling
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * // Basic group with actions
 * createVirtualGroup({
 *   name: "Setup Variables",
 *   actions: [
 *     createVirtualSetVariable({ variable: "Width", text: "1920" }),
 *     createVirtualSetVariable({ variable: "Height", text: "1080" })
 *   ]
 * })
 *
 * @example
 * // Colored group with timeout settings
 * createVirtualGroup({
 *   name: "Window Management",
 *   color: "Blue",
 *   timeOutAbortsMacro: false,
 *   actions: [
 *     createVirtualManipulateWindow({ manipulation: "Center" }),
 *     createVirtualPause({ time: 0.5 })
 *   ]
 * })
 */
export function createVirtualGroup(opts: GroupOptions): VirtualAction {
  console.log(
    chalk.cyan(`[VirtualAction] Group:`),
    chalk.grey(
      JSON.stringify({ name: opts.name, actionCount: opts.actions.length }),
    ),
  );

  const { name, actions, timeOutAbortsMacro = true } = opts;

  // Generate XML for all sub-actions
  const actionsXml = actions.map((action) => action.toXml()).join("\n");

  // Build the group XML structure
  const xmlLines = [
    "\t<dict>",
    "\t\t<key>ActionName</key>",
    `\t\t<string>${escapeForXml(name)}</string>`,
    ...generateActionUIDXml(),
    "\t\t<key>Actions</key>",
    "\t\t<array>",
    // Indent the sub-actions properly (they already have their own indentation)
    ...actionsXml.split("\n").map((line) => (line ? "\t\t" + line : line)),
    "\t\t</array>",
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>Group</string>",
    ...renderTimeoutXml({ timeoutAborts: timeOutAbortsMacro }),
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
