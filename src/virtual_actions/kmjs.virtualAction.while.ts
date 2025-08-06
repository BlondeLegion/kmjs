//FILE: src/virtual_actions/kmjs.virtualAction.while.ts

import { conditionToXml } from "../utils/template.xml.condition";
import { formatXmlAction } from "../utils/utils.xml";
import type { VirtualAction } from "./types";
import type { ConditionListMatch } from "./types/types.system";
import type { KMCondition } from "./types/types.conditions";

/**
 * Represents the top-level structure for a While action.
 * @property conditions - An array of condition objects to evaluate.
 * @property match - How to evaluate the list of conditions (e.g., all must be true).
 * @property actions - An array of VirtualActions to execute while the conditions are met.
 * @property timeoutAborts - Whether a timeout in a nested action should abort the whole macro.
 * @property notifyOnTimeout - Whether to notify when a timeout occurs.
 */
export interface WhileOptions {
  conditions: KMCondition[];
  match?: ConditionListMatch;
  actions: VirtualAction[];
  timeoutAborts?: boolean;
  notifyOnTimeout?: boolean;
}

/**
 * Creates a virtual "While" action for Keyboard Maestro.
 * This action repeatedly executes a set of actions while the specified conditions remain true.
 *
 * @param opts - The configuration for the While loop.
 * @returns A VirtualAction object that can be executed in a macro.
 *
 * @example
 * // While a specific image is found on screen, click it
 * createVirtualWhile({
 *   match: 'All',
 *   conditions: [
 *     {
 *       ConditionType: 'ScreenImage',
 *       ScreenImageConditionType: 'Contains',
 *       ScreenArea: { type: 'ScreenAll' },
 *       Fuzz: 15
 *     }
 *   ],
 *   actions: [
 *     createVirtualClickAtFoundImage({
 *       image: { source: 'File', path: '/path/to/image.png' },
 *       screenArea: { type: 'ScreenAll' }
 *     })
 *   ]
 * });
 */
export function createVirtualWhile(opts: WhileOptions): VirtualAction {
  const {
    conditions,
    match = "All",
    actions,
    timeoutAborts = true,
    notifyOnTimeout,
  } = opts;

  // Generate XML for nested actions
  const actionsXml = actions.map((a) => a.toXml()).join("\n");

  // Generate XML for conditions array
  const conditionsArray =
    conditions.length > 0
      ? conditions
          .map(conditionToXml)
          .map((xml) =>
            xml
              .split("\n")
              .map((line) => "\t\t\t" + line)
              .join("\n"),
          )
          .join("\n")
      : "";

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>ActionUID</key>",
    `\t\t<integer>${Math.floor(Date.now() / 1000)}</integer>`,
    "\t\t<key>Actions</key>",
    actionsXml ? "\t\t<array>" : "\t\t<array/>",
    ...(actionsXml
      ? [
          actionsXml
            .split("\n")
            .map((line) => "\t\t\t" + line)
            .join("\n"),
          "\t\t</array>",
        ]
      : []),
    "\t\t<key>Conditions</key>",
    "\t\t<dict>",
    "\t\t\t<key>ConditionList</key>",
    conditionsArray ? "\t\t\t<array>" : "\t\t\t<array/>",
    ...(conditionsArray ? [conditionsArray, "\t\t\t</array>"] : []),
    "\t\t\t<key>ConditionListMatch</key>",
    `\t\t\t<string>${match}</string>`,
    "\t\t</dict>",
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>While</string>",
    ...(notifyOnTimeout !== undefined
      ? [
          "\t\t<key>NotifyOnTimeOut</key>",
          `\t\t${notifyOnTimeout ? "<true/>" : "<false/>"}`,
        ]
      : []),
    "\t\t<key>TimeOutAbortsMacro</key>",
    `\t\t${timeoutAborts ? "<true/>" : "<false/>"}`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
