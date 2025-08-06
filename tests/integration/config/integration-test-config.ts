//FILE: tests/integration/config/integration-test-config.ts

/**
 * Integration Test Configuration
 *
 * Defines global settings and rules for integration tests across the KMJS project.
 */

export const INTEGRATION_TEST_CONFIG = {
  /** Default maximum consecutive failures before stopping test suite */
  DEFAULT_MAX_CONSECUTIVE_FAILURES: 10,

  /** Whether circuit breaker is enabled by default */
  DEFAULT_ENABLE_CIRCUIT_BREAKER: true,

  /** Default timeout for individual tests (ms) */
  DEFAULT_TEST_TIMEOUT: 30000,

  /** Default timeout for macro operations (ms) */
  DEFAULT_MACRO_TIMEOUT: 5000,

  /** How long to wait between macro operations (ms) */
  MACRO_OPERATION_DELAY: 100,

  /** How long to wait for KM to process deletions (ms) */
  CLEANUP_DELAY: 250,

  /** Test macro group name in Keyboard Maestro */
  TEST_MACRO_GROUP_NAME: "kmjs-test",

  /** Test macro name prefix */
  TEST_MACRO_NAME_PREFIX: "kmjs-test-",

  /** Directories */
  FAILURES_DIR: "tests/integration/failures",
  ARTIFACTS_DIR: "tests/integration/artifacts",

  /** Logging */
  ENABLE_VERBOSE_LOGGING: false,
  ENABLE_XML_LOGGING: true,

  /** Maximum number of tests to run (undefined = no limit) */
  //   undefined = all tests  / integer = limit
  MAX_TESTS: undefined, // Limit for integration debugging
};

/**
 * Environment-specific overrides
 */
export function getIntegrationTestConfig() {
  const config = { ...INTEGRATION_TEST_CONFIG };

  // CI environment adjustments
  if (process.env.CI) {
    config.DEFAULT_TEST_TIMEOUT = 60000; // Longer timeout in CI
    config.CLEANUP_DELAY = 1000; // More conservative cleanup delay
    config.ENABLE_VERBOSE_LOGGING = true; // More logging in CI
  }

  // Development environment adjustments
  if (process.env.NODE_ENV === "development") {
    config.DEFAULT_MAX_CONSECUTIVE_FAILURES = 10; // Fail faster in dev
    config.ENABLE_VERBOSE_LOGGING = true;
  }

  return config;
}
