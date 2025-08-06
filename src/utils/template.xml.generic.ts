//FILE: src/utils/template.xml.generic.ts

/**
 * Shared utilities for generating Keyboard Maestro action XML templates.
 */

/**
 * Options for generating action UIDs.
 */
export interface ActionUIDOptions {
  /** Optional custom timestamp base. If not provided, uses current time. */
  timestamp?: number;
}

/**
 * Standard Keyboard Maestro .kmmacros XML header (PLIST format).
 * Use this at the start of any generated macro XML.
 */
export const PLIST_HEADER =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ` +
  `"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
  `<plist version="1.0">\n<array>\n`;

/**
 * Standard Keyboard Maestro .kmmacros XML footer (PLIST format).
 * Use this at the end of any generated macro XML.
 */
export const PLIST_FOOTER = "</array>\n</plist>";

/**
 * Generates a unique action UID for Keyboard Maestro actions.
 * Uses Unix timestamp in seconds as the base for uniqueness.
 *
 * @param opts - Options for UID generation
 * @returns A numeric UID suitable for KM actions
 */
export function generateActionUID(opts: ActionUIDOptions = {}): number {
  const { timestamp = Date.now() } = opts;
  return Math.floor(timestamp / 1000);
}

/**
 * Generates the ActionUID XML key-value pair for KM actions.
 *
 * @param opts - Options for UID generation
 * @returns Array of XML lines for the ActionUID
 */
export function generateActionUIDXml(opts: ActionUIDOptions = {}): string[] {
  const uid = generateActionUID(opts);
  return ["\t\t<key>ActionUID</key>", `\t\t<integer>${uid}</integer>`];
}

/**
 * Renders the StopOnFailure XML key only if the value is explicitly true.
 * If undefined or false, omits the key (KM only stores this when true).
 *
 * @param stopOnFailure - Whether failure aborts the macro (default true)
 * @returns Array of XML lines (empty if omitted)
 */
export function renderStopOnFailureXml(stopOnFailure?: boolean): string[] {
  if (stopOnFailure === true) {
    return ["\t\t<key>StopOnFailure</key>", "\t\t<true/>"];
  }
  return [];
}

/**
 * Renders the NotifyOnFailure XML key if the value is explicitly false.
 * If undefined or true, omits the key (default KM behavior).
 *
 * @param notifyOnFailure - Whether to notify on failure (default true)
 * @returns Array of XML lines (empty if omitted)
 */
export function renderNotifyOnFailureXml(notifyOnFailure?: boolean): string[] {
  if (notifyOnFailure === false) {
    return ["\t\t<key>NotifyOnFailure</key>", "\t\t<false/>"];
  }
  return [];
}

/**
 * Renders timeout-related XML keys based on Keyboard Maestro's behavior patterns.
 *
 * KM's XML inclusion rules based on ground truth analysis:
 * - TimeOutAbortsMacro: Always included (true or false)
 * - NotifyOnTimeOut: Only included when it differs from the expected default behavior:
 *   - When timeoutAborts=true: NotifyOnTimeOut is included only if it's false
 *   - When timeoutAborts=false: NotifyOnTimeOut is included only if it's true
 *
 * @param options - Timeout configuration options
 * @param options.notifyOnTimeout - Whether to notify on timeout (default true)
 * @param options.timeoutAborts - Whether timeout aborts the macro (default true)
 * @returns Array of XML lines for timeout configuration
 */
export function renderTimeoutXml(
  options: {
    notifyOnTimeout?: boolean;
    timeoutAborts?: boolean;
  } = {},
): string[] {
  const { notifyOnTimeout = true, timeoutAborts = true } = options;

  const xmlLines: string[] = [];

  // NotifyOnTimeOut is included when it differs from expected behavior:
  // - If timeoutAborts=true and notifyOnTimeout=false (non-default)
  // - If timeoutAborts=false and notifyOnTimeout=true (non-default for this case)
  const shouldIncludeNotifyOnTimeOut =
    (timeoutAborts === true && notifyOnTimeout === false) ||
    (timeoutAborts === false && notifyOnTimeout === true);

  if (shouldIncludeNotifyOnTimeOut) {
    xmlLines.push(
      "\t\t<key>NotifyOnTimeOut</key>",
      notifyOnTimeout ? "\t\t<true/>" : "\t\t<false/>",
    );
  }

  // TimeOutAbortsMacro is always included
  xmlLines.push(
    "\t\t<key>TimeOutAbortsMacro</key>",
    timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
  );

  return xmlLines;
}

/**
 * @deprecated Use renderTimeoutXml instead for consistent timeout handling
 */
export function renderTimeOutAbortsMacroXml(
  timeoutAborts: boolean = true,
): string[] {
  return renderTimeoutXml({ timeoutAborts });
}

/**
 * @deprecated Use renderTimeoutXml instead for consistent timeout handling
 */
export function renderNotifyOnTimeOutXml(
  notifyOnTimeout: boolean = true,
): string[] {
  return renderTimeoutXml({ notifyOnTimeout });
}
