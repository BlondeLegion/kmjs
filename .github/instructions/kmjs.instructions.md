---
applyTo: "**"
---

# kmjs Consumer Instructions

> **Scope**  These instructions are for _using_ the published **kmjs** package inside your own TypeScript / Node.js project. They are **not** about developing or testing kmjs itself.

---

## 1  What is **kmjs**?

**kmjs** is a strongly‑typed TypeScript toolkit that lets you drive \[Keyboard Maestro]‑style macOS automation entirely from code. It ships over **30 virtual actions**, a macro runner, rich system‑query helpers, and a complete dictionary of Keyboard Maestro text tokens.

- **Runs on**: macOS with Keyboard Maestro installed (KM 10 or later recommended).
- **Install**:

  ```bash
  pnpm add kmjs        # or yarn add / npm install
  ```

---

## 2  Core Usage Pattern

```ts
import { runVirtualMacro, createVirtualNotification, KM_TOKENS } from "kmjs";

const actions = [
  createVirtualNotification({
    title: "Hello from kmjs!",
    body: `Front app: ${KM_TOKENS.FrontApplicationName}`,
  }),
];

runVirtualMacro(actions, "Sample Macro");
```

### Golden Rules

1. **Always** build automation with the exported `createVirtual*` or `generateMacro` functions to leave direct XML creation / ediitng handling to kmjs – try not to hand‑roll XML without kmjs utilities if it can be helped.
2. Pass options as **a single object literal** that matches the exported TypeScript types _exactly_.
3. Collect all virtual‑action objects in an **array** and execute with `runVirtualMacro(…)`.
4. Import only what you use from **"kmjs"**; Copilot should generate precise import lists.
5. Always priortise searching through the local kmjs files (whether we're using the yarn / npm node modules version, or the bundled version) for information on types, parameters, options, functions, values, etc, before trying to search online / the repo.

---

## 3  Available Building Blocks _(cheat‑sheet)_

| Category                | Key helpers (✎ parameters in parentheses)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI & Display**        | `createVirtualNotification` (title, body?, sound?) · `createVirtualDisplayTextBriefly` (text, tokenPreset?, processingMode?) · `createVirtualDisplayTextWindow` (text, action) · `createVirtualShowStatusMenu` ()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Input Simulation**    | `createVirtualTypeKeystroke` (keystroke, pressAndHold?, pressAndRepeat?, holdTime?) · `createVirtualMoveAndClick` (horizontal?, vertical?, relative?, clickKind?, button?, mouseDrag?, dragTargetX?, dragTargetY?, restoreMouseLocation?) - **Primary mouse control for moving cursor, clicking, and dragging elements. Use relative:"Screen" for absolute coordinates, mouseDrag:"Absolute"/"Relative" for drag operations** · `createVirtualClickAtFoundImage` (imageSource?, filePath?, horizontal?, vertical?, relative?, clickKind?, button?, mouseDrag?, dragTargetX?, dragTargetY?, fuzz?, waitForImage?) - **Advanced image-based clicking with drag support. Finds images first, then clicks/drags relative to them** · `createVirtualScrollWheelEvent` (scrollAmount, direction, stopOnFailure?, notifyOnFailure?, actionUID?) · `createVirtualPressButton` (action, buttonName, waitForEnabledButton?, timeoutAborts?, notifyOnTimeout?, stopOnFailure?, notifyOnFailure?) |
| **Apps & Windows**      | `createVirtualActivate` (target?, specific?, allWindows?, reopenWindows?, alreadyActivatedAction?, timeoutAborts?) · `createVirtualQuit` (variant?, target?, specific?, timeoutAborts?) · `createVirtualManipulateWindow` (manipulation?, values?, moveAndResizePreset?, customValues?, windowTarget?, windowIdentifier?, windowIndex?, applicationTarget?, specificApplication?, stopOnFailure?, notifyOnFailure?) · ``(action, window?) ·`createVirtualSelectMenuItem`(menuPath, target?, specific?, stopOnFailure?, notifyOnFailure?) ·`createVirtualSelectMenu`(menu) ·`createVirtualShowSpecificApp` (target?, specific)                                                                                                                                                                                                                                                                                                                                                         |
| **Variables**           | `createVirtualSetVariable` (variable, text, scope?) · `createVirtualUseVariable` (variable, action, stopOnFailure?, notifyOnFailure?) · `createVirtualSetVariableToCalculation` (variable, text, format?, stopOnFailure?, notifyOnFailure?)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Logic & Flow**        | `createVirtualIf` (conditions, then, else?, match?, timeoutAborts?) · ``(conditions, then, else?) ·`createVirtualSwitchCase`(variable, cases) ·`createVirtualWhile`(conditions, actions) ·`createVirtualPause` (time?, unit?) ·`createVirtualCancel`(cancelType, instance?) ·`createVirtualBreakFromLoop`() ·`createVirtualContinueLoop`() ·`createVirtualRetryThisLoop`() ·`createVirtualReturn`(text, tokenPreset?) ·`createVirtualComment`(title, text, rtfContent?) ·`createVirtualGroup` (name, actions, timeOutAbortsMacro?)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Clipboard**           | `createVirtualCopy` (notifyOnTimeout?, timeoutAborts?) · `createVirtualCut` (notifyOnTimeout?, timeoutAborts?) · `createVirtualPaste` (notifyOnTimeout?, timeoutAborts?) · `createVirtualSetClipboardToText` (text?, presetMode?, processingMode?, includeStyledText?, rtfContent?, destination?, stopOnFailure?, notifyOnFailure?)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Text / Files / URLs** | `createVirtualInsertText` (text, tokenPreset?, action?, processingMode?, includeStyledText?, rtfContent?, targetingType?) · ``(text, action?) · `createVirtualFile` (operation, source?, destination?, outputPath?, stopOnFailure?, notifyOnFailure?) ·``(action, path?) ·`createVirtualOpen` (path, target?, specific?, stopOnFailure?, notifyOnFailure?) ·`createVirtualOpenURL` (url, target?, specific?, processingMode?, openInBackground?, stopOnFailure?, notifyOnFailure?, timeoutAborts?, notifyOnTimeout?) ·`createVirtualClearTypedStringBuffer` ()                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Media**               | `createVirtualScreenCapture` (area?, format?) · `createVirtualPlaySound` (sound?, path?, asynchronously?, volume?, deviceID?, timeoutAborts?)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Macro Generation**    | `generateMacro` (actions, options?) · `runVirtualMacro` (actions, name?, addReturnActionXML?, captureReturnValue?) · `buildEphemeralMacroXml` (actions, addReturnActionXML?)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

_(The library exports many more helpers; Copilot can rely on TypeScript intellisense for the full list.)_

### 3.1 Macro Generation Functions

- **`runVirtualMacro(actions, name?, addReturnActionXML?, captureReturnValue?)`** - Execute virtual actions immediately as an ephemeral macro in-memory without needing to output the XML / interface with the Keyboard Maestro GUI. The most central function of kmjs.

- **`generateMacro(actions, options?)`** - Generate XML from virtual actions with flexible output options:
  - `addPlistWrapping?: boolean` - Add plist XML wrapper (required for file/KM export)
  - `exportTarget?: ExportTarget` - Multiple output options:
    - `displayInTextWindow?: boolean` - Show XML in KM text window
    - `filePath?: string` - Export to .kmmacros file
    - `toKMGroup?: string` - Import directly to KM macro group
  - `macroName?: string` - Name for the generated macro

- **`buildEphemeralMacroXml(actions, addReturnActionXML?)`** - Generate raw XML for virtual actions

**Usage Examples:**

````ts
// Generate raw XML
const xml = generateMacro([createVirtualNotification({ title: "Hello" })]);

// Export to file
generateMacro(actions, {
  addPlistWrapping: true,
  exportTarget: { filePath: "/path/to/macro.kmmacros" },
  macroName: "My Generated Macro"
});

// Import to KM group
generateMacro(actions, {
  exportTarget: { toKMGroup: "Generated Macros" },
  macroName: "Auto Generated"
});

// Display in text window
generateMacro(actions, {
  exportTarget: { displayInTextWindow: true }
});

---

## 4  Dynamic Information Sources

### 4.1 Tokens (for macro text)

Use the constant **`KM_TOKENS`** for strings that Keyboard Maestro will expand _at run time_:

```ts
`User: ${KM_TOKENS.UserName} – Mouse: ${KM_TOKENS.CurrentMouse}`;
````

### 4.2 Synchronous Queries (immediate values)

When your script itself needs live data (before the macro runs), import the `get*` helpers:

```ts
import { getMousePosition, getFrontAppInfo } from "kmjs";

const [x, y] = getMousePosition(true);
console.log(`Mouse at ${x},${y}`);
console.log(getFrontAppInfo().name);
```

All query helpers are **pure** and **synchronous**, so they can be called inside render loops without side‑effects.

**Available Query Functions:**

- `getAudioDevices()` - Get current audio input, output, and effects devices
- `getFinderSelections()` - Get currently selected items in Finder
- `getFrontAppInfo()` - Get information about the frontmost application
- `getFrontWindowInfo()` - Get information about the frontmost window
- `getKeyboardLayout()` - Get current keyboard layout information
- `getMousePosition(includeScreenInfo?)` - Get current mouse coordinates
- `getNetworkInfo()` - Get network interface information
- `getPastClipboard(index?)` - Get clipboard history entries
- `getRunningApps()` - Get list of currently running applications
- `getScreenFrames()` - Get screen frame information for all displays
- `getScreenResolution()` - Get screen resolution information
- `getSystemClipboard()` - Get current system clipboard content
- `getSystemVersion()` - Get macOS version information
- `getSystemVolume()` - Get current system volume level
- `getUserInfo()` - Get current user information

---

## 4.3 Utility Functions

**kmjs** provides several utility functions for text processing, keystroke normalization, and data conversion:

### Keystroke Normalization

- **`normalizeAppleScriptShortcut(input)`** - Convert various keystroke formats to AppleScript-compatible modifier mask → key code maps

  ```ts
  import { normalizeAppleScriptShortcut } from "kmjs";

  // String shortcuts with modifiers
  normalizeAppleScriptShortcut("Cmd+S"); // { 256: 1 }
  normalizeAppleScriptShortcut("Shift+Option+A"); // { 2560: 0 }

  // Single characters (auto-mapped)
  normalizeAppleScriptShortcut("a"); // { 0: 0 }
  normalizeAppleScriptShortcut("1"); // { 0: 18 }

  // Event codes and special keys
  normalizeAppleScriptShortcut("Space"); // { 0: 49 }
  normalizeAppleScriptShortcut("Enter"); // { 0: 36 }

  // Raw key codes
  normalizeAppleScriptShortcut(36); // { 0: 36 }

  // Modifier-only (returns null key - useful for other automation)
  normalizeAppleScriptShortcut("Cmd"); // { 256: null }
  ```

### Text Processing (KMET Utilities)

- **`xmlToJson(xml, options?)`** - Convert Keyboard Maestro XML to JSON for easier manipulation
- **`jsonToXml(json, options?)`** - Convert JSON back to Keyboard Maestro XML format
- **`searchReplaceInText(text, searchPattern, replacement, options?)`** - Advanced search/replace with regex support
- **`encodeTextForXml(text)`** - Safely encode text for XML inclusion
- **`encodeTextForJson(text)`** - Safely encode text for JSON inclusion

### StyledText (RTF) Utilities

- **`encodeStyledTextData(rtf)`** - Encode RTF content for Keyboard Maestro's StyledText format
- **`decodeStyledTextData(base64Data)`** - Decode StyledText data back to RTF and plain text
- **`updateStyledTextInXml(xml, updateFn)`** - Update RTF content within Keyboard Maestro XML
- **`generateBasicRtf(text, options?)`** - Generate basic RTF from plain text
- **`stripRtfToPlainText(rtf)`** - Extract plain text from RTF content

**Usage Notes:**

- These utilities are primarily for advanced macro manipulation and text processing
- Most common use cases are handled automatically by the `createVirtual*` functions
- The keystroke normalizer is used internally by `createVirtualTypeKeystroke` but can be used standalone for other automation needs

---

## 5  Copilot Guidance

- Default to **`createVirtual*`** helpers when the user asks to “click”, “type”, “show a message”, etc.
- Suggest `runVirtualMacro(actions, "Descriptive Name")` as the execution wrapper.
- Offer `KM_TOKENS` when the user needs a _dynamic_ placeholder in displayed text.
- Offer `get*` query helpers when the user needs an **immediate** macOS value _inside_ their script.
- If multiple actions are required, accumulate them in an array in **logical order**, then run once.
- When typing key shortcuts, supply them as human‑readable strings (`"Cmd+Shift+S"`); `createVirtualTypeKeystroke` will normalise them.
- For waits/delays, insert `createVirtualPause({ time: <seconds> })` between actions that need a buffer (e.g. after launching an app).
- Keep imports minimal and alphabetised:

  ```ts
  import {
    createVirtualActivate,
    createVirtualPause,
    createVirtualTypeKeystroke,
    runVirtualMacro,
  } from "kmjs";
  ```

- Comment key intent where helpful; Copilot should avoid generating raw XML or accessing kmjs internals.

---

## 6  Common Pitfalls — and how Copilot can avoid them

| Pitfall                                               | Copilot‑friendly Fix                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Raw XML** generation                                | _Never_ output XML manually – always call `createVirtual*` or `generateMacro` helpers. |
| Wrong helper choice (e.g. using keystroke for clicks) | Map user verbs → helper table above.                                                   |
| Incorrect option names                                | Use TypeScript’s autocomplete; property names are **_camelCase_** and match JSDoc.     |
| Forgetting to execute actions                         | Always end snippets with `runVirtualMacro(actions, "…")`.                              |
| Missing imports                                       | Derive the import list from used helpers; include `runVirtualMacro`.                   |

---

## 7  Advanced Tips

- **Return values** – Some virtual actions (e.g. `createVirtualReturn`) let a macro pass a result back; capture it from `runVirtualMacro()`’s returned promise.
- **Combining queries and tokens** – Queries give you immediate data for logic; tokens give the macro dynamic placeholders visible to the user.
- **Sound names** – Use macOS system sounds by name (`"Ping"`, `"Glass"`, etc.) with `createVirtualPlaySound` or as the `sound` option in notifications.
- **Mouse movement and dragging** – `createVirtualMoveAndClick` is your primary tool for mouse automation. Use `horizontal`/`vertical` for coordinates, `relative` for coordinate system ("Screen", "Window", "Mouse", "Absolute"). For dragging: set `mouseDrag` to "Absolute" (drag to specific coordinates) or "Relative" (drag by offset), then specify `dragTargetX`/`dragTargetY`. Use `clickKind: "Move"` to position cursor without clicking. `createVirtualClickAtFoundImage` works similarly but finds images first - perfect for UI elements that may move. Ask users to run `getMousePosition(true)` to discover current coordinates.

---

### 8  Reference Snippet Library (copy‑ready)

```ts
/** Activate Safari, wait half a second, then hit Cmd+L */
import {
  createVirtualActivate,
  createVirtualPause,
  createVirtualTypeKeystroke,
  runVirtualMacro,
} from "kmjs";

const actions = [
  createVirtualActivate({ application: "Safari" }),
  createVirtualPause({ time: 0.5 }),
  createVirtualTypeKeystroke({ keystroke: "Cmd+L" }),
];

runVirtualMacro(actions, "Focus URL Bar");
```

---

## 9  Further Resources

- API docs live in the published TypeScript types – import any helper and **hover** for full JSDoc.
- GitHub repo: [https://github.com/BlondeLegion/kmjs](https://github.com/BlondeLegion/kmjs) (for examples – _do not_ modify kmjs source here).

---

**Happy automating!**  Copilot, keep code concise, type‑safe, and free of raw XML.
