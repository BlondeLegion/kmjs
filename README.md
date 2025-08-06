# kmjs

> **One-liner:** A modern TypeScript toolkit for programmatically automating Keyboard Maestro, enabling powerful macOS automation through robust, type-safe JavaScript.

**kmjs** empowers developers by integrating Keyboard Maestro's extensive macOS automation capabilities into a seamless, code-first workflow. Rather than manually crafting macros in the GUI, kmjs lets you construct, manipulate, and execute sophisticated automation sequences directly within your JavaScript or TypeScript projects.

This toolkit serves as a powerful bridge, leveraging Keyboard Maestro's mature low-level API hooks for precise GUI automation—tasks such as mouse control, window manipulation, and image recognition that are challenging to achieve reliably with JavaScript alone. By abstracting away complexity into clear, self-documenting, strongly-typed functions.

kmjs harnesses the capabilities of [Keyboard Maestro](https://www.keyboardmaestro.com/) to further facilitate:

- **Automated Building and Testing Workflows:**
  Centralize and streamline automated testing by managing all macro logic and JavaScript interactions in one place, eliminating direct manipulation of KM macro files or GUI interfaces.

- **Centralized Interaction Toolkit:**
  Provide a unified, developer-friendly set of JavaScript functions and tools to interact effortlessly with existing Keyboard Maestro workflows, variables, and macros.

- **Automated Macro Generation:**
  Quickly generate complex Keyboard Maestro macros programmatically, facilitating bulk actions, macro templating, and scalable automation setups.

- **Comprehensive KM Documentation:**
  Maintain a centralized, easily-parsable repository of Keyboard Maestro documentation, structured specifically to enable advanced usage by tools like GitHub Copilot, Context7, and various LLM-driven agents. This dramatically improves automation discoverability and development speed.

### ⚠️ Prerequisites

Before you begin, please note that **`kmjs` is a toolkit for interacting with Keyboard Maestro**, not a standalone automation framework.

> You must have a valid, licensed copy of [Keyboard Maestro](https://www.keyboardmaestro.com/) installed on your macOS machine for this toolkit to be functional.

## 🌟 Key Features

- **Type-Safe Virtual Actions**: Programmatically construct any Keyboard Maestro action using a strongly-typed, self-documenting API. Forget manual XML editing.
- **Universal Environment Compatibility**: Built with lazy-loading architecture that works seamlessly across Node.js, CEP (Adobe Creative Suite), Electron, and other JavaScript runtime environments without configuration changes.
- **Real Macro Syncing**: Export your hand-crafted macros from Keyboard Maestro into your project for version control, and import them back with a single command.
- **Ephemeral Macro Execution**: Run complex sequences of actions on the fly without ever saving them to the Keyboard Maestro editor. `kmjs` builds, executes, and cleans up temporary macros for you. Supports both fire-and-forget execution and return value capture for query-style operations.
- **Rich Text Processing**: Includes modern, typed implementations of KMET utilities for XML/JSON conversion and robust tools for handling Keyboard Maestro's `StyledText` (RTF) format.
- **Comprehensive Testing Framework**: Guarantees reliability through exhaustive permutation testing, ensuring every valid combination of action options produces valid, executable XML.

## 🏛️ Architecture Overview

`kmjs` is built on a modular architecture that separates concerns between generating virtual actions and managing real macros.

```
src/
├── virtual_actions/          # Factories for creating virtual action XML (e.g., createVirtualNotification)
│   └── types/                # TypeScript types for all actions, conditions, and options
├── queries/                  # Synchronous query helpers for KM tokens and system info
│   ├── index.ts              # Barrel file for all query helpers
│   ├── kmjs.query.*.ts       # Individual query helper files (e.g., getMousePosition, getScreenResolution, etc.)
│   └── kmjs.query.cli.ts     # CLI utility for running queries from the command line
├── utils/                    # Core utilities for XML, text processing, KM interfacing, etc.
├── tokens/                   # A fully-documented dictionary of all KM text tokens
│   └── data/                 # Token mapping files and raw text files of token names / strings
├── macros/                   # Your local library of version-controlled .kmmacros files
├── demo/                     # Example/demo virtual macros and actions
├── kmjs.runMacro.ts          # Utility for running real macros by name/UUID
├── kmjs.runVirtualMacro.ts   # Utility for running ephemeral virtual macros
├── kmjs.kmvar.ts             # Helper for reading/writing KM variables
└── ...                       # Other core scripts and modules
```

## 🛡️ Important: Backup Your Macros

**Before using kmjs, especially the macro import/export features, create a backup of your Keyboard Maestro macros:**

1. **In Keyboard Maestro Editor**: File → Export → Export Macros...
2. **Save to a safe location** (e.g., `~/Desktop/KM_Backup_YYYY-MM-DD.kmmacros`)
3. **Consider version control** for your macro library using the `scripts/export-kmjs-macros.js` utility

> **Why backup?** While kmjs is designed to be safe, macro import operations can overwrite existing macros. Having a backup ensures you can always restore your automation setup if needed.

## Installation

### Option 1: Package Manager (Recommended)

```bash
yarn add kmjs
# or
npm install kmjs
```

### Option 2: Direct Download (No Build Required)

For users who want to quickly try kmjs without setting up a Node.js project:

1. **Download pre-built files** from the [GitHub repository](https://github.com/BlondeLegion/kmjs):
   - [`bundle/kmjs.js`](https://raw.githubusercontent.com/BlondeLegion/kmjs/main/bundle/kmjs.js) - Full version with source maps
   - [`bundle/kmjs.min.js`](https://raw.githubusercontent.com/BlondeLegion/kmjs/main/bundle/kmjs.min.js) - Minified version (← for dead-simple installation, you can copy and paste this into an existing script to allow it to use kmjs)

2. **Use in Node.js scripts**:

   ```javascript
   // Save as test-kmjs.js
   const kmjs = require("./kmjs.min.js");

   const actions = [
     kmjs.createVirtualNotification({
       title: "Hello from kmjs!",
       body: "Direct download working!",
     }),
   ];

   kmjs.runVirtualMacro(actions, "Test Macro");
   ```

3. **Run with Node.js**:

   ```bash
   node test-kmjs.js
   ```

4. **Or try the complete example**:
   - Download [`examples/quick-start.js`](https://raw.githubusercontent.com/BlondeLegion/kmjs/main/examples/quick-start.js) for a full demo with system queries and automation sequences

### Option 3: Install from Tarball

For users who want the complete package without using npm/yarn:

1. **Download the tarball**:
   - [`kmjs-1.0.0.tgz`](https://raw.githubusercontent.com/BlondeLegion/kmjs/main/kmjs-1.0.0.tgz) - Complete npm package

2. **Install locally**:

   ```bash
   # Extract and install
   tar -xzf kmjs-1.0.0.tgz
   cd package

   # Use in your project
   npm install /path/to/package
   # or
   yarn add file:/path/to/package
   ```

3. **Or install directly from tarball**:
   ```bash
   npm install kmjs-1.0.0.tgz
   # or
   yarn add ./kmjs-1.0.0.tgz
   ```

### Option 4: Clone and Build

For development or contributing:

```bash
git clone https://github.com/BlondeLegion/kmjs.git
cd kmjs
yarn install
yarn build:release  # Builds dist/, bundle/, and tarball
```

> **Note**: The pre-built files (`bundle/`, `examples/`, and `kmjs-1.0.0.tgz`) are automatically updated and included in the repository for easy access.

## Quick Start

```typescript
import {
  runVirtualMacro,
  createVirtualNotification,
  createVirtualTypeKeystroke,
} from "kmjs";

// Create actions
const actions = [
  createVirtualNotification({
    title: "Hello from kmjs!",
    body: "Automation started",
  }),
  createVirtualTypeKeystroke({ keystroke: "Hello, World!" }),
];

// Execute as ephemeral macro
runVirtualMacro(actions, "My First Automation");
```

### Using kmjs in Other Projects

#### Option 1: Local Package Linking (Recommended for Development)

Use `yarn link` to make `kmjs` available as a local package in other projects:

```bash
# In your kmjs directory
yarn build
yarn link

# In your other project directory
yarn link "kmjs"
```

Now you can import and use `kmjs` in your other projects:

```typescript
import {
  runVirtualMacro,
  createVirtualNotification,
  createVirtualTypeKeystroke,
  KM_TOKENS,
} from "kmjs";

const actions = [
  createVirtualNotification({
    title: "Hello from another project!",
    body: `Current app: ${KM_TOKENS.FrontApplicationName}`,
  }),
  createVirtualTypeKeystroke({
    keystroke: "Hello, World!",
  }),
];

runVirtualMacro(actions, "Cross-Project Macro");
```

#### Option 2: Single-File Bundle

For simple use cases where you want a single JavaScript file to copy-paste:

```bash
# Generate both regular and minified bundles
yarn bundle
```

This creates:

- `bundle/kmjs.js` - Regular bundle with source maps
- `bundle/kmjs.min.js` - Minified bundle for production

You can copy either file into any Node.js project and use it directly:

```javascript
const { createVirtualNotification, runVirtualMacro } = require("./kmjs.js");

// Use kmjs functions directly
const actions = [createVirtualNotification({ title: "Bundled kmjs!" })];
runVirtualMacro(actions, "Bundled Macro");
```

### Basic Usage: Running a Virtual Macro

Create and execute a macro in just a few lines of code. This example creates a notification, pauses for a second, and shows another. The macro runs immediately but is never saved in your Keyboard Maestro library.

```typescript
import {
  createVirtualNotification,
  createVirtualPause,
  runVirtualMacro,
} from "kmjs";

// 1. Define your sequence of virtual actions
const actions = [
  createVirtualNotification({
    title: "Hello from kmjs!",
    body: "This is a virtual macro.",
    sound: "Glass",
  }),
  createVirtualPause({ time: 1 }), // Pause for 1 second
  createVirtualNotification({
    title: "Still here!",
    body: "The virtual macro has finished.",
    sound: "Ping",
  }),
];

// 2. Run the sequence as an ephemeral macro
runVirtualMacro(actions, "My First Virtual Macro");

// Or capture a return value from a macro with a Return action
const result = runVirtualMacro([], "Query Macro", "%CurrentMouse%", true);
console.log(`Mouse position: ${result}`); // "123,456"
```

### Generating Macros for Export and Development

The `generateMacro` function provides flexible options for generating Keyboard Maestro XML from virtual actions without immediately executing them. This is ideal for macro development, debugging, caching, and batch processing workflows.

```typescript
import {
  generateMacro,
  createVirtualNotification,
  createVirtualPause,
} from "kmjs";

const actions = [
  createVirtualNotification({
    title: "Generated Macro",
    body: "Hello from generateMacro!",
  }),
  createVirtualPause({ time: 1 }),
];

// Generate raw XML
const xml = generateMacro(actions);

// Export to .kmmacros file with plist wrapping
generateMacro(actions, {
  addPlistWrapping: true,
  exportTarget: { filePath: "./my-macro.kmmacros" },
  macroName: "My Generated Macro",
});

// Import directly to Keyboard Maestro group
generateMacro(actions, {
  exportTarget: { toKMGroup: "Generated Macros" },
  macroName: "Auto Generated Macro",
});

// Display XML in direclty in a Keyboard Maestro 'display text' window for convenience
generateMacro(actions, {
  exportTarget: { displayInTextWindow: true },
});

// Multiple export targets simultaneously if desired
generateMacro(actions, {
  exportTarget: {
    displayInTextWindow: true,
    filePath: "./backup.kmmacros",
    toKMGroup: "Development",
  },
  macroName: "Multi-Export Demo",
});
```

## 📦 Core Concepts & Usage

### 🔮 Virtual Macros & Actions

Virtual actions are the heart of `kmjs`. They are functions that generate the raw XML for Keyboard Maestro actions, allowing you to build complex macros programmatically.

- **Discoverable API**: Every action and its options are strongly typed, giving you autocompletion and inline documentation.
- **Composable**: Combine simple actions to create complex, conditional workflows.
- **Ephemeral**: `runVirtualMacro` executes your action array as a temporary macro that is instantly created and destroyed, leaving your KM editor clean.

```typescript
import {
  createVirtualIf,
  createVirtualSetVariable,
  createVirtualTypeKeystroke,
  KM_TOKENS, // Access built-in KM tokens
} from "kmjs";

// Example: Set a variable and type a message if a condition is met
const setVar = createVirtualSetVariable({
  variable: "MyStatus",
  text: "Ready",
  scope: "local",
});

const typeMessage = createVirtualTypeKeystroke({
  keystroke: "Process complete. Status: %Variable%MyStatus%",
});

const conditionalAction = createVirtualIf({
  conditions: [
    {
      ConditionType: "Variable",
      Variable: "MyStatus",
      VariableConditionType: "Is",
      VariableValue: "Ready",
    },
  ],
  then: [typeMessage],
});

runVirtualMacro([setVar, conditionalAction]);
```

## ✨ Convenience Additions

While `kmjs` aims for faithful XML generation, it is not strictly a 1-to-1 recreation of the Keyboard Maestro interface. Liberties are taken to provide a more ergonomic and powerful developer experience. Some virtual actions are composites that abstract away multi-step processes into a single function call.

A prime example is `createVirtualTypeKeystroke`. In Keyboard Maestro, holding a key for a duration requires three separate actions: `Press and Hold`, `Pause`, and `Release`. This is necessary for some applications which are set to ignore synethically created inputs, which this sequence in KM circumvents. `kmjs` simplifies this into one call:

```typescript
// This single function call...
const holdKeyAction = createVirtualTypeKeystroke({
  keystroke: "A",
  holdTime: 0.5, // Hold the 'A' key for half a second
});

// ...generates the XML for all three underlying actions automatically.
runVirtualMacro([holdKeyAction]);
```

These conveniences are designed to make scripting complex interactions more intuitive, letting you focus on your automation logic instead of Keyboard Maestro's implementation details.

### 🔄 Syncing Real Macros

If you prefer to build and manage your macros in the Keyboard Maestro editor, `kmjs` helps you keep them under version control with simple import/export commands.

- **Export**: Pulls your macros from the `kmjs` macro group in Keyboard Maestro and saves them as `.kmmacros` files in `src/macros/`.
- **Import**: Deletes the existing macros in the `kmjs` group and replaces them with the versions from your `src/macros/` folder. This ensures UUIDs remain consistent.

```bash
# Export all macros from the "kmjs" group in KM to your local project
yarn macros:export

# After making changes or pulling from git, import them back into KM
yarn macros:import
```

### 📝 Text Processing: KMET Utilities

Inspired by Dan Thomas's brilliant "KMET: Edit KM Objects as Text" macro suite, `kmjs` provides a set of powerful, type-safe utilities for programmatic text manipulation. While the original KMET focused on a copy/edit/paste workflow as keyboard maestro macros, `kmjs` adapts this power for a code-first environment.

- **XML ⇄ JSON Conversion**: At its core is the ability to losslessly convert Keyboard Maestro's verbose plist XML into a clean, easily parsable JSON format and back again. This is invaluable for inspecting, modifying, or generating complex actions programmatically.
- **Safe Search & Replace**: Perform literal or regex-based search-and-replace operations on the raw XML or JSON text. This is perfect for bulk-renaming variables or refactoring text across multiple actions without breaking the underlying structure.
- **Text Encoding**: Includes helpers to safely escape text for embedding within JSON strings or XML nodes, preventing syntax errors.

```typescript
import { xmlToJson, jsonToXml, searchReplaceInText } from "kmjs";

// Convert a complex action to JSON to easily inspect or modify it
const actionJson = xmlToJson(actionXmlString);

// Programmatically modify the object...
const modifiedObject = JSON.parse(actionJson);
modifiedObject.dict.string[1] = "New Value"; // Example modification

// Convert it back to valid KM XML
const newActionXml = jsonToXml(modifiedObject);

// Or, perform a simple bulk rename
const refactoredXml = searchReplaceInText(
  actionXmlString,
  "Old_Variable_Name",
  "New_Variable_Name",
  { literal: true },
);
```

### ✨ Text Processing: StyledText Handling

Keyboard Maestro actions like "Display Text in Window" and "Comment" use a `StyledText` field to store rich text (RTF) content, which is Base64-encoded within the macro's XML. Manipulating this data is notoriously difficult.

Based on the foundational research by the late JMichaelTX of the Keyboard Maestro forums, `kmjs` provides a complete toolset for handling this format.

- **Decode & Encode**: `decodeStyledTextData` converts the Base64 blob into human-readable RTF and a plain-text representation. `encodeStyledTextData` performs the reverse operation.
- **Update In-Place**: The `updateStyledTextInXml` function is a high-level utility that handles the entire decode-transform-reencode cycle. You provide a function to modify the RTF content, and it automatically updates both the `<StyledText>` data blob and the plain `<Text>` string in the XML, keeping them in sync. This is the recommended way to safely change text (like variable names) within a rich text field without corrupting the formatting.

```typescript
import { updateStyledTextInXml } from "kmjs";

// Assume `styledActionXml` is the XML of an action with styled text.
// This will safely find "Local_Var", replace it with "Global_Var",
// and then update both the RTF data and plain text fields.
const updatedActionXml = updateStyledTextInXml(styledActionXml, (rtf) =>
  rtf.replace("Local_Var", "Global_Var"),
);
```

## 📖 Keyboard Maestro Tokens

Access every Keyboard Maestro text token with full type-safety and inline documentation directly in your editor. The `tokens` module provides a comprehensive, programmatically-accessible dictionary of all available tokens and a utility to translate between different token formats. This eliminates the need to memorize token syntax and provides instant context for what each token does.

#### The `KM_TOKENS` Constant

The `KM_TOKENS` object contains every token, keyed by a developer-friendly `PascalCase` name. Each token includes detailed JSDoc documentation sourced directly from the Keyboard Maestro documentation (also included), giving you rich intellisense and context on its purpose and usage.

```typescript
import { KM_TOKENS, createVirtualNotification } from "kmjs";

// Access a token by its PascalCase name.
// Hover over 'ARandomUniqueID' in a supported IDE to see its documentation.
const uuidToken = KM_TOKENS.ARandomUniqueID; // Evaluates to "%RandomUUID%"

// Use tokens directly within virtual actions for dynamic text.
const notification = createVirtualNotification({
  title: "New Item Created",
  body: `The new item ID is: ${uuidToken}`,
  sound: "Ping",
});
```

#### The `lookupKMToken` Utility

For more dynamic scenarios, the `lookupKMToken` function allows you to translate between a token's different representations: its human-readable name, its `PascalCase` key, and its raw token string. This is especially useful for building user interfaces or processing text that contains token names.

```typescript
import { lookupKMToken } from "kmjs";

// Look up a token by its raw string to get its other forms
const info = lookupKMToken("%RandomUUID%");
// -> { human: 'A Random Unique ID', pascal: 'ARandomUniqueID' }

// Look up by human-readable name and get a specific format back
const pascalCaseName = lookupKMToken("A Random Unique ID", "pascal");
// -> 'ARandomUniqueID'

// Look up by PascalCase name and get the raw token string
const rawToken = lookupKMToken("ARandomUniqueID", "token");
// -> '%RandomUUID%'
```

This feature set makes working with Keyboard Maestro tokens more reliable, discoverable, and integrated into a modern development workflow.

## ⌨️ Keystroke & Shortcut Normalization

A significant challenge in macOS automation is the lack of a standardized, well-documented system for key codes and modifier masks for AppleScript and other automation layers. `kmjs` solves this with a robust and flexible shortcut normalization module. It provides a reliable bridge between human-readable shortcuts, JavaScript `event.code` standards, and the specific formats required by Keyboard Maestro and AppleScript.

This module is essential for any virtual action that simulates keyboard input, such as `createVirtualTypeKeystroke`, ensuring that any valid shortcut format is correctly translated.

#### The `normalizeAppleScriptShortcut` Gateway

The main entry point to this module is the `normalizeAppleScriptShortcut` function. It's designed to be a versatile "one-stop-shop" that accepts a shortcut in virtually any common format and returns a standardized AppleScript-compatible map.

**Accepted Input Formats:**

- **Human-Readable String**: Common shortcuts like `"Cmd+Shift+S"`.
- **JavaScript `event.code` String**: Web-standard codes like `"KeyS"` or `"Digit1"`.
- **Raw Numeric Key Code**: A number representing an AppleScript key code, like `36` for the Return key.
- **AppleScript Map**: An existing map object like `{ 256: 1 }` (Cmd+S), which is passed through unmodified.

**Output Format:**

The function always returns an object with a single key-value pair: `{ <modifierMask>: <keyCode> }`. The modifier mask is an integer representing the combination of pressed modifier keys, and the key code is the integer for the non-modifier key.

```typescript
import { normalizeAppleScriptShortcut } from "kmjs";

// From a human-readable string
const shortcut1 = normalizeAppleScriptShortcut("Cmd+Option+S");
// -> { 2304: 1 }

// From a JavaScript event.code
const shortcut2 = normalizeAppleScriptShortcut("KeyS");
// -> { 0: 1 } (0 mask means no modifiers)

// From a raw numeric key code (e.g., Return key)
const shortcut3 = normalizeAppleScriptShortcut(36);
// -> { 0: 36 }

// It even handles modifier-only combinations
const shortcut4 = normalizeAppleScriptShortcut("Cmd+Shift");
// -> { 768: null }
```

#### Key Features

- **Format Flexibility**: Seamlessly handles multiple shortcut formats, making it easy to integrate into any control flow.
- **Comprehensive Modifier Aliases**: Understands a wide range of aliases, including `Command`, `Opt`, `Alt`, `Ctrl`, and even Windows-style names like `Win`, making it friendly to re-use existing key-handling code from cross-platform projects.
- **Canonical Ordering**: Automatically sorts modifiers into the standard macOS order (`Cmd` → `Option` → `Shift` → `Control`), ensuring consistent output.
- **Underlying Data**: The core logic in `utils.keystroke.ts` is powered by detailed static maps in `utils.keystroke.mapping.ts`, which separates the logic from the data and makes the system easy to extend.

## 🔄 Interacting with Existing Macros

While `kmjs` excels at creating virtual macros, it also provides a robust bridge to interact with the macros you've already built and perfected within the Keyboard Maestro editor. This allows you to use your existing Keyboard Maestro macro suite easily in JavaScript projects.

#### Manipulating Keyboard Maestro Variables (`kmvar`)

The `kmvar` module provides a simple and direct way to seamlessly get and set Keyboard Maestro variables from within your JavaScript code. This is the primary mechanism for passing data and state between your application and your macros. It fully supports all variable scopes:

- **Global**: Standard variables accessible everywhere.
- **Local**: Variables prefixed with `LOCAL` that are specific to a single macro execution instance.
- **Instance**: Variables prefixed with `INSTANCE` that are also specific to a single macro execution instance.

```typescript
import { kmvar } from "kmjs";

// Set and get a global variable
kmvar.set("UserPreference", "DarkMode");
const theme = kmvar.get("UserPreference"); // Returns "DarkMode"

// The module also provides a convenient shorthand function
kmvar("Counter", 10); // Sets the variable
const count = kmvar("Counter"); // Gets the variable, returns "10"

// Accessing LOCAL or INSTANCE variables is as simple as prefixing the name.
// Note: This requires the KMINSTANCE environment variable to be set by the parent macro that executes your script.
const localStatus = kmvar.get("LOCALStatus");
```

#### Executing Macros and Passing Data (`runMacro`)

The `runMacro` function is a robust and reliable way to trigger any existing Keyboard Maestro macro by its name or UUID. Its key strength lies in its ability to pass complex JavaScript objects as parameters and receive a string result back, handling all the necessary JSON stringification and shell escaping automatically.

This turns your Keyboard Maestro macros into callable functions for your Node.js application.

```typescript
import { runMacro } from "kmjs";

// Define a complex object to send to your macro
const userData = {
  userId: 123,
  project: "kmjs-docs",
  settings: { notifications: true, theme: "dark" },
};

// Execute a macro by its UUID and pass the object as a parameter.
// kmjs handles the conversion to a JSON string and all necessary escaping.
const result = runMacro({
  macroId: "YOUR-MACRO-UUID-HERE",
  parameter: userData,
});

console.log(`Macro returned: ${result}`);

// Inside your Keyboard Maestro macro, you can access this data
// via the %TriggerValue% token and parse it using a "Variable Set to JSON" action.
// To send a value back, use the "Return from Macro" action.
```

## 🔍 Query helpers – read-only system information

`kmjs` provides quick access to Keyboard Maestro's _text tokens_ as small, synchronous functions by wrapping the necessary virtual macro generation boilerplate. The result is even-faster access to values that would otherwise require incredibly involved system-level APIs.

Each helper runs a tiny virtual macro in memory, reads the requested value using KM's text tokens, and then returns. Nothing is written to the clipboard, no variables are changed, and the Keyboard Maestro editor stays untouched.

### Why this matters

- **No side-effects** – ideal for status checks or branching logic inside virtual macros.
- **Typed results** – every helper returns a well-defined object or primitive, so TypeScript can catch mistakes at compile time.
- **CLI friendly** – each file can be invoked from the command line for quick diagnostics.

### Helper overview

The following are the currently built-in queries:

| Function                                           | What it returns (examples)                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `getMousePosition()`                               | `"1234,876"` or `[1234, 876]`                                                         |
| `getFrontAppInfo()`                                | `{ name: "Safari", bundleId: "com.apple.Safari", … }`                                 |
| `getFrontWindowInfo()`                             | `{ name: "Downloads", frame: { x:0, y:23, width:1512, height:982 } }`                 |
| `getScreenFrames()`                                | array of window-server frame objects                                                  |
| `getScreenResolution()`                            | resolution record(s) with nominal & pixel sizes                                       |
| `getRunningApps()`                                 | array of process names                                                                |
| `getSystemVolume()`                                | number `0-100`                                                                        |
| `getNetworkInfo()`                                 | `{ location: "Automatic", wirelessNames: ["Home-Wi-Fi"], ipAddress: "192.168.1.10" }` |
| `getAudioDevices()`                                | current Core Audio input/output/effects devices                                       |
| `getKeyboardLayout()`                              | active input-source name                                                              |
| `getCurrentTrackInfo()`                            | Music/iTunes track metadata and player state                                          |
| `getSystemClipboard()` / `getPastClipboard(index)` | clipboard contents                                                                    |
| `getUserInfo()`                                    | `{ name: "Alice Example", loginId: "alice", home: "/Users/alice" }`                   |
| `getSystemVersion()`                               | `{ short: "14.3", long: "macOS Sonoma 14.3 (23D56)" }`                                |

### Example

```ts
import { runQuery } from "kmjs";

const { ipAddress } = runQuery.getNetworkInfo();
const { musicPlayerState } = runQuery.getCurrentTrackInfo();

console.log(`IP: ${ipAddress} – Music app is ${musicPlayerState}.`);
```

All helpers are re-exported individually, so you can also import only what you need:

```ts
import { getMousePosition } from "kmjs/queries";

// Default (no argument, to mirror KM's behaviour): returns a comma-separated string
const positionString = getMousePosition();
// e.g. "1234,876"

// Pass `true`: returns a numeric [x, y] tuple
const [x, y] = getMousePosition(true);
```

### CLI Usage for Development

During development, each query function can be invoked directly from the command line for quick diagnostics:

```bash
# Run any query function with arguments
ts-node src/queries/kmjs.query.getMousePosition.ts
ts-node src/queries/kmjs.query.getFrontAppInfo.ts
ts-node src/queries/kmjs.query.getSystemVolume.ts

# Or use the generic CLI utility
ts-node src/queries/kmjs.query.cli.ts getMousePosition true
ts-node src/queries/kmjs.query.cli.ts getSystemVolume
```

**Note**: CLI functionality is only available when working with the source code directly (e.g., during development or when cloning the repository). When `kmjs` is installed as a dependency in another project, the CLI files are included but demo files are excluded from the published package to prevent browser bundling issues.

### Browser Compatibility

`kmjs` is designed for Node.js environments and uses Node.js-specific modules like `child_process`, `fs`, and `os`. If you're using a bundler like Vite, Webpack, or Rollup that tries to bundle `kmjs` for browser use, you may encounter externalization warnings.

This is expected behavior since `kmjs` requires Keyboard Maestro and macOS system access. The warnings can be safely ignored, or you can configure your bundler to exclude `kmjs` from browser bundles if needed.

**Note**: Thanks to `kmjs`'s lazy loading architecture, the package will import successfully in browser environments - it will only throw runtime errors when you actually attempt to execute automation functions that require Node.js APIs. This makes it safe to include in universal/isomorphic codebases where the automation features are only used server-side.

## 🛠️ Available Scripts

### Development & Building

- `yarn build`: Compile TypeScript to JavaScript in the `dist/` folder.
- `yarn dev`: Run the project's main entry point using `ts-node`.
- `yarn lint`: Check for code style issues with ESLint.
- `yarn format`: Automatically format code with Prettier.

### Testing

The test suite is the backbone of `kmjs`, ensuring all generated XML is valid. Virtual actions are generated, imported into Keyboard Maestro, extracted, and compared against the original XML specification to ensure authenticity.

- `yarn test`: Run all unit and integration tests.
- `yarn test:coverage`: Run all tests and generate a code coverage report.
- `yarn test:integration`: Run only the integration tests, which interact directly with Keyboard Maestro.
- `yarn test:integration:<ActionName>`: Run integration tests for a specific action (e.g., `yarn test:integration:notification`).

### Macro Management

- `yarn macros:export`: Export macros from the `kmjs` group in Keyboard Maestro to `src/macros/`.
- `yarn macros:import`: Import macros from `src/macros/` into Keyboard Maestro.

### Utilities

- `yarn tree`: Display the project's folder structure.
- `yarn show:last-failure`: Display the XML and error logs from the last failed integration test.
- `yarn test:generate-test-schema`: Regenerate the JSON schema used for permutation testing.

## 🧪 Testing Philosophy: Reliability

`kmjs` is built on a foundation of **exhaustive permutation testing**. Instead of writing a few static tests for each action, we programmatically generate hundreds or thousands of test cases that cover every possible combination of an action's possible configurations. This ensures that every feature is robust and that our generated XML is 100% compatible with Keyboard Maestro.

Each permutation is subjected to a rigorous, automated round-trip validation pipeline that proves the generated XML is fully understood by the live Keyboard Maestro engine.

### From Virtual Action to Validated XML: The `kmjs` Testing Pipeline

The reliability of `kmjs` hinges on this sophisticated validation process. Here's how it works from start to finish:

1.  **Generate Action XML**: The process starts with a `VirtualAction` object created by a function like `createVirtualNotification`. Its `.toXml()` method is called to produce an XML `<dict>` fragment for that single action.

2.  **Build a Complete Macro**: To make this fragment executable, a helper function like `wrapAsKMMacros` (from `src/utils/km.interface.ts`) wraps the action XML in the necessary parent `plist` structure. This transforms it into the complete content of a valid `.kmmacros` file, ready for import.

3.  **Live Import**: The integration test suite, orchestrated by `createIntegrationTestSuite` (in `tests/integration/utils/integration-test-framework.ts`), takes this `.kmmacros` content. Using the `importPlistString` function, it executes an AppleScript command to import it directly into a special `kmjs-test` macro group within the live Keyboard Maestro application.

4.  **Retrieve and Verify**: Immediately after import, the test runner executes another AppleScript/JXA command (`importAndRetrieveActionXml`) to read the action's XML directly back from Keyboard Maestro's internal database. This retrieved XML represents what Keyboard Maestro _actually_ understood the action to be.

5.  **Normalize and Compare**: Both the originally generated XML and the retrieved XML are normalized to remove volatile data that Keyboard Maestro changes on every import (like the `ActionUID`). The two XML strings are then compared. If they are not identical, the test fails, instantly flagging an incompatibility.

6.  **Monitor and Cleanup**: Throughout this entire process, the test runner watches the Keyboard Maestro Engine Log for any errors. After the comparison, the temporary macro is automatically deleted, ensuring the test environment remains pristine.

This end-to-end process provides the highest possible confidence that `kmjs` is generating perfect, executable XML that is fully compliant with Keyboard Maestro's real-world expectations.

## 🎨 Available Virtual Actions

`kmjs` provides a growing library of virtual actions to virtually construct their in-GUI-counterparts. See the `src/virtual_actions/` directory for the full list and their options.

| Category               | Actions                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI & Notifications** | `createVirtualNotification`, `createVirtualShowStatusMenu`, `createVirtualDisplayText`                                                       |
| **Data & Variables**   | `createVirtualSetVariable`, `createVirtualUseVariable`                                                                                       |
| **Control Flow**       | `createVirtualIf`, `createVirtualSwitchCase`, `createVirtualReturn`, `createVirtualCancel`, `createVirtualPause`                             |
| **Loop Control**       | `createVirtualBreakFromLoop`, `createVirtualContinueLoop`, `createVirtualRetryThisLoop`                                                      |
| **Input Simulation**   | `createVirtualTypeKeystroke`, `createVirtualMoveAndClick`, `createVirtualClickAtFoundImage`                                                  |
| **System & Apps**      | `createVirtualActivate`, `createVirtualQuit`, `createVirtualManipulateWindow`, `createVirtualSelectMenuItem`, `createVirtualShowSpecificApp` |
| **Files & Media**      | `createVirtualFile`, `createVirtualScreenCapture`, `createVirtualPlaySound`, `createVirtualInsertText`                                       |

## 🚀 Lazy Loading Architecture

`kmjs` is built with a **lazy loading architecture** that provides significant advantages over traditional static imports:

### Universal Runtime Compatibility

Unlike many Node.js packages that fail in specialized JavaScript environments, `kmjs` works seamlessly across:

- **Standard Node.js** environments
- **Adobe CEP** (Creative Suite Extensions) environments (for automated testing)
- **Electron** applications
- **Bundled environments** (Webpack, Vite, Rollup)
- **Embedded JavaScript** runtimes

### How It Works

Instead of importing Node.js modules like `child_process`, `fs`, and `os` at the top level, `kmjs` uses **lazy imports** that only load these modules when actually needed:

```typescript
// ❌ Traditional approach (fails in many environments)
import { spawnSync } from "child_process";

// ✅ kmjs lazy loading approach
function getSafeSpawnSync() {
  // Try normal require first
  let spawnSync = require?.("child_process")?.spawnSync;

  // Fallback for bundled environments
  if (!spawnSync && typeof globalThis !== "undefined") {
    spawnSync = globalThis.__cgNodeRequire?.("child_process")?.spawnSync;
  }

  return spawnSync;
}
```

### Key Benefits

- **Zero Configuration**: Works out-of-the-box in any JavaScript environment without bundler configuration
- **Smaller Bundle Size**: Only loads Node.js modules when actually executing automation (not during import)
- **Better Error Handling**: Provides clear, actionable error messages when Node.js APIs aren't available
- **Future-Proof**: Automatically adapts to new JavaScript runtime environments
- **Development Friendly**: No need to configure external dependencies or modify build processes

### CEP Environment Support

For Adobe Creative Suite developers, `kmjs` automatically detects and uses the real Node.js APIs even when bundlers replace them with stubs. Simply expose the real `require` function:

```javascript
// In your CEP host environment
if (typeof globalThis !== "undefined") {
  globalThis.__cgNodeRequire = require;
}
```

This architecture makes `kmjs` one of the most portable automation libraries available for JavaScript environments.

## 🤝 Contributing

Contributions are welcome! Please follow this workflow to add new features or fix issues.

### Adding a New Virtual Action

1.  **Create the Action File**: Add `src/virtual_actions/kmjs.virtualAction.[YourAction].ts`. Follow the pattern of existing actions, exporting a single creator function.
2.  **Define Types**: Add any necessary types to `src/virtual_actions/types/`. Reuse generic types where possible.
3.  **Generate Permutations**: Create a new file in `tests/integration/fixtures/` to generate all possible option combinations for your new action.
4.  **Write Integration Test**: Add a new spec file in `tests/test_virtual_actions/integration/` that uses your permutation generator to run a full round-trip validation test.
5.  **Add Yarn Script**: Add a new `test:integration:<YourAction>` script to `package.json`.
6.  **Update Exports**: Add your new action to `src/virtual_actions/index.ts`.
7.  **Document**: Ensure your creator function has comprehensive JSDoc explaining its purpose and options.

### Code Standards

- **Type Safety**: All new code must be strongly typed.
- **Documentation**: Use JSDoc for all functions, types, and interfaces.
- **Formatting**: Run `yarn format` before committing.
- **Testing**: All new features must be accompanied by comprehensive tests.
