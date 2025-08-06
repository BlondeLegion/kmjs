//FILE: src/virtual_actions/kmjs.virtualAction.notification.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import { createVirtualPlaySound } from "./kmjs.virtualAction.playSound";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import {
  resolveTokenPreset,
  type TokenPresetMode,
} from "../utils/template.xml.token";
import type { VirtualAction } from "./types";
import chalk from "chalk";

/**
 * Options for building a Notification action.
 */
export interface NotificationOptions {
  title: string;
  subtitle?: string;
  body: string;
  /**
   * Either a built‑in KP sound name, or a full path to a custom file.
   */
  sound?: string;

  /**
   * Token preset for title. Any token key from KM_TOKENS for IntelliSense-supported token insertion.
   * When provided, overrides the title parameter.
   */
  titleTokenPreset?: TokenPresetMode;

  /**
   * Token preset for subtitle. Any token key from KM_TOKENS for IntelliSense-supported token insertion.
   * When provided, overrides the subtitle parameter.
   */
  subtitleTokenPreset?: TokenPresetMode;

  /**
   * Token preset for body. Any token key from KM_TOKENS for IntelliSense-supported token insertion.
   * When provided, overrides the body parameter.
   */
  bodyTokenPreset?: TokenPresetMode;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Notification.
 * @param opts - NotificationOptions with title, body, subtitle, and optional sound.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic usage
 * createVirtualNotification({ title: "Alert", body: "Something happened" })
 *
 * @example
 * // Token presets
 * createVirtualNotification({
 *   title: "",
 *   titleTokenPreset: "FrontApplicationName",
 *   body: "",
 *   bodyTokenPreset: "CurrentMouseLocation"
 * })
 */
export function createVirtualNotification(
  opts: NotificationOptions,
): VirtualAction {
  console.log(
    chalk.cyan(`[VirtualAction] Notification:`),
    chalk.grey(JSON.stringify(opts)),
  );
  const {
    title,
    subtitle = "",
    body,
    sound = "",
    titleTokenPreset,
    subtitleTokenPreset,
    bodyTokenPreset,
  } = opts;

  // Resolve token presets
  const finalTitle = resolveTokenPreset(title, titleTokenPreset);
  const finalSubtitle = resolveTokenPreset(subtitle, subtitleTokenPreset);
  const finalBody = resolveTokenPreset(body, bodyTokenPreset);

  // Detect custom file path if it contains a slash
  const isCustomPath = sound.includes("/");

  // Build notification XML (no SoundName if using custom path)
  const xmlLines = [
    `\t<dict>`,
    ...generateActionUIDXml(),
    `\t\t<key>MacroActionType</key>`,
    `\t\t<string>Notification</string>`,
    `\t\t<key>SoundName</key>`,
    isCustomPath
      ? `\t\t<string></string>`
      : `\t\t<string>${escapeForXml(sound)}</string>`,
    `\t\t<key>Subtitle</key>`,
    `\t\t<string>${escapeForXml(finalSubtitle)}</string>`,
    `\t\t<key>Text</key>`,
    `\t\t<string>${escapeForXml(finalBody)}</string>`,
    `\t\t<key>Title</key>`,
    `\t\t<string>${escapeForXml(finalTitle)}</string>`,
    `\t</dict>`,
  ].join("\n");

  // If custom path, append a PlaySound action
  if (isCustomPath) {
    const playAction = createVirtualPlaySound({ path: sound });
    const combined = [xmlLines, playAction.toXml().trim()].join("\n");
    return { toXml: () => formatXmlAction(combined) };
  }

  // Default built‑in notification sound
  return { toXml: () => formatXmlAction(xmlLines) };
}
