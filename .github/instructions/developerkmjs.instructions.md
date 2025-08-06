---
applyTo: "**"
---

# Project Overview

- **kmjs** is a TypeScript/Node.js toolkit for treating Keyboard Maestro macros as code. It enables exporting, importing, and simulating macros in-memory, supporting both real and virtual macro workflows.
- The codebase is modular, with clear separation between real macro management (import/export) and virtual macro/action generation (XML-based, programmatic, ephemeral execution).

## Key Components & Structure

- **scripts/**: Node.js scripts for importing/exporting macros to/from Keyboard Maestro using AppleScript and XML manipulation.
- **src/**: Core TypeScript source. Notable subfolders:
  - `virtual_actions/`: Contains VirtualAction implementations (e.g., notification, playSound, ifThenElse, etc.)
  - `macros/`: Macro XML files for real macro workflows.
  - `utils/`: Utilities for XML, logging, keystroke/mouse handling, and template generation.
  - `demo/`: Example/demo virtual macros and actions.
- **tests/**: Vitest-based suite. Includes integration, unit, and permutation tests for action XML generation and macro workflows.

## Developer Workflows

- **Build**: Standard TypeScript build via `tsc`.
- **Test**: Use `vitest` for all tests. Test commands are defined in `package.json`.
- **Macro Import/Export**: Use `scripts/export-kmjs-macros.js` and `scripts/import-kmjs-macros.js` for real macro workflows. These scripts handle AppleScript calls and XML scaffolding/cleanup.
- **Virtual Macro Execution**: Use `kmjs.runVirtualMacro.ts` to assemble and execute ephemeral macros via JXA, monitoring the Keyboard Maestro engine log for errors.

## Testing with Yarn

- Use the provided yarn scripts to run tests and check code coverage.
- Common commands:
  - Focus on adding / using integration tests similar to the existing ones specific to virtual actions, rather than more general unit tests.
  - DO NOT try and use "yarn test" - you must use the specific test commands for each action to ensure the correct environment and setup sourced in or added to `package.json`.

## Project-Specific Patterns & Conventions

- **VirtualAction Pattern**: All virtual actions implement a common interface and generate valid Keyboard Maestro XML fragments. New actions should follow the structure in `virtual_actions/`.
- **XML Generation**: All macro/action XML must be valid for Keyboard Maestro. Tests verify XML correctness for all permutations.
- **Testing**: Permutation tests ensure all valid/invalid combinations of action options are covered. If a test fails, first check types, then XML generation, then permutation logic.
- **Error Handling**: Virtual macro execution watches the KM engine log and reports errors with clear console output.
- **No Duplicate Macros**: When importing, always delete existing macros by name to avoid UUID mismatches.

## Integration Points

- **Keyboard Maestro**: Integration via AppleScript/JXA for macro import/export and execution.
- **Node.js**: All scripts and utilities are Node.js-based, using TypeScript for type safety and maintainability.

## Examples

- To add a new virtual action: create a new file in `src/virtual_actions/`, implement the VirtualAction interface, and add tests in `tests/test_virtual_actions/`.
- To test macro XML generation: run the Vitest suite and check for XML validity in the output.

# Adding New Virtual Actions: Guidelines and Best Practices

To add new virtual actions to the project (mirroring Keyboard Maestro's real actions), follow these steps to ensure consistency, testability, and maintainability:

## 1. Analyze Existing Patterns

- Review the structure of existing virtual actions in `src/virtual_actions/` (e.g., `kmjs.virtualAction.ifThenElse.ts`).
- Study how each action implements the VirtualAction interface and exposes a single function (e.g., `createVirtualIf`) for XML generation.
- Examine the XML generation logic, especially how templates and indentation are handled for multi-action and nested actions.
- Reference and reuse modular XML template utilities in `src/utils/` where possible.

## 2. XML Generation

- Ensure all generated XML is valid for Keyboard Maestro and follows the formatting/indentation conventions established in the project.
- Use or extend existing XML template helpers for common patterns (e.g., multi-action containers, arrays, dicts).
- If you identify repeated XML patterns across actions, modularize them into reusable template files in `src/utils/`.
- The main function for each action (e.g., `createVirtualIf`) should handle all boilerplate and return a valid XML string for that action.
- Avoid using `xmlLines.push` for XML generation. Instead, use the structured XML formatting we use in other virtual action files.
- Don't use regex for XML generation or editing as much as possible; instead, rely on the XML template utilities in `src/utils/` that ensure valid formatting. Or use the included XML library in the project, or try to determine some other means. Regex is not an optimal solution and you should always try to consider other options; only use regex when handling XML as a last resort.
- Don't build XML as plain objects and then convert to XML. Instead, use the structured XML generation approach we have established that uses strings.
- Virtual action xml formatting: DO NOT USE "xmlLines.push". Instead - use the XML structure /styling / formatting we use in other virtualAction files.

## 3. TypeScript Types

- Define or extend types for new actions in `src/virtual_actions/types/`.
- Ensure all parameters and options are strongly typed and documented.
- Use type hints and JSDoc to clarify the purpose and expected values for each property.
- Whenever editing the types, ensure to use the yarn command `yarn test:generate-test-schema` to update the test schema, otherwise the tests will fail due to schema mismatches.

## 4. Permutation Generation for Testing

- Update or add permutation generators in `tests/integration/utils/` to cover all valid/invalid combinations of action options for the new action.
- Focus on generating a wide range of input parameters to robustly test XML generation, not on hard-coding logic to compensate for XML generation flaws.
- Ensure permutation tests are type-driven and extensible for future actions.
- If a test fails, you can check the generated / failed XML in the `tests/integration/failures` directory, which will contain the XML that failed to validate against the schema.

## 5. Integration Tests

- Add new integration test files in `tests/test_virtual_actions/integration/` for the new action.
- Integration tests should:
  - Use the permutation generator to create test cases.
  - Validate that all generated XML is valid and produces the expected behavior in Keyboard Maestro.
  - Catch edge cases and invalid parameter combinations.

# Debugging Integration Test Failures

- After running any integration test, if a failure occurs, use the following command to instantly display the last failed XML and error log for the relevant action:

  ```sh
  yarn show:last-failure <ActionName>
  ```

  For example:

  ```sh
  yarn show:last-failure ManipulateWindow
  ```

- This should be your standard first step after any test failure to speed up diagnosis and debugging.

Note: we have standard vitest files at the following location that are not integrated with keyboard maestro here:

`tests/test_virtual_actions/kmjs.virtualAction.[ACTION NAME].spec.ts`

We are not going to edit these or add to this set of files specifically until we are near project compelte. Please do not create non-integration vitest files unless very explictly instructed.

## 6. Modularization and Reuse

- When you see repeated XML or logic in what we create, refactor it into reusable modules or template helpers.
- Keep XML template files focused and composable for use across multiple actions.

## 7. Inline Documentation

- For every new function, class, or significant code block, add JSDoc comments explaining its purpose, parameters, and return values.
- Use inline comments to clarify control flow, edge cases, and non-obvious logic.
- Add type hints throughout to make the code self-documenting and accessible to new contributors and LLM agents.
- Always document the intent and reasoning behind changes or additions.

## 8. Do Not Break Existing Functionality

- Ensure all changes are backward compatible and do not break existing tests or formatting.

## 9. Summary Workflow

1. Analyze existing virtual actions and XML patterns.
2. Define/extend types for the new action.
3. Implement the action with a single XML-generating function.
4. Modularize any reusable XML logic.
5. Add/extend permutation generators for robust test coverage.
6. Add integration tests for the new action.
7. Add thorough inline documentation and type hints.
8. Run all tests and verify no regressions.

By following these steps, you will help maintain a robust, extensible, and well-documented codebase for generating and executing virtual Keyboard Maestro actions and macros.

# Creating a New Virtual Action

If you are asked to make a new virtual action, that will entail:

## 1. Main Virtual Action File

Adding a main virtualAction file such as:
`/src/virtual_actions/kmjs.virtualAction.[ACTION NAME HERE].ts`

This file should define:

- The main entry point to generate the XML for that action file, the function to do so, plus the type that defines the options for generating that virtual action
- A type that defines the options for generating that virtual action
- Any extremely specific functionality for that action

Begin by using the included project tree command to get perspective on the current project strucutre. See the `package.json` for the yarn command for this, which is:

`yarn tree:no-sizes` (or `yarn tree` if you want to see file sizes).
This will print the project structure without file sizes, which is useful for understanding where to place new files and how the current project is strucutred without you having to inspect the strucutre manually yourself. This will give you excellent context of where to investigate existing ulities, functions, tests, etc, that are relevant to the new task being set for you. Always run this at the start of a new conversation.

Also ensure to export this from our virtualAction index at `src/virtual_actions/index.ts`

Note: Always refer to the structre, style, XML generation style (i.e strings, not objects and not using "object.push") by examining other existing virtualAction files in this folder before creating or editing a virtualAction. Also try to examine any provided 'ground truth' examples repeatedly when editing or creating XML generation functions.

Also try to ensure indentation aligns with ground truth examples. We also have XML generation helper utilities and formatting utilities in:

`src/utils/utils.xml.ts`

Note: Generic types should be located in the various files in this folder (i.e., most types but EXCLUDING the types for the top-level OPTIONS/PARAMETERS of virtual actions):
`/src/virtual_actions/types`

Note: If you edit or create new types in `/src/virtual_actions/types`, you need to run this yarn command to ensure the permutation generation will use up to date data for testing:

```
yarn test:generate-test-schema
```

Note: Any re-usable functions, generic functions, or template of generic XML that multiple virtual actions rely on should be included in this folder (ideally within existing files in this folder if applicable):
`src/utils`

## 2. Integration Test File

Creating an integration test file for this action in the integration test folder (if it doesn't already exist) such as:
`tests/test_virtual_actions/integration/kmjs.virtualAction.[ACTION NAME HERE].integration.spec.ts`

## 3. Permutations Generator File

A permutations generator file for assistance in producing the integration tests (if it doesn't already exist) such as:
`tests/integration/fixtures/[ACTION NAME HERE].permutations.ts`

## 4. Package.json Test Command

And then we need a yarn command added to our package.json here:
`package.json`

Such as:

```json
"test:integration:[ACTION NAME HERE]": "yarn clear && vitest run --bail=1 --reporter=dot --environment=node tests/test_virtual_actions/integration/kmjs.virtualAction.[ACTION NAME HERE].integration.spec.ts",
```

---

## inclusion: always

# XML Construction Patterns for Virtual Actions

## CRITICAL: XML Construction Style

When implementing virtual actions that generate Keyboard Maestro XML, you MUST follow the string construction pattern used by existing actions like `setVariable`. **DO NOT use array `.push()` style construction.**

### ✅ CORRECT Pattern (String Construction)

```typescript
const xmlLines = [
  "\t<dict>",
  "\t\t<key>Action</key>",
  `\t\t<string>${action}</string>`,
  ...generateActionUIDXml(),
  "\t\t<key>MacroActionType</key>",
  "\t\t<string>ActionType</string>",
  ...(processingMode ? renderProcessingModeXml(processingMode) : []),
  ...(conditionalXml ? [conditionalXml] : []),
  "\t\t<key>Text</key>",
  `\t\t<string>${escapeForXml(text)}</string>`,
  "\t</dict>",
];

return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
```

### ❌ INCORRECT Pattern (Array Push Style)

```typescript
// DO NOT DO THIS
const xmlLines: string[] = [
  "\t<dict>",
  "\t\t<key>Action</key>",
  `\t\t<string>${action}</string>`,
];

xmlLines.push(...generateActionUIDXml());
xmlLines.push("\t\t<key>MacroActionType</key>");
xmlLines.push("\t\t<string>ActionType</string>");

if (processingMode) {
  xmlLines.push(...renderProcessingModeXml(processingMode));
}

xmlLines.push("\t\t<key>Text</key>");
xmlLines.push(`\t\t<string>${escapeForXml(text)}</string>`);
xmlLines.push("\t</dict>");

const xml = xmlLines.join("\n");
```

## Key Principles

1. **Use array literal with spread operators** for conditional XML sections
2. **Build conditional XML strings separately** before including them in the main array
3. **Use ternary operators** with spread syntax for optional sections: `...(condition ? [xmlString] : [])`
4. **Join the array once** at the end on return with `join("\n")` also using our existing formatting function.
5. **Never use `.push()` methods** for building XML - this creates maintenance issues and inconsistency

## Type Organization

- **Action-specific types** (like `InsertTextAction`) should be defined in the action file itself, not in the shared types folder
- **Generic types** (like `ProcessingMode`) should be in the shared types folder and reused across actions
- **Deprecated types** should be marked with `@deprecated` and reference the new unified type

## Processing Mode Unification

All actions that support text processing should use the unified `ProcessingMode` type:

```typescript
export type ProcessingMode = undefined | "TextTokensOnly" | "Nothing";
```

Legacy action-specific processing mode types should be deprecated aliases pointing to `ProcessingMode`.

## Development Guidelines

### Build Process

- **DO NOT attempt to build the project** during development unless explicitly requested by the user
- The project may have temporary build errors during active development
- Focus on implementing functionality and running specific tests rather than full builds
- Use `ts-node` for quick testing of TypeScript functionality when needed

## References

- See `.kiro/steering/kiro-instructions.md` for architectural context and testing philosophy.
- See `scripts/` for real macro workflows, and `src/virtual_actions/` for virtual macro/action logic.
- There are no online resources for referencing keyboard maestro's XML structure / schemas for actions. Do not attempt to search for these, as they do not exist. Instead, refer to the existing actions in the `src/virtual_actions/` directory and the tests for examples of valid XML structures.

---

For any unclear conventions or missing documentation, consult `kmjs.instructions.dev.md`. Do not attenpt to search online, except in the sole scenerio you are looking for general behaviour or information about keyboard maestro itself (which will not contain any information about the XML structure of actions, as that is not documented online).
