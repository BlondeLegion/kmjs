//FILE: src/queries/kmjs.query.getNetworkInfo.ts

/**
 * @file kmjs.query.getNetworkInfo.ts
 * @module kmjs.query
 * @description Provides a function to query various network details.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Interface for structured network information.
 */
export interface NetworkInfo {
  location: string;
  wirelessNames: string[];
  ipAddress: string;
}

/**
 * Queries Keyboard Maestro for network details, including the current network
 * location, connected Wi-Fi network names, and the primary IP address.
 *
 * @returns An object containing the network location, wireless network names, and IP address.
 * @throws {Error} If the network information cannot be retrieved.
 *
 * @example
 * const netInfo = getNetworkInfo();
 * // -> { location: "Automatic", wirelessNames: ["MyWiFi"], ipAddress: "192.168.1.100" }
 */
export function getNetworkInfo(): NetworkInfo {
  try {
    // Combine multiple tokens into a single query for efficiency.
    const delimiter = "::KMJS_DELIMITER::";
    const tokenString = [
      KM_TOKENS.NetworkLocation,
      KM_TOKENS.WirelessNetworkNames,
      KM_TOKENS.MachineIPAddress,
    ].join(delimiter);

    const result = runVirtualMacro(
      [],
      "query:getNetworkInfo",
      tokenString,
      true, // Capture the return value
    ) as string;

    const [location, wireless, ipAddress] = result.split(delimiter);

    if (
      location === undefined ||
      wireless === undefined ||
      ipAddress === undefined
    ) {
      throw new Error(`Incomplete network info returned from KM: "${result}"`);
    }

    return {
      location,
      // Wireless network names can also be multi-line if connected to multiple.
      wirelessNames: wireless ? wireless.split("\n").filter(Boolean) : [],
      ipAddress,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get network info: ${message}`);
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
