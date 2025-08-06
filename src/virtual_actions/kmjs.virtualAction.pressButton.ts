//FILE: src/virtual_actions/kmjs.virtualAction.pressButton.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";

/**
 * Button action types for the Press Button action.
 */
export type ButtonActionType =
  | "PressButtonNamed"
  | "ShowMenuOfButtonNamed"
  | "DecrementSliderNamed"
  | "IncrementSliderNamed"
  | "CancelButtonNamed";

/**
 * Options for Press Button action.
 */
export interface PressButtonOptions {
  /** Type of button action to perform. */
  action: ButtonActionType;
  /** Name of the button/slider to interact with. */
  buttonName: string;
  /** Whether to wait for the button to be enabled before pressing. */
  waitForEnabledButton?: boolean;
  /** Whether timeout aborts the macro (only applies when waitForEnabledButton is true). */
  timeoutAborts?: boolean;
  /** Whether to notify on timeout (only applies when waitForEnabledButton is true). */
  notifyOnTimeout?: boolean;
  /** Whether failure aborts the macro. */
  stopOnFailure?: boolean;
  /** Whether to notify on failure. */
  notifyOnFailure?: boolean;
}

/**
 * Maps button action types to their corresponding AXAction values.
 */
const BUTTON_ACTION_TO_AX_ACTION: Record<ButtonActionType, string | undefined> =
  {
    PressButtonNamed: undefined, // No AXAction for basic press
    ShowMenuOfButtonNamed: "AXShowMenu",
    DecrementSliderNamed: "AXDecrement",
    IncrementSliderNamed: "AXIncrement",
    CancelButtonNamed: "AXCancel",
  };

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Press Button action.
 * @param opts - PressButtonOptions for button action type, name, and various timeout/failure settings.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic button press
 * createVirtualPressButton({
 *   action: "PressButtonNamed",
 *   buttonName: "OK"
 * })
 *
 * @example
 * // Show menu with timeout settings
 * createVirtualPressButton({
 *   action: "ShowMenuOfButtonNamed",
 *   buttonName: "Options",
 *   waitForEnabledButton: true,
 *   timeoutAborts: false,
 *   notifyOnTimeout: true
 * })
 */
export function createVirtualPressButton(
  opts: PressButtonOptions,
): VirtualAction {
  const {
    action,
    buttonName,
    waitForEnabledButton = false,
    timeoutAborts = true,
    notifyOnTimeout = true,
    stopOnFailure,
    notifyOnFailure,
  } = opts;

  const axAction = BUTTON_ACTION_TO_AX_ACTION[action];

  const xmlLines = [
    "\t<dict>",
    ...(axAction
      ? ["\t\t<key>AXAction</key>", `\t\t<string>${axAction}</string>`]
      : []),
    ...generateActionUIDXml(),
    "\t\t<key>ButtonName</key>",
    `\t\t<string>${escapeForXml(buttonName)}</string>`,
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>PressButton</string>",
    ...renderNotifyOnFailureXml(notifyOnFailure),
    ...(waitForEnabledButton &&
    ((timeoutAborts === true && notifyOnTimeout === false) ||
      (timeoutAborts === false && notifyOnTimeout === true))
      ? [
          "\t\t<key>NotifyOnTimeOut</key>",
          notifyOnTimeout ? "\t\t<true/>" : "\t\t<false/>",
        ]
      : []),
    ...(stopOnFailure === false
      ? ["\t\t<key>StopOnFailure</key>", "\t\t<false/>"]
      : []),
    ...(waitForEnabledButton
      ? [
          "\t\t<key>TimeOutAbortsMacro</key>",
          timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
        ]
      : []),
    ...(waitForEnabledButton
      ? ["\t\t<key>WaitForEnabledButton</key>", "\t\t<true/>"]
      : []),
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
