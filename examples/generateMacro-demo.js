#!/usr/bin/env node

/**
 * Demo script showing how to use the generateMacro function.
 *
 * This example demonstrates all the different ways to use generateMacro:
 * - Generate raw XML
 * - Add plist wrapping
 * - Display in text window
 * - Export to file
 * - Import to KM group
 */

const {
  generateMacro,
  createVirtualNotification,
  createVirtualPause,
  createVirtualComment,
  createVirtualInsertText,
  createVirtualSetVariable,
} = require("../bundle/kmjs.js");

console.log("🚀 generateMacro Demo\n");

// Create some sample virtual actions
const sampleActions = [
  createVirtualComment({
    title: "Demo Macro",
    text: "This macro was generated using the generateMacro function",
  }),
  createVirtualSetVariable({
    variable: "DemoStatus",
    text: "Starting demo...",
    scope: "local",
  }),
  createVirtualNotification({
    title: "Demo Started",
    body: "This is a generated macro demo",
    sound: "Glass",
  }),
  createVirtualPause({ time: 2 }),
  createVirtualInsertText({
    text: "Hello from generateMacro! Status: %Variable%DemoStatus%",
  }),
  createVirtualNotification({
    title: "Demo Complete",
    body: "The generated macro has finished executing",
    sound: "Ping",
  }),
];

console.log("📝 Example 1: Generate raw XML");
console.log("=".repeat(50));
const rawXml = generateMacro(sampleActions);
console.log("Raw XML generated (first 200 chars):");
console.log(rawXml.substring(0, 200) + "...\n");

console.log("📦 Example 2: Generate XML with plist wrapping");
console.log("=".repeat(50));
const wrappedXml = generateMacro(sampleActions, {
  addPlistWrapping: true,
  macroName: "Demo Macro with Plist",
});
console.log("Plist-wrapped XML generated (first 200 chars):");
console.log(wrappedXml.substring(0, 200) + "...\n");

console.log("🖥️  Example 3: Display XML in Keyboard Maestro text window");
console.log("=".repeat(50));
generateMacro(sampleActions, {
  exportTarget: { displayInTextWindow: true },
  macroName: "Display Demo",
});
console.log("XML displayed in KM text window\n");

console.log(
  "💾 Example 4: Export to file (commented out to avoid file creation)",
);
console.log("=".repeat(50));
console.log("// generateMacro(sampleActions, {");
console.log("//   exportTarget: { filePath: './demo-macro.kmmacros' },");
console.log("//   macroName: 'File Export Demo'");
console.log("// });");
console.log("File export example (commented out)\n");

console.log("🎯 Example 5: Import directly to Keyboard Maestro group");
console.log("=".repeat(50));
generateMacro(sampleActions, {
  exportTarget: { toKMGroup: "kmjs-demos" },
  macroName: "generateMacro Demo",
});
console.log("Macro imported to 'kmjs-demos' group in Keyboard Maestro\n");

console.log("🔄 Example 6: Multiple export targets");
console.log("=".repeat(50));
generateMacro(sampleActions, {
  exportTarget: {
    displayInTextWindow: true,
    toKMGroup: "kmjs-demos",
  },
  macroName: "Multi-Export Demo",
});
console.log("Macro displayed in text window AND imported to KM group\n");

console.log("✅ Demo complete!");
console.log("\nCheck your Keyboard Maestro editor for the 'kmjs-demos' group");
console.log(
  "to see the imported macros. You can run them to test the functionality.",
);
