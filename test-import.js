#!/usr/bin/env node

/**
 * Simple test to verify that generateMacro imports work correctly
 */

const {
  generateMacro,
  createVirtualNotification,
  runMacro,
} = require("./bundle/kmjs.js");

console.log("🧪 Testing generateMacro import functionality\n");

// Create a simple test macro
const testActions = [
  createVirtualNotification({
    title: "Import Test",
    body: "This macro was imported via generateMacro",
    sound: "Basso",
  }),
];

// Import it to a test group
console.log("📥 Importing test macro...");
generateMacro(testActions, {
  exportTarget: { toKMGroup: "generateMacro-test" },
  macroName: "Import Test Macro",
});

console.log("✅ Import completed!");
console.log("\n🚀 Now running the imported macro to verify it works...");

// Try to run the imported macro
try {
  runMacro({
    macroId: "Import Test Macro",
  });
  console.log("✅ Macro executed successfully!");
  console.log("\nThe import functionality is working correctly! 🎉");
} catch (error) {
  console.error("❌ Failed to run imported macro:", error.message);
  console.log("\nThis might indicate an issue with the import structure.");
}

console.log(
  "\nCheck your Keyboard Maestro editor for the 'generateMacro-test' group to see the imported macro.",
);
