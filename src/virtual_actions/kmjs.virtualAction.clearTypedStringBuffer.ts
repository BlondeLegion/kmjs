//FILE: src/virtual_actions/kmjs.virtualAction.clearTypedStringBuffer.ts

import { formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Clear Typed String Buffer action.
 *
 * The Clear Typed String Buffer action simply resets the Typed String buffer — the same thing
 * that happens if you change applications, type Shift-Space, or simply do not press a key for
 * a period of time. This action lets you clear the buffer explicitly if it is necessary for
 * any reason.
 *
 * This action clears the buffer of typed string triggers. It takes no parameters.
 *
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualClearTypedStringBuffer()
 */
export function createVirtualClearTypedStringBuffer(): VirtualAction {
  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>IsDisclosed</key>",
    "\t\t<false/>",
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>SystemAction</string>",
    "\t\t<key>SystemAction</key>",
    "\t\t<string>ClearTypedString</string>",
    "\t</dict>",
  ];
  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
