//FILE: src/utils/spawn.utils.ts

/**
 * Utility to safely obtain spawnSync even when bundlers replace child_process with stubs.
 * This handles CEP environments where the bundler stubs Node.js modules but the runtime
 * still has access to the real Node.js APIs.
 */
export function getSafeSpawnSync(): typeof import("child_process").spawnSync {
  let spawnSync: typeof import("child_process").spawnSync | undefined;

  // ① First try the local (possibly-stubbed) require
  try {
    spawnSync = require?.("child_process")?.spawnSync;
  } catch {
    /* ignore */
  }

  // ② If that failed, grab the copy exposed on globalThis by the host environment
  if (!spawnSync && typeof globalThis !== "undefined") {
    try {
      spawnSync = (globalThis as any).__cgNodeRequire?.(
        "child_process",
      )?.spawnSync;
    } catch {
      /* ignore */
    }
  }

  if (typeof spawnSync !== "function") {
    throw new Error(
      "child_process.spawnSync not available in this environment",
    );
  }

  return spawnSync;
}
