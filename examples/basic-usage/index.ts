#!/usr/bin/env ts-node

/**
 * Basic example of using kmjs in another project
 *
 * This demonstrates how to import and use kmjs functions
 * in a separate TypeScript/Node.js project.
 */

import {
  runVirtualMacro,
  createVirtualNotification,
  createVirtualTypeKeystroke,
  createVirtualPause,
  KM_TOKENS,
  kmvar,
  getMousePosition,
  getFrontAppInfo,
} from "kmjs";

console.log("🚀 Running kmjs example...");

// Example 1: Simple notification sequence
const simpleActions = [
  createVirtualNotification({
    title: "Hello from kmjs!",
    body: "This notification was created from another project using kmjs.",
    sound: "Glass",
  }),
  createVirtualPause({ time: 1 }),
  createVirtualNotification({
    title: "Still here!",
    body: "The virtual macro sequence is complete.",
    sound: "Ping",
  }),
];

console.log("Running simple notification sequence...");
runVirtualMacro(simpleActions, "Simple Example Macro");

// Example 2: Using system information and tokens
const systemInfoActions = [
  createVirtualNotification({
    title: "System Information",
    body: `Current app: ${KM_TOKENS.FrontApplicationName}\nTime: ${KM_TOKENS.ICUDateTime}`,
    sound: "Basso",
  }),
];

console.log("Running system info example...");
runVirtualMacro(systemInfoActions, "System Info Example");

// Example 3: Using query helpers
console.log("Getting system information...");
const mousePos = getMousePosition();
const frontApp = getFrontAppInfo();

console.log(`Mouse position: ${mousePos}`);
console.log(`Front app: ${frontApp.name} (${frontApp.bundleId})`);

// Example 4: Working with variables
console.log("Setting and getting KM variables...");
kmvar.set("ExampleVar", "Hello from the example project!");
const varValue = kmvar.get("ExampleVar");
console.log(`Variable value: ${varValue}`);

// Example 5: Type a message with the retrieved information
const typingActions = [
  createVirtualTypeKeystroke({
    keystroke: `Mouse is at: ${mousePos}, Front app: ${frontApp.name}`,
  }),
];

console.log("Running typing example...");
runVirtualMacro(typingActions, "Typing Example");

console.log("✅ All examples completed!");
