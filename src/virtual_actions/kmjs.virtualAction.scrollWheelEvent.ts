//FILE: src/virtual_actions/kmjs.virtualAction.scrollWheelEvent.ts

import { formatXmlAction } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./index";
import type { ScrollDirection } from "./types/types.input";

/**
 * Options for creating a ScrollWheelEvent virtual action.
 */
export interface ScrollWheelEventOptions {
  /** Amount to scroll (pixels or lines, as string or number) */
  scrollAmount: string | number;
  /** Direction to scroll: Up, Down, Left, Right */
  direction: ScrollDirection;
  /** If true, add <key>StopOnFailure</key><true/> */
  stopOnFailure?: boolean;
  /** If false, add <key>NotifyOnFailure</key><false/> */
  notifyOnFailure?: boolean;
  /** Optionally override ActionUID (for test parity) */
  actionUID?: number;
}

/**
 * Creates a Keyboard Maestro virtual action for ScrollWheelEvent.
 *
 * @param opts - Options for scroll wheel event
 * @returns VirtualAction
 */
export function createVirtualScrollWheelEvent(
  opts: ScrollWheelEventOptions,
): VirtualAction {
  const { scrollAmount, direction, stopOnFailure, notifyOnFailure, actionUID } =
    opts;

  // Use provided UID or let KM assign one
  const actionUIDXml =
    actionUID !== undefined
      ? [`\t<key>ActionUID</key>`, `\t<integer>${actionUID}</integer>`]
      : generateActionUIDXml();

  const xmlLines = [
    "\t<dict>",
    ...actionUIDXml,
    "\t<key>MacroActionType</key>",
    "\t<string>ScrollWheelEvent</string>",
    ...renderNotifyOnFailureXml(notifyOnFailure),
    "\t<key>ScrollAmountExpression</key>",
    `\t<string>${scrollAmount}</string>`,
    "\t<key>ScrollDirection</key>",
    `\t<string>${direction}</string>`,
    ...renderStopOnFailureXml(stopOnFailure),
    "\t</dict>",
  ];

  return {
    toXml: () => formatXmlAction(xmlLines.join("\n")),
  };
}
