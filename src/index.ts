//FILE: src/index.ts

/**
 * # kmjs: Keyboard Maestro as Code
 *
 * A powerful TypeScript toolkit that brings the full capabilities of Keyboard Maestro
 * into a modern, type-safe, code-first workflow. Treat your macros like modules:
 * version them with Git, generate them programmatically, and test them rigorously.
 *
 * ## Quick Start
 *
 * ```typescript
 * import {
 *   runVirtualMacro,
 *   createVirtualNotification,
 *   createVirtualTypeKeystroke,
 *   KM_TOKENS
 * } from 'kmjs';
 *
 * const actions = [
 *   createVirtualNotification({
 *     title: 'Hello from kmjs!',
 *     body: `Current app: ${KM_TOKENS.FrontApplicationName}`,
 *   }),
 *   createVirtualTypeKeystroke({ keystroke: 'Hello, World!' }),
 * ];
 *
 * runVirtualMacro(actions, 'My First Virtual Macro');
 * ```
 *
 * ## Core Features
 *
 * - **Virtual Actions**: 30+ type-safe action creators for programmatic macro generation
 * - **Real Macro Syncing**: Import/export macros for version control
 * - **Query Helpers**: Synchronous access to system information via KM tokens
 * - **KMET Utilities**: XML/JSON conversion and text processing tools
 * - **StyledText Support**: Handle Keyboard Maestro's rich text format
 * - **Keystroke Normalization**: Convert shortcuts between formats
 * - **Token Dictionary**: Full type-safe access to all KM text tokens
 *
 * @packageDocumentation
 */

// ================================================================================================
// CORE EXECUTION FUNCTIONS
// ================================================================================================

/**
 * Execute an existing Keyboard Maestro macro by name or UUID.
 *
 * @example
 * ```typescript
 * import { runMacro } from 'kmjs';
 *
 * const result = runMacro({
 *   macroId: 'My Macro Name',
 *   parameter: { userId: 123, action: 'process' }
 * });
 * ```
 */
export { runMacro } from "./kmjs.runMacro";

/**
 * Build and execute ephemeral virtual macros without saving them to Keyboard Maestro.
 *
 * @example
 * ```typescript
 * import { runVirtualMacro, createVirtualNotification } from 'kmjs';
 *
 * const actions = [createVirtualNotification({ title: 'Hello!' })];
 * runVirtualMacro(actions, 'Temporary Macro');
 * ```
 */
export {
  buildEphemeralMacroXml,
  runVirtualMacro,
} from "./kmjs.runVirtualMacro";

/**
 * Generate Keyboard Maestro XML from virtual actions with flexible output options.
 *
 * @example
 * ```typescript
 * import { generateMacro, createVirtualNotification } from 'kmjs';
 *
 * // Generate raw XML
 * const xml = generateMacro([createVirtualNotification({ title: 'Hello!' })]);
 *
 * // Export to file
 * generateMacro(actions, {
 *   addPlistWrapping: true,
 *   exportTarget: { filePath: '/path/to/macro.kmmacros' },
 *   macroName: 'My Macro'
 * });
 *
 * // Display in text window
 * generateMacro(actions, {
 *   exportTarget: { displayInTextWindow: true }
 * });
 * ```
 */
export {
  generateMacro,
  type GenerateMacroOptions,
  type ExportTarget,
} from "./kmjs.generateMacro";

// ================================================================================================
// VARIABLE AND NOTIFICATION HELPERS
// ================================================================================================

/**
 * Get and set Keyboard Maestro variables with full scope support.
 *
 * @example
 * ```typescript
 * import { kmvar } from 'kmjs';
 *
 * kmvar.set('MyVar', 'Hello');
 * const value = kmvar.get('MyVar'); // 'Hello'
 *
 * // Shorthand
 * kmvar('Counter', 10); // Set
 * const count = kmvar('Counter'); // Get
 * ```
 */
export { kmvar, get as getVariable, set as setVariable } from "./kmjs.kmvar";

/**
 * Display system notifications via Keyboard Maestro.
 *
 * @example
 * ```typescript
 * import { notify } from 'kmjs';
 *
 * notify('Process Complete', 'All files have been processed successfully.');
 * ```
 */
export { notify } from "./kmjs.notify";

// ================================================================================================
// TOKENS AND SYSTEM INFORMATION
// ================================================================================================

/**
 * Complete dictionary of Keyboard Maestro text tokens with type safety and documentation.
 * Includes KM_TOKENS constant and lookupKMToken utility.
 *
 * @example
 * ```typescript
 * import { KM_TOKENS, lookupKMToken } from 'kmjs';
 *
 * const uuid = KM_TOKENS.ARandomUniqueID; // '%RandomUUID%'
 * const info = lookupKMToken('%RandomUUID%'); // { human: 'A Random Unique ID', pascal: 'ARandomUniqueID' }
 * ```
 */
export * from "./tokens";

/**
 * Synchronous query helpers for system information via Keyboard Maestro tokens.
 *
 * @example
 * ```typescript
 * import { getMousePosition, getFrontAppInfo, getSystemVolume } from 'kmjs';
 *
 * const mousePos = getMousePosition(); // "1234,567"
 * const app = getFrontAppInfo(); // { name: "Safari", bundleId: "com.apple.Safari" }
 * const volume = getSystemVolume(); // 75
 * ```
 */
export * from "./queries";

// ================================================================================================
// VIRTUAL ACTIONS AND TYPES
// ================================================================================================

/**
 * 30+ virtual action creators and their TypeScript types for programmatic macro generation.
 *
 * @example
 * ```typescript
 * import {
 *   createVirtualNotification,
 *   createVirtualTypeKeystroke,
 *   createVirtualIf,
 *   createVirtualSetVariable
 * } from 'kmjs';
 *
 * const actions = [
 *   createVirtualSetVariable({ variable: 'Status', text: 'Ready' }),
 *   createVirtualIf({
 *     conditions: [{ ConditionType: 'Variable', Variable: 'Status', VariableConditionType: 'Is', VariableValue: 'Ready' }],
 *     then: [createVirtualNotification({ title: 'System Ready!' })]
 *   })
 * ];
 * ```
 */
export * from "./virtual_actions";

// ================================================================================================
// TEXT PROCESSING UTILITIES
// ================================================================================================

/**
 * KMET (Keyboard Maestro Edit-as-Text) utilities for XML/JSON conversion and text processing.
 * Based on Dan Thomas's excellent KMET macro library.
 *
 * @example
 * ```typescript
 * import { xmlToJson, jsonToXml, searchReplaceInText, encodeTextForXml } from 'kmjs';
 *
 * const json = xmlToJson(kmXmlSnippet);
 * const xml = jsonToXml(jsonObject);
 * const updated = searchReplaceInText(json, /Old_Var/g, 'New_Var');
 * const escaped = encodeTextForXml('Text with <special> & "characters"');
 * ```
 */
export {
  encodeTextForJson,
  encodeTextForXml,
  xmlToJson,
  jsonToXml,
  searchReplaceInText,
  type XmlToJsonOptions,
  type JsonToXmlOptions,
  type SearchReplaceOptions,
} from "./utils/utils.kmet";

/**
 * StyledText utilities for handling Keyboard Maestro's rich text format (RTF).
 *
 * @example
 * ```typescript
 * import { encodeStyledTextData, decodeStyledTextData, updateStyledTextInXml } from 'kmjs';
 *
 * const base64Data = encodeStyledTextData(rtfString);
 * const { rtf, text } = decodeStyledTextData(base64Data);
 * const updatedXml = updateStyledTextInXml(actionXml, rtf => rtf.replace('old', 'new'));
 * ```
 */
export {
  encodeStyledTextData,
  decodeStyledTextData,
  updateStyledTextInXml,
  generateBasicRtf,
  stripRtfToPlainText,
  type DecodedStyledText,
} from "./utils/utils.styledText";

/**
 * Keystroke normalization utilities for converting shortcuts between formats.
 *
 * The main utility `normalizeAppleScriptShortcut` accepts various keystroke input formats
 * and converts them to AppleScript-compatible modifier mask → key code maps for use
 * with Keyboard Maestro automation.
 *
 * **Supported Input Formats:**
 * - String shortcuts: "Cmd+S", "Shift+KeyA", "Option+F1"
 * - Single characters: "a", "1" (auto-mapped to KeyA, Digit1)
 * - Event codes: "Space", "Enter", "ArrowUp"
 * - Raw key codes: 36 (Return), 53 (Escape)
 * - Modifier-only: "Cmd", "Shift+Option" (returns null key)
 * - Pre-formatted maps: { 256: 1 } (returned as-is)
 *
 * @example
 * ```typescript
 * import { normalizeAppleScriptShortcut } from 'kmjs';
 *
 * // String shortcuts with modifiers
 * normalizeAppleScriptShortcut('Cmd+S')           // { 256: 1 }
 * normalizeAppleScriptShortcut('Shift+Option+A')  // { 2560: 0 }
 *
 * // Single characters (auto-mapped)
 * normalizeAppleScriptShortcut('a')               // { 0: 0 }
 * normalizeAppleScriptShortcut('1')               // { 0: 18 }
 *
 * // Event codes and special keys
 * normalizeAppleScriptShortcut('Space')           // { 0: 49 }
 * normalizeAppleScriptShortcut('Enter')           // { 0: 36 }
 * normalizeAppleScriptShortcut('F1')              // { 0: 122 }
 *
 * // Raw key codes
 * normalizeAppleScriptShortcut(36)                // { 0: 36 }
 * normalizeAppleScriptShortcut('KeyCode:36')      // { 0: 36 }
 *
 * // Modifier-only shortcuts (useful for other automation tools)
 * normalizeAppleScriptShortcut('Cmd')             // { 256: null }
 * normalizeAppleScriptShortcut('Shift+Option')    // { 2560: null }
 *
 * // Use with virtual actions
 * import { createVirtualTypeKeystroke } from 'kmjs';
 * const keystroke = normalizeAppleScriptShortcut('Cmd+Shift+N');
 * const action = createVirtualTypeKeystroke({ keystroke });
 * ```
 */
export { normalizeAppleScriptShortcut } from "./utils/utils.keystroke";
