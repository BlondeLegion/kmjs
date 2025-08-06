//FILE: src/virtual_actions/kmjs.virtualAction.open.ts

import { formatXmlAction, escapeForXml } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import { generateApplicationXml } from "../utils/template.xml.application";
import type { VirtualAction } from "./types";
import type { SpecificAppOptions, ApplicationTarget } from "./types/types.ui";

/**
 * Options for the Open action.
 */
export interface OpenActionOptions {
  /** The path or string to open (file, folder, or URL). */
  path: string;
  /** Whether to target the frontmost app or a specific one. @default "Front" */
  target?: ApplicationTarget;
  /** If targeting a specific app, provide identification options. */
  specific?: SpecificAppOptions;
  /** Whether failure aborts the macro. @default true */
  stopOnFailure?: boolean;
  /** Whether to notify on failure. @default true */
  notifyOnFailure?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Open action.
 *
 * @param opts - OpenActionOptions for configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualOpen({ path: "/Applications/Safari.app" })
 */
export function createVirtualOpen(opts: OpenActionOptions): VirtualAction {
  const {
    path,
    target = "Front",
    specific = {},
    stopOnFailure = true,
    notifyOnFailure = true,
  } = opts;

  const isDefaultApp =
    target === "Front" || !specific || Object.keys(specific).length === 0;
  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    // Only include Application if not default
    ...(!isDefaultApp
      ? [
          "\t\t<key>Application</key>",
          ...generateApplicationXml(target, specific).map(
            (line) => `\t\t${line}`,
          ),
        ]
      : []),
    "\t\t<key>IsDefaultApplication</key>",
    isDefaultApp ? "\t\t<true/>" : "\t\t<false/>",
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>Open1File</string>",
    // Only include NotifyOnFailure if false
    ...(notifyOnFailure === false ? renderNotifyOnFailureXml(false) : []),
    "\t\t<key>Path</key>",
    `\t\t<string>${escapeForXml(path)}</string>`,
    // Only include StopOnFailure if false
    ...(stopOnFailure === false ? renderStopOnFailureXml(false) : []),
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
