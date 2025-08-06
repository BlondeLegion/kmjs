//FILE: src/virtual_actions/kmjs.virtualAction.activate.ts

import chalk from "chalk";
import { formatXmlAction, escapeForXml, kmKeyOrder } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
import type { SpecificAppOptions } from "./types/types.ui";

/**
 * What to do if the app is already frontmost.
 */
export type AlreadyActivatedActionType =
  | "Normal" // leave it at front
  | "SwitchToLast" // switch to last app
  | "BringAllWindows" // bring all app windows forward
  | "Reopen" // reopen initial windows
  | "Hide" // hide app
  | "HideOthers" // hide other apps
  | "Quit"; // quit app

/**
 * Options for ActivateApplication virtual action.
 */
export interface ActivateOptions {
  /** Activate the frontmost app or a specific one. */
  target?: "Front" | "Specific";
  /** If targeting a specific app, supply these selectors. */
  specific?: SpecificAppOptions;
  /** Activate all windows? */
  allWindows?: boolean;
  /** Reopen initial windows? */
  reopenWindows?: boolean;
  /** Behavior if already frontmost. */
  alreadyActivatedAction?: AlreadyActivatedActionType;
  /** Whether timeout aborts the macro. */
  timeoutAborts?: boolean;
}

/**
 * Constructs a VirtualAction for ActivateApplication.
 */
export function createVirtualActivate(
  opts: ActivateOptions = {},
): VirtualAction {
  const {
    target = "Front",
    specific = {},
    allWindows = false,
    reopenWindows = false,
    alreadyActivatedAction = "Normal",
    timeoutAborts = true,
  } = opts;

  console.log(
    chalk.cyan("[VirtualAction] ActivateApplication:"),
    chalk.yellowBright(JSON.stringify(opts)),
  );

  // Build the <Application> dict (or empty)
  let applicationXml: string;
  if (target === "Specific") {
    const { name, bundleIdentifier, path, match, newFile } = specific;
    const appData: Record<string, string> = {};
    if (bundleIdentifier) appData.BundleIdentifier = bundleIdentifier;
    if (match) appData.Match = match;
    if (name) appData.Name = name;
    if (newFile) appData.NewFile = newFile;
    if (path) appData.Path = path;

    const orderedKeys = kmKeyOrder(Object.keys(appData), "application");
    const lines: string[] = ["<dict>"];
    for (const key of orderedKeys) {
      lines.push(`<key>${key}</key>`);
      lines.push(`<string>${escapeForXml(appData[key])}</string>`);
    }
    lines.push("</dict>");
    applicationXml = lines.join("\n");
  } else {
    applicationXml = "<dict/>";
  }

  /**
   * Canonical KM order (including ActionUID — stripped later in test normalisation):
   *  ActionUID
   *  AllWindows
   *  AlreadyActivatedActionType
   *  Application
   *  MacroActionType
   *  ReopenWindows
   *  TimeOutAbortsMacro
   */
  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>AllWindows</key>",
    allWindows ? "\t\t<true/>" : "\t\t<false/>",
    "\t\t<key>AlreadyActivatedActionType</key>",
    `\t\t<string>${alreadyActivatedAction}</string>`,
    "\t\t<key>Application</key>",
    ...applicationXml.split("\n").map((l) => "\t\t" + l),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>ActivateApplication</string>",
    "\t\t<key>ReopenWindows</key>",
    reopenWindows ? "\t\t<true/>" : "\t\t<false/>",
    "\t\t<key>TimeOutAbortsMacro</key>",
    timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
