//FILE: src/virtual_actions/kmjs.virtualAction.quit.ts

import { formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import { generateApplicationXml } from "../utils/template.xml.application";
import type { VirtualAction } from "./types";
import type { SpecificAppOptions, ApplicationTarget } from "./types/types.ui";

/**
 * Variants for quitting applications.
 */
export type QuitVariant = /** Gracefully quit without relaunch */ "Quit";
/** Quit then immediately relaunch */ ("QuitRelaunch");
/** Force quit without relaunch */ ("ForceQuit");
/** Force quit then relaunch */ ("ForceQuitRelaunch");

/**
 * Options for building a Quit action.
 */
export interface QuitOptions {
  /**
   * Which variant of quit to perform.
   * @default "Quit"
   */
  variant?: QuitVariant;
  /**
   * Whether to target the frontmost app or a specific one.
   * @default "Front"
   */
  target?: ApplicationTarget;
  /**
   * If targeting a specific app, provide identification and relaunch options.
   */
  specific?: SpecificAppOptions;
  /**
   * Whether timeout aborts the macro.
   * @default true
   */
  timeoutAborts?: boolean;
}

/**
 * Constructs a VirtualAction that quits or (optionally) relaunches applications.
 */
export function createVirtualQuit(opts: QuitOptions = {}): VirtualAction {
  const {
    variant = "Quit",
    target = "Front",
    specific = {},
    timeoutAborts = true,
  } = opts;

  // Build the <dict> for the Application key with canonical ordering
  const appLines = generateApplicationXml(target, specific);

  // Assemble the full XML fragment
  const xmlLines = [
    "\t<dict>",
    // KM ordering for QuitSpecificApp puts Action BEFORE ActionUID.
    "\t\t<key>Action</key>",
    `\t\t<string>${variant}</string>`,
    ...generateActionUIDXml(),
    "\t\t<key>Application</key>",
    ...appLines.map((line) => `\t\t${line}`),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>QuitSpecificApp</string>",
    "\t\t<key>Target</key>",
    `\t\t<string>${target}</string>`,
    "\t\t<key>TimeOutAbortsMacro</key>",
    timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
