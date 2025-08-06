//FILE: src/virtual_actions/kmjs.virtualAction.file.ts

import type { VirtualAction } from "./types";
import type { FileOperation } from "./types/types.file";
import type { NotifyOnFailure, StopOnFailure } from "./types/types.system";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import { formatXmlAction, escapeForXml } from "../utils/utils.xml";

/**
 * Options for the File virtual action.
 *
 * All file paths must be absolute or valid KM path tokens. For operations that write or delete, double-check the path.
 *
 * @property operation - The file operation to perform (see FileOperation).
 * @property source - The source file or directory path (required for all operations).
 * @property destination - The destination file or directory path (required for two-string operations: Move, Rename, Move or Rename, Copy, Create Unique).
 * @property outputPath - Output path for Create Unique (always present, even if empty).
 * @property stopOnFailure - If true, abort macro on failure (default false).
 * @property notifyOnFailure - If false, do not notify on failure (default true).
 */
export interface FileActionOptions {
  /** The file operation to perform (canonical XML value). */
  operation: FileOperation;
  /** Source file or directory path. Optional, defaults to empty string. */
  source?: string;
  /**
   * Destination file or directory path. Required for two-string operations:
   *   - CreateUnique
   *   - OnlyMove
   *   - OnlyRename
   *   - Move
   *   - Copy
   * For one-string operations, this should be omitted or empty.
   */
  destination?: string;
  /** Output path for CreateUnique (always present, even if empty). */
  outputPath?: string;
  /** If true, abort macro on failure (default false). */
  stopOnFailure?: StopOnFailure;
  /** If false, do not notify on failure (default true). */
  notifyOnFailure?: NotifyOnFailure;
}

/**
 * Creates a virtual File action for Keyboard Maestro.
 *
 * @param opts - FileActionOptions
 * @returns VirtualAction
 *
 * The UID is auto-generated. MacroActionType is always "File".
 *
 * Example XML output: (see canonical examples)
 */
export function createVirtualFile(opts: FileActionOptions): VirtualAction {
  const {
    operation,
    source = "",
    destination = "",
    outputPath,
    stopOnFailure,
    notifyOnFailure,
  } = opts;

  // Operations that require only one string (destination must be empty)
  const singleStringOps = [
    "Reveal",
    "Duplicate",
    "Trash",
    "Delete",
    "RecursiveDelete",
  ];
  const destValue = singleStringOps.includes(operation)
    ? ""
    : destination || "";

  // Only include OutputPath for CreateUnique, always present (even if empty)
  const includeOutputPath = operation === "CreateUnique";
  const outputPathValue = includeOutputPath ? (outputPath ?? "") : undefined;

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml().map((line) => `\t\t${line}`),
    "\t\t<key>Destination</key>",
    `\t\t<string>${escapeForXml(destValue)}</string>`,
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>File</string>",
    notifyOnFailure === false
      ? `\t\t<key>NotifyOnFailure</key>\n\t\t<false/>`
      : undefined,
    "\t\t<key>Operation</key>",
    `\t\t<string>${escapeForXml(operation)}</string>`,
    includeOutputPath
      ? `\t\t<key>OutputPath</key>\n\t\t<string>${escapeForXml(outputPathValue!)}</string>`
      : undefined,
    "\t\t<key>Source</key>",
    `\t\t<string>${escapeForXml(source)}</string>`,
    stopOnFailure === true
      ? `\t\t<key>StopOnFailure</key>\n\t\t<true/>`
      : undefined,
    "\t</dict>",
  ].filter(Boolean);

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
