//FILE: src/virtual_actions/kmjs.virtualAction.playSound.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
import type { KMSound } from "./types/types.system";
import chalk from "chalk";

/**
 * Options for building a PlaySound action.
 */
export interface PlaySoundOptions {
  /**
   * A built‑in sound name to play (from KMSound).
   * If omitted, defaults to "Tink".
   */
  sound?: KMSound;
  /**
   * A full path to a custom sound file.
   * If provided, this path will be used instead of a built‑in sound.
   */
  path?: string;
  /**
   * Whether the sound should play asynchronously.
   * Defaults to true.
   */
  asynchronously?: boolean;
  /**
   * Volume percentage (0–100).
   * Defaults to 75.
   */
  volume?: number;
  /**
   * The output device identifier.
   * Defaults to "SOUNDEFFECTS" (the system default effects device).
   */
  deviceID?: string;
  /**
   * Whether timeout should abort the macro.
   * Defaults to true.
   */
  timeoutAborts?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro PlaySound action.
 *
 * @param opts - PlaySoundOptions to configure sound, path, async behavior, etc.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 */
export function createVirtualPlaySound(
  opts: PlaySoundOptions = {},
): VirtualAction {
  console.log(
    chalk.cyan(`[VirtualAction] PlaySound:`),
    chalk.grey(JSON.stringify(opts)),
  );
  const {
    sound = "Tink",
    path,
    asynchronously = true,
    volume = 75,
    // KM appears to always serialize TimeOutAbortsMacro = true for PlaySound.
    // We accept the option for API symmetry but ignore falsy values to avoid diffs.
    timeoutAborts = true,
  } = opts;

  // Determine output device: custom files should use SOUNDEFFECTS to match KM behavior
  const isCustomPath = typeof path === "string" && path.includes("/");
  const deviceID = "SOUNDEFFECTS";
  const soundPath = isCustomPath
    ? path!
    : `/System/Library/Sounds/${sound}.aiff`;

  // KM ordering observed in retrieved XML:
  // ActionUID, Asynchronously?, DeviceID, MacroActionType, Path, TimeOutAbortsMacro, Volume?
  const volInt = Math.max(0, Math.min(100, Math.round(volume)));
  const includeVolume = volInt !== 100; // KM omits when default (100) — observed in retrieval.
  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    asynchronously ? "\t\t<key>Asynchronously</key>" : "",
    asynchronously ? "\t\t<true/>" : "",
    "\t\t<key>DeviceID</key>",
    `\t\t<string>${deviceID}</string>`,
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>PlaySound</string>",
    "\t\t<key>Path</key>",
    `\t\t<string>${escapeForXml(soundPath)}</string>`,
    // Force TimeOutAbortsMacro true (KM seems to always set)
    "\t\t<key>TimeOutAbortsMacro</key>",
    "\t\t<true/>",
    includeVolume ? "\t\t<key>Volume</key>" : "",
    includeVolume ? `\t\t<integer>${volInt}</integer>` : "",
    "\t</dict>",
  ].filter(Boolean);

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
