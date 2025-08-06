#!/usr/bin/env node

/**
 * Quick Start Example for kmjs
 *
 * This example demonstrates basic kmjs usage without requiring a full Node.js project setup.
 *
 * To use this example:
 * 1. Download kmjs.min.js from: https://raw.githubusercontent.com/BlondeLegion/kmjs/main/bundle/kmjs.min.js
 * 2. Save this file as quick-start.js in the same directory
 * 3. Run: node quick-start.js
 *
 * Requirements:
 * - macOS with Keyboard Maestro installed
 * - Node.js installed
 */

// If you downloaded kmjs.min.js to the same directory:
// const kmjs = require('./kmjs.min.js');

// If you installed via npm/yarn:
const kmjs = require("kmjs");

async function quickStartDemo() {
  console.log("🚀 Starting kmjs Quick Start Demo...");

  // Example 1: Simple notification
  const notificationActions = [
    kmjs.createVirtualNotification({
      title: "kmjs Quick Start",
      body: "Hello from kmjs! 👋",
      sound: "Glass",
    }),
  ];

  await kmjs.runVirtualMacro(notificationActions, "Quick Start Notification");
  console.log("✅ Notification sent!");

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Example 2: Get system information
  console.log("\n📊 System Information:");
  console.log(`Mouse Position: ${kmjs.getMousePosition()}`);
  console.log(`Front App: ${kmjs.getFrontAppInfo().name}`);
  console.log(`System Volume: ${kmjs.getSystemVolume()}%`);

  // Example 3: Simple automation sequence
  const automationActions = [
    kmjs.createVirtualActivate({ application: "TextEdit" }),
    kmjs.createVirtualPause({ time: 0.5 }),
    kmjs.createVirtualTypeKeystroke({
      keystroke:
        "Hello from kmjs automation! 🤖\n\nThis text was typed programmatically.",
    }),
  ];

  await kmjs.runVirtualMacro(automationActions, "Quick Start Automation");
  console.log("✅ Automation sequence completed!");

  console.log(
    "\n🎉 Quick Start Demo finished! Check TextEdit for the typed message.",
  );
}

// Run the demo
quickStartDemo().catch(console.error);
