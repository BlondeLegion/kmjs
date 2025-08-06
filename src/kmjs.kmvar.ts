//FILE: src/kmjs.kmvar.ts

/**
 * @file kmjs.kmvar.ts
 * @module kmjs.kmvar
 * @description Access Keyboard Maestro variables from Node.js.
 *
 * Provides `get(name)`, `set(name, value)`, and a callable `kmvar(name)` wrapper.
 *
 * Example:
 *   kmvar.set('MyVar', 'value');
 *   const val = kmvar.get('MyVar');
 *   kmvar('MyVar', 'new'); // sets
 *   const v = kmvar('MyVar'); // gets
 */
// Lazy import to avoid CEP environment issues

const INSTANCE_PREFIX = /^(?:INSTANCE|LOCAL)/i;

/** Determine whether the supplied name denotes a local / instance variable. */
function isInstanceVariable(name: string): boolean {
  return INSTANCE_PREFIX.test(name);
}

/**
 * Get the value of a Keyboard Maestro variable.
 *
 * @param name - Variable name (prefix INSTANCE or LOCAL for instance vars).
 * @returns The variable’s value, or empty string if not set.
 * @throws If `KMINSTANCE` is missing when accessing an instance/local variable.
 */
export function get(name: string): string {
  // Safe process.env access for CEP environments
  const kmInstance =
    typeof process !== "undefined" && process.env
      ? (process.env.KMINSTANCE ?? "")
      : "";

  let script: string;
  if (isInstanceVariable(name)) {
    if (!kmInstance) {
      throw new Error(
        `KMINSTANCE env var is not set – cannot access instance/local variable “${name}”.`,
      );
    }
    script = `tell application "Keyboard Maestro Engine" to getvariable "${name}" instance "${kmInstance}"`;
  } else {
    script = `tell application "Keyboard Maestro Engine" to getvariable "${name}"`;
  }

  const { execSync } = require("child_process");

  // Safe child_process check
  if (typeof execSync !== "function") {
    throw new Error("child_process.execSync not available in this environment");
  }

  return execSync(`osascript -e '${script}'`, { encoding: "utf8" }).trim();
}

/**
 * Set the value of a Keyboard Maestro variable.
 *
 * @param name - Variable name (prefix INSTANCE or LOCAL for instance vars).
 * @param value - Value to assign; will be converted to string.
 * @throws If `KMINSTANCE` is missing when setting an instance/local variable.
 */
export function set(name: string, value: unknown): void {
  // Safe process.env access for CEP environments
  const kmInstance =
    typeof process !== "undefined" && process.env
      ? (process.env.KMINSTANCE ?? "")
      : "";

  let script: string;
  if (isInstanceVariable(name)) {
    if (!kmInstance) {
      throw new Error(
        `KMINSTANCE env var is not set – cannot set instance/local variable “${name}”.`,
      );
    }
    script = `tell application "Keyboard Maestro Engine" to setvariable "${name}" to "${value}" instance "${kmInstance}"`;
  } else {
    script = `tell application "Keyboard Maestro Engine" to setvariable "${name}" to "${value}"`;
  }

  const { execSync } = require("child_process");

  // Safe child_process check
  if (typeof execSync !== "function") {
    throw new Error("child_process.execSync not available in this environment");
  }

  execSync(`osascript -e '${script}'`);
}

/**
 * Uniform getter/setter function for Keyboard Maestro variables.
 *
 * @param name - Variable name.
 * @param value - Optional: value to set; if omitted, the current value is returned.
 * @returns The variable’s value when used as getter, otherwise undefined.
 */
export const kmvar = Object.assign(
  function (name: string, value?: unknown): string | void {
    return typeof value === "undefined" ? get(name) : set(name, value);
  },
  { get, set },
) as {
  (name: string): string;
  (name: string, value: unknown): void;
  get: typeof get;
  set: typeof set;
};

export default kmvar;
