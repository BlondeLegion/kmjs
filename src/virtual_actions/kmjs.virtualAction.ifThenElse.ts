//FILE: src/virtual_actions/kmjs.virtualAction.if.ts

import { conditionToXml } from "../utils/template.xml.condition";
import { formatXmlAction } from "../utils/utils.xml";
import type { VirtualAction } from "./types";
import type { ConditionListMatch } from "./types/types.system";
import type { KMCondition } from "./types/types.conditions";
/**
 * Represents the top-level structure for an If/Then/Else action.
 * @property conditions - An array of condition objects to evaluate.
 * @property match - How to evaluate the list of conditions (e.g., all must be true).
 * @property then - An array of VirtualActions to execute if the conditions are met.
 * @property else - An optional array of VirtualActions to execute otherwise.
 * @property timeoutAborts - Whether a timeout in a nested action should abort the whole macro.
 */
export interface IfThenElseOptions {
  conditions: KMCondition[];
  match?: ConditionListMatch;
  then: VirtualAction[];
  else?: VirtualAction[];
  timeoutAborts?: boolean;
}

/**
 * Creates a virtual "If/Then/Else" action for Keyboard Maestro.
 * This is one of the most powerful and complex actions, allowing for conditional logic flows.
 *
 * @param opts - The configuration for the If/Then/Else block.
 * @returns A VirtualAction object that can be executed in a macro.
 *
 * @example
 * // If the front window of Finder is named "Downloads", activate Chrome.
 * createVirtualIf({
 *   match: 'All',
 *   conditions: [
 *     {
 *       ConditionType: 'FrontWindow',
 *       IsFrontApplication: false,
 *       FrontWindowConditionType: 'TitleIs',
 *       FrontWindowTitle: 'Downloads',
 *       Application: {
 *         BundleIdentifier: 'com.apple.finder',
 *         Name: 'Finder'
 *       }
 *     }
 *   ],
 *   then: [
 *     createVirtualActivate({
 *       target: 'Specific',
 *       specific: { BundleIdentifier: 'com.google.Chrome', Name: 'Google Chrome' }
 *     })
 *   ],
 *   else: [
 *     createVirtualNotification({ title: 'Condition Not Met', body: 'The front window was not "Downloads".' })
 *   ]
 * });
 */
export function createVirtualIf(opts: IfThenElseOptions): VirtualAction {
  const {
    conditions,
    match = "All",
    then,
    else: elseActions = [],
    timeoutAborts = true,
  } = opts;

  // Generate XML for nested actions
  const thenXml = then.map((a) => a.toXml()).join("\n");
  const elseXml = elseActions.map((a) => a.toXml()).join("\n");

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
    "\t\t<key>Conditions</key>",
    "\t\t<dict>",
    "\t\t\t<key>ConditionList</key>",
    conditionsArray ? "\t\t\t<array>" : "\t\t\t<array/>",
    ...(conditionsArray ? [conditionsArray, "\t\t\t</array>"] : []),
    "\t\t\t<key>ConditionListMatch</key>",
    `\t\t\t<string>${match}</string>`,
    "\t\t</dict>",
    "\t\t<key>ElseActions</key>",
    elseXml ? "\t\t<array>" : "\t\t<array/>",
    ...(elseXml
      ? [
          elseXml
            .split("\n")
            .map((line) => "\t\t\t" + line)
            .join("\n"),
          "\t\t</array>",
        ]
      : []),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>IfThenElse</string>",
    "\t\t<key>ThenActions</key>",
    thenXml ? "\t\t<array>" : "\t\t<array/>",
    ...(thenXml
      ? [
          thenXml
            .split("\n")
            .map((line) => "\t\t\t" + line)
            .join("\n"),
          "\t\t</array>",
        ]
      : []),
    "\t\t<key>TimeOutAbortsMacro</key>",
    `\t\t${timeoutAborts ? "<true/>" : "<false/>"}`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
