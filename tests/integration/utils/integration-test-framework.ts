//FILE: src/tests/utils/integration-test-framework.ts

/**
 * Integration Test Framework for KMJS
 *
 * Provides reusable utilities for integration tests that interact with Keyboard Maestro,
 * including circuit breaker logic, cleanup management, and failure reporting.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { diff } from "jest-diff";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { getIntegrationTestConfig } from "../config/integration-test-config";
import { normalizeXmlForComparison } from "./permutations.normalizer";

const CONFIG = getIntegrationTestConfig();

export interface IntegrationTestConfig {
  /** Maximum consecutive failures before stopping the test suite */
  maxConsecutiveFailures?: number;
  /** Whether to enable the circuit breaker */
  enableCircuitBreaker?: boolean;
  /** Custom cleanup function to run before and after tests */
  customCleanup?: () => void;
  /** Directory for test failure artifacts */
  failuresDir?: string;
  /** Maximum number of tests to run */
  maxTests?: number;
}

export interface TestPermutation<T = any> {
  name: string;
  action: T;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * Creates an integration test suite with built-in circuit breaker and cleanup logic.
 */
export function createIntegrationTestSuite<T>(
  suiteName: string,
  permutations: TestPermutation<T>[],
  testFunction: (permutation: TestPermutation<T>) => TestResult,
  config: IntegrationTestConfig = {},
) {
  const {
    maxConsecutiveFailures = CONFIG.DEFAULT_MAX_CONSECUTIVE_FAILURES,
    enableCircuitBreaker = CONFIG.DEFAULT_ENABLE_CIRCUIT_BREAKER,
    customCleanup,
    failuresDir = path.resolve(__dirname, `../${CONFIG.FAILURES_DIR}`),
    maxTests = CONFIG.MAX_TESTS,
  } = config;

  // Limit number of tests if maxTests is set
  const testPermutations =
    typeof maxTests === "number" && maxTests > 0
      ? permutations.slice(0, maxTests)
      : permutations;

  let consecutiveFailures = 0;
  const failedTests: string[] = [];
  let writtenFiles: string[] = [];

  describe(suiteName, () => {
    beforeAll(() => {
      // Clean up failures directory
      const absFailuresDir = path.isAbsolute(failuresDir)
        ? failuresDir
        : path.resolve(process.cwd(), failuresDir);
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(
          chalk.gray(
            `[Integration Test] Failure artifacts will be written to: ${absFailuresDir}`,
          ),
        );
      }
      if (fs.existsSync(absFailuresDir)) {
        if (CONFIG.ENABLE_VERBOSE_LOGGING) {
          console.log(chalk.gray("Cleaning up previous test failure files..."));
        }
        fs.rmSync(absFailuresDir, { recursive: true, force: true });
      }
      fs.mkdirSync(absFailuresDir, { recursive: true });
      // Run custom cleanup if provided
      if (customCleanup) {
        customCleanup();
      }
    });

    afterAll(() => {
      try {
        // Clean up all test macros at once for better performance
        const { cleanupTestMacros } = require("../../../src/utils/km.testing");
        cleanupTestMacros();
      } catch (e) {
        // Non-fatal - cleanup is best effort
        if (CONFIG.ENABLE_VERBOSE_LOGGING) {
          console.warn("[Integration Test] Macro cleanup failed:", e);
        }
      }
      // Run custom cleanup again
      if (customCleanup) {
        try {
          customCleanup();
        } catch (e) {
          if (CONFIG.ENABLE_VERBOSE_LOGGING) {
            console.warn("[Integration Test] Custom cleanup failed:", e);
          }
        }
      }
      // Report circuit breaker results
      if (
        enableCircuitBreaker &&
        failedTests.length >= maxConsecutiveFailures
      ) {
        console.log(
          chalk.red(
            `\n❌ Test suite stopped after ${maxConsecutiveFailures} consecutive failures:`,
          ),
        );
        failedTests.forEach((test, i) =>
          console.log(chalk.red(`  ${i + 1}. ${test}`)),
        );
      }
      // Print summary of all files written
      if (writtenFiles.length > 0 && CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(
          chalk.gray("\n[Integration Test] Failure artifacts written:"),
        );
        writtenFiles.forEach((f) => console.log(chalk.gray(`  ${f}`)));
      }
    });

    // Generate dynamic tests
    it.each(testPermutations)(
      'should correctly process permutation: "$name"',
      (permutation) => {
        // Circuit breaker check
        if (
          enableCircuitBreaker &&
          consecutiveFailures >= maxConsecutiveFailures
        ) {
          // mark the rest as skipped instead of failed
          return it.skip("Skipped after circuit breaker");
        }

        // Run the actual test
        const result = testFunction(permutation);

        // Handle failure tracking
        if (!result.passed) {
          consecutiveFailures++;
          failedTests.push(permutation.name);

          // Save failure artifacts
          let paramSummary = "";
          // First, try to get parameters from the permutation.params property
          if (
            permutation &&
            typeof permutation === "object" &&
            (permutation as any).params
          ) {
            const params = (permutation as any).params;
            const summaryParts: string[] = [];
            for (const [k, v] of Object.entries(params)) {
              if (v !== undefined) {
                let value = v;
                if (typeof value === "object" && value !== null) {
                  // Flatten nested objects (e.g. screenArea)
                  value = Object.entries(value)
                    .map(([subk, subv]) => `${subk}-${subv}`)
                    .join("-");
                }
                summaryParts.push(`${k}-${value}`);
              }
            }
            paramSummary = summaryParts.join("_");
          }
          // Fallback: try to extract from action object
          else if (
            permutation &&
            typeof permutation === "object" &&
            permutation.action &&
            typeof permutation.action === "object"
          ) {
            const keys = [
              "clickKind",
              "button",
              "relative",
              "relativeCorner",
              "mouseDrag",
              "imageSelection",
              "screenArea",
              "filePath",
              "namedClipboardUUID",
            ];
            const actionObj = permutation.action as Record<string, any>;
            const summaryParts: string[] = [];
            for (const k of keys) {
              if (k in actionObj && actionObj[k] !== undefined) {
                let v = actionObj[k];
                if (typeof v === "object" && v !== null) {
                  // Flatten nested objects (e.g. screenArea)
                  v = Object.entries(v)
                    .map(([subk, subv]) => `${subk}-${subv}`)
                    .join("-");
                }
                summaryParts.push(`${k}-${v}`);
              }
            }
            paramSummary = summaryParts.join("_");
          }
          // If no summary, use the permutation index from the name
          if (!paramSummary) {
            const match = permutation.name.match(/Permutation[_\s](\d+)/);
            if (match) paramSummary = `idx-${match[1]}`;
          }
          const safe = (
            permutation.name + (paramSummary ? "_" + paramSummary : "")
          )
            .replace(/[^a-z0-9]+/gi, "_")
            .slice(0, 120);
          saveFailureArtifacts(failuresDir, safe, result, writtenFiles);
          // expose the base name so we can surface it if the XML mismatches
          (result as any).artifactBaseName = safe;
        } else {
          consecutiveFailures = 0; // Reset counter on success
        }

        // 1️⃣  If there was any script or engine error, fail immediately
        if (result.error) {
          throw new Error(result.error);
        }

        // 2️⃣  Compare the raw XML strings—this will show the full XML content
        // Normalize ignorable differences first
        const normalizedGenerated = normalizeXmlForComparison(
          result.generatedXml,
        );
        const normalizedRetrieved = normalizeXmlForComparison(
          result.retrievedXml,
        );

        if (normalizedGenerated !== normalizedRetrieved) {
          const headline =
            result.engineErrors && result.engineErrors.length > 0
              ? `KM engine errors: ${result.engineErrors.join(" | ")}`
              : "XML mismatch";

          // If we have an artifactBaseName, show the file‐names that were written
          const base = (result as any).artifactBaseName;
          const artifactsInfo = base
            ? `\n\n📁 Failure artifacts:\n   • ${base}.generated.xml\n   • ${base}.retrieved.xml`
            : "";

          // Show full XML content for both generated and retrieved
          const fullXmlOutput = `\n\n🔧 GENERATED XML:\n${result.generatedXml}\n\n🔍 RETRIEVED XML:\n${result.retrievedXml}`;

          // Also produce a diff for quick comparison
          const xmlDiff = diff(normalizedGenerated, normalizedRetrieved, {
            expand: false,
          });

          // throw a single Error with full XML content and diff
          throw new Error(
            `❌ ${headline}${artifactsInfo}${fullXmlOutput}\n\n📊 DIFF:\n${xmlDiff}`,
          );
        }
        // otherwise it passed
        expect(true).toBe(true);
      },
    );
  });
}

/**
 * Saves failure artifacts to disk for debugging.
 */
function saveFailureArtifacts(
  failuresDir: string,
  safeName: string,
  result: TestResult,
  writtenFiles: string[],
) {
  if (CONFIG.ENABLE_VERBOSE_LOGGING) {
    console.log(
      chalk.cyan(`\n[DEBUG] saveFailureArtifacts called for: ${safeName}`),
    );
    console.log(
      chalk.cyan(
        `[DEBUG] result.generatedXml present: ${!!result.generatedXml}`,
      ),
    );
    console.log(
      chalk.cyan(
        `[DEBUG] result.retrievedXml present: ${!!result.retrievedXml}`,
      ),
    );
  }

  try {
    // Use absolute path for failuresDir
    const absFailuresDir = path.isAbsolute(failuresDir)
      ? failuresDir
      : path.resolve(process.cwd(), failuresDir);
    fs.mkdirSync(absFailuresDir, { recursive: true });

    // Print and save any XML or other debugging data
    if (result.generatedXml) {
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.gray("\n[Generated XML]:"));
        console.log(result.generatedXml);
      }
      const genPath = path.join(absFailuresDir, `${safeName}.generated.xml`);
      fs.writeFileSync(genPath, result.generatedXml);
      writtenFiles.push(genPath);
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.gray(`[Saved to]: ${genPath}`));
      }
    } else {
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.yellow("[WARNING] No generatedXml to save"));
      }
    }

    if (result.retrievedXml) {
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.gray("\n[Retrieved XML]:"));
        console.log(result.retrievedXml);
      }
      const retPath = path.join(absFailuresDir, `${safeName}.retrieved.xml`);
      fs.writeFileSync(retPath, result.retrievedXml);
      writtenFiles.push(retPath);
      //   if (CONFIG.ENABLE_VERBOSE_LOGGING) {
      //     console.log(chalk.gray(`[Saved to]: ${retPath}`));
      //   }
    } else {
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.yellow("[WARNING] No retrievedXml to save"));
      }
    }

    // Print and save error information
    if (result.error) {
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.red("\n[Error]:"));
        console.log(result.error);
      }
      const errPath = path.join(absFailuresDir, `${safeName}.error.txt`);
      fs.writeFileSync(errPath, result.error);
      writtenFiles.push(errPath);
      if (CONFIG.ENABLE_VERBOSE_LOGGING) {
        console.log(chalk.red(`[Saved to]: ${errPath}`));
      }
    }
  } catch (e) {
    if (CONFIG.ENABLE_VERBOSE_LOGGING) {
      console.warn(
        chalk.yellow(`Failed to save failure artifacts for ${safeName}:`, e),
      );
    }
  }
}
