//FILE: src/queries/index.ts

/**
 * @file src/queries/index.ts
 * @module kmjs.query
 * @description Barrel file for all query helpers.
 *
 * ## QUICK START
 * ```ts
 * import { runQuery } from 'kmjs';
 * const { x, y } = runQuery.getMousePosition(true);
 * const { musicPlayerState } = runQuery.getCurrentTrackInfo();
 * ```
 *
 * ## Available Queries
 * | Key | What it returns |
 * | --- | --------------- |
 * | getMousePosition | Cursor coordinates. `string` ("x,y") or `[number, number]`. |
 * | getFrontAppInfo | Active app’s `{ name, bundleId, path }`. |
 * | getFrontWindowInfo | Frontmost window title + frame. |
 * | getFinderSelections | Array of selected Finder items’ full paths. |
 * | getSystemClipboard | Plain-text system clipboard contents. |
 * | getPastClipboard | Historical clipboard entry (index ≥ 0). |
 * | getSystemVolume | Output volume `0‒100`. |
 * | getScreenFrames | Frames of all connected displays. |
 * | getScreenResolution | Resolution tuple(s) for given screen(s). |
 * | getRunningApps | Names of every running process. |
 * | getNetworkInfo | Location, SSID(s), IP address. |
 * | getUserInfo | macOS user `{ name, loginId, home }`. |
 * | getSystemVersion | macOS short + long versions. |
 *
 * All query helpers are pure (side-effect-free) and synchronous so
 * they are safe to call inside render loops or tight computational pipelines.
 */

import { getMousePosition } from "./kmjs.query.getMousePosition";
import { getFrontAppInfo } from "./kmjs.query.getFrontAppInfo";
import { getFrontWindowInfo } from "./kmjs.query.getFrontWindowInfo";
import { getFinderSelections } from "./kmjs.query.getFinderSelections";
import { getSystemClipboard } from "./kmjs.query.getSystemClipboard";
import { getSystemVolume } from "./kmjs.query.getSystemVolume";
import { getScreenFrames } from "./kmjs.query.getScreenFrames";
import { getRunningApps } from "./kmjs.query.getRunningApps";
import { getNetworkInfo } from "./kmjs.query.getNetworkInfo";
import { getUserInfo } from "./kmjs.query.getUserInfo";
import { getSystemVersion } from "./kmjs.query.getSystemVersion";
import { getPastClipboard } from "./kmjs.query.getPastClipboard";
import { getScreenResolution } from "./kmjs.query.getScreenResolution";

// Centralized object for all query functions
const queryFns = {
  getMousePosition,
  getFrontAppInfo,
  getFrontWindowInfo,
  getFinderSelections,
  getSystemClipboard,
  getSystemVolume,
  getScreenFrames,
  getRunningApps,
  getNetworkInfo,
  getUserInfo,
  getSystemVersion,
  getPastClipboard,
  getScreenResolution,
};

/**
 * A collection of query functions to retrieve live state from Keyboard Maestro.
 * These are synchronous, read-only operations.
 *
 * @example
 * // Using the query object (string format)
 * import { runQuery } from 'kmjs';
 * const position = runQuery.getMousePosition(); // "1234,567"
 *
 * @example
 * // Using the query object (array format)
 * import { runQuery } from 'kmjs';
 * const [x, y] = runQuery.getMousePosition(true); // [1234, 567]
 *
 * @example
 * // Using individual functions
 * import { getMousePosition } from 'kmjs';
 * const position = getMousePosition(); // "1234,567"
 * const [x, y] = getMousePosition(true); // [1234, 567]
 */
export const runQuery = { ...queryFns };
export const queries = { ...queryFns } as const;

// Export individual functions for direct import
/**
 * Individual query helpers for direct import and tree-shaking.
 * Each function is pure and synchronous.
 */
export {
  getMousePosition,
  getFrontAppInfo,
  getFrontWindowInfo,
  getFinderSelections,
  getSystemClipboard,
  getSystemVolume,
  getScreenFrames,
  getRunningApps,
  getNetworkInfo,
  getUserInfo,
  getSystemVersion,
  getPastClipboard,
  getScreenResolution,
};
