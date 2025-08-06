//FILE: src/virtual_actions/kmjs.virtualAction.typeKeystroke.ts

import chalk from "chalk";
import { formatXmlAction } from "../utils/utils.xml";
import { normalizeAppleScriptShortcut } from "../utils/utils.keystroke";
import type { VirtualAction } from "./types";
import {
  createVirtualPause,
  type PauseOptions,
} from "./kmjs.virtualAction.pause";
import { generateActionUIDXml } from "../utils/template.xml.generic";

/**
 * Options for building a TypeKeystroke action.
 */
export interface TypeKeystrokeOptions {
  /** Keystroke to simulate. Can be a shortcut string, mask→key map, or keycode number. */
  keystroke: string | Record<number, number> | number;
  /** Whether to hold the key down. Defaults to false. */
  pressAndHold?: boolean;
  /** Whether to press and repeat. Defaults to false. */
  pressAndRepeat?: boolean;
  /** Duration to hold key in seconds. Implies pressAndHold=true. */
  holdTime?: number;
}

/**
 * Constructs a VirtualAction for simulating keystrokes in Keyboard Maestro.
 */
export function createVirtualTypeKeystroke(
  opts: TypeKeystrokeOptions,
): VirtualAction {
  console.log(
    chalk.cyan("[VirtualAction] TypeKeystroke:"),
    chalk.grey(JSON.stringify(opts)),
  );

  const {
    keystroke,
    pressAndHold = false,
    pressAndRepeat = false,
    holdTime,
  } = opts;

  // Validate incompatible options
  if (pressAndRepeat && (pressAndHold || holdTime !== undefined)) {
    throw new Error(
      "pressAndRepeat cannot be combined with pressAndHold or holdTime",
    );
  }

  // Determine if we should use hold flow
  const useHold = holdTime !== undefined ? true : pressAndHold;

  // Normalize the keystroke into an AppleScript mask→key map
  const shortcutMap = normalizeAppleScriptShortcut(keystroke as any);
  const [[modifiers, keyCode]] = Object.entries(shortcutMap).map(
    ([mask, key]) => [Number(mask), key] as const,
  );

  // Validate that we have a valid key code (not null for modifier-only)
  if (keyCode === null) {
    throw new Error(
      `TypeKeystroke action requires a key, but received modifier-only keystroke: ${JSON.stringify(keystroke)}. ` +
        `Modifier-only keystrokes (like "Cmd" or "Shift") cannot be used with typeKeystroke actions.`,
    );
  }

  // Helper to build a simulate keystroke action dict
  const buildSimulate = (
    pressType?: "PressAndHold" | "PressAndRepeat" | "Release",
  ): VirtualAction => {
    const xmlLines = [
      `\t<dict>`,
      ...generateActionUIDXml(),
      `\t\t<key>KeyCode</key>`,
      `\t\t<integer>${keyCode}</integer>`,
      `\t\t<key>MacroActionType</key>`,
      `\t\t<string>SimulateKeystroke</string>`,
      `\t\t<key>Modifiers</key>`,
      `\t\t<integer>${modifiers}</integer>`,
      pressType ? `\t\t<key>Press</key>` : ``,
      pressType ? `\t\t<string>${pressType}</string>` : ``,
      `\t\t<key>ReleaseAll</key>`,
      `\t\t<false/>`,
      `\t\t<key>TargetApplication</key>`,
      `\t\t<dict/>`,
      `\t\t<key>TargetingType</key>`,
      `\t\t<string>Front</string>`,
      `\t</dict>`,
    ]
      .filter(Boolean)
      .join("\n");
    return { toXml: () => formatXmlAction(xmlLines) };
  };

  // Flow 3: press and hold (with optional pause)
  if (useHold) {
    const pressAction = buildSimulate("PressAndHold");
    const pauseOpts: PauseOptions =
      holdTime !== undefined ? { time: holdTime } : {};
    const pauseAction = createVirtualPause(pauseOpts);
    const releaseAction = buildSimulate("Release");
    const fragments: VirtualAction[] = [
      pressAction,
      pauseAction,
      releaseAction,
    ];

    return { toXml: () => fragments.map((a) => a.toXml().trim()).join("\n") };
  }

  // Flow 2: press and repeat
  if (pressAndRepeat) {
    return buildSimulate("PressAndRepeat");
  }

  // Flow 1: default single keystroke
  return buildSimulate();
}
