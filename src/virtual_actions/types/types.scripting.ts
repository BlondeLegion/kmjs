//FILE: src/virtual_actions/types/scripting.ts

import type { TextualConditionOperator } from "./types.conditions";
import type { ScreenArea, ImageSource, ImageSelection } from "./types.ui";

/**
 * Condition for evaluating a file attribute (e.g., file size, creation date).
 * - ConditionType: "FileAttribute"
 * - Path: Path to the file
 * - FileAttribute: Attribute to check
 * - FileAttrtibuteConditionType: Operator for comparison
 * - ConditionValue: Value to compare against
 */
export interface FileAttributeCondition {
  ConditionType: "FileAttribute";
  Path: string;
  FileAttribute:
    | "FileType"
    | "FileSize"
    | "CreationDate"
    | "ModificationDate"
    | "AddedDate"
    | "LastUsedDate"
    | "DownloadedDate"
    | "WhereFrom"
    | "OwnerName"
    | "OwnerID"
    | "GroupName"
    | "GroupID"
    | "PosixPermissions"
    | "ExtensionHidden"
    | "Invisible"
    | "HFSCreatorCode"
    | "HFSTypeCode"
    | "ContentType"
    | "ContentKind"
    | "Tags"
    | "Comment"
    | "Parent"
    | "Name"
    | "BaseName"
    | "Extension"
    | "DisplayName";
  FileAttrtibuteConditionType: TextualConditionOperator;
  ConditionValue: string;
}

/**
 * Condition for evaluating OCR (Optical Character Recognition) results.
 * - ConditionType: "OCR"
 * - OCRConditionType: Operator for comparison
 * - ConditionResult: Optional result string
 * - Language: Optional language code
 * - ImageSource: Optional image source
 * - ImageScreenArea: Optional screen area
 * - ImagePath: Optional path to image file
 * - ImageNamedClipboardName: Optional named clipboard
 * - ImageNamedClipboardRedundandDisplayName: Optional redundant display name
 */
export interface OCRCondition {
  ConditionType: "OCR";
  OCRConditionType: TextualConditionOperator;
  ConditionResult?: string;
  Language?: string;
  ImageSource?: ImageSource;
  ImageScreenArea?: ScreenArea;
  ImagePath?: string;
  ImageNamedClipboardName?: string;
  ImageNamedClipboardRedundandDisplayName?: string;
}

/**
 * Condition for evaluating the existence or type of a file or folder path.
 * - ConditionType: "Path"
 * - Path: Path to check
 * - PathConditionType: What to check for (existence, file/folder, etc)
 */
export interface PathCondition {
  ConditionType: "Path";
  Path: string;
  PathConditionType:
    | "NothingExists"
    | "SomethingExists"
    | "FileExists"
    | "FileDoesNotExists"
    | "FolderExists"
    | "FolderDoesNotExists";
}

/**
 * Condition for evaluating the color of a pixel at a given position.
 * - ConditionType: "Pixel"
 * - HorizontalPositionExpression: X coordinate expression
 * - VerticalPositionExpression: Y coordinate expression
 * - PixelConditionType: What to check for (color, brightness, etc)
 * - PixelConditionTypeGood: Good values for comparison
 * - Red, Green, Blue: Color values
 */
export interface PixelCondition {
  ConditionType: "Pixel";
  HorizontalPositionExpression: string;
  VerticalPositionExpression: string;
  PixelConditionType:
    | "Is"
    | "IsNot"
    | "IsBrighter"
    | "IsDarker"
    | "IsMoreRed"
    | "IsLessRed"
    | "IsMoreGreen"
    | "IsLessGreen"
    | "IsMoreBlue"
    | "IsLessBlue"
    // Never ask a woman her age
    // Never ask a man his salary
    // Never ask Peter Lewis his PixelConditionType
    | "IsLessBlueIsNot";
  PixelConditionTypeGood:
    | "Is"
    | "IsNot"
    | "IsBrighter"
    | "IsDarker"
    | "IsMoreRed"
    | "IsLessRed"
    | "IsMoreGreen"
    | "IsLessGreen"
    | "IsMoreBlue"
    | "IsLessBlue";
  Red: number;
  Green: number;
  Blue: number;
}

/**
 * Condition for evaluating the result of a script (AppleScript, Shell, JS, etc).
 * - ConditionType: "Script"
 * - ScriptConditionSourceType: Type of script source
 * - ScriptConditionType: Operator for result
 * - ScriptText: Optional script text
 * - Path: Optional path to script file
 * - ScriptTerminationStatus: Optional termination status
 * - ScriptResult: Optional result string
 * - UseModernSyntax: Optional flag for modern syntax
 * - IncludedVariables: Optional list of included variables
 * - includeAllVariables: Convenience flag to include all variables
 */
export interface ScriptCondition {
  ConditionType: "Script";
  ScriptConditionSourceType:
    | "AppleScriptText"
    | "AppleScriptFile"
    | "ShellScriptText"
    | "ShellScriptFile"
    | "SwiftScriptText"
    | "SwiftScriptFile"
    | "JavaScriptText"
    | "JavaScriptFile"
    | "JavaScriptBrowserText"
    | "JavaScriptBrowserFile";
  ScriptConditionType:
    | "ReturnsSuccess"
    | "ReturnsError"
    | "ReturnsStatus"
    | TextualConditionOperator;
  ScriptText?: string;
  Path?: string;
  ScriptTerminationStatus?: number;
  ScriptResult?: string;
  UseModernSyntax?: boolean;
  IncludedVariables?: string[];
  /** Convenience flag: set to true to include *all* variables (serialises as ["9999"]). */
  includeAllVariables?: boolean;
}

/**
 * Condition for evaluating the presence of a found image on the screen.
 * - ConditionType: "ScreenImage"
 * - ScreenImageConditionType: What to check for (contains, does not contain, etc)
 * - ScreenArea: Area to search
 * - ImageSource: Optional image source
 * - Fuzz: Optional fuzziness for matching
 * - DisplayMatches: Optional flag to display matches
 * - ImageNamedClipboardName: Optional named clipboard
 * - ImageNamedClipboardRedundandDisplayName: Optional redundant display name
 * - ImagePath: Optional path to image file
 * - ImageScreenArea: Optional screen area for image
 * - ImageSelection: Optional image selection mode
 */
export interface FoundImageCondition {
  ConditionType: "ScreenImage";
  ScreenImageConditionType:
    | "Contains"
    | "ContainsUnique"
    | "DoesNotContain"
    | "DoesNotContainUnique";
  ScreenArea: ScreenArea;
  ImageSource?: ImageSource;
  Fuzz?: number;
  DisplayMatches?: boolean;
  ImageNamedClipboardName?: string;
  ImageNamedClipboardRedundandDisplayName?: string;
  ImagePath?: string;
  ImageScreenArea?: ScreenArea;
  ImageSelection?: ImageSelection;
}
