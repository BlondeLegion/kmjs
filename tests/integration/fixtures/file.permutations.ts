//FILE: tests/integration/utils/file.permutations.ts

import type { FileOperation } from "../../../src/virtual_actions/types/types.file";
import { type FileActionOptions } from "../../../src/virtual_actions/kmjs.virtualAction.file";

/**
 * Generates permutations for FileActionOptions covering all valid/invalid combinations.
 * Focuses on edge cases, dangerous operations, and canonical XML output.
 */
export function generateFileActionPermutations(): FileActionOptions[] {
  // Use only operations that are actually supported by FileOperation type
  const operations: FileOperation[] = [
    "Reveal",
    "CreateUnique",
    "OnlyMove",
    "OnlyRename",
    "Move",
    "Copy",
    "Duplicate",
    "Trash",
    "Delete",
    "RecursiveDelete",
  ];

  const perms: FileActionOptions[] = [];

  // Generate comprehensive test cases for each operation
  for (const operation of operations) {
    // Minimal case - just operation
    perms.push({ operation });

    // With source
    perms.push({ operation, source: "/tmp/source.txt" });

    // Two-string operations with destination
    if (
      ["CreateUnique", "OnlyMove", "OnlyRename", "Move", "Copy"].includes(
        operation,
      )
    ) {
      perms.push({
        operation,
        source: "/tmp/source.txt",
        destination: "/tmp/dest.txt",
      });

      // CreateUnique with outputPath
      if (operation === "CreateUnique") {
        perms.push({
          operation,
          source: "/tmp/source.txt",
          destination: "/tmp/dest.txt",
          outputPath: "/tmp/output.txt",
        });
      }
    }

    // With stop/notify options
    perms.push({
      operation,
      source: "/tmp/source.txt",
      stopOnFailure: true,
      notifyOnFailure: false,
    });
  }

  return perms;
}
