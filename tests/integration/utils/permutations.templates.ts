//FILE: src/tests/utils/permutations.templates.ts

export const specificApps = [
  // Fully specified Finder
  {
    bundleIdentifier: "com.apple.Finder",
    name: "Finder",
    match: "BundleID",
    newFile: "/System/Library/CoreServices/Finder.app",
  },
  // Fully specified Safari
  {
    bundleIdentifier: "com.apple.Safari",
    name: "Safari",
    match: "BundleID",
    /**
     * Safari’s on-disk *logical* path (/System/Applications/Safari.app) is
     * rewritten by Keyboard Maestro when imported to its *canonical* Cryptex
     * path inside the Preboot volume. To ensure round-trip XML equality we
     * start with the value KM will emit after import.
     *
     * If Apple changes this again, consider adding a normalization rule
     * that ignores NewFile for ActivateApplication, but for now we just
     * match KM’s current serialization.
     */
    newFile:
      "/System/Volumes/Preboot/Cryptexes/App/System/Applications/Safari.app",
  },
  // TextEdit example
  {
    bundleIdentifier: "com.apple.TextEdit",
    name: "TextEdit",
    match: "BundleID",
    newFile: "/System/Applications/TextEdit.app",
  },
  // Minimal (name only) variant to exercise heuristic fill (remove if undesired)
  //   { name: "Safari" }, // (heuristic fill test)
] as const;

// --- ManipulateWindow Sample Values ---

export const sampleValues: [string, string][] = [
  ["100", "200"],
  ["50%", "75%"],
  ["0", "0"],
];

export const sampleCustomValues: (
  | [string, string, string]
  | [string, string, string, string]
)[] = [
  [
    "SCREENVISIBLE(Main,Left)",
    "SCREENVISIBLE(Main,Width)",
    "SCREENVISIBLE(Main,Height)",
  ],
  ["100", "200", "300"],
  ["50%", "25%", "75%"],
  // 4-element arrays for full MoveAndResize control
  [
    "SCREENVISIBLE(Main,Left)",
    "SCREENVISIBLE(Main,Top)",
    "SCREENVISIBLE(Main,Width)",
    "SCREENVISIBLE(Main,Height)",
  ],
  ["SCREENVISIBLE(Main,Left)", "SCREENVISIBLE(Main,Top)", "1280", "1440"],
  ["100", "150", "800", "600"],
];

// --- Programmatic generator for all SpecificAppOptions permutations ---

/**
 * All valid values for the 'match' field in SpecificAppOptions.
 */
export const appMatchTypes = [undefined, "BundleID", "Path"] as const;

/**
 * All meaningful combinations of SpecificAppOptions for exhaustive app targeting tests.
 * This covers all ways to define an application location for KM actions, filtered to only valid/meaningful combos.
 */
export const allSpecificAppPermutations = [
  // 1. Match by default (just name)
  {
    name: "Finder",
  },
  // 2. Match by path (must include bundleIdentifier)
  {
    name: "Finder",
    bundleIdentifier: "com.apple.finder",
    match: "Path" as const,
    newFile: "/System/Library/CoreServices/Finder.app",
  },
  // 3. Match by bundle ID
  {
    name: "Finder",
    bundleIdentifier: "com.apple.Finder",
    match: "BundleID" as const,
    newFile: "/System/Library/CoreServices/Finder.app",
  },
];
