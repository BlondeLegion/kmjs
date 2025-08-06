// FILE: src/tokens/km.token.lookup.ts

/**
 * @file Lightweight utility to translate Keyboard Maestro token names
 * between Human-Readable, PascalCase, and Raw KM Token representations.
 */

// Lazy imports to avoid CEP environment issues

/**
 * Represents the three forms of a Keyboard Maestro token.
 */
interface TokenTriple {
  human: string;
  pascal: string;
  token: string;
}

/**
 * A cached map of all token data for fast lookups.
 */
let tokenData: {
  lookupByHuman: Map<string, TokenTriple>;
  lookupByPascal: Map<string, TokenTriple>;
  lookupByToken: Map<string, TokenTriple>;
} | null = null;

/**
 * Loads and caches the token mapping data from the JSON file.
 * This function is called automatically on the first lookup.
 */
function loadTokenData(): void {
  if (tokenData) {
    return;
  }

  try {
    let tokenMap: TokenTriple[] = [];

    // Try multiple approaches to load the token data
    let tokenMapLoaded = false;

    // Approach 1: Try direct require (works in some bundled environments)
    try {
      tokenMap = require("./data/km.tokens.mapping.json");
      tokenMapLoaded = true;
    } catch {
      // Approach 2: Try file system reading with different possible paths
      const fs = require("fs");
      const path = require("path");

      // Safe fs check
      if (typeof fs.readFileSync === "function") {
        const possiblePaths = [
          path.resolve(__dirname, "./data/km.tokens.mapping.json"), // dist version
          path.resolve(__dirname, "./tokens/data/km.tokens.mapping.json"), // bundle version
          path.resolve(__dirname, "../tokens/data/km.tokens.mapping.json"), // alternative bundle path
        ];

        for (const tokenMapPath of possiblePaths) {
          try {
            const existsSync =
              typeof fs.existsSync === "function" ? fs.existsSync : () => false;
            if (existsSync(tokenMapPath)) {
              tokenMap = JSON.parse(fs.readFileSync(tokenMapPath, "utf8"));
              tokenMapLoaded = true;
              break;
            }
          } catch {
            // Continue to next path
          }
        }
      }

      // Approach 3: Use embedded data (for bundled versions)
      if (!tokenMapLoaded) {
        try {
          tokenMap = getEmbeddedTokenData();
          tokenMapLoaded = true;
        } catch {
          throw new Error("Could not locate token mapping data file");
        }
      }
    }

    const lookupByHuman = new Map<string, TokenTriple>();
    const lookupByPascal = new Map<string, TokenTriple>();
    const lookupByToken = new Map<string, TokenTriple>();

    for (const entry of tokenMap) {
      lookupByHuman.set(entry.human, entry);
      lookupByPascal.set(entry.pascal, entry);
      lookupByToken.set(entry.token, entry);
    }

    tokenData = { lookupByHuman, lookupByPascal, lookupByToken };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn("[km.token.lookup] Failed to load token data:", errorMessage);
    // Create empty maps as fallback
    tokenData = {
      lookupByHuman: new Map(),
      lookupByPascal: new Map(),
      lookupByToken: new Map(),
    };
  }
}

/**
 * Returns embedded token data for bundled versions.
 * This function will be replaced during the bundle process.
 */
function getEmbeddedTokenData(): TokenTriple[] {
  // This is a placeholder that will be replaced during bundling
  // If this runs, it means the bundle process didn't replace it
  throw new Error(
    "Token data not embedded - this should not happen in bundled versions",
  );
}

type ReturnKey = "human" | "pascal" | "token";

/**
 * Looks up a Keyboard Maestro token by any of its forms (human-readable, PascalCase, or raw token).
 *
 * @param query The token string to look up.
 * @param returnKey Optional. If specified, returns only the value for that key (e.g., 'human', 'pascal', 'token').
 * @returns If `returnKey` is specified, a string. Otherwise, an object containing the other two forms of the token.
 * @throws An error if the token is not found.
 *
 * @example
 * // Get the full object
 * lookupKMToken('%RandomUUID%'); // → { human: 'A Random Unique ID', pascal: 'ARandomUniqueID' }
 *
 * @example
 * // Get a specific value
 * lookupKMToken('Linefeed (\\n)', 'token'); // → '%LineFeed%'
 *
 * @example
 * // Get a specific value
 * lookupKMToken('AddressBookEmail', 'human'); // → 'AddressBook Email'
 */
export function lookupKMToken(query: string, returnKey: ReturnKey): string;
export function lookupKMToken(
  query: string,
): Omit<TokenTriple, "human" | "pascal" | "token">;
export function lookupKMToken(
  query: string,
  returnKey?: ReturnKey,
): string | Omit<TokenTriple, "human" | "pascal" | "token"> {
  loadTokenData();
  const { lookupByHuman, lookupByPascal, lookupByToken } = tokenData!;

  const found =
    lookupByHuman.get(query) ??
    lookupByPascal.get(query) ??
    lookupByToken.get(query);

  if (!found) {
    throw new Error(`Unknown Keyboard Maestro token: "${query}"`);
  }

  if (returnKey) {
    return found[returnKey];
  }

  const result: Partial<TokenTriple> = { ...found };
  if (query === found.human) delete result.human;
  if (query === found.pascal) delete result.pascal;
  if (query === found.token) delete result.token;

  return result;
}
