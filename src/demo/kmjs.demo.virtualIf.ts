#!/usr/bin/env ts-node

//FILE: src/demo/kmjs.demo.virtualIf.ts

/**
 * Demo: Showcases the If/Then/Else virtual action.
 * Usage: yarn ts-node src/demo/kmjs.demo.virtualIf.ts
 */
import { createVirtualIf } from "../virtual_actions/kmjs.virtualAction.ifThenElse";
import { createVirtualNotification } from "../virtual_actions/kmjs.virtualAction.notification";
import { createVirtualPlaySound } from "../virtual_actions/kmjs.virtualAction.playSound";
import { runVirtualMacro } from "../kmjs.runVirtualMacro";

async function main() {
  console.log("--- Running Demo 1: Check front application ---");

  // DEMO 1: Check if Finder is the frontmost application.
  const checkFrontAppMacro = [
    createVirtualIf({
      match: "All",
      conditions: [
        {
          ConditionType: "Application",
          ApplicationConditionType: "Active",
          Application: {
            // We can specify by name, bundle ID, or path.
            // Here, we use bundle ID for precision.
            bundleIdentifier: "com.apple.finder",
            name: "Finder",
          },
        },
      ],
      then: [
        createVirtualNotification({
          title: "✅ Condition Met",
          body: "Finder is the frontmost application.",
          sound: "Glass",
        }),
      ],
      else: [
        createVirtualNotification({
          title: "❌ Condition Not Met",
          body: "Finder is NOT the frontmost application.",
          sound: "Basso",
        }),
      ],
    }),
  ];

  runVirtualMacro(checkFrontAppMacro, "Check Front App");

  // A small delay between demos
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("\n--- Running Demo 2: Check for a file and a variable ---");

  // DEMO 2: Check if a file exists at ~/Desktop/test.txt AND
  // a variable named 'MyTestVar' has the value 'Hello'.
  // This uses the 'Any' match type to show the 'else' branch if only one is true.
  const checkFileAndVarMacro = [
    createVirtualIf({
      match: "All", // Both conditions must be true
      conditions: [
        {
          ConditionType: "Path",
          Path: "~/Desktop/test.txt",
          PathConditionType: "FileExists",
        },
        {
          ConditionType: "Variable",
          Variable: "MyTestVar",
          VariableConditionType: "Is",
          VariableValue: "Hello",
        },
      ],
      then: [
        createVirtualNotification({
          title: "✅ All Conditions Met",
          body: '~/Desktop/test.txt exists and MyTestVar is "Hello".',
          sound: "Hero",
        }),
      ],
      else: [
        createVirtualNotification({
          title: "❌ Conditions Not Met",
          body: "Either the file is missing or the variable is wrong (or both).",
          sound: "Sosumi",
        }),
        createVirtualPlaySound({
          path: "/System/Library/Sounds/Submarine.aiff",
        }),
      ],
    }),
  ];

  runVirtualMacro(checkFileAndVarMacro, "Check File and Variable");

  console.log(
    `\nTo test the second demo, you can run the following commands in your terminal:\n` +
      `  touch ~/Desktop/test.txt\n` +
      `  osascript -e 'tell application "Keyboard Maestro Engine" to setvariable "MyTestVar" to "Hello"'\n`,
  );
}

main().catch(console.error);
