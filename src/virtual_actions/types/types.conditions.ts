//FILE: src/virtual_actions/types.conditions.ts

import type { ModifiersCondition, MouseButtonCondition } from "./types.input";
import type {
  ActionResultCondition,
  CalculationCondition,
  ClipboardCondition,
  EnvironmentVariableCondition,
  TextCondition,
  VariableCondition,
} from "./types.data";
import type { ButtonCondition, MenuCondition } from "./types.ui";
import type {
  ApplicationCondition,
  WirelessNetworkCondition,
  KeyCondition,
  LocationCondition,
  MountedVolumeCondition,
  USBDeviceCondition,
  MacroCondition,
  TypedStringCondition,
} from "./types.system";
import type {
  FileAttributeCondition,
  FoundImageCondition,
  OCRCondition,
  PathCondition,
  PixelCondition,
  ScriptCondition,
} from "./types.scripting";
import type { FrontWindowCondition, AnyWindowCondition } from "./types.ui";

/**
 * A union type representing any possible Keyboard Maestro condition.
 * This type is used to describe the full set of conditions that can be evaluated
 * in If/Then/Else, Switch/Case, and other conditional actions.
 */
export type KMCondition =
  | ActionResultCondition
  | ApplicationCondition
  | ButtonCondition
  | CalculationCondition
  | ClipboardCondition
  | EnvironmentVariableCondition
  | FileAttributeCondition
  | FoundImageCondition
  | KeyCondition
  | LocationCondition
  | MacroCondition
  | MenuCondition
  | ModifiersCondition
  | MountedVolumeCondition
  | MouseButtonCondition
  | OCRCondition
  | PathCondition
  | PixelCondition
  | ScriptCondition
  | TextCondition
  | TypedStringCondition
  | USBDeviceCondition
  | VariableCondition
  | AnyWindowCondition
  | FrontWindowCondition
  | WirelessNetworkCondition;

/**
 * Common comparison operators for string-based conditions.
 * Used in Variable, Text, Clipboard, Environment Variable, etc.
 * - "IsEmpty": True if the value is empty
 * - "IsNotEmpty": True if the value is not empty
 * - "Is": Exact match
 * - "IsNot": Not an exact match
 * - "Contains": Substring match
 * - "DoesNotContain": Substring does not match
 * - "StartsWith": Value starts with string
 * - "EndsWith": Value ends with string
 * - "IsBefore": Lexicographical comparison (before)
 * - "IsAfter": Lexicographical comparison (after)
 * - "Matches": Regular expression match
 * - "DoesNotMatch": Regular expression does not match
 */
export type StringConditionOperator =
  | "IsEmpty"
  | "IsNotEmpty"
  | "Is"
  | "IsNot"
  | "Contains"
  | "DoesNotContain"
  | "StartsWith"
  | "EndsWith"
  | "IsBefore" // Lexicographical comparison
  | "IsAfter" // Lexicographical comparison
  | "Matches" // Regex
  | "DoesNotMatch"; // Regex

/**
 * Common comparison operators for numeric-based conditions.
 * Used in Variable, Text, Clipboard, File Attribute, etc.
 * - "LessThan": Value is less than
 * - "LessThanOrEqual": Value is less than or equal
 * - "Equal": Value is equal
 * - "GreaterThanOrEqual": Value is greater than or equal
 * - "GreaterThan": Value is greater than
 * - "NotEqual": Value is not equal
 */
export type NumericConditionOperator =
  | "LessThan"
  | "LessThanOrEqual"
  | "Equal"
  | "GreaterThanOrEqual"
  | "GreaterThan"
  | "NotEqual";

/**
 * Represents the full set of comparison operators applicable
 * to text-based fields that can also be interpreted numerically.
 * This is a union of string and numeric operators.
 */
export type TextualConditionOperator =
  | StringConditionOperator
  | NumericConditionOperator;

/**
 * Common conditions for checking the existence of an item.
 * - "Exists": The item exists
 * - "DoesNotExist": The item does not exist
 */
export type ExistenceCondition = "Exists" | "DoesNotExist";

/**
 * Conditions for checking if an item is enabled.
 * - "IsEnabled": The item is enabled
 * - "IsNotEnabled": The item is not enabled
 * - "ExistsButIsNotEnabled": The item exists but is not enabled
 */
export type EnabledCondition =
  | "IsEnabled"
  | "IsNotEnabled"
  | "ExistsButIsNotEnabled";

/**
 * Conditions for checking the marked/checked state of a UI element.
 * - "IsMarked": The item is marked/checked
 * - "IsNotMarked": The item is not marked/checked
 * - "ExistsButIsNotMarked": The item exists but is not marked/checked
 */
export type MarkedCondition =
  | "IsMarked"
  | "IsNotMarked"
  | "ExistsButIsNotMarked";

/**
 * Conditions for checking the on/off/mixed state of a UI element (like a checkbox).
 * - "IsOn": The item is on
 * - "IsOff": The item is off
 * - "IsMixed": The item is in a mixed state
 */
export type OnOffMixedStateCondition = "IsOn" | "IsOff" | "IsMixed";
