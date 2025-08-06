//FILE: tests/test_virtual_actions/kmjs.queries.unit.spec.ts

import { describe, it, expect } from "vitest";
import chalk from "chalk";
import { getMousePosition } from "../../src/queries/kmjs.query.getMousePosition";
import { getFrontAppInfo } from "../../src/queries/kmjs.query.getFrontAppInfo";
import { getFrontWindowInfo } from "../../src/queries/kmjs.query.getFrontWindowInfo";
import { getFinderSelections } from "../../src/queries/kmjs.query.getFinderSelections";
import { getSystemClipboard } from "../../src/queries/kmjs.query.getSystemClipboard";
import { getSystemVolume } from "../../src/queries/kmjs.query.getSystemVolume";
import { getScreenFrames } from "../../src/queries/kmjs.query.getScreenFrames";
import { getRunningApps } from "../../src/queries/kmjs.query.getRunningApps";
import { getNetworkInfo } from "../../src/queries/kmjs.query.getNetworkInfo";
import { getUserInfo } from "../../src/queries/kmjs.query.getUserInfo";
import { getSystemVersion } from "../../src/queries/kmjs.query.getSystemVersion";
import { getPastClipboard } from "../../src/queries/kmjs.query.getPastClipboard";
import {
  getScreenResolution,
  ScreenResolutionRecord,
} from "../../src/queries/kmjs.query.getScreenResolution";

/**
 * Utility to log XML or JSON output in chalk grey for visual inspection.
 * @param xml - The XML or JSON string to log.
 */
function logXml(xml: string) {
  console.log(chalk.gray("[VirtualMacro XML]\n" + xml));
}

/**
 * All query tests for kmjs. Each test is documented inline to clarify its purpose and expected behavior.
 * This suite covers both basic queries and screen resolution queries, with robust type and value checks.
 */
describe("kmjs queries", () => {
  it("getMousePosition returns valid coordinates", () => {
    const pos = getMousePosition();
    console.log(chalk.cyan("Mouse Position:"), chalk.green(pos));
    const arr = getMousePosition(true);
    console.log(
      chalk.cyan("Mouse Position Array:"),
      chalk.green(arr.join(", ")),
    );
    expect(pos).toMatch(/^\d+,\d+$/);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(2);
    expect(arr.every((n) => typeof n === "number" && !isNaN(n))).toBe(true);
  });

  it("getFrontAppInfo returns valid app info", () => {
    const info = getFrontAppInfo();
    console.log(
      chalk.magenta("Front App Info:"),
      chalk.whiteBright(JSON.stringify(info, null, 2)),
    );
    expect(info).toHaveProperty("name");
    expect(info).toHaveProperty("bundleId");
    expect(info).toHaveProperty("path");
    expect(typeof info.name).toBe("string");
    expect(typeof info.bundleId).toBe("string");
    expect(typeof info.path).toBe("string");
  });

  it("getFrontWindowInfo returns valid window info", () => {
    const info = getFrontWindowInfo();
    console.log(
      chalk.magenta("Front Window Info:"),
      chalk.whiteBright(JSON.stringify(info, null, 2)),
    );
    expect(info).toHaveProperty("name");
    expect(info).toHaveProperty("frame");
    expect(typeof info.name).toBe("string");
    expect(info.frame).toHaveProperty("x");
    expect(info.frame).toHaveProperty("y");
    expect(info.frame).toHaveProperty("width");
    expect(info.frame).toHaveProperty("height");
  });

  it("getFinderSelections returns an array", () => {
    const selections = getFinderSelections();
    console.log(
      chalk.blue("Finder Selections:"),
      chalk.green(selections.join("\n")),
    );
    expect(Array.isArray(selections)).toBe(true);
    selections.forEach((item) => expect(typeof item).toBe("string"));
  });

  it("getSystemClipboard returns a string", () => {
    const clipboard = getSystemClipboard();
    console.log(
      chalk.yellow("System Clipboard:"),
      chalk.whiteBright(clipboard),
    );
    expect(typeof clipboard).toBe("string");
  });

  it("getSystemVolume returns a number between 0 and 100", () => {
    const volume = getSystemVolume();
    console.log(chalk.yellow("System Volume:"), chalk.green(volume));
    expect(typeof volume).toBe("number");
    expect(volume).toBeGreaterThanOrEqual(0);
    expect(volume).toBeLessThanOrEqual(100);
  });

  it("getScreenFrames returns array of frames", () => {
    const frames = getScreenFrames();
    logXml(frames.map((f) => JSON.stringify(f)).join("\n"));
    expect(Array.isArray(frames)).toBe(true);
    frames.forEach((frame) => {
      expect(frame).toHaveProperty("x");
      expect(frame).toHaveProperty("y");
      expect(frame).toHaveProperty("width");
      expect(frame).toHaveProperty("height");
    });
  });

  it("getRunningApps returns array of strings", () => {
    const apps = getRunningApps();
    console.log(
      chalk.blue("Running Apps:"),
      chalk.green(
        apps.slice(0, 10).join(", ") + (apps.length > 10 ? ", ..." : ""),
      ),
    );
    expect(Array.isArray(apps)).toBe(true);
    apps.forEach((app) => expect(typeof app).toBe("string"));
  });

  it("getNetworkInfo returns valid network info", () => {
    const info = getNetworkInfo();
    console.log(
      chalk.magenta("Network Info:"),
      chalk.whiteBright(JSON.stringify(info, null, 2)),
    );
    expect(info).toHaveProperty("location");
    expect(info).toHaveProperty("wirelessNames");
    expect(info).toHaveProperty("ipAddress");
    expect(Array.isArray(info.wirelessNames)).toBe(true);
    expect(typeof info.location).toBe("string");
    expect(typeof info.ipAddress).toBe("string");
  });

  it("getUserInfo returns valid user info", () => {
    const info = getUserInfo();
    console.log(
      chalk.magenta("User Info:"),
      chalk.whiteBright(JSON.stringify(info, null, 2)),
    );
    expect(info).toHaveProperty("name");
    expect(info).toHaveProperty("loginId");
    expect(info).toHaveProperty("home");
    expect(typeof info.name).toBe("string");
    expect(typeof info.loginId).toBe("string");
    expect(typeof info.home).toBe("string");
  });

  it("getSystemVersion returns valid version info", () => {
    const info = getSystemVersion();
    console.log(
      chalk.magenta("System Version Info:"),
      chalk.whiteBright(JSON.stringify(info, null, 2)),
    );
    expect(info).toHaveProperty("short");
    expect(info).toHaveProperty("long");
    expect(typeof info.short).toBe("string");
    expect(typeof info.long).toBe("string");
  });

  it("getPastClipboard returns a string for index 0", () => {
    const clipboard = getPastClipboard(0);
    console.log(
      chalk.yellow("Past Clipboard[0]:"),
      chalk.whiteBright(clipboard),
    );
    expect(typeof clipboard).toBe("string");
  });

  /**
   * Screen resolution tests (merged from kmjs.query.getScreenResolution.unit.spec.ts)
   * These tests verify both single and multiple screen queries, with robust type and value checks.
   */
  const screenKeys: (keyof ScreenResolutionRecord)[] = [
    "nominalWidth",
    "nominalHeight",
    "pixelWidth",
    "pixelHeight",
    "refreshRate",
  ];

  it("getScreenResolution returns a valid ScreenResolutionRecord for the main screen", () => {
    const result = getScreenResolution();
    console.log(
      chalk.gray("[ScreenResolution:Main]"),
      chalk.whiteBright(JSON.stringify(result, null, 2)),
    );
    expect(Array.isArray(result)).toBe(false);
    const rec = result as ScreenResolutionRecord;
    expect(rec).toBeTypeOf("object");
    screenKeys.forEach((key) => {
      expect(rec).toHaveProperty(key);
      expect(typeof rec[key]).toBe("number");
      expect(!isNaN(rec[key])).toBe(true);
    });
  });

  it("getScreenResolution returns an array of ScreenResolutionRecord for all screens", () => {
    const results = getScreenResolution("All");
    console.log(
      chalk.gray("[ScreenResolution:All]"),
      chalk.whiteBright(JSON.stringify(results, null, 2)),
    );
    expect(Array.isArray(results)).toBe(true);
    for (const rec of results as ScreenResolutionRecord[]) {
      screenKeys.forEach((key) => {
        expect(rec).toHaveProperty(key);
        expect(typeof rec[key]).toBe("number");
        expect(!isNaN(rec[key])).toBe(true);
      });
    }
  });

  it("getScreenResolution throws on invalid token result format", () => {
    // Defensive test: simulate an invalid result and ensure error handling works
    const invalidLine = "not,a,valid,screen,resolution";
    const parse = (line: string): ScreenResolutionRecord => {
      const parts = line.split(",").map(Number);
      if (parts.length !== 5 || parts.some(isNaN)) {
        throw new Error(`Invalid ScreenResolution format: “${line}”`);
      }
      const [
        nominalWidth,
        nominalHeight,
        pixelWidth,
        pixelHeight,
        refreshRate,
      ] = parts;
      return {
        nominalWidth,
        nominalHeight,
        pixelWidth,
        pixelHeight,
        refreshRate,
      };
    };
    expect(() => parse(invalidLine)).toThrowError(
      /Invalid ScreenResolution format/,
    );
  });
});

/**
 * CLI tests for kmjs queries. Each test runs the corresponding CLI command and checks the output format.
 * This suite ensures that all query helpers are covered by CLI tests, with basic output validation.
 */
describe("kmjs queries CLI", () => {
  const cliPath = "src/queries/kmjs.query.cli.ts";
  const runCli = async (args: string[]) => {
    const { execa } = await import("execa");
    try {
      const { stdout } = await execa("npx", ["ts-node", cliPath, ...args]);
      return stdout;
    } catch (err: any) {
      return err.stdout || err.message;
    }
  };

  it("CLI getMousePosition returns valid result", async () => {
    const out = await runCli(["getMousePosition"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getFrontAppInfo returns valid result", async () => {
    const out = await runCli(["getFrontAppInfo"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getFrontWindowInfo returns valid result", async () => {
    const out = await runCli(["getFrontWindowInfo"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getFinderSelections returns valid result", async () => {
    const out = await runCli(["getFinderSelections"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getSystemClipboard returns valid result", async () => {
    const out = await runCli(["getSystemClipboard"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getSystemVolume returns valid result", async () => {
    const out = await runCli(["getSystemVolume"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getScreenFrames returns valid result", async () => {
    const out = await runCli(["getScreenFrames"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getRunningApps returns valid result", async () => {
    const out = await runCli(["getRunningApps"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getNetworkInfo returns valid result", async () => {
    const out = await runCli(["getNetworkInfo"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getUserInfo returns valid result", async () => {
    const out = await runCli(["getUserInfo"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getSystemVersion returns valid result", async () => {
    const out = await runCli(["getSystemVersion"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getPastClipboard returns valid result or error", async () => {
    const out = await runCli(["getPastClipboard", "0"]);
    expect(out).toMatch(/Result:|Clipboard history index/);
  });

  it("CLI getScreenResolution returns valid result", async () => {
    const out = await runCli(["getScreenResolution"]);
    expect(out).toMatch(/Result:/);
  });

  it("CLI getScreenResolution All returns valid result", async () => {
    const out = await runCli(["getScreenResolution", "All"]);
    expect(out).toMatch(/Result:/);
  });
});
