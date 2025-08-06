//FILE: src/virtual_actions/types/ui.ts

import type {
  StringConditionOperator,
  ExistenceCondition,
  EnabledCondition,
  MarkedCondition,
  OnOffMixedStateCondition,
} from "./types.conditions";

/**
 * How to match a specific application in KM actions.
 * - "Name": Match by app name
 * - "BundleID": Match by bundle identifier
 * - "Path": Match by file path
 */
export type AppMatchType = "Name" | "BundleID" | "Path";

/**
 * Options to identify a specific application for targeting.
 * - name: App name
 * - bundleIdentifier: Bundle ID
 * - path: File path
 * - match: How to match (AppMatchType)
 * - newFile: Optional new file path
 */
export interface SpecificAppOptions {
  name?: string;
  bundleIdentifier?: string;
  path?: string;
  match?: AppMatchType;
  newFile?: string;
}

/**
 * Source of an image for matching in KM actions.
 * - "Image": Inline image
 * - "Icon": App icon
 * - "SystemClipboard": System clipboard
 * - "TriggerClipboard": Trigger clipboard
 * - "NamedClipboard": Named clipboard
 * - "File": File path
 * - "Screen": Screen capture
 */
export type ImageSource =
  | "Image"
  | "Icon"
  | "SystemClipboard"
  | "TriggerClipboard"
  | "NamedClipboard"
  | "File"
  | "Screen";

/**
 * Corner of an area or image for relative positioning.
 * - "Center", "TopLeft", "TopRight", "BottomLeft", "BottomRight"
 */
export type RelativeCorner =
  | "Center"
  | "TopLeft"
  | "TopRight"
  | "BottomLeft"
  | "BottomRight";

/**
 * How to select an image if multiple matches are found.
 * - "Unique", "Best", "Top", "Left", "Bottom", "Right"
 */
export type ImageSelection =
  | "Unique"
  | "Best"
  | "Top"
  | "Left"
  | "Bottom"
  | "Right";

/**
 * Basis for offset calculations in click / drag actions.
 * - "Image", "Window", "Screen", "Mouse", "Absolute"
 */
export type CoordinateReference =
  | "Image"
  | "Window"
  | "Screen"
  | "Mouse"
  | "Absolute";

/**
 * A discriminated union describing a screen, window, or rectangular area.
 * Used for targeting in image, click, and window actions.
 */
export type ScreenArea =
  | { type: "ScreenAll" }
  | { type: "ScreenMain" }
  | { type: "ScreenSecond" }
  | { type: "ScreenThird" }
  | { type: "ScreenInternal" }
  | { type: "ScreenExternal" }
  | { type: "ScreenFront" }
  | { type: "ScreenBack" }
  | { type: "ScreenBack2" }
  | { type: "ScreenMouse" }
  | { type: "ScreenIndex"; index: number | string }
  | { type: "WindowFront" }
  | { type: "WindowName"; name: string }
  | { type: "WindowNameContaining"; name: string }
  | { type: "WindowNameMatching"; name: string }
  | { type: "WindowIndex"; index: number | string }
  | {
      type: "Area";
      left: number | string;
      top: number | string;
      width: number | string;
      height: number | string;
    };

// --- Condition-specific types ---

/**
 * Condition for checking the state of a button in the UI.
 * - ConditionType: "Button"
 * - ButtonConditionType: Existence, enabled, or on/off/mixed state
 * - ButtonTitle: Title of the button
 * - ButtonConditionSelectionType: How to match (is, contains, matches)
 */
export interface ButtonCondition {
  ConditionType: "Button";
  ButtonConditionType:
    | ExistenceCondition
    | EnabledCondition
    | OnOffMixedStateCondition;
  ButtonTitle: string;
  ButtonConditionSelectionType: "Is" | "Contains" | "Matches";
}

/**
 * Condition for checking the state of a menu in the UI.
 * - ConditionType: "Menu"
 * - MenuConditionType: Existence, enabled, or marked state
 * - MenuTitle: Title of the menu
 * - MenuConditionSelectionType: How to match (is, contains, matches, path, shortcut)
 * - MenuShortcut: Optional shortcut string
 * - MenuModifiers: Optional modifier bitmask
 */
export interface MenuCondition {
  ConditionType: "Menu";
  MenuConditionType: ExistenceCondition | EnabledCondition | MarkedCondition;
  MenuTitle: string;
  MenuConditionSelectionType:
    | "Is"
    | "Contains"
    | "Matches"
    | "Path"
    | "Shortcut";
  MenuShortcut?: string;
  MenuModifiers?: number;
}

/**
 * Condition for checking the state of any window in the UI.
 * - ConditionType: "AnyWindow"
 * - AnyWindowConditionType: String operator for window title
 * - AnyWindowTitle: Title of the window
 * - IsFrontApplication: True if front app, false if specific app
 * - Application: App options if not front app
 */
export type AnyWindowCondition =
  | {
      /** Front-Application variant */
      ConditionType: "AnyWindow";
      AnyWindowConditionType: StringConditionOperator;
      AnyWindowTitle: string;
      IsFrontApplication: true;
      Application?: never;
    }
  | {
      /** Specific-Application variant */
      ConditionType: "AnyWindow";
      AnyWindowConditionType: StringConditionOperator;
      AnyWindowTitle: string;
      IsFrontApplication: false;
      Application: SpecificAppOptions;
    };

/**
 * Condition for checking the state of the front window in the UI.
 * - ConditionType: "FrontWindow"
 * - FrontWindowConditionType: Existence, title, or fullscreen state
 * - FrontWindowTitle: Optional window title
 * - IsFrontApplication: True if front app, false if specific app
 * - Application: App options if not front app
 */
export type FrontWindowCondition =
  | {
      ConditionType: "FrontWindow";
      FrontWindowConditionType:
        | ExistenceCondition
        | "TitleIs"
        | "TitleIsNot"
        | "ExistsButTitleIsNot"
        | "TitleContains"
        | "TitleDoesNotContain"
        | "ExistsButTitleDoesNotContain"
        | "TitleMatches"
        | "TitleDoesNotMatch"
        | "ExistsButTitleDoesNotMatch"
        | "IsFullScreen"
        | "IsNotFullScreen"
        | "ExistsButIsNotFullScreen";
      FrontWindowTitle?: string;
      IsFrontApplication: true;
      Application?: never;
    }
  | {
      ConditionType: "FrontWindow";
      FrontWindowConditionType:
        | ExistenceCondition
        | "TitleIs"
        | "TitleIsNot"
        | "ExistsButTitleIsNot"
        | "TitleContains"
        | "TitleDoesNotContain"
        | "ExistsButTitleDoesNotContain"
        | "TitleMatches"
        | "TitleDoesNotMatch"
        | "ExistsButTitleDoesNotMatch"
        | "IsFullScreen"
        | "IsNotFullScreen"
        | "ExistsButIsNotFullScreen";
      FrontWindowTitle?: string;
      IsFrontApplication: false;
      Application: SpecificAppOptions;
    };

/**
 * Application targeting options used by various KM actions.
 * - "Front": Target the frontmost application
 * - "Specific": Target a specific application
 */
export type ApplicationTarget = "Front" | "Specific";

/**
 * Window manipulation operations available in Keyboard Maestro.
 * Now matches the exact Keyboard Maestro action strings.
 */
export type WindowManipulation =
  | "ResizeWindowByPercent" // ScaleBy
  | "ResizeWindowBy"
  | "ResizeWindowTo"
  | "MoveWindowBy"
  | "MoveWindowTo"
  | "MoveAndResize"
  | "CenterWindow"
  | "CenterWindowAt"
  | "CloseWindow"
  | "ZoomWindow"
  | "ReallyMinimizeWindow"
  | "UnminimizeWindow"
  | "MinimizeWindow" // ToggleMinimize
  | "SelectWindow"; // BringToFront

/**
 * Predefined Move and Resize options for window manipulation.
 * - "Custom", "FullScreen", "LeftColumn", "RightColumn", etc.
 */
export type MoveAndResizePreset =
  | "Custom"
  | "FullScreen"
  | "LeftColumn"
  | "RightColumn"
  | "TopHalf"
  | "BottomHalf"
  | "TopLeft"
  | "TopRight"
  | "BottomLeft"
  | "BottomRight";

/**
 * Window targeting options for ManipulateWindow action.
 * - "FrontWindow": Target the frontmost window
 * - "NamedWindow": Target a window by name
 * - "WindowNameContaining": Target a window containing a string
 * - "WindowNameMatching": Target a window matching a regex
 * - "WindowIndex": Target a window by index
 * - "KMWindowID": Target a window by KM ID
 * - "KMLastWindow": Target the last window
 */
export type WindowTarget =
  | "FrontWindow"
  | "NamedWindow"
  | "WindowNameContaining"
  | "WindowNameMatching"
  | "WindowIndex"
  | "KMWindowID"
  | "KMLastWindow";
