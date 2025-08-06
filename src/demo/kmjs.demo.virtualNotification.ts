#!/usr/bin/env ts-node

//FILE: src/demo/kmjs.demo.virtualNotification.ts

/**
 * Demo: runs a single virtual Notification action in Keyboard Maestro.
 * Usage: npx ts-node src/virtual_macros/demo/kmjs.demo.virtualNotification.ts
 */
import { createVirtualNotification } from "../virtual_actions/kmjs.virtualAction.notification";
import { createVirtualPause } from "../virtual_actions/kmjs.virtualAction.pause";
import { runVirtualMacro } from "../kmjs.runVirtualMacro";

const CUSTOM_SOUND_PATH = process.argv[2];
if (!CUSTOM_SOUND_PATH) {
  console.error(
    "Error: Please provide a custom sound file path as the first argument.",
  );
  process.exit(1);
}

async function main() {
  // 1) Default notification (built‑in sound)
  runVirtualMacro(
    [
      // Construct a virtual notification with built-in sound effect parameter of the notification action
      createVirtualNotification({
        title: "KM JS Demo",
        subtitle: "Virtual macro",
        body: "Hello from TypeScript!",
        sound: "Ping",
      }),
      // Add a pause using the virtual pause action
      createVirtualPause({ time: 1 }),
      // Construct a virtual notification with custom sound effect parameter (which in turn adds the virtual PlaySound action)
      createVirtualNotification({
        title: "KM JS Demo",
        subtitle: "Custom sound",
        body: "This uses a custom file path for the sound",
        sound: CUSTOM_SOUND_PATH,
      }),
    ],
    "Notification with pause and custom sound",
  );
}

main().catch(console.error);
