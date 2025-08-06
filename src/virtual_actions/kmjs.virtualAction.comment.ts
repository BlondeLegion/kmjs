//FILE: src/virtual_actions/kmjs.virtualAction.comment.ts

import { formatXmlAction, escapeForXml } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import {
  encodeStyledTextData,
  generateBasicRtf,
} from "../utils/utils.styledText";
import type { VirtualAction } from "./types";

/**
 * Options for the Comment virtual action.
 */
export interface CommentOptions {
  /** The title for the comment (shown in the KM editor). */
  title: string;
  /** The comment text (will be encoded as styled text). */
  text: string;
  /** Optional RTF string for styled text. If not provided, a basic RTF is generated from text. */
  rtfContent?: string;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Comment action.
 *
 * The Comment action displays a styled text comment in the macro editor. The text is always encoded as RTF.
 *
 * @param opts - CommentOptions for title, text, and optional RTF content.
 * @returns A VirtualAction that emits the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualComment({ title: "My Note", text: "This is a comment." })
 *
 * @example
 * createVirtualComment({ title: "Styled", text: "Bold text", rtfContent: "{\\rtf1...}" })
 */
export function createVirtualComment(opts: CommentOptions): VirtualAction {
  const { title, text, rtfContent } = opts;

  // Use provided RTF or generate a basic RTF from plain text
  const rtf = rtfContent || generateBasicRtf(text);
  const styledTextData = encodeStyledTextData(rtf);
  const indentedData = styledTextData
    .split("\n")
    .map((line) => `\t\t${line}`)
    .join("\n");

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>Comment</string>",
    "\t\t<key>StyledText</key>",
    "\t\t<data>",
    indentedData,
    "\t\t</data>",
    "\t\t<key>Title</key>",
    `\t\t<string>${escapeForXml(title)}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
