//FILE: src/utils/km.engineLog.ts

import chalk from "chalk";

/** Byte-offset we last read from. */
let lastPos = 0;

/** Lazy-loaded log path to avoid calling os.homedir() at module load time */
function getLogPath(): string {
  try {
    const os = require("os");
    return `${os.homedir()}/Library/Logs/Keyboard Maestro/Engine.log`;
  } catch (error) {
    // Fallback for environments where os module isn't available
    console.warn("[km.engineLog] os module not available, using fallback path");
    return "/tmp/keyboard-maestro-engine.log";
  }
}

/**
 * Begin watching the Keyboard Maestro Engine log for new entries.
 * We don’t actually tail in real time—just record where we are now.
 */
export function startWatching(): void {
  const logPath = getLogPath();
  const fs = require("fs");

  // Safe fs check
  const existsSync =
    typeof fs.existsSync === "function" ? fs.existsSync : () => false;
  const statSync =
    typeof fs.statSync === "function" ? fs.statSync : () => ({ size: 0 });

  lastPos = existsSync(logPath) ? statSync(logPath).size : 0;
}

/**
 * Return any lines containing failure or error indicators since we last watched or optionally since a given position.
 * @param since - Optional position in the log file to start reading from.
 */
export function getErrors(since?: number): string[] {
  const logPath = getLogPath();
  const fs = require("fs");

  // Safe fs checks
  const existsSync =
    typeof fs.existsSync === "function" ? fs.existsSync : () => false;
  const statSync =
    typeof fs.statSync === "function" ? fs.statSync : () => ({ size: 0 });
  const openSync = typeof fs.openSync === "function" ? fs.openSync : null;
  const readSync = typeof fs.readSync === "function" ? fs.readSync : null;

  if (!existsSync(logPath) || !openSync || !readSync) return [];

  // --- read only the *new* bytes -----------------------------------------
  const fileSize = statSync(logPath).size;
  const startPos = since ?? lastPos;
  if (fileSize <= startPos) {
    lastPos = fileSize;
    return [];
  }

  const byteCount = fileSize - startPos;
  const buffer = Buffer.alloc(byteCount);
  const fd = openSync(logPath, "r");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _bytes = readSync(fd, buffer, 0, byteCount, startPos);
  const tail = buffer.toString("utf8");
  lastPos = fileSize;

  const lines = tail.split(/\r?\n/);
  return lines.filter((l) => /\b(fail(?:ed|ure)?|error)\b/i.test(l));
}

/**
 * Strip leading timestamp from each log line.
 * @param lines - Raw log lines
 */
export function stripTimestamps(lines: string[]): string[] {
  return lines.map((l) =>
    l.replace(/^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2} /, ""),
  );
}

/**
 * Stop watching the log (No-op).
 */
export function stopWatching(): void {
  // nothing to do
}

/**
 * Check and report any errors found in the Keyboard Maestro Engine log.
 * Logs errors in red if found.
 * @param xml - Optional XML string to print after errors.
 * @returns true if errors were reported, false otherwise.
 */
export function reportErrors(xml?: string): boolean {
  const errors = stripTimestamps(getErrors());
  if (errors.length > 0) {
    console.log();
    console.log(
      chalk.red.bold("[km.engineLog] Virtual macro reported engine errors:"),
    );
    console.log(
      chalk.grey("----------------------------------------------------"),
    );
    errors.forEach((err) => {
      console.log(chalk.bgRed("  • ") + "\t" + chalk.redBright(err));
      console.log();
    });
    if (xml) {
      console.log(chalk.grey("[km.engineLog] Executed XML:"));
      xml.split("\n").forEach((line) => console.log(chalk.grey("  " + line)));
      console.log();
    }
    return true;
  }
  return false;
}
