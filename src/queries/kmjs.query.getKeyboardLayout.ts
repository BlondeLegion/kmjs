//FILE: src/queries/kmjs.query.getKeyboardLayout.ts

/**
 * @file kmjs.query.getKeyboardLayout.ts
 * @module kmjs.query
 * @description Returns the name of the active macOS keyboard layout / input source.
 */
import { runVirtualMacro as runVM } from "../kmjs.runVirtualMacro";
import { KM_TOKENS as K } from "../tokens/km.tokens";

export function getKeyboardLayout(): string {
  return runVM(
    [],
    "query:getKeyboardLayout",
    K.KeyboardLayoutInputSource,
    true,
  ) as string;
}

if (require.main === module) {
  require("./kmjs.query.cli");
}
