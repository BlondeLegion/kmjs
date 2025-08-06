//FILE: src/virtual_actions/types/system.ts

import type { SpecificAppOptions } from "./types.ui";
import type { StringConditionOperator } from "./types.conditions";
import type { ApplicationTarget } from "./types.ui";

/**
 * How the list of conditions in an If/Then/Else action should be evaluated.
 * - "All": All conditions must be true
 * - "Any": Any condition must be true
 * - "None": No conditions must be true
 * - "NotAll": Not all conditions must be true
 */
export type ConditionListMatch = "All" | "Any" | "None" | "NotAll";

/**
 * The set of built-in Keyboard Maestro sound effect names.
 * Used by actions like PlaySound and Notification.
 */
export type KMSound =
  | "Basso"
  | "Blow"
  | "Bottle"
  | "Default Sound"
  | "Frog"
  | "Funk"
  | "Glass"
  | "Hero"
  | "Morse"
  | "Ping"
  | "Pop"
  | "Purr"
  | "Sosumi"
  | "Submarine"
  | "Tink";

// --- Condition-specific types ---

/**
 * Condition for checking the state of a key.
 * - ConditionType: "Key"
 * - KeyCode: Key code number
 * - KeyConditionType: "Down" or "Up"
 */
export interface KeyCondition {
  ConditionType: "Key";
  KeyCode: number;
  KeyConditionType: "Down" | "Up";
}

/**
 * Condition for checking the state of a macro.
 * - ConditionType: "Macro"
 * - MacroUID: Unique identifier for the macro
 * - MacroConditionType: Macro state (enabled, active, executing, etc)
 */
export interface MacroCondition {
  ConditionType: "Macro";
  MacroUID: string;
  MacroConditionType:
    | "IsEnabled"
    | "IsDisabled"
    | "IsActive"
    | "IsInactive"
    | "IsExecuting"
    | "IsNotExecuting";
}

/**
 * Condition for checking the state of an application.
 * - ConditionType: "Application"
 * - ApplicationConditionType: App state (running, active, hidden, etc)
 * - Application: App identification options
 */
export interface ApplicationCondition {
  ConditionType: "Application";
  ApplicationConditionType:
    | "Running"
    | "NotRunning"
    | "Active"
    | "NotActive"
    | "RunningButNotActive"
    | "Hidden"
    | "NotHidden"
    | "RunningButHidden";
  Application: SpecificAppOptions;
}

/**
 * Condition for checking the state of a mounted disk/volume.
 * - ConditionType: "Disk"
 * - DiskConditionType: Existence of disk
 * - DiskTitle: Title of the disk
 * - DiskConditionSelectionType: How to match the disk (is, contains, matches)
 */
export interface MountedVolumeCondition {
  ConditionType: "Disk";
  DiskConditionType: "Exists" | "DoesNotExist";
  DiskTitle: string;
  DiskConditionSelectionType: "Is" | "Contains" | "Matches";
}

/**
 * Condition for checking the state of a USB device.
 * - ConditionType: "USBDevice"
 * - USBDeviceConditionType: Existence of device
 * - USBDeviceConditionName: Name of the device
 * - USBDeviceConditionSelectionType: How to match the device (is, contains, matches)
 */
export interface USBDeviceCondition {
  ConditionType: "USBDevice";
  USBDeviceConditionType: "Exists" | "DoesNotExist";
  USBDeviceConditionName: string;
  USBDeviceConditionSelectionType: "Is" | "Contains" | "Matches";
}

/**
 * Condition for checking the state of a wireless network.
 * - ConditionType: "WirelessNetwork"
 * - WirelessNetworkConditionType: Connection state
 * - WirelessNetworkConditionName: Name of the network
 * - WirelessNetworkMatchType: How to match the network (any, name, BSSID, etc)
 */
export interface WirelessNetworkCondition {
  ConditionType: "WirelessNetwork";
  WirelessNetworkConditionType: "IsConnected" | "IsNotConnected";
  WirelessNetworkConditionName: string;
  WirelessNetworkMatchType:
    | "Any"
    | "NameIs"
    | "NameContains"
    | "NameMatches"
    | "BSSID";
}

/**
 * Condition for checking the state of a location.
 * - ConditionType: "Location"
 * - LocationConditionType: Operator for comparison
 * - LocationName: Name of the location
 */
export interface LocationCondition {
  ConditionType: "Location";
  LocationConditionType: StringConditionOperator;
  LocationName: string;
}

/**
 * Condition for checking the state of a typed string.
 * - ConditionType: "TypedString"
 * - TrippedCaseBehaviour: Case behavior for the string
 */
export interface TypedStringCondition {
  ConditionType: "TypedString";
  TrippedCaseBehaviour: "None" | "TitleCase" | "Uppercase";
}

/**
 * Whether failure aborts the macro for actions that support it.
 * - true (default): Failure aborts macro (no XML key)
 * - false: Failure does not abort macro (adds <key>StopOnFailure</key><false/>)
 */
export type StopOnFailure = boolean | undefined;

/**
 * Whether to notify on failure for actions that support it.
 * - true (default): Notify on failure (no XML key)
 * - false: Do not notify on failure (adds <key>NotifyOnFailure</key><false/>)
 */
export type NotifyOnFailure = boolean | undefined;

/**
 * Variants for the Cancel action in Keyboard Maestro.
 * - "CancelAllMacros": Cancel all macros
 * - "CancelAllOtherMacros": Cancel all other macros
 * - "CancelThisMacro": Cancel this macro (current instance)
 * - "CancelJustThisMacro": Cancel just this macro (current instance, not others)
 * - "CancelSpecificMacro": Cancel a specific macro by name or UUID (requires 'instance')
 * - "RetryThisLoop": Retry the current loop
 * - "ContinueLoop": Continue the current loop
 * - "BreakFromLoop": Break from the current loop
 */
export type CancelType =
  | "CancelAllMacros"
  | "CancelAllOtherMacros"
  | "CancelThisMacro"
  | "CancelJustThisMacro"
  | "CancelSpecificMacro"
  | "RetryThisLoop"
  | "ContinueLoop"
  | "BreakFromLoop";
