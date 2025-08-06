#!/usr/bin/env ts-node

//FILE: src/demo/kmjs.demo.virtualScreenCapture.ts

/**
 * Demo: Runs a virtual ScreenCapture action targeting a custom named clipboard (no UID).
 * Usage: npx ts-node src/demo/kmjs.demo.virtualScreenCapture.ts
 */
import { createVirtualScreenCapture } from "../virtual_actions/kmjs.virtualAction.screenCapture";
import { runVirtualMacro } from "../kmjs.runVirtualMacro";

async function main() {
  // Screen capture to a custom named clipboard (no UID)
  const macro = [
    createVirtualScreenCapture({
      screenArea: { type: "ScreenMain" },
      destination: { name: "Clipboard Custom" },
      alwaysNominalResolution: false,
      stopOnFailure: false,
      notifyOnFailure: true,
    }),
  ];

  runVirtualMacro(macro, "ScreenCapture to Named Clipboard (no UID)");
}

main().catch(console.error);
