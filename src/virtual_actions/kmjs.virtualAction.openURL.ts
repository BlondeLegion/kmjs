//FILE: src/virtual_actions/kmjs.virtualAction.openURL.ts

import { formatXmlAction, escapeForXml } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
  renderTimeoutXml,
} from "../utils/template.xml.generic";
import { generateApplicationXml } from "../utils/template.xml.application";
import type { VirtualAction } from "./types";
import type { SpecificAppOptions, ApplicationTarget } from "./types/types.ui";
import type { ProcessingMode } from "./types/types.data";

/**
 * Options for the OpenURL action.
 */
export interface OpenURLActionOptions {
  /** The URL to open. */
  url: string;
  /** Whether to target the frontmost app or a specific one. @default "Front" */
  target?: ApplicationTarget;
  /** If targeting a specific app, provide identification options. */
  specific?: SpecificAppOptions;
  /** Text processing mode for the URL. */
  processingMode?: ProcessingMode;
  /** Open URL in background? @default false */
  openInBackground?: boolean;
  /** Whether failure aborts the macro. @default true */
  stopOnFailure?: boolean;
  /** Whether to notify on failure. @default true */
  notifyOnFailure?: boolean;
  /** Whether timeout aborts the macro. @default true */
  timeoutAborts?: boolean;
  /** Whether to notify on timeout. @default true */
  notifyOnTimeout?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Open URL action.
 *
 * @param opts - OpenURLActionOptions for configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualOpenURL({ url: "https://www.keyboardmaestro.com/" })
 */
export function createVirtualOpenURL(
  opts: OpenURLActionOptions,
): VirtualAction {
  const {
    url,
    target = "Front",
    specific = {},
    processingMode,
    openInBackground = false,
    stopOnFailure = true,
    notifyOnFailure = true,
    timeoutAborts = true,
    notifyOnTimeout = true,
  } = opts;

  const isDefaultApp =
    target === "Front" || !specific || Object.keys(specific).length === 0;

  const timeoutXml = renderTimeoutXml({ notifyOnTimeout, timeoutAborts });
  const notifyOnTimeOutIdx = timeoutXml.findIndex((line) =>
    line.includes("NotifyOnTimeOut"),
  );
  const notifyOnTimeOutXml =
    notifyOnTimeOutIdx !== -1
      ? timeoutXml.slice(notifyOnTimeOutIdx, notifyOnTimeOutIdx + 2)
      : [];
  // TimeOutAbortsMacro is always present and is always the last two lines of timeoutXml
  const timeOutAbortsMacroXml = timeoutXml.slice(-2);

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
    "\t\t<string>OpenURL</string>",
    // Only include NotifyOnFailure if false
    ...(notifyOnFailure === false ? renderNotifyOnFailureXml(false) : []),
    // Only include NotifyOnTimeOut if present
    ...notifyOnTimeOutXml,
    // OpenInBackground (if present)
    ...(openInBackground
      ? ["\t\t<key>OpenInBackground</key>", "\t\t<true/>"]
      : []),
    // Processing mode (if present)
    ...(processingMode
      ? [
          "\t\t<key>ProcessingMode</key>",
          `\t\t<string>${processingMode}</string>`,
        ]
      : []),
    // Only include StopOnFailure if false
    ...(stopOnFailure === false ? renderStopOnFailureXml(false) : []),
    // Always include TimeOutAbortsMacro
    ...timeOutAbortsMacroXml,
    // URL
    "\t\t<key>URL</key>",
    `\t\t<string>${escapeForXml(url)}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
