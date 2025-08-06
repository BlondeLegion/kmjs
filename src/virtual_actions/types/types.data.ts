//FILE: src/virtual_actions/types/data.ts

import type {
  TextualConditionOperator,
  StringConditionOperator,
} from "./types.conditions";

/**
 * Condition for evaluating the result of a previous action.
 * - ConditionType: "ActionResult"
 * - ActionResultConditionType: "IsOK", "IsNotOK", or a string operator
 * - ActionResultText: Optional text for comparison
 */
export interface ActionResultCondition {
  ConditionType: "ActionResult";
  ActionResultConditionType: "IsOK" | "IsNotOK" | StringConditionOperator; // not TextualConditionOperator
  ActionResultText?: string;
}

/**
 * Condition for evaluating a calculation expression.
 * - ConditionType: "Calculation"
 * - Text: The calculation expression to evaluate
 */
export interface CalculationCondition {
  ConditionType: "Calculation";
  Text: string;
}

/**
 * Condition for evaluating the contents of the clipboard.
 * - ConditionType: "Clipboard"
 * - ClipboardConditionType: Type of clipboard check (text, image, conforms, etc)
 * - ClipboardText: Optional text for comparison
 * - ClipboardSourceUseTriggerClipboard: Use the trigger clipboard if true
 */
export interface ClipboardCondition {
  ConditionType: "Clipboard";
  ClipboardConditionType:
    | "HasText"
    | "DoesNotHaveText"
    | "HasImage"
    | "DoesNotHaveImage"
    | "ConformsTo"
    | "DoesNotConformTo"
    | TextualConditionOperator;
  ClipboardText?: string;
  ClipboardSourceUseTriggerClipboard?: boolean;
}

/**
 * Condition for evaluating an environment variable.
 * - ConditionType: "EnvironmentVariable"
 * - EnvironmentVariable: Name of the environment variable
 * - EnvironmentVariableConditionType: Existence or comparison operator
 * - EnvironmentVariableText: Optional text for comparison
 */
export interface EnvironmentVariableCondition {
  ConditionType: "EnvironmentVariable";
  EnvironmentVariable: string;
  EnvironmentVariableConditionType:
    | "Exists"
    | "DoesNotExist"
    | TextualConditionOperator;
  EnvironmentVariableText?: string;
}

/**
 * Condition for evaluating a text value.
 * - ConditionType: "Text"
 * - Text: The text to evaluate
 * - TextConditionType: Operator for comparison
 * - TextValue: Value to compare against
 */
export interface TextCondition {
  ConditionType: "Text";
  Text: string;
  TextConditionType: TextualConditionOperator;
  TextValue: string;
}

/**
 * Condition for evaluating a variable value.
 * - ConditionType: "Variable"
 * - Variable: Name of the variable
 * - VariableConditionType: Operator for comparison
 * - VariableValue: Value to compare against
 */
export interface VariableCondition {
  ConditionType: "Variable";
  Variable: string;
  VariableConditionType: TextualConditionOperator;
  VariableValue: string;
}

/**
 * Shared text processing flags used by actions that expose the
 * “Process Text …” popup (e.g. Switch/Case, Search/Replace, etc).
 *
 * *Omitting* the key = “Process Text Normally”.
 * - "Nothing": Process Nothing
 * - "TextTokensOnly": Process Text Tokens Only
 */
/**
 * Unified text processing mode used by actions that support text processing.
 * - undefined: Process Text Normally (no XML key)
 * - "TextTokensOnly": Process Text Tokens Only
 * - "Nothing": Process Nothing
 */
export type ProcessingMode = undefined | "TextTokensOnly" | "Nothing";

/**
 * Where modes for Set Variable action.
 * - undefined: Set Variable (no XML key)
 * - "Prepend": Prepend to variable
 * - "Append": Append to variable
 */
export type SetVariableWhere = undefined | "Prepend" | "Append";

/**
 * Scope for Set Variable action.
 * - "global": (default) Global variable (no prefix)
 * - "local": Local variable (prepends "LOCAL" to variable name)
 * - "instance": Instance variable (prepends "INSTANCE" to variable name)
 */
export type SetVariableScope = "global" | "local" | "instance";

/**
 * Type for a Named Clipboard destination.
 * - name: The display name of the clipboard
 * - uid: Optional unique identifier (not required for virtual actions/macros)
 */
export interface NamedClipboardDestination {
  name: string;
  uid?: string;
}

/**
 * Type for all supported clipboard destinations in KM actions.
 * - undefined: SystemClipboard (default, no XML key)
 * - "TriggerClipboard": sets DestinationUseTriggerClipboard
 * - NamedClipboardDestination: sets DestinationNamedClipboardRedundantDisplayName, DestinationUseNamedClipboard, and optionally UID
 */
export type ClipboardDestination =
  | undefined
  | "TriggerClipboard"
  | NamedClipboardDestination;
