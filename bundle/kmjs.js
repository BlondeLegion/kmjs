'use strict';

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const styles$1 = {
	modifier: {
		reset: [0, 0],
		// 21 isn't widely supported and 22 does the same thing
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		// Bright color
		blackBright: [90, 39],
		gray: [90, 39], // Alias of `blackBright`
		grey: [90, 39], // Alias of `blackBright`
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],

		// Bright color
		bgBlackBright: [100, 49],
		bgGray: [100, 49], // Alias of `bgBlackBright`
		bgGrey: [100, 49], // Alias of `bgBlackBright`
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
	},
};

Object.keys(styles$1.modifier);
const foregroundColorNames = Object.keys(styles$1.color);
const backgroundColorNames = Object.keys(styles$1.bgColor);
[...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles$1)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles$1[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles$1[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles$1, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles$1, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles$1.color.close = '\u001B[39m';
	styles$1.bgColor.close = '\u001B[49m';

	styles$1.color.ansi = wrapAnsi16();
	styles$1.color.ansi256 = wrapAnsi256();
	styles$1.color.ansi16m = wrapAnsi16m();
	styles$1.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles$1.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles$1.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles$1, {
		rgbToAnsi256: {
			value(red, green, blue) {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value(hex) {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles$1.rgbToAnsi256(...styles$1.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value(code) {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles$1.ansi256ToAnsi(styles$1.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles$1.ansi256ToAnsi(styles$1.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles$1;
}

const ansiStyles = assembleStyles();

/* eslint-env browser */

const level = (() => {
	if (!('navigator' in globalThis)) {
		return 0;
	}

	if (globalThis.navigator.userAgentData) {
		const brand = navigator.userAgentData.brands.find(({brand}) => brand === 'Chromium');
		if (brand && brand.version > 93) {
			return 3;
		}
	}

	if (/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent)) {
		return 1;
	}

	return 0;
})();

const colorSupport = level !== 0 && {
	level};

const supportsColor = {
	stdout: colorSupport,
	stderr: colorSupport,
};

// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.slice(endIndex, index) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.slice(endIndex, (gotCR ? index - 1 : index)) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

const {stdout: stdoutColor, stderr: stderrColor} = supportsColor;

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m',
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

const chalkFactory = options => {
	const chalk = (...strings) => strings.join(' ');
	applyOptions(chalk, options);

	Object.setPrototypeOf(chalk, createChalk.prototype);

	return chalk;
};

function createChalk(options) {
	return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		},
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this[STYLER], true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	},
};

const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === 'rgb') {
		if (level === 'ansi16m') {
			return ansiStyles[type].ansi16m(...arguments_);
		}

		if (level === 'ansi256') {
			return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...arguments_));
		}

		return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...arguments_));
	}

	if (model === 'hex') {
		return getModelAnsi('rgb', level, type, ...ansiStyles.hexToRgb(...arguments_));
	}

	return ansiStyles[type][model](...arguments_);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), ansiStyles.color.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...arguments_), ansiStyles.bgColor.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		},
	},
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent,
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	// Single argument is hot path, implicit coercion is faster than anything
	// eslint-disable-next-line no-implicit-coercion
	const builder = (...arguments_) => applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self[IS_EMPTY] ? '' : string;
	}

	let styler = self[STYLER];

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.includes('\u001B')) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, styles);

const chalk = createChalk();
createChalk({level: stderrColor ? stderrColor.level : 0});

//FILE: src/utils/km.engineLog.ts
/** Byte-offset we last read from. */
let lastPos = 0;
/** Lazy-loaded log path to avoid calling os.homedir() at module load time */
function getLogPath() {
    try {
        const os = require("os");
        return `${os.homedir()}/Library/Logs/Keyboard Maestro/Engine.log`;
    }
    catch (error) {
        // Fallback for environments where os module isn't available
        console.warn("[km.engineLog] os module not available, using fallback path");
        return "/tmp/keyboard-maestro-engine.log";
    }
}
/**
 * Begin watching the Keyboard Maestro Engine log for new entries.
 * We don’t actually tail in real time—just record where we are now.
 */
function startWatching() {
    const logPath = getLogPath();
    const fs = require("fs");
    // Safe fs check
    const existsSync = typeof fs.existsSync === "function" ? fs.existsSync : () => false;
    const statSync = typeof fs.statSync === "function" ? fs.statSync : () => ({ size: 0 });
    lastPos = existsSync(logPath) ? statSync(logPath).size : 0;
}
/**
 * Return any lines containing failure or error indicators since we last watched or optionally since a given position.
 * @param since - Optional position in the log file to start reading from.
 */
function getErrors(since) {
    const logPath = getLogPath();
    const fs = require("fs");
    // Safe fs checks
    const existsSync = typeof fs.existsSync === "function" ? fs.existsSync : () => false;
    const statSync = typeof fs.statSync === "function" ? fs.statSync : () => ({ size: 0 });
    const openSync = typeof fs.openSync === "function" ? fs.openSync : null;
    const readSync = typeof fs.readSync === "function" ? fs.readSync : null;
    if (!existsSync(logPath) || !openSync || !readSync)
        return [];
    // --- read only the *new* bytes -----------------------------------------
    const fileSize = statSync(logPath).size;
    const startPos = lastPos;
    if (fileSize <= startPos) {
        lastPos = fileSize;
        return [];
    }
    const byteCount = fileSize - startPos;
    const buffer = Buffer.alloc(byteCount);
    const fd = openSync(logPath, "r");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readSync(fd, buffer, 0, byteCount, startPos);
    const tail = buffer.toString("utf8");
    lastPos = fileSize;
    const lines = tail.split(/\r?\n/);
    return lines.filter((l) => /\b(fail(?:ed|ure)?|error)\b/i.test(l));
}
/**
 * Strip leading timestamp from each log line.
 * @param lines - Raw log lines
 */
function stripTimestamps(lines) {
    return lines.map((l) => l.replace(/^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2} /, ""));
}
/**
 * Check and report any errors found in the Keyboard Maestro Engine log.
 * Logs errors in red if found.
 * @param xml - Optional XML string to print after errors.
 * @returns true if errors were reported, false otherwise.
 */
function reportErrors(xml) {
    const errors = stripTimestamps(getErrors());
    if (errors.length > 0) {
        console.log();
        console.log(chalk.red.bold("[km.engineLog] Virtual macro reported engine errors:"));
        console.log(chalk.grey("----------------------------------------------------"));
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

//FILE: src/utils/spawn.utils.ts
/**
 * Utility to safely obtain spawnSync even when bundlers replace child_process with stubs.
 * This handles CEP environments where the bundler stubs Node.js modules but the runtime
 * still has access to the real Node.js APIs.
 */
function getSafeSpawnSync() {
    var _a, _b, _c, _d;
    let spawnSync;
    // ① First try the local (possibly-stubbed) require
    try {
        spawnSync = (_a = require === null || require === void 0 ? void 0 : require("child_process")) === null || _a === void 0 ? void 0 : _a.spawnSync;
    }
    catch (_e) {
        /* ignore */
    }
    // ② If that failed, grab the copy exposed on globalThis by the host environment
    if (!spawnSync && typeof globalThis !== "undefined") {
        try {
            spawnSync = (_d = (_c = (_b = globalThis).__cgNodeRequire) === null || _c === void 0 ? void 0 : _c.call(_b, "child_process")) === null || _d === void 0 ? void 0 : _d.spawnSync;
        }
        catch (_f) {
            /* ignore */
        }
    }
    if (typeof spawnSync !== "function") {
        throw new Error("child_process.spawnSync not available in this environment");
    }
    return spawnSync;
}

//FILE: src/kmjs.runMacro.ts
/**
 * @file kmjs.runMacro.ts
 * @module kmjs.runMacro
 * @description Run a Keyboard Maestro macro via JXA/osascript.
 *
 * Spawns an osascript process, invokes the specified macro UUID or name
 * with an optional parameter, and returns whatever the macro’s final
 * 'Return' action outputs as a string.
 *
 * @example
 * import { runMacro } from 'kmjs';
 * const result = runMacro({ macroId: '...', parameter: { foo: 'bar' } });
 */
// Lazy import to avoid CEP environment issues
/**
 * Escape a value so it can be embedded inside the single‑quoted JXA template.
 * @param str - String to escape for JXA
 * @returns Escaped string
 */
function escapeForJXA(str) {
    return str
        .replace(/\\/g, "\\\\") // backslashes
        .replace(/'/g, "\\'") // single quotes
        .replace(/\n/g, "\\n") // newlines
        .replace(/\r/g, "\\r"); // carriage returns
}
/**
 * Execute a Keyboard Maestro macro.
 *
 * @param options.macroId - UUID or name of the macro.
 * @param options.parameter - Optional parameter to pass; objects are JSON-stringified.
 * @returns The string output from the macro’s final 'Return' action.
 * @throws If the osascript process fails or the macro errors.
 */
function runMacro({ macroId, parameter = "" }) {
    const paramString = typeof parameter === "object"
        ? JSON.stringify(parameter)
        : String(parameter);
    const jxa = `
(function () {
  var kme = Application('Keyboard Maestro Engine');
  var result = kme.doScript('${macroId}', { withParameter: '${escapeForJXA(paramString)}' });
  return (result !== undefined && result !== null) ? String(result) : '';
})();`;
    // 🔍 Debug logging:
    console.log(chalk.magenta(`[kmjs.runMacro] Macro ID: ${macroId}`));
    console.log(chalk.gray(`[kmjs.runMacro] Param: ${paramString}`));
    console.log(chalk.gray(`[kmjs.runMacro] JXA →\n${jxa}`));
    startWatching();
    const spawnSync = getSafeSpawnSync();
    const { status, stdout, stderr, error } = spawnSync("osascript", ["-l", "JavaScript", "-e", jxa], { encoding: "utf8" });
    if (error) {
        console.error(chalk.red("[kmjs.runMacro] spawnSync error:"), error);
        throw error;
    }
    if (status !== 0) {
        console.error(chalk.red(`[kmjs.runMacro] osascript stderr:\n${stderr}`));
        throw new Error(`osascript failed: ${stderr.trim()}`);
    }
    const engineErrors = stripTimestamps(getErrors());
    if (engineErrors.length) {
        const divider = chalk.bgRed(" ".repeat(48));
        console.log();
        console.log(divider);
        console.log(chalk.whiteBright.bgRed.bold("[kmjs.runMacro] Engine Errors:"));
        engineErrors.forEach((err, idx) => {
            const bullet = chalk.redBright("  • ");
            const msg = idx % 2 === 0
                ? chalk.yellowBright.bold(err)
                : chalk.whiteBright.bold(err);
            console.log(bullet + msg);
        });
        console.log(divider);
        console.log();
    }
    console.log(chalk.green(`[kmjs.runMacro] stdout: ${stdout.trim()}`));
    return stdout.trim();
}

//FILE: src/utils/template.xml.generic.ts
/**
 * Standard Keyboard Maestro .kmmacros XML header (PLIST format).
 * Use this at the start of any generated macro XML.
 */
const PLIST_HEADER = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ` +
    `"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
    `<plist version="1.0">\n<array>\n`;
/**
 * Standard Keyboard Maestro .kmmacros XML footer (PLIST format).
 * Use this at the end of any generated macro XML.
 */
const PLIST_FOOTER = "</array>\n</plist>";
/**
 * Generates a unique action UID for Keyboard Maestro actions.
 * Uses Unix timestamp in seconds as the base for uniqueness.
 *
 * @param opts - Options for UID generation
 * @returns A numeric UID suitable for KM actions
 */
function generateActionUID(opts = {}) {
    const { timestamp = Date.now() } = opts;
    return Math.floor(timestamp / 1000);
}
/**
 * Generates the ActionUID XML key-value pair for KM actions.
 *
 * @param opts - Options for UID generation
 * @returns Array of XML lines for the ActionUID
 */
function generateActionUIDXml(opts = {}) {
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
function renderStopOnFailureXml(stopOnFailure) {
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
function renderNotifyOnFailureXml(notifyOnFailure) {
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
function renderTimeoutXml(options = {}) {
    const { notifyOnTimeout = true, timeoutAborts = true } = options;
    const xmlLines = [];
    // NotifyOnTimeOut is included when it differs from expected behavior:
    // - If timeoutAborts=true and notifyOnTimeout=false (non-default)
    // - If timeoutAborts=false and notifyOnTimeout=true (non-default for this case)
    const shouldIncludeNotifyOnTimeOut = (timeoutAborts === true && notifyOnTimeout === false) ||
        (timeoutAborts === false && notifyOnTimeout === true);
    if (shouldIncludeNotifyOnTimeOut) {
        xmlLines.push("\t\t<key>NotifyOnTimeOut</key>", notifyOnTimeout ? "\t\t<true/>" : "\t\t<false/>");
    }
    // TimeOutAbortsMacro is always included
    xmlLines.push("\t\t<key>TimeOutAbortsMacro</key>", timeoutAborts ? "\t\t<true/>" : "\t\t<false/>");
    return xmlLines;
}

//FILE: src/utils/utils.xml.ts
/**
 * Escape special characters for safe inclusion in XML text nodes.
 * @param str - Raw string to escape.
 * @returns A string with XML entities substituted.
 */
function escapeForXml(str) {
    return str.replace(/[<>&'"]/g, (c) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
    })[c]);
}
/**
 * Formats XML action content with proper KM-style nested indentation.
 * Applies appropriate indentation levels: dict at 1 tab, contents at 2 tabs.
 * Preserves multiline string content without adding extra indentation.
 * @param content - The XML content to format
 * @returns Properly indented XML string matching KM's format
 */
function formatXmlAction(content) {
    const lines = content.trim().split("\n");
    let insideMultilineString = false;
    return lines
        .map((line) => {
        const trimmed = line.trim();
        if (!trimmed)
            return line;
        // Detect multiline string patterns
        if (trimmed.startsWith("<string>") && !trimmed.endsWith("</string>")) {
            // Starting a multiline string
            insideMultilineString = true;
            return "\t\t" + trimmed;
        }
        else if (insideMultilineString && trimmed === "</string>") {
            // Ending a multiline string
            insideMultilineString = false;
            return "\t\t" + trimmed;
        }
        else if (insideMultilineString) {
            // Inside a multiline string - don't add extra indentation
            return line;
        }
        // <dict> and </dict> get 1 tab
        if (trimmed === "<dict>" || trimmed === "</dict>") {
            return "\t" + trimmed;
        }
        // Everything else inside dict gets 2 tabs
        return "\t\t" + trimmed;
    })
        .join("\n");
}
/**
 * Sorts object keys in Keyboard Maestro's canonical order.
 * This handles the general XML dict ordering requirements across all KM actions.
 * @param keys - Array of keys to sort
 * @param context - Optional context hint for specialized ordering (e.g. 'condition', 'action', 'application')
 * @returns Sorted array with keys in KM's canonical order
 */
function kmKeyOrder(keys, context) {
    if (context === "condition") {
        const flagKeys = [
            "IsFrontApplication",
            "IsFrontWindow",
            "IsFront",
            // feel free to add more here later
        ];
        return keys.sort((a, b) => {
            const aIsFlag = flagKeys.includes(a);
            const bIsFlag = flagKeys.includes(b);
            // ConditionType just before flags
            if (a === "ConditionType" && bIsFlag)
                return -1;
            if (b === "ConditionType" && aIsFlag)
                return 1;
            // ConditionType after regular fields but before flags
            // if (a === "ConditionType") return 1;
            // if (b === "ConditionType") return -1;
            // flags always go last (keep their relative order)
            if (aIsFlag && !bIsFlag)
                return 1;
            if (bIsFlag && !aIsFlag)
                return -1;
            // alphabetical fallback
            return a.localeCompare(b, "en");
        });
    }
    return keys.sort((a, b) => {
        // For action contexts, MacroActionType typically comes early
        if (context === "action") {
            if (a === "MacroActionType")
                return -1;
            if (b === "MacroActionType")
                return 1;
            // ActionUID if present
            if (a === "ActionUID")
                return -1;
            if (b === "ActionUID")
                return 1;
            // Then alphabetical
            return a.localeCompare(b, "en");
        }
        // For application contexts, sort specific keys first
        if (context === "application") {
            const appKeyOrder = [
                "BundleIdentifier",
                "Match",
                "Name",
                "NewFile",
                "Path",
            ];
            const aIndex = appKeyOrder.indexOf(a);
            const bIndex = appKeyOrder.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1)
                return aIndex - bIndex;
            if (aIndex !== -1)
                return -1;
            if (bIndex !== -1)
                return 1;
            return a.localeCompare(b, "en");
        }
        // Default: alphabetical sorting
        return a.localeCompare(b, "en");
    });
}
/**
 * Generates a Keyboard Maestro time code for CreationDate/ModificationDate.
 * Returns seconds since epoch as a float, e.g. 774213049.26031303
 */
function generateKMTimeCode() {
    return Date.now() / 1000;
}

// FILE: src/tokens/km.tokens.ts
/**
 * @file A comprehensive, documented list of all Keyboard Maestro text tokens.
 * @description This file provides a constant object `KM_TOKENS` where each key is a PascalCase
 * representation of a Keyboard Maestro token, and its value is the raw token string (e.g., `%RandomUUID%`).
 * Each token is accompanied by detailed JSDoc documentation sourced from the Keyboard Maestro documentation.
 */
const KM_TOKENS = {
    /**
     * **A Random Unique ID**
     *
     * Returns a brand‑new UUID (v4) every time it is expanded. Handy for unique temp filenames, correlation IDs for logs, or deduplicating runs of a macro.
     *
     * **Why this over `%Calculate%` etc?** You cannot reliably generate RFC‑4122 UUIDs with Keyboard Maestro math/functions. Use this when you truly need uniqueness without maintaining state.
     *
     * @token %RandomUUID%
     * @since v8
     * @category System
     * @example
     * // Give a file a unique suffix
     * Set Variable “Path” to Text: ~/Desktop/output-%RandomUUID%.txt
     * @see https://wiki.keyboardmaestro.com/token/RandomUUID
     */
    ARandomUniqueID: "%RandomUUID%",
    /**
     * **AddressBook Email**
     *
     * Reads a field from your macOS Contacts “Me” card. Use this to personalise snippets, fill forms, or route mail without hard‑coding values.
     *
     * **Sibling tokens:** `%AddressBook%Name%`, `%AddressBook%First%`, `%AddressBook%Last%`, `%AddressBook%Nickname%`, `%AddressBook%Organization%`, `%AddressBook%Note%`.
     *
     * Prefer these tokens when you always want *your* identity, not the frontmost Mail message (see the `Mail*` tokens).
     *
     * @token %AddressBook%Email%
     * @category System
     * @example Use in an email template snippet: “From: %AddressBook%Name% &lt;%AddressBook%Email%&gt;”
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookEmail: "%AddressBook%Email%",
    /**
     * **AddressBook First Name**
     *
     * Your given name from the macOS Contacts “Me” card.
     * Complementary with `%AddressBook%Last%`.
     *
     * @token %AddressBook%First%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookFirstName: "%AddressBook%First%",
    /**
     * **AddressBook Last Name**
     *
     * Family/surname from the Contacts “Me” card. Combine with `%AddressBook%First%` or `%AddressBook%Name%` as needed.
     *
     * @token %AddressBook%Last%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookLastName: "%AddressBook%Last%",
    /**
     * **AddressBook Name**
     *
     * Full display name from the “Me” card, respecting locale order (e.g. “Jane Doe”).
     * Faster than concatenating first/last manually.
     *
     * @token %AddressBook%Name%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookName: "%AddressBook%Name%",
    /**
     * **AddressBook Nickname**
     *
     * The “nickname” field of your Contacts card. Useful for casual email openings.
     *
     * @token %AddressBook%Nickname%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookNickname: "%AddressBook%Nickname%",
    /**
     * **AddressBook Note**
     *
     * Arbitrary notes stored on your “Me” card (could hold license keys, disclaimers, etc.).
     * Retrieve securely without hard-coding secrets in macros.
     *
     * @token %AddressBook%Note%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookNote: "%AddressBook%Note%",
    /**
     * **AddressBook Organization**
     *
     * Company/organisation field from your card — ideal for letterheads or email signatures.
     *
     * @token %AddressBook%Organization%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/AddressBook
     */
    AddressBookOrganization: "%AddressBook%Organization%",
    /**
     * **All Audio Input Devices**
     *
     * List every microphone or aggregate input your Mac can “see”, one per line.
     * Great for building *choose‑input* palettes or sanity‑checking device names before a script switches input via shell.
     *
     * **Compare:**
     * • `%AudioInputDevice%` → *current* input only.
     * • `%AudioOutputDevices%` → speakers/headphones.
     *
     * @token %AudioInputDevices%
     * @category Audio
     * @example
     * Prompt With List ─ Items: `%AudioInputDevices%`
     * @see https://wiki.keyboardmaestro.com/token/AudioInputDevices
     */
    AllAudioInputDevices: "%AudioInputDevices%",
    /**
     * **All Audio Output Devices**
     *
     * Names every playback device the CoreAudio HAL reports (built‑in, USB, AirPlay, aggregate), one per line.
     * Use to populate a menu or to verify exact spelling before issuing `SwitchAudioSource`.
     *
     * @token %AudioOutputDevices%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioOutputDevices
     */
    AllAudioOutputDevices: "%AudioOutputDevices%",
    /**
     * **All Background Application Names**
     *
     * Every *running* app **without** a Dock icon (daemons, helpers), one per line.
     * Use to debug launch agents or to ensure headless apps (e.g. Dropbox) are alive.
     *
     * @token %Application%Background%
     * @category Application
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens
     */
    AllBackgroundApplicationNames: "%Application%Background%",
    /**
     * **All Foreground Application Names**
     *
     * Running apps with visible UI (Dock icons).
     * Useful for building app‑switcher palettes or conditional workflows that ignore background utilities.
     *
     * @token %Application%Foreground%
     * @category Application
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens
     */
    AllForegroundApplicationNames: "%Application%Foreground%",
    /**
     * **All Running Application Names**
     *
     * Union of foreground + background. Think of it as `ps` filtered to GUI & agents.
     * Iterate to quit everything except a safelist.
     *
     * @token %Application%All%
     * @category Application
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens
     */
    AllRunningApplicationNames: "%Application%All%",
    /**
     * **All Screen Frames**
     *
     * Frames (left,top,width,height) for **all** connected displays, from left to right, one per line. Great for iterating windows across monitors.
     *
     * Compare with:
     *  - `%Screen%Main%` / `%Screen%1%` – a single screen.
     *  - `%ScreenVisible%…%` – excludes the menu bar and Dock areas.
     *
     * Coordinates are measured from the top‑left of the **main** screen.
     *
     * @token %Screen%All%
     * @category Screen
     * @example
     * For Each line in `%Screen%All%` → move a window to each screen in turn.
     * @see https://wiki.keyboardmaestro.com/token/Screen
     */
    AllScreenFrames: "%Screen%All%",
    /**
     * **All Window Names**
     *
     * Titles of *every* window in the front app, newline‑separated.
     * Combine with a “Prompt With List” to let users pick a window to focus.
     *
     * @token %WindowName%All%
     * @category Window
     * @see https://wiki.keyboardmaestro.com/token/Window_Tokens
     */
    AllWindowNames: "%WindowName%All%",
    /**
     * **Calculation**
     *
     * Numerically evaluate a formula. Variables are read as numbers (not strings), functions are allowed, and the result is returned **without** formatting.
     *
     * **Use when:** you need arithmetic, comparisons, or to coerce a variable like `"007"` to the number `7`. For string output with formatting, see {@link FormattedCalculation}.
     *
     * @token %Calculate%<formula>%
     * @category Calculation
     * @examples
     *  - %Calculate%1+2%
     *  - %Calculate%(MyVarWordsPerSec*60)/MyVarWordsPerPage%
     *  - %Calculate%RANDOM(10)%
     * @difference
     * `%Variable%MyVar%` returns **the literal string** of the variable, `%Calculate%MyVar%` returns its numeric interpretation.
     * @see https://wiki.keyboardmaestro.com/token/Calculate
     */
    Calculation: "%Calculate%1+2%",
    /**
     * **Calculation with Result in Binary**
     *
     * Returns the result of a calculation formatted as **binary**, padded to *N* digits.
     *
     * @token %BinN%<formula>%
     * @category Calculation
     * @example %Bin8%10%  → 00001010
     * @see https://wiki.keyboardmaestro.com/token/Calculate
     */
    CalculationWithResultInBinary: "%Bin8%1+2%",
    /**
     * **Calculation with Result in Decimal**
     *
     * Returns the result of a calculation as **decimal**, left‑padded with zeros to *N* digits.
     *
     * @token %DecN%<formula>%
     * @category Calculation
     * @example %Dec5%123% → 00123
     * @see https://wiki.keyboardmaestro.com/token/Calculate
     */
    CalculationWithResultInDecimal: "%Dec2%1+2%",
    /**
     * **Calculation with Result in Hex**
     *
     * Returns the result of a calculation as **hexadecimal**, left‑padded with zeros to *N* digits.
     *
     * @token %HexN%<formula>%
     * @category Calculation
     * @example %Hex4%255% → 00FF
     * @see https://wiki.keyboardmaestro.com/token/Calculate
     */
    CalculationWithResultInHex: "%Hex2%1+2%",
    /**
     * **Calculation with Result in Octal**
     *
     * Returns the result of a calculation as **octal**, left‑padded with zeros to *N* digits.
     *
     * @token %OctN%<formula>%
     * @category Calculation
     * @see https://wiki.keyboardmaestro.com/token/Calculate
     */
    CalculationWithResultInOctal: "%Oct3%1+2%",
    /**
     * **Comma-separated list of the current execution instances**
     *
     * All currently running **macro instances**, expressed as opaque IDs. Use these with AppleScript to fetch Local/Instance variables or to cancel a *specific* instance.
     *
     * Prefer this over `%ExecutingInstance%` when you want *every* instance, not just “this one”.
     *
     * @token %ExecutingInstances%
     * @since v9.0
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingInstances
     */
    CommaSeparatedListOfTheCurrentExecutionInstances: "%ExecutingInstances%",
    /**
     * **Comma-separated list of variables accessed by this macro**
     *
     * Debug helper: which variables did this macro touch (read or write)? Useful for logging or snapshotting state after a run. Do **not** rely on it for cleanup — access can be implicit.
     *
     * @token %AccessedVariables%
     * @since v10.0
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/AccessedVariables
     */
    CommaSeparatedListOfVariablesAccessedByThisMacro: "%AccessedVariables%",
    /**
     * **Current Audio Input Device**
     *
     * Returns the *selected* system input (eg “Built‑in Microphone” or “Loopback”).
     * Automations that record, transcribe, or gate audio can log this token before capture to avoid ambiguity.
     *
     * @token %AudioInputDevice%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioDevice
     */
    CurrentAudioInputDevice: "%AudioInputDevice%",
    /**
     * **Current Audio Input Device UID**
     *
     * Stable CoreAudio UID for the active input — survives renaming.
     * Use when scripting `switchaudiosource` or comparing across Macs where user‑facing names may differ.
     *
     * @token %AudioInputDeviceUID%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioDevice
     */
    CurrentAudioInputDeviceUID: "%AudioInputDeviceUID%",
    /**
     * **Current Audio Output Device**
     *
     * What your Mac is *playing through* right now (menu‑bar Output). Handy for volume macros or context‑aware EQ.
     *
     * @token %AudioOutputDevice%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioDevice
     */
    CurrentAudioOutputDevice: "%AudioOutputDevice%",
    /**
     * **Current Audio Output Device UID**
     *
     * CoreAudio UID of the active output device — ideal for deterministic scripting.
     *
     * @token %AudioOutputDeviceUID%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioDevice
     */
    CurrentAudioOutputDeviceUID: "%AudioOutputDeviceUID%",
    /**
     * **Current Audio Sound Effects Device**
     *
     * Device used for system beeps/alerts (can differ from main output).
     * Log this before playing alerts so users know *where* the sound went.
     *
     * @token %AudioSoundEffectsDevice%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioDevice
     */
    CurrentAudioSoundEffectsDevice: "%AudioSoundEffectsDevice%",
    /**
     * **Current Audio Sound Effects Device UID**
     *
     * CoreAudio UID for the system‑alert output device.
     *
     * @token %AudioSoundEffectsDeviceUID%
     * @category Audio
     * @see https://wiki.keyboardmaestro.com/token/AudioDevice
     */
    CurrentAudioSoundEffectsDeviceUID: "%AudioSoundEffectsDeviceUID%",
    /**
     * **Current Mouse Location**
     *
     * Current pointer position as `"x,y"`. Combine with screen/frame tokens to anchor UI interactions or to restore the cursor after moving it.
     *
     * @token %CurrentMouse%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/CurrentMouse
     */
    CurrentMouseLocation: "%CurrentMouse%",
    /**
     * **Current Track Album**
     *
     * Returns the album of the currently playing track in iTunes/Music.app.
     *
     * @token %CurrentTrack%album%
     * @category Music
     * @see https://wiki.keyboardmaestro.com/token/CurrentTrack
     */
    CurrentTrackAlbum: "%CurrentTrack%album%",
    /**
     * **Current Track Artist**
     *
     * Returns the artist of the currently playing track in iTunes/Music.app.
     *
     * @token %CurrentTrack%artist%
     * @category Music
     * @see https://wiki.keyboardmaestro.com/token/CurrentTrack
     */
    CurrentTrackArtist: "%CurrentTrack%artist%",
    /**
     * **Current Track Name**
     *
     * Returns the name of the currently playing track in iTunes/Music.app.
     *
     * @token %CurrentTrack%name%
     * @category Music
     * @see https://wiki.keyboardmaestro.com/token/CurrentTrack
     */
    CurrentTrackName: "%CurrentTrack%name%",
    /**
     * **Current Track Rating**
     *
     * Returns the star rating of the currently playing track in iTunes/Music.app.
     *
     * @token %CurrentTrack%ratingstars%
     * @category Music
     * @see https://wiki.keyboardmaestro.com/token/CurrentTrack
     */
    CurrentTrackRating: "%CurrentTrack%ratingstars%",
    /**
     * **Delete (Hide a Variable)**
     *
     * Special sentinel: when used as the value in “Set Variable to Text”, Keyboard Maestro **deletes** the variable instead of setting it to the empty string. Everywhere else it expands to an empty string.
     *
     * @token %Delete%
     * @category Variable
     * @example
     * Set Variable “Tmp” to Text: %Delete%  // Tmp is removed, not just blanked.
     * @see https://wiki.keyboardmaestro.com/token/Delete
     */
    Delete: "%Delete%",
    /**
     * **Executing Macro**
     *
     * The human‑readable name of the macro that is currently executing (the *top level* one). For the action’s containing macro (inside sub‑macros), see `%ExecutingThisMacro%`.
     *
     * @token %ExecutingMacro%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingMacro
     */
    ExecutingMacro: "%ExecutingMacro%",
    /**
     * **Executing Macro Group**
     *
     * Name (and via the UUID variant, the ID) of the group that owns the currently executing macro. Useful for group‑scoped logging/routing.
     *
     * @token %ExecutingMacroGroup%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingMacroGroup
     */
    ExecutingMacroGroup: "%ExecutingMacroGroup%",
    /**
     * **Executing Macro Group UUID**
     *
     * The `\%ExecutingMacroGroupUUID\%` token returns the UUID of the macro group containing the currently executing macro.
     *
     * @token %ExecutingMacroGroupUUID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingMacroGroup?redirect=1
     */
    ExecutingMacroGroupUUID: "%ExecutingMacroGroupUUID%",
    /**
     * **Executing Macro UUID**
     *
     * The stable identifier of the currently executing macro. Prefer this over names if you need to look up macros programmatically or across renamed macros.
     *
     * @token %ExecutingMacroUUID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingMacroUUID
     */
    ExecutingMacroUUID: "%ExecutingMacroUUID%",
    /**
     * **Executing This Macro**
     *
     * The name of the macro **that this action lives inside**. Differs from `%ExecutingMacro%` when you run a sub‑macro using *Execute a Macro*.
     *
     * @token %ExecutingThisMacro%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingThisMacro
     */
    ExecutingThisMacro: "%ExecutingThisMacro%",
    /**
     * **Executing This Macro Group**
     *
     * The group name (and via UUID variant, ID) that this action is in. Helps resolve context when building reusable sub‑macros.
     *
     * @token %ExecutingThisMacroGroup%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingThisMacroGroup
     */
    ExecutingThisMacroGroup: "%ExecutingThisMacroGroup%",
    /**
     * **Executing This Macro Group UUID**
     *
     * The `\%ExecutingThisMacroGroupUUID\%` token returns the UUID of the macro group the action is within.
     *
     * @token %ExecutingThisMacroGroupUUID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingThisMacroGroup?redirect=1
     */
    ExecutingThisMacroGroupUUID: "%ExecutingThisMacroGroupUUID%",
    /**
     * **Executing This Macro UUID**
     *
     * UUID of the macro that contains the current action (can differ from `%ExecutingMacroUUID%`).
     *
     * @token %ExecutingThisMacroUUID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingThisMacroUUID
     */
    ExecutingThisMacroUUID: "%ExecutingThisMacroUUID%",
    /**
     * **Find Pasteboard**
     *
     * The `\%FindPasteboard\%` token returns the current value of the system's find pasteboard (separate from the clipboard).
     *
     * @token %FindPasteboard%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/FindPasteboard
     */
    FindPasteboard: "%FindPasteboard%",
    /**
     * **Finder Insertion Location Path**
     *
     * The `\%FinderInsertionLocation\%` token returns the path of the Finder's current insertion location, typically the path of the frontmost Finder window.
     *
     * @token %FinderInsertionLocation%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/FinderInsertionLocation
     */
    FinderInsertionLocationPath: "%FinderInsertionLocation%",
    /**
     * **First Screen Frame**
     *
     * Frame of the *left-most* display (index 1). Same as `%Screen%Main%` **only** when the main display is left-most.
     *
     * @token %Screen%1%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Screen
     */
    FirstScreenFrame: "%Screen%1%",
    /**
     * **Formatted (ICU) Date Time**
     *
     * The `\%ICUDateTime\%` token returns the current date formatted according to an ICU Date Time format string.
     * Example: `\%ICUDateTime%EEE, MMM d, yyyy h:mm\%`.
     *
     * @token %ICUDateTime%EEE, MMM d, yyyy h:mm%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/ICUDateTime
     */
    FormattedICUDateTime: "%ICUDateTime%EEE, MMM d, yyyy h:mm%",
    /**
     * **Formatted (ICU) Date Time For**
     *
     * The `\%ICUDateTimeFor\%` token returns a specific date (based on a calculation or unixtime) formatted with an ICU string.
     *
     * @token %ICUDateTimeFor%NOW()+20%EEE, MMM d, yyyy h:mm%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/ICUDateTime?redirect=1
     */
    FormattedICUDateTimeFor: "%ICUDateTimeFor%NOW()+20%EEE, MMM d, yyyy h:mm%",
    /**
     * **Formatted (ICU) Date Time Minus**
     *
     * The `\%ICUDateTimeMinus\%` token returns a date in the past, calculated by subtracting a specified amount of time, and formats it.
     *
     * @token %ICUDateTimeMinus%3*7%Days%EEE, MMM d, yyyy h:mm%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/ICUDateTime?redirect=1
     */
    FormattedICUDateTimeMinus: "%ICUDateTimeMinus%3*7%Days%EEE, MMM d, yyyy h:mm%",
    /**
     * **Formatted (ICU) Date Time Plus**
     *
     * The `\%ICUDateTimePlus\%` token returns a date in the future, calculated by adding a specified amount of time, and formats it.
     *
     * @token %ICUDateTimePlus%3*7%Days%EEE, MMM d, yyyy h:mm%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/ICUDateTime?redirect=1
     */
    FormattedICUDateTimePlus: "%ICUDateTimePlus%3*7%Days%EEE, MMM d, yyyy h:mm%",
    /**
     * **Formatted Calculation**
     *
     * The `\%CalculateFormat\%` token returns the result of a calculation, formatted according to a Unicode number format pattern.
     * Useful for displaying numbers with specific decimal places, currency symbols, or separators.
     *
     * @token %CalculateFormat%1+2%#,##0.00#%
     * @category Calculation
     * @see https://wiki.keyboardmaestro.com/token/CalculateFormat
     */
    FormattedCalculation: "%CalculateFormat%1+2%#,##0.00#%",
    /**
     * **Front Application Bundle ID**
     *
     * Reverse-DNS identifier (e.g. `com.apple.Finder`).
     * Prefer over names for settings storage because it survives localisation/renames.
     *
     * @token %ApplicationBundleID%1%
     * @category Application
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens
     */
    FrontApplicationBundleID: "%ApplicationBundleID%1%",
    /**
     * **Front Application Long Version**
     *
     * Returns the detailed version string of the frontmost application.
     *
     * @token %ApplicationLongVersion%1%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens?redirect=1
     */
    FrontApplicationLongVersion: "%ApplicationLongVersion%1%",
    /**
     * **Front Application Name**
     *
     * Simple, reliable name of the frontmost app (“Finder”, “Pages”). Combine with `%WindowName%1%` for logging *where* a macro fired.
     *
     * @token %Application%1%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens
     */
    FrontApplicationName: "%Application%1%",
    /**
     * **Front Application Path**
     *
     * Returns the full file path to the frontmost application's executable.
     *
     * @token %ApplicationPath%1%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens?redirect=1
     */
    FrontApplicationPath: "%ApplicationPath%1%",
    /**
     * **Front Application Version**
     *
     * Short semantic version of the frontmost app (e.g. “14.1”). Use when guarding features that only exist in certain versions.
     *
     * @token %ApplicationVersion%1%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens?redirect=1
     */
    FrontApplicationVersion: "%ApplicationVersion%1%",
    /**
     * **Front Browser Bundle ID**
     *
     * Returns the bundle identifier of the frontmost web browser.
     *
     * @token %FrontBrowserBundleID%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserBundleID: "%FrontBrowserBundleID%",
    /**
     * **Front Browser Document Title**
     *
     * Returns the title of the document in the frontmost tab of the frontmost web browser.
     *
     * @token %FrontBrowserTitle%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserDocumentTitle: "%FrontBrowserTitle%",
    /**
     * **Front Browser Document URL**
     *
     * Returns the URL of the document in the frontmost tab of the frontmost web browser.
     *
     * @token %FrontBrowserURL%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserDocumentURL: "%FrontBrowserURL%",
    /**
     * **Front Browser Field**
     *
     * Returns the value of a specific field in the front browser's document, identified by a JavaScript path.
     *
     * @token %FrontBrowserField%document.forms[0][0]%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserField: "%FrontBrowserField%document.forms[0][0]%",
    /**
     * **Front Browser JavaScript**
     *
     * Executes a JavaScript snippet in the context of the front browser's document and returns the result.
     *
     * @token %FrontBrowserJavaScript%document.forms[0].innerHTML%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserJavaScript: "%FrontBrowserJavaScript%document.forms[0].innerHTML%",
    /**
     * **Front Browser Long Version**
     *
     * Returns the detailed version string of the frontmost web browser.
     *
     * @token %FrontBrowserLongVersion%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserLongVersion: "%FrontBrowserLongVersion%",
    /**
     * **Front Browser Name**
     *
     * Returns the name of the frontmost web browser (e.g., "Google Chrome", "Safari").
     *
     * @token %FrontBrowserName%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserName: "%FrontBrowserName%",
    /**
     * **Front Browser Path**
     *
     * Returns the file path to the frontmost web browser's executable.
     *
     * @token %FrontBrowserPath%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserPath: "%FrontBrowserPath%",
    /**
     * **Front Browser Ready State**
     *
     * Returns the ready state of the document in the frontmost browser tab (e.g., "complete", "interactive").
     *
     * @token %FrontBrowserReadyState%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserReadyState: "%FrontBrowserReadyState%",
    /**
     * **Front Browser Version**
     *
     * Returns the short version string of the frontmost web browser.
     *
     * @token %FrontBrowserVersion%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserVersion: "%FrontBrowserVersion%",
    /**
     * **Front Browser Window Name**
     *
     * Returns the name (title) of the frontmost web browser window.
     *
     * @token %FrontBrowserWindowName%
     * @category Front Browser
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    FrontBrowserWindowName: "%FrontBrowserWindowName%",
    /**
     * **Front Window Frame**
     *
     * Returns the frame (left,top,width,height) of the frontmost window of the front application.
     *
     * @token %WindowFrame%1%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Window_Tokens?redirect=1
     */
    FrontWindowFrame: "%WindowFrame%1%",
    /**
     * **Front Window Name**
     *
     * Returns the name (title) of the frontmost window of the front application.
     *
     * @token %WindowName%1%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Window_Tokens?redirect=1
     */
    FrontWindowName: "%WindowName%1%",
    /**
     * **Front Window Position**
     *
     * Returns the position (left,top) of the frontmost window of the front application.
     *
     * @token %WindowPosition%1%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Window_Tokens?redirect=1
     */
    FrontWindowPosition: "%WindowPosition%1%",
    /**
     * **Front Window Size**
     *
     * Returns the size (width,height) of the frontmost window of the front application.
     *
     * @token %WindowSize%1%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Window_Tokens?redirect=1
     */
    FrontWindowSize: "%WindowSize%1%",
    /**
     * **Google Chrome Bundle ID**
     *
     * Returns the bundle identifier of Google Chrome.
     *
     * @token %ChromeBundleID%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeBundleID: "%ChromeBundleID%",
    /**
     * **Google Chrome Document Title**
     *
     * Returns the title of the document in the frontmost tab of Google Chrome.
     *
     * @token %ChromeTitle%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeDocumentTitle: "%ChromeTitle%",
    /**
     * **Google Chrome Document URL**
     *
     * Returns the URL of the document in the frontmost tab of Google Chrome.
     *
     * @token %ChromeURL%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeDocumentURL: "%ChromeURL%",
    /**
     * **Google Chrome Field**
     *
     * Returns the value of a specific field in the Google Chrome document.
     *
     * @token %ChromeField%document.forms[0][0]%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeField: "%ChromeField%document.forms[0][0]%",
    /**
     * **Google Chrome JavaScript**
     *
     * Executes a JavaScript snippet in the context of the Google Chrome document and returns the result.
     *
     * @token %ChromeJavaScript%document.forms[0].innerHTML%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeJavaScript: "%ChromeJavaScript%document.forms[0].innerHTML%",
    /**
     * **Google Chrome Long Version**
     *
     * Returns the detailed version string of Google Chrome.
     *
     * @token %ChromeLongVersion%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeLongVersion: "%ChromeLongVersion%",
    /**
     * **Google Chrome Name**
     *
     * Returns the name "Google Chrome".
     *
     * @token %ChromeName%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeName: "%ChromeName%",
    /**
     * **Google Chrome Path**
     *
     * Returns the file path to the Google Chrome executable.
     *
     * @token %ChromePath%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromePath: "%ChromePath%",
    /**
     * **Google Chrome Ready State**
     *
     * Returns the ready state of the document in the frontmost tab of Google Chrome.
     *
     * @token %ChromeReadyState%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeReadyState: "%ChromeReadyState%",
    /**
     * **Google Chrome Version**
     *
     * Returns the short version string of Google Chrome.
     *
     * @token %ChromeVersion%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeVersion: "%ChromeVersion%",
    /**
     * **Google Chrome Window Name**
     *
     * Returns the name (title) of the frontmost Google Chrome window.
     *
     * @token %ChromeWindowName%
     * @category Google Chrome
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    GoogleChromeWindowName: "%ChromeWindowName%",
    /**
     * **ID of Last Keyboard Maestro Engine Window Opened by This Macro**
     *
     * The `\%LastWindowID\%` token (v10.0+) returns the window ID of the last Keyboard Maestro Engine window (e.g., a prompt) opened by this macro.
     *
     * @token %LastWindowID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/LastWindowID
     */
    IDOfLastKeyboardMaestroEngineWindowOpenedByThisMacro: "%LastWindowID%",
    /**
     * **ID of the Last Aborted Action**
     *
     * The `\%LastAbortedActionID\%` token (v11.0+) returns the ID of the most recently aborted action in the current macro execution.
     *
     * @token %LastAbortedActionID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/LastAbortedActionID
     */
    IDOfTheLastAbortedAction: "%LastAbortedActionID%",
    /**
     * **JSON From Dictionary**
     *
     * The `\%JSONFromDictionary%DictionaryName\%` token returns a JSON object constructed from a Keyboard Maestro Dictionary variable.
     * Dictionary keys become JSON field names.
     *
     * @token %JSONFromDictionary%DictionaryName%
     * @category JSON
     * @see https://wiki.keyboardmaestro.com/token/JSONFromDictionary
     */
    JSONFromDictionary: "%JSONFromDictionary%DictionaryName%",
    /**
     * **JSON From Variables**
     *
     * The `\%JSONFromVariables%Prefix\%` token returns a JSON object constructed from all variables that start with a given prefix.
     *
     * @token %JSONFromVariables%Prefix%
     * @category JSON
     * @see https://wiki.keyboardmaestro.com/token/JSONFromVariables
     */
    JSONFromVariables: "%JSONFromVariables%Prefix%",
    /**
     * **JSON Value**
     *
     * The `\%JSONValue%jsonpath\%` token returns a value from a JSON object stored in a variable, using a dot-notation path.
     * For example, `\%JSONValue%MyJSON.user.name\%`.
     *
     * @token %JSONValue%VariableName.field(field)[1]%
     * @category JSON
     * @see https://wiki.keyboardmaestro.com/token/JSONValue
     */
    JSONValue: "%JSONValue%VariableName.field(field)[1]%",
    /**
     * **Keyboard Layout Input Source**
     *
     * The `\%KeyboardLayout\%` token (v8+) returns the name of the current keyboard layout (e.g., "U.S.").
     *
     * @token %KeyboardLayout%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/KeyboardLayout
     */
    KeyboardLayoutInputSource: "%KeyboardLayout%",
    /**
     * **Keyboard Maestro Long Version**
     *
     * The `\%KeyboardMaestroLongVersion\%` token (v11.0+) returns the detailed version of the running Keyboard Maestro application.
     *
     * @token %KeyboardMaestroLongVersion%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/KeyboardMaestroVersion?redirect=1
     */
    KeyboardMaestroLongVersion: "%KeyboardMaestroLongVersion%",
    /**
     * **Keyboard Maestro Version**
     *
     * The `\%KeyboardMaestroVersion\%` token (v11.0+) returns the short version of the running Keyboard Maestro application (e.g., "11.0.2").
     *
     * @token %KeyboardMaestroVersion%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/KeyboardMaestroVersion
     */
    KeyboardMaestroVersion: "%KeyboardMaestroVersion%",
    /**
     * **Linefeed (\n)**
     *
     * The `\%LineFeed\%` token returns the linefeed character (`\n`, ASCII 0x0A). Use this to insert new lines in text.
     *
     * @token %LineFeed%
     * @category Character
     * @see https://wiki.keyboardmaestro.com/token/LineFeed
     */
    Linefeed: "%LineFeed%",
    /**
     * **Long Date**
     *
     * The `\%LongDate\%` token returns the current date in a localized long format (e.g., "September 5, 2017").
     *
     * @token %LongDate%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/LongDate
     */
    LongDate: "%LongDate%",
    /**
     * **Machine IP Address**
     *
     * The `\%MacIPAddress\%` token returns the current primary IP address of the Mac.
     *
     * @token %MacIPAddress%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/MacIPAddress
     */
    MachineIPAddress: "%MacIPAddress%",
    /**
     * **Machine Name**
     *
     * The `\%MacName\%` token returns the current computer name as set in System Settings.
     *
     * @token %MacName%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/MacName
     */
    MachineName: "%MacName%",
    /**
     * **Machine Unique ID**
     *
     * The `\%MacUUID\%` token returns a unique ID for the Mac. Useful for macros that behave differently on different machines.
     *
     * @token %MacUUID%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/MacUUID
     */
    MachineUniqueID: "%MacUUID%",
    /**
     * **Macro Name for UUID**
     *
     * This token returns the name of the macro or macro group corresponding to the specified UUID.
     * Returns "Not Found" if the UUID does not exist, allowing for existence checks.
     *
     * @token %MacroNameForUUID%UUID%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/MacroNameForUUID
     */
    MacroNameForUUID: "%MacroNameForUUID%UUID%",
    /**
     * **Mail BCC Recipients**
     *
     * Returns a comma-separated list of the BCC recipients in the currently selected Mail.app message.
     *
     * @token %MailBCCRecipients%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailBCCRecipients
     */
    MailBCCRecipients: "%MailBCCRecipients%",
    /**
     * **Mail CC Recipients**
     *
     * Returns a comma-separated list of the CC recipients in the currently selected Mail.app message.
     *
     * @token %MailCCRecipients%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailCCRecipients
     */
    MailCCRecipients: "%MailCCRecipients%",
    /**
     * **Mail Contents**
     *
     * Returns the body content of the currently selected Mail.app message.
     *
     * @token %MailContents%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailContents
     */
    MailContents: "%MailContents%",
    /**
     * **Mail Raw Source**
     *
     * Returns the full raw source of the currently selected Mail.app message, including all headers.
     *
     * @token %MailRawSource%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailRawSource
     */
    MailRawSource: "%MailRawSource%",
    /**
     * **Mail Recipients**
     *
     * Returns a comma-separated list of all recipients (To, CC, BCC) in the currently selected Mail.app message.
     *
     * @token %MailRecipients%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailRecipients
     */
    MailRecipients: "%MailRecipients%",
    /**
     * **Mail Reply To**
     *
     * Returns the Reply-To address of the currently selected Mail.app message.
     *
     * @token %MailReplyTo%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailReplyTo
     */
    MailReplyTo: "%MailReplyTo%",
    /**
     * **Mail Sender**
     *
     * Returns the sender of the currently selected Mail.app message.
     *
     * @token %MailSender%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailSender
     */
    MailSender: "%MailSender%",
    /**
     * **Mail Subject**
     *
     * Returns the subject of the currently selected Mail.app message.
     *
     * @token %MailSubject%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailSubject
     */
    MailSubject: "%MailSubject%",
    /**
     * **Mail To Recipients**
     *
     * Returns a comma-separated list of the To recipients in the currently selected Mail.app message.
     *
     * @token %MailToRecipients%
     * @category Mail
     * @see https://wiki.keyboardmaestro.com/token/MailToRecipients
     */
    MailToRecipients: "%MailToRecipients%",
    /**
     * **Main Screen Frame**
     *
     * Returns the frame (left,top,width,height) of the main screen (the one with the menu bar).
     *
     * @token %Screen%Main%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Screen
     */
    MainScreenFrame: "%Screen%Main%",
    /**
     * **Main Screen Possible Resolutions (array of resolutions)**
     *
     * The `\%ScreenResolutions\%` token (v11.0+) returns a list of the available resolutions for the main screen.
     *
     * @token %ScreenResolutions%Main%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/ScreenResolution?redirect=1
     */
    MainScreenPossibleResolutions: "%ScreenResolutions%Main%",
    /**
     * **Main Screen Resolution (width,height,pixelwidth,pixelheight,refresh)**
     *
     * The `\%ScreenResolution\%` token (v11.0+) returns the current resolution of the main screen.
     * The format is `width,height,pixelwidth,pixelheight,refresh`.
     *
     * @token %ScreenResolution%Main%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/ScreenResolution
     */
    MainScreenResolution: "%ScreenResolution%Main%",
    /**
     * **Main Screen Visible Frame**
     *
     * Same metrics as `%Screen%Main%` but *excludes* areas covered by the Menu Bar and Dock.
     * Use for maximising windows without hiding system UI.
     *
     * @token %ScreenVisible%Main%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/ScreenVisible
     */
    MainScreenVisibleFrame: "%ScreenVisible%Main%",
    /**
     * **Music Player State**
     *
     * Returns `stopped`, `playing`, `paused`, `fast forwarding`, `rewinding`, or `not running`.
     * Branch your macro: pause podcasts before a call, resume after.
     *
     * @token %MusicPlayerState%
     * @category Music
     * @see https://wiki.keyboardmaestro.com/token/MusicPlayerState
     */
    MusicPlayerState: "%MusicPlayerState%",
    /**
     * **Named Clipboard**
     *
     * Grab the *text* contents of a specific Named Clipboard bucket — persistent across reboots and shareable via sync.
     * For images or RTF see the flavours token or use clipboard actions.
     *
     * @token %NamedClipboard%<Name>%
     * @category Clipboard
     * @example
     * Insert Text: `%NamedClipboard%Email Signature%`
     * @see https://wiki.keyboardmaestro.com/token/NamedClipboard
     */
    NamedClipboard: "%NamedClipboard%A Named Clipboard%",
    /**
     * **Named Clipboard Flavors**
     *
     * Which data types are stored in a Named Clipboard (UTF‑8, PNG, RTF…).
     * Use before paste to decide whether to process as rich text or plain.
     *
     * @token %NamedClipboardFlavors%<Name>%
     * @category Clipboard
     * @see https://wiki.keyboardmaestro.com/token/NamedClipboardFlavors
     */
    NamedClipboardFlavors: "%NamedClipboardFlavors%A Named Clipboard%",
    /**
     * **Network Location**
     *
     * The `\%NetworkLocation\%` token returns the name of the current network location as set in System Settings.
     *
     * @token %NetworkLocation%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/NetworkLocation
     */
    NetworkLocation: "%NetworkLocation%",
    /**
     * **Number Date**
     *
     * The `\%NumberDate\%` token returns the current date in a localized numeric format (e.g., "9/5/17").
     *
     * @token %NumberDate%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/NumberDate
     */
    NumberDate: "%NumberDate%",
    /**
     * **Opaque ID of the Current Execution Instance**
     *
     * The `\%ExecutingInstance\%` token (v9.0+) returns an opaque ID for the current macro execution instance.
     * Useful for uniquely identifying a specific run of a macro, especially for scripting or inter-macro communication.
     *
     * @token %ExecutingInstance%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingInstance
     */
    OpaqueIDOfTheCurrentExecutionInstance: "%ExecutingInstance%",
    /**
     * **Option-Return (Insert Text by Typing Only)**
     *
     * The `\%OptionReturn\%` token (v11.0+) is a special token for the "Insert Text by Typing" action to simulate pressing Option-Return.
     *
     * @token %OptionReturn%
     * @category Character
     * @see https://wiki.keyboardmaestro.com/token/OptionReturn
     */
    OptionReturn: "%OptionReturn%",
    /**
     * **Past Clipboard**
     *
     * The `\%PastClipboard%N\%` token returns the text of a previous clipboard entry from the history.
     * `\%PastClipboard%0\%` is the current clipboard, `\%PastClipboard%1\%` is the one before it, and so on.
     *
     * @token %PastClipboard%1%
     * @category Clipboard
     * @see https://wiki.keyboardmaestro.com/token/PastClipboard
     */
    PastClipboard: "%PastClipboard%1%",
    /**
     * **Past Clipboard Flavors**
     *
     * The `\%PastClipboardFlavors\%` token (v11.0+) returns the available data types (flavors) of a specified past clipboard entry.
     *
     * @token %PastClipboardFlavors%1%
     * @category Clipboard
     * @see https://wiki.keyboardmaestro.com/token/PastClipboardFlavors
     */
    PastClipboardFlavors: "%PastClipboardFlavors%1%",
    /**
     * **Position Cursor Placeholder**
     *
     * Within *Insert Text* actions, `%|%` marks where the caret should land after insertion.
     * Not useful elsewhere (expands to nothing).
     *
     * @token %|%
     * @category Text
     * @example
     * Insert Text: `Hello %|%World` → cursor sits between the words.
     * @see https://wiki.keyboardmaestro.com/token/PositionCursor
     */
    PositionCursor: "%|%",
    /**
     * **Previous Application Name**
     *
     * The app that was frontmost *before* the current one. Perfect for “jump back” hotkeys or context‑aware toggles.
     *
     * @token %Application%2%
     * @category Application
     * @see https://wiki.keyboardmaestro.com/token/Application_Tokens
     */
    PreviousApplicationName: "%Application%2%",
    /**
     * **Prompt for Snippet Placeholder (Default from Variable)**
     *
     * Used within a snippet to prompt the user for input, with the default value taken from a variable.
     * Syntax: `%Ask<promptID>:VariableName%`
     *
     * @token %Ask20:VarName%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/Ask20VarName
     */
    PromptForSnippetPlaceholderDefaultFromVariable: "%Ask20:VarName%",
    /**
     * **Prompt for Snippet Placeholder (Default Text)**
     *
     * Used within a snippet to prompt the user for input, with a default text value.
     * Syntax: `%Ask<promptID>:DefaultText%`
     *
     * @token %Ask20:Default%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/Ask20Default
     */
    PromptForSnippetPlaceholderDefaultText: "%Ask20:Default%",
    /**
     * **Return (\r)**
     *
     * The `\%Return\%` token returns the carriage return character (`\r`, ASCII 0x0D).
     *
     * @token %Return%
     * @category Character
     * @see https://wiki.keyboardmaestro.com/token/Return
     */
    Return: "%Return%",
    /**
     * **Safari Bundle ID**
     *
     * Returns the bundle identifier of Safari.
     *
     * @token %SafariBundleID%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariBundleID: "%SafariBundleID%",
    /**
     * **Safari Document Title**
     *
     * Returns the title of the document in the frontmost tab of Safari.
     *
     * @token %SafariTitle%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariDocumentTitle: "%SafariTitle%",
    /**
     * **Safari Document URL**
     *
     * Returns the URL of the document in the frontmost tab of Safari.
     *
     * @token %SafariURL%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariDocumentURL: "%SafariURL%",
    /**
     * **Safari Field**
     *
     * Returns the value of a specific field in the Safari document.
     *
     * @token %SafariField%document.forms[0][0]%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariField: "%SafariField%document.forms[0][0]%",
    /**
     * **Safari JavaScript**
     *
     * Executes a JavaScript snippet in the context of the Safari document and returns the result.
     *
     * @token %SafariJavaScript%document.forms[0].innerHTML%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariJavaScript: "%SafariJavaScript%document.forms[0].innerHTML%",
    /**
     * **Safari Long Version**
     *
     * Returns the detailed version string of Safari.
     *
     * @token %SafariLongVersion%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariLongVersion: "%SafariLongVersion%",
    /**
     * **Safari Name**
     *
     * Returns the name "Safari".
     *
     * @token %SafariName%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariName: "%SafariName%",
    /**
     * **Safari Path**
     *
     * Returns the file path to the Safari executable.
     *
     * @token %SafariPath%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariPath: "%SafariPath%",
    /**
     * **Safari Ready State**
     *
     * Returns the ready state of the document in the frontmost tab of Safari.
     *
     * @token %SafariReadyState%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariReadyState: "%SafariReadyState%",
    /**
     * **Safari Version**
     *
     * Returns the short version string of Safari.
     *
     * @token %SafariVersion%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariVersion: "%SafariVersion%",
    /**
     * **Safari Window Name**
     *
     * Returns the name (title) of the frontmost Safari window.
     *
     * @token %SafariWindowName%
     * @category Safari
     * @see https://wiki.keyboardmaestro.com/token/WebBrowserTokens?redirect=1
     */
    SafariWindowName: "%SafariWindowName%",
    /**
     * **Second Screen Frame**
     *
     * Frame of the second display from the left (excluding the main menu-bar index).
     * Useful when you want to target an external monitor without concern for its physical resolution.
     *
     * @token %Screen%2%
     * @category Screen
     * @see https://wiki.keyboardmaestro.com/token/Screen
     */
    SecondScreenFrame: "%Screen%2%",
    /**
     * **Short Date**
     *
     * The `\%ShortDate\%` token returns the current date in a localized short format (e.g., "9/5/17").
     *
     * @token %ShortDate%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/ShortDate
     */
    ShortDate: "%ShortDate%",
    /**
     * **Space**
     *
     * The `\%Space\%` token returns the space character.
     *
     * @token %Space%
     * @category Character
     * @see https://wiki.keyboardmaestro.com/token/Space
     */
    Space: "%Space%",
    /**
     * **Success Result of Last Action**
     *
     * The `\%ActionResult\%` token returns "OK" if the previous action was successful, or an error message if it failed.
     * Crucial for error handling; must be saved to a variable immediately after the action to be checked.
     *
     * @token %ActionResult%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ActionResult
     */
    SuccessResultOfLastAction: "%ActionResult%",
    /**
     * **System Clipboard**
     *
     * The current clipboard *text*. For images or mixed content inspect `%SystemClipboardFlavors%` first.
     *
     * @token %SystemClipboard%
     * @category Clipboard
     * @see https://wiki.keyboardmaestro.com/token/SystemClipboard
     */
    SystemClipboard: "%SystemClipboard%",
    /**
     * **System Clipboard Flavors**
     *
     * All UTI types in the current clipboard (public.utf8‑plain‑text, public.png,…).
     * Gate macros so they only run on specific content types.
     *
     * @token %SystemClipboardFlavors%
     * @category Clipboard
     * @see https://wiki.keyboardmaestro.com/token/SystemClipboardFlavors
     */
    SystemClipboardFlavors: "%SystemClipboardFlavors%",
    /**
     * **System Long Version**
     *
     * Returns the detailed version of macOS, including the build number.
     *
     * @token %SystemLongVersion%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/SystemVersion?redirect=1
     */
    SystemLongVersion: "%SystemLongVersion%",
    /**
     * **System Version**
     *
     * The `\%SystemVersion\%` token (v11.0+) returns the version of macOS (e.g., "14.1.1").
     *
     * @token %SystemVersion%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/SystemVersion
     */
    SystemVersion: "%SystemVersion%",
    /**
     * **System Volume**
     *
     * The `\%SystemVolume\%` token returns the current system volume level (0-100).
     *
     * @token %SystemVolume%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/SystemVolume
     */
    SystemVolume: "%SystemVolume%",
    /**
     * **Tab (\t)**
     *
     * The `\%Tab\%` token returns the tab character (`\t`, ASCII 0x09).
     *
     * @token %Tab%
     * @category Character
     * @see https://wiki.keyboardmaestro.com/token/Tab
     */
    Tab: "%Tab%",
    /**
     * **The Last Alert Button Selected**
     *
     * The `\%AlertButton\%` token (v8+) returns the name of the button clicked in the last "Alert" action.
     *
     * @token %AlertButton%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/AlertButton
     */
    TheLastAlertButtonSelected: "%AlertButton%",
    /**
     * **The Last Custom HTML Result**
     *
     * The `\%HTMLResult\%` token (v8+) returns the result of the last "Custom HTML Prompt" action.
     *
     * @token %HTMLResult%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/HTMLResult
     */
    TheLastCustomHTMLResult: "%HTMLResult%",
    /**
     * **The Last Found Image**
     *
     * The `\%FoundImage\%` token (v8+) returns the details (left,top,width,height,fuzz) of the last image found by an action or condition.
     *
     * @token %FoundImage%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/FoundImage
     */
    TheLastFoundImage: "%FoundImage%",
    /**
     * **The Last Prompt Button Selected**
     *
     * The `\%PromptButton\%` token (v8+) returns the name of the button clicked in the last "Prompt for User Input" action.
     *
     * @token %PromptButton%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/PromptButton
     */
    TheLastPromptButtonSelected: "%PromptButton%",
    /**
     * **The Macro Name of the Specified Instance**
     *
     * The `\%ExecutingInstanceName%instance\%` token (v9.0+) returns the name of a specific execution instance.
     *
     * @token %ExecutingInstanceName%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/ExecutingInstanceName
     */
    TheMacroNameOfTheSpecifiedInstance: "%ExecutingInstanceName%",
    /**
     * **The Modifiers Used When Completing a Prompt With List Action**
     *
     * The `\%PromptWithListModifiers\%` token (v10.2+) returns the modifier keys (e.g., "Command") that were held down when an item was selected in a "Prompt With List" action.
     *
     * @token %PromptWithListModifiers%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/PromptWithListModifiers
     */
    TheModifiersUsedWhenCompletingAPromptWithListAction: "%PromptWithListModifiers%",
    /**
     * **The Path of the Front Window’s Document**
     *
     * The `\%FrontDocumentPath\%` token (v11.0+) returns the file path of the document in the frontmost window, if the application supports it.
     *
     * @token %FrontDocumentPath%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/FrontDocumentPath
     */
    ThePathOfTheFrontWindowDocument: "%FrontDocumentPath%",
    /**
     * **The Path of the Selected Finder Item**
     *
     * The `\%FinderSelection\%` token (v10.0+) returns the full path of the single selected item in the Finder. If multiple or no items are selected, it returns an empty string.
     *
     * @token %FinderSelection%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/FinderSelection
     */
    ThePathOfTheSelectedFinderItem: "%FinderSelection%",
    /**
     * **The Paths of the Selected Finder Items**
     *
     * The `\%FinderSelections\%` token (v10.0+) returns the full paths of all selected items in the Finder, with each path on a new line.
     *
     * @token %FinderSelections%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/FinderSelection?redirect=1
     */
    ThePathsOfTheSelectedFinderItems: "%FinderSelections%",
    /**
     * **The Text Entered in a Paste by Name Action**
     *
     * The `\%PasteByNameText\%` token (v10.0+) returns the text the user entered in the last "Paste by Name" action.
     *
     * @token %PasteByNameText%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/PasteByNameText
     */
    TheTextEnteredInAPasteByNameAction: "%PasteByNameText%",
    /**
     * **The Text Entered in a Prompt With List Action**
     *
     * The `\%PromptWithListText\%` token (v10.0+) returns the text the user typed into the search field of the last "Prompt With List" action.
     *
     * @token %PromptWithListText%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/PromptWithListText
     */
    TheTextEnteredInAPromptWithListAction: "%PromptWithListText%",
    /**
     * **The Text Entered in a Select Menu by Name Action**
     *
     * The `\%SelectMenuByNameText\%` token (v11.0.3+) returns the text the user entered in the last "Select Menu by Name" action.
     *
     * @token %SelectMenuByNameText%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/SelectMenuByNameText
     */
    TheTextEnteredInASelectMenuByNameAction: "%SelectMenuByNameText%",
    /**
     * **Time**
     *
     * The `\%ShortTime\%` token returns the current time in a localized short format (e.g., "11:17 AM").
     *
     * @token %ShortTime%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/ICUDateTime
     */
    Time: "%ShortTime%",
    /**
     * **Time With Seconds**
     *
     * The `\%LongTime\%` token returns the current time with seconds in a localized format (e.g., "11:17:35 AM").
     *
     * @token %LongTime%
     * @category Date
     * @see https://wiki.keyboardmaestro.com/token/LongTime
     */
    TimeWithSeconds: "%LongTime%",
    /**
     * **Tripped Trigger Clipboard Flavors**
     *
     * The `\%TriggerClipboardFlavors\%` token (v11.0+) returns the data types (flavors) of the clipboard that triggered the macro via a "Clipboard Filter" trigger.
     *
     * @token %TriggerClipboardFlavors%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/TriggerClipboardFlavors
     */
    TrippedTriggerClipboardFlavors: "%TriggerClipboardFlavors%",
    /**
     * **Tripped Trigger Clipboard Value**
     *
     * The `\%TriggerClipboard\%` token (v8+) returns the text content of the clipboard that triggered the macro.
     *
     * @token %TriggerClipboard%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/TriggerClipboard
     */
    TrippedTriggerClipboardValue: "%TriggerClipboard%",
    /**
     * **Tripped Trigger Text**
     *
     * The `\%Trigger\%` token returns a description of the trigger that executed the macro (e.g., "Hot Key 'F1'").
     *
     * @token %Trigger%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/Trigger
     */
    TrippedTriggerText: "%Trigger%",
    /**
     * **Tripped Trigger Type**
     *
     * The `\%TriggerBase\%` token returns the base type of the trigger that executed the macro (e.g., "Hot Key Trigger").
     *
     * @token %TriggerBase%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/TriggerBase
     */
    TrippedTriggerType: "%TriggerBase%",
    /**
     * **Tripped Trigger Value**
     *
     * The `\%TriggerValue\%` token returns the value associated with the macro's trigger.
     * For a hot key trigger, this is the key pressed. For a typed string trigger, it's the string typed. For a remote trigger, it's the parameter passed.
     *
     * @token %TriggerValue%
     * @category Macro Information
     * @see https://wiki.keyboardmaestro.com/token/TriggerValue
     */
    TrippedTriggerValue: "%TriggerValue%",
    /**
     * **User Home Directory**
     *
     * The `\%UserHome\%` token (v10.0+) returns the path to the current user's home directory (e.g., "/Users/username").
     *
     * @token %UserHome%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/UserHome
     */
    UserHomeDirectory: "%UserHome%",
    /**
     * **User Login ID**
     *
     * The `\%UserLoginID\%` token returns the current user's login ID or short name.
     *
     * @token %UserLoginID%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/UserLoginID
     */
    UserLoginID: "%UserLoginID%",
    /**
     * **User Name**
     *
     * The `\%UserName\%` token returns the current user's full name.
     *
     * @token %UserName%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/UserName
     */
    UserName: "%UserName%",
    /**
     * **Wireless Network Name(s)**
     *
     * The `\%WirelessNetwork\%` token returns the name(s) of the currently connected wireless network(s).
     *
     * @token %WirelessNetwork%
     * @category System
     * @see https://wiki.keyboardmaestro.com/token/WirelessNetwork
     */
    WirelessNetworkNames: "%WirelessNetwork%",
};

//FILE: src/utils/template.xml.token.ts
/**
 * Resolves a token preset to its actual token value.
 * If tokenPreset is provided, returns the corresponding token from KM_TOKENS.
 * Otherwise, returns the original text.
 *
 * @param text - The original text value
 * @param tokenPreset - Optional token preset mode
 * @returns The resolved text (either original text or token value)
 *
 * @example
 * resolveTokenPreset("Hello", undefined) // → "Hello"
 * resolveTokenPreset("Hello", "ARandomUniqueID") // → "%RandomUUID%"
 * resolveTokenPreset("", "FrontApplicationName") // → "%Application%1%"
 */
function resolveTokenPreset(text, tokenPreset) {
    if (tokenPreset && tokenPreset in KM_TOKENS) {
        return KM_TOKENS[tokenPreset];
    }
    return text;
}

//FILE: src/virtual_actions/kmjs.virtualAction.return.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Return action.
 * @param opts - ReturnActionOptions with the string to return from the macro.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic usage
 * createVirtualReturn({ text: "ExampleString" })
 *
 * @example
 * // Token presets
 * createVirtualReturn({ text: "", tokenPreset: "ARandomUniqueID" })
 * createVirtualReturn({ text: "", tokenPreset: "FrontApplicationName" })
 */
function createVirtualReturn(opts) {
    const { text, tokenPreset } = opts;
    // Resolve token preset
    const finalText = resolveTokenPreset(text, tokenPreset);
    // console.log(
    //   chalk.cyan(`[VirtualAction] Return:`),
    //   chalk.grey(JSON.stringify(opts)),
    // );
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>Return</string>",
        "\t\t<key>Text</key>",
        `\t\t<string>${escapeForXml(finalText !== null && finalText !== void 0 ? finalText : "")}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/kmjs.runVirtualMacro.ts
/**
 * Build a transient macro from an array of VirtualAction and “do script” it.
 */
// Lazy import to avoid CEP environment issues
/**
 * Wraps an array of VirtualAction XML fragments into a complete .kmmacros plist.
 *
 * This function takes an array of VirtualAction instances, converts each to its XML
 * representation, and wraps them all inside the standard plist XML structure required
 * by Keyboard Maestro for ephemeral macros.
 *
 * If addReturnActionXML is provided, appends a Keyboard Maestro Return action as the last action
 * as a convenience feature of KMJS.
 *
 * @param actions - List of VirtualAction instances to include in the macro.
 * @param addReturnActionXML - Optional string to include in a Return action (adds a Return action at the end)
 * @returns A full XML string representing the ephemeral macro.
 */
function buildEphemeralMacroXml(actions, addReturnActionXML) {
    const allActions = addReturnActionXML
        ? [...actions, createVirtualReturn({ text: addReturnActionXML })]
        : actions;
    const body = allActions.map((a) => a.toXml()).join("\n");
    return PLIST_HEADER + body + "\n" + PLIST_FOOTER;
}
/**
 * Executes a transient virtual macro in Keyboard Maestro by sending it XML via osascript.
 *
 * This function builds the ephemeral macro XML from the given VirtualAction array,
 * sends it to Keyboard Maestro Engine using JavaScript for Automation (JXA),
 * waits briefly to allow the macro to execute, and then checks for any errors
 * emitted by the engine during execution.
 *
 * If addReturnActionXML is provided, appends a Keyboard Maestro Return action as the last action
 * as a convenience feature of KMJS (but does not capture the return value).
 *
 * If captureReturnValue is true, the function will capture and return the result from the macro execution.
 *
 * @param actions - Array of VirtualAction objects to run.
 * @param name - Optional macro name for logging.
 * @param addReturnActionXML - Optional string to include in a Return action (adds a Return action at the end)
 * @param captureReturnValue - Whether to capture and return the macro's result
 * @returns The macro result if captureReturnValue is true, otherwise void
 */
function runVirtualMacro(actions, name, addReturnActionXML, captureReturnValue) {
    if (actions.length === 0 && !addReturnActionXML) {
        console.log(chalk.yellow("No actions supplied — nothing to run."));
        return;
    }
    // construct the XML for the virtual macro
    const xml = buildEphemeralMacroXml(actions, addReturnActionXML);
    const macroLabel = name ? `virtual macro '${name}'` : "virtual macro";
    console.log(chalk.gray(`--> Executing ${macroLabel} with ${actions.length}${addReturnActionXML ? "+Return" : ""} action(s)…`));
    // Start watching the Keyboard Maestro Engine log for errors
    startWatching();
    // Use osascript to run the macro - modify JXA based on whether we need to capture return value
    const jxaScript = captureReturnValue
        ? `(function () {
        var kme = Application('Keyboard Maestro Engine');
        var result = kme.doScript(${JSON.stringify(xml)});
        return (result !== undefined && result !== null) ? String(result) : '';
      })();`
        : `Application('Keyboard Maestro Engine').doScript(${JSON.stringify(xml)})`;
    const spawnSync = getSafeSpawnSync();
    const osa = spawnSync("osascript", ["-l", "JavaScript", "-e", jxaScript], {
        encoding: "utf8",
    });
    // Check for errors in the osascript execution as the first attempt to procure errors
    if (osa.error) {
        console.error(chalk.red("Spawn error:"), osa.error);
        if (captureReturnValue) {
            throw osa.error;
        }
        return;
    }
    else {
        if (osa.stderr.trim()) {
            console.error(chalk.red("[KM ERROR]"), osa.stderr.trim());
            if (captureReturnValue) {
                throw new Error(`KM Error: ${osa.stderr.trim()}`);
            }
            return;
        }
        if (osa.status !== 0) {
            console.error(chalk.red("Non-zero exit code:", osa.status));
            if (captureReturnValue) {
                throw new Error(`Non-zero exit code: ${osa.status}`);
            }
            return;
        }
    }
    // Now check the Keyboard Maestro Engine log for any errors that occurred during execution
    if (!reportErrors(xml)) {
        if (name) {
            console.log(chalk.green(`✅ ${macroLabel} executed successfully.`));
            console.log(chalk.green(`No Keyboard Maestro engine errors detected for '${name}'.`));
        }
        else {
            console.log(chalk.green("✅ Virtual macro executed successfully."));
            console.log(chalk.green("No Keyboard Maestro engine errors detected."));
        }
    }
    {
        console.log(chalk.magenta("[VirtualMacro XML]"));
        console.log(chalk.grey(xml));
    }
    // Return the captured result if requested
    if (captureReturnValue) {
        const result = osa.stdout.trim();
        console.log(chalk.green(`[runVirtualMacro] Result: ${result}`));
        return result;
    }
}

//FILE: src/utils/template.xml.variable.ts
/**
 * Renders the XML for the Set Variable action's ProcessingMode key.
 * Omits the key if mode is undefined ("Process Text Normally").
 * @param mode - Processing mode (undefined, "TextTokensOnly", "Nothing")
 * @returns Array of XML lines (empty if omitted)
 */
function renderSetVariableProcessingModeXml(mode) {
    if (!mode)
        return [];
    return ["\t\t<key>ProcessingMode</key>", `\t\t<string>${mode}</string>`];
}
/**
 * Renders the XML for the Set Variable action's Where key.
 * Omits the key if where is undefined ("Set Variable").
 * @param where - Where mode (undefined, "Prepend", "Append")
 * @returns Array of XML lines (empty if omitted)
 */
function renderSetVariableWhereXml(where) {
    if (!where)
        return [];
    return ["\t\t<key>Where</key>", `\t\t<string>${where}</string>`];
}

// FILE: src/utils/utils.styledText.ts
// RUNTIME: Node 18+ (commonjs) – matches your project
//
// -------------------------------------------------------------------------------------------------
// Purpose
// -------------------------------------------------------------------------------------------------
// Utilities for dealing with Keyboard Maestro's <StyledText><data>...</data></StyledText> payloads.
// These payloads are Base-64 encoded RTF (technically an NSAttributedString archived to RTF/RTFD).
// We provide:
//
//   • decodeStyledTextData(...)  -> Base64 blob -> { rtf, text }
//   • encodeStyledTextData(...)  -> RTF string  -> Base64 blob (wrapped to 76-chars/line)
//   • updateStyledTextInXml(...) -> Given a KM Action XML, apply a transform to the RTF, and
//                                   write the updated Base-64 + <Text> plain string back.
//
// References:
//   • “KM8: XML of Display Text in Window Does Not Update by Script” forum thread
//     (NSAttributedString <-> RTF(D) <-> Base64 discussion & working AppleScript/ObjC sample).
//
// Credits:
//   • JMichaelTX (https://forum.keyboardmaestro.com/u/JMichaelTX/summary) for the exploration
//     work required to produce these functions.
//
// Caveats:
//   • We cannot reproduce Cocoa's NSAttributedString fidelity from Node.js. We treat the RTF as
//     opaque text. Replacing plain ASCII variable names inside the RTF is typically safe, but you
//     should not try to change fonts/colors/etc. here — do that inside KM or a native helper.
//   • Every time KM re-archives the NSAttributedString, the resulting data will differ
//     (as Peter Lewis mentions) — so don't compare Base-64 strings for equality across writes.
//
// -------------------------------------------------------------------------------------------------
/**
 * An error thrown by this module. We isolate our thrown errors behind a public, typed class
 * so callers can safely `instanceof StyledTextError`.
 */
class StyledTextError extends Error {
    constructor(message) {
        super(message);
        this.name = "StyledTextError";
    }
}
/**
 * Decode a Keyboard Maestro `<StyledText>` data blob (Base-64) into its RTF string.
 *
 * @param base64 - The Base-64 text found inside `<data> ... </data>` (whitespace/newlines OK).
 * @returns {DecodedStyledText} { rtf, text }
 */
function decodeStyledTextData(base64) {
    try {
        // Normalize whitespace, KM often wraps @ 76 columns.
        const compact = base64.replace(/\s+/g, "");
        const buf = Buffer.from(compact, "base64");
        const rtf = buf.toString("utf8");
        // Heuristic "plain text" extraction (strip {\...}, \'xx, \controlwords, and braces).
        // This is intentionally simple — for quick variable-name manipulations and previews.
        const text = stripRtfToPlainText(rtf);
        return { rtf, text };
    }
    catch (err) {
        const msg = `[utils.styledText.decode] Failed to decode Base-64 StyledText. ${err.message}`;
        console.error(chalk.red(msg));
        throw new StyledTextError(msg);
    }
}
/**
 * Encode an **RTF string** into Keyboard Maestro's Base-64 blob.
 * The output is wrapped to 76 chars per line (a safe default for plist `<data>`).
 *
 * @param rtf - The raw RTF string to encode.
 * @param wrap - Whether to wrap the Base-64 at 76 columns (default: true).
 * @returns Base-64 text ready to drop inside `<data> ... </data>`.
 */
function encodeStyledTextData(rtf, wrap = true) {
    try {
        const b64 = Buffer.from(rtf, "utf8").toString("base64");
        return wrap ? wrapBase64(b64, 76) : b64;
    }
    catch (err) {
        const msg = `[utils.styledText.encode] Failed to encode RTF into Base-64. ${err.message}`;
        console.error(chalk.red(msg));
        throw new StyledTextError(msg);
    }
}
/**
 * Update a KM Action XML string’s `<StyledText>` + `<Text>` fields by running a function that
 * takes the decoded RTF and returns a new RTF string.
 *
 * **Important**: We do *string* parsing on the XML (regex-based). That’s safer here because
 * Keyboard Maestro’s plist structure can vary slightly per action. If you prefer a DOM/Plist
 * approach, you can wire up `fast-xml-parser` here (already in your deps).
 *
 * @param xml - Entire KM Action XML (a `<dict>` or full `.kmmacros`).
 * @param transformer - Function that receives the decoded RTF and returns the new RTF.
 * @returns Updated XML string.
 */
function updateStyledTextInXml(xml, transformer) {
    var _a, _b;
    const styledTextMatch = STYLED_TEXT_RE.exec(xml);
    if (!styledTextMatch) {
        console.warn(chalk.yellow("[utils.styledText.update] <StyledText><data>...</data> not found in given XML."));
        return xml;
    }
    const rawData = (_b = (_a = styledTextMatch.groups) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : "";
    const { rtf } = decodeStyledTextData(rawData);
    // Let the caller mutate the RTF however they like (typically variable name replacements).
    const newRtf = transformer(rtf);
    // Re-encode
    const newB64 = encodeStyledTextData(newRtf, true);
    // Update <StyledText> data
    let newXml = replaceAt(xml, styledTextMatch.index, styledTextMatch[0].length, buildStyledTextXml(newB64));
    // Also update plain text <key>Text</key><string>...</string>
    const newPlain = stripRtfToPlainText(newRtf);
    newXml = setPlainTextString(newXml, newPlain);
    return newXml;
}
// -------------------------------------------------------------------------------------------------
// Internals
// -------------------------------------------------------------------------------------------------
/**
 * Simple regex to capture the `<StyledText>` data block.
 * We use named capturing group `data` so it's easy to grab the base64 payload.
 */
const STYLED_TEXT_RE = /<key>\s*StyledText\s*<\/key>\s*<data>(?<data>[\s\S]*?)<\/data>/im;
/**
 * Regex to locate the <key>Text</key> <string> ... </string> so we can keep it in sync.
 */
const PLAIN_TEXT_RE = /<key>\s*Text\s*<\/key>\s*<string>(?<text>[\s\S]*?)<\/string>/im;
/**
 * Build a full `<StyledText>` XML fragment with properly wrapped Base-64.
 */
function buildStyledTextXml(base64) {
    return ["<key>StyledText</key>", "<data>", base64, "</data>"].join("\n");
}
/**
 * Replace a segment of a string using start & length (so we don't do multi-regex confusion).
 */
function replaceAt(src, start, len, insert) {
    return src.slice(0, start) + insert + src.slice(start + len);
}
/**
 * Ensure the XML <key>Text</key><string>…</string> holds the *plain* version of the RTF.
 * If it doesn't exist, we do not add it (we keep changes as non-invasive as possible).
 */
function setPlainTextString(xml, newText) {
    var _a;
    const match = PLAIN_TEXT_RE.exec(xml);
    if (!match) {
        console.warn(chalk.yellow("[utils.styledText.update] <key>Text</key> not found. Leaving XML untouched."));
        return xml;
    }
    const { 0: all, groups } = match;
    const oldText = (_a = groups === null || groups === void 0 ? void 0 : groups.text) !== null && _a !== void 0 ? _a : "";
    // Escape XML entities for safety.
    const escaped = escapeForXml(newText);
    const replacement = all.replace(oldText, escaped);
    return xml.replace(all, replacement);
}
/**
 * Best-effort plain text extraction from RTF.
 * This is *not* a full RTF parser — it just strips basic control words, braces and hex escapes.
 *
 * @param rtf - The raw RTF string.
 * @returns "Plain" text.
 */
function stripRtfToPlainText(rtf) {
    // 1) Handle hex escapes first
    let s = rtf.replace(/\\'[0-9a-fA-F]{2}/g, (m) => {
        // Convert \'hh -> that byte
        const hex = m.slice(2);
        try {
            return Buffer.from(hex, "hex").toString("latin1");
        }
        catch (_a) {
            return "";
        }
    });
    // 2) Remove RTF header groups
    s = s.replace(/\{\\fonttbl[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, "");
    s = s.replace(/\{\\colortbl[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, "");
    // 3) Remove all control words
    s = s.replace(/\\[a-zA-Z]+\d*\s?/g, " ");
    // 4) Remove remaining braces
    s = s.replace(/[{}]/g, "");
    // 5) Collapse multiple spaces/newlines and trim
    s = s.replace(/\s+/g, " ").trim();
    return s;
}
/**
 * Wrap a Base-64 string into fixed-length lines (default 76 chars) for plist <data>.
 */
function wrapBase64(b64, width = 76) {
    const out = [];
    for (let i = 0; i < b64.length; i += width) {
        out.push(b64.slice(i, i + width));
    }
    return out.join("\n");
}
/**
 * Generate a basic RTF wrapper around plain text.
 * This creates a minimal RTF document with the text properly escaped.
 *
 * @param text - The plain text to wrap in RTF
 * @returns RTF string ready for encoding
 */
function generateBasicRtf(text) {
    // Escape RTF special characters
    const escapedText = text
        .replace(/\\/g, "\\\\")
        .replace(/}/g, "\\}")
        .replace(/{/g, "\\{");
    return `{\\rtf1\\ansi\\deff0 ${escapedText}}`;
}

//FILE: src/virtual_actions/kmjs.virtualAction.insertText.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Insert Text action.
 *
 * This action can insert text by typing, pasting, or display it in various ways.
 * It supports styled text for certain action modes and text processing options.
 *
 * @param opts - InsertTextOptions for text content, action mode, processing, and styling.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic text insertion by typing
 * createVirtualInsertText({ text: "Hello World" })
 *
 * @example
 * // Display text in window with styled text
 * createVirtualInsertText({
 *   text: "Styled Text",
 *   action: "DisplayWindow",
 *   includeStyledText: true
 * })
 *
 * @example
 * // Insert by pasting with text tokens only
 * createVirtualInsertText({
 *   text: "Variable: %Variable%MyVar%",
 *   action: "ByPasting",
 *   processingMode: "TextTokensOnly"
 * })
 *
 * @example
 * // Token presets
 * createVirtualInsertText({ text: "", tokenPreset: "ARandomUniqueID" })
 * createVirtualInsertText({ text: "", tokenPreset: "FrontApplicationName", action: "ByPasting" })
 */
function createVirtualInsertText(opts) {
    const { text, tokenPreset, action = "ByTyping", processingMode, includeStyledText = false, rtfContent, targetingType = "Front", } = opts;
    // Resolve token preset
    const resolvedText = resolveTokenPreset(text, tokenPreset);
    // Build styled text data for actions that support it
    const supportsStyledText = action === "ByPastingStyles" || action === "DisplayWindow";
    let styledTextXml = "";
    let finalText = resolvedText;
    if (includeStyledText && supportsStyledText) {
        // Generate RTF content if not provided
        let finalRtfContent = rtfContent;
        if (!finalRtfContent) {
            finalRtfContent = generateBasicRtf(resolvedText);
        }
        try {
            // Encode the RTF as base64 styled text data
            const styledTextData = encodeStyledTextData(finalRtfContent);
            const indentedData = styledTextData
                .split("\n")
                .map((line) => `\t\t${line}`)
                .join("\n");
            styledTextXml = [
                "\t\t<key>StyledText</key>",
                "\t\t<data>",
                indentedData,
                "\t\t</data>",
            ].join("\n");
            // When using custom RTF, extract the plain text from it for the Text field
            // This matches Keyboard Maestro's behavior
            if (rtfContent) {
                finalText = stripRtfToPlainText(finalRtfContent);
            }
        }
        catch (error) {
            // If styled text encoding fails, fall back to plain text
            console.warn(`[insertText] Failed to encode styled text, falling back to plain text: ${error}`);
        }
    }
    // Build target application XML for ByTyping action
    const targetingXml = action === "ByTyping"
        ? [
            "\t\t<key>TargetApplication</key>",
            "\t\t<dict/>",
            "\t\t<key>TargetingType</key>",
            `\t\t<string>${targetingType}</string>`,
        ].join("\n")
        : "";
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        `\t\t<string>${action}</string>`,
        ...generateActionUIDXml(),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>InsertText</string>",
        ...(processingMode
            ? renderSetVariableProcessingModeXml(processingMode)
            : []),
        ...(styledTextXml ? [styledTextXml] : []),
        ...(targetingXml ? [targetingXml] : []),
        "\t\t<key>Text</key>",
        `\t\t<string>${escapeForXml(finalText)}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.displayText.ts
/**
 * Constructs a VirtualAction to display text briefly (notification-style, self-dimssing after a short timeframe).
 *
 * Appropirate for quick messages, small in nature and importance.
 *
 * This is a wrapper around the InsertText action, preconfigured for
 * the 'DisplayBriefly' mode.
 *
 * @param opts - Options including the text to display and optional processing.
 * @returns A VirtualAction emitting the corresponding KM XML.
 *
 * @example
 * // Basic usage
 * createVirtualDisplayTextBriefly({ text: "Hello World" })
 *
 * @example
 * // Token presets
 * createVirtualDisplayTextBriefly({ text: "", tokenPreset: "ARandomUniqueID" })
 * createVirtualDisplayTextBriefly({ text: "", tokenPreset: "FrontApplicationName" })
 */
function createVirtualDisplayTextBriefly(opts) {
    const finalText = resolveTokenPreset(opts.text, opts.tokenPreset);
    return createVirtualInsertText({
        text: finalText,
        action: "DisplayBriefly",
        processingMode: opts.processingMode,
        includeStyledText: false,
    });
}
/**
 * Constructs a VirtualAction to display text in a window.
 *
 * Creates a pop-up modal window appropriate for displaying large amounts of information.
 *
 * This is a wrapper around the InsertText action, preconfigured for
 * the 'DisplayWindow' mode. Supports optional styled text.
 *
 * @param opts - Options including the text to display, processing, and styling.
 * @returns A VirtualAction emitting the corresponding KM XML.
 *
 * @example
 * // Basic usage
 * createVirtualDisplayTextWindow({ text: "Hello World" })
 *
 * @example
 * // Token presets
 * createVirtualDisplayTextWindow({ text: "", tokenPreset: "CurrentMouseLocation" })
 * createVirtualDisplayTextWindow({ text: "", tokenPreset: "FrontApplicationName" })
 */
function createVirtualDisplayTextWindow(opts) {
    var _a;
    const finalText = resolveTokenPreset(opts.text, opts.tokenPreset);
    return createVirtualInsertText({
        text: finalText,
        action: "DisplayWindow",
        processingMode: opts.processingMode,
        includeStyledText: (_a = opts.includeStyledText) !== null && _a !== void 0 ? _a : false,
        rtfContent: opts.rtfContent,
    });
}

//FILE: src/kmjs.generateMacro.ts
/**
 * Generate macro XML from virtual actions with flexible output options.
 *
 * This module provides the core `generateMacro` function that takes an array of VirtualAction
 * instances and generates the corresponding Keyboard Maestro XML. Unlike `runVirtualMacro`,
 * this function focuses on XML generation rather than execution, offering multiple output
 * targets including raw XML, file export, text window display, and direct KM group import.
 */
/**
 * Generates Keyboard Maestro XML from an array of VirtualAction instances.
 *
 * This function provides flexible output options for the generated XML:
 * - Raw XML string (default)
 * - Display in KM text window
 * - Export to .kmmacros file
 * - Import directly to KM macro group
 *
 * Unlike `runVirtualMacro`, this function focuses on XML generation and export
 * rather than immediate execution, making it ideal for macro development,
 * debugging, and batch processing workflows.
 *
 * @param actions - Array of VirtualAction instances to convert to XML
 * @param options - Configuration options for XML generation and export
 * @returns The generated XML string (always returned regardless of export targets)
 *
 * @example
 * ```typescript
 * // Generate raw XML
 * const xml = generateMacro([
 *   createVirtualNotification({ title: "Hello" }),
 *   createVirtualPause({ time: 1 })
 * ]);
 *
 * // Display XML in text window
 * generateMacro(actions, {
 *   exportTarget: { displayInTextWindow: true }
 * });
 *
 * // Export to file with plist wrapping
 * generateMacro(actions, {
 *   addPlistWrapping: true,
 *   exportTarget: { filePath: "/path/to/macro.kmmacros" },
 *   macroName: "My Generated Macro"
 * });
 *
 * // Import directly to KM group
 * generateMacro(actions, {
 *   exportTarget: { toKMGroup: "Generated Macros" },
 *   macroName: "Auto Generated"
 * });
 * ```
 */
function generateMacro(actions, options = {}) {
    const { addPlistWrapping = false, exportTarget = {}, macroName = "Generated Macro", } = options;
    // Validate inputs
    if (actions.length === 0) {
        console.log(chalk.yellow("No actions provided - generating empty macro XML."));
    }
    // Generate the core XML from actions
    const actionsXml = actions.map((action) => action.toXml()).join("\n");
    // Apply plist wrapping if requested or required by export target
    const needsPlistWrapping = addPlistWrapping || exportTarget.filePath || exportTarget.toKMGroup;
    const finalXml = needsPlistWrapping
        ? PLIST_HEADER + actionsXml + "\n" + PLIST_FOOTER
        : actionsXml;
    console.log(chalk.gray(`Generated XML for ${actions.length} action(s)${needsPlistWrapping ? " with plist wrapping" : ""}`));
    // Process export targets
    if (exportTarget.displayInTextWindow) {
        handleDisplayInTextWindow(finalXml);
    }
    if (exportTarget.filePath) {
        try {
            handleFileExport(finalXml, exportTarget.filePath, macroName);
        }
        catch (error) {
            // In test environments, we may not have real file system access
            // Log the error but don't throw to allow testing of XML generation
            if (process.env.NODE_ENV === "test" || process.env.VITEST) {
                console.warn(`File export skipped in test environment: ${error instanceof Error ? error.message : String(error)}`);
            }
            else {
                throw error;
            }
        }
    }
    if (exportTarget.toKMGroup) {
        try {
            // Pass the raw actions XML, not the plist-wrapped version
            handleKMGroupExport(actionsXml, exportTarget.toKMGroup, macroName);
        }
        catch (error) {
            // In test environments, we may not have Keyboard Maestro access
            // Log the error but don't throw to allow testing of XML generation
            if (process.env.NODE_ENV === "test" || process.env.VITEST) {
                console.warn(`KM group export skipped in test environment: ${error instanceof Error ? error.message : String(error)}`);
            }
            else {
                throw error;
            }
        }
    }
    return finalXml;
}
/**
 * Displays the generated XML in a Keyboard Maestro text window.
 *
 * Creates and executes a virtual macro containing a DisplayTextWindow action
 * to show the XML content in a readable format within Keyboard Maestro.
 *
 * @param xml - The XML content to display
 */
function handleDisplayInTextWindow(xml) {
    console.log(chalk.blue("Displaying XML in Keyboard Maestro text window..."));
    const displayAction = createVirtualDisplayTextWindow({
        text: xml,
        processingMode: "Nothing", // Prevent token processing in XML content
    });
    runVirtualMacro([displayAction], "Display Generated XML");
}
/**
 * Exports the generated XML to a .kmmacros file.
 *
 * Writes the XML content to the specified file path, automatically adding
 * the .kmmacros extension if not present. The XML must include plist wrapping
 * for the file to be valid for Keyboard Maestro import.
 *
 * @param xml - The XML content to export (should include plist wrapping)
 * @param filePath - Target file path for export
 * @param macroName - Name of the macro for logging purposes
 */
function handleFileExport(xml, filePath, macroName) {
    // Lazy import to avoid CEP environment issues
    const fs = require("fs");
    const path = require("path");
    // Ensure .kmmacros extension
    const finalPath = filePath.endsWith(".kmmacros")
        ? filePath
        : `${filePath}.kmmacros`;
    try {
        // Ensure directory exists
        const dir = path.dirname(finalPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Write the file
        fs.writeFileSync(finalPath, xml, "utf8");
        const stats = fs.statSync(finalPath);
        console.log(chalk.green(`✅ Exported "${macroName}" to ${finalPath} (${stats.size} bytes)`));
    }
    catch (error) {
        console.error(chalk.red(`❌ Failed to export to file: ${error instanceof Error ? error.message : String(error)}`));
        throw error;
    }
}
/**
 * Imports the generated macro directly into a Keyboard Maestro macro group.
 *
 * Creates a temporary .kmmacros file and uses AppleScript to import it into
 * the specified macro group. If the group doesn't exist, Keyboard Maestro
 * will create it automatically. Any existing macro with the same name will
 * be deleted before import to prevent duplicates.
 *
 * @param xml - The XML content to import (should include plist wrapping)
 * @param groupName - Name of the target macro group
 * @param macroName - Name of the macro for identification and cleanup
 */
/**
 * Creates a proper .kmmacros file structure for importing into Keyboard Maestro.
 *
 * This function wraps the actions XML in the proper macro group structure that
 * Keyboard Maestro expects, including the group metadata and individual macro
 * structure with Actions array, Name, UID, etc.
 *
 * @param actionsXml - The raw actions XML (without plist wrapping)
 * @param macroName - Name of the macro
 * @param groupName - Name of the target group
 * @returns Complete .kmmacros file content
 */
function createMacroGroupPlist(actionsXml, macroName, groupName) {
    const macroUID = Date.now().toString();
    const groupUID = (Date.now() + 1).toString(); // Ensure unique UIDs
    const timeCode = generateKMTimeCode();
    // Create the macro structure with proper indentation
    const macroDict = [
        `\t\t\t<dict>`,
        `\t\t\t\t<key>Actions</key>`,
        `\t\t\t\t<array>`,
        // Actions XML needs to be indented 5 tabs deep
        ...actionsXml.split("\n").map((line) => (line ? `\t\t\t\t\t${line}` : "")),
        `\t\t\t\t</array>`,
        `\t\t\t\t<key>CreationDate</key>`,
        `\t\t\t\t<real>${timeCode}</real>`,
        `\t\t\t\t<key>ModificationDate</key>`,
        `\t\t\t\t<real>${timeCode}</real>`,
        `\t\t\t\t<key>Name</key>`,
        `\t\t\t\t<string>${macroName}</string>`,
        `\t\t\t\t<key>Triggers</key>`,
        `\t\t\t\t<array/>`,
        `\t\t\t\t<key>UID</key>`,
        `\t\t\t\t<string>${macroUID}</string>`,
        `\t\t\t</dict>`,
    ].join("\n");
    // Create the group structure
    const groupPlist = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">`,
        `<plist version="1.0">`,
        `<array>`,
        `\t<dict>`,
        `\t\t<key>Activate</key>`,
        `\t\t<string>Normal</string>`,
        `\t\t<key>CreationDate</key>`,
        `\t\t<real>${timeCode}</real>`,
        `\t\t<key>Macros</key>`,
        `\t\t<array>`,
        macroDict,
        `\t\t</array>`,
        `\t\t<key>Name</key>`,
        `\t\t<string>${groupName}</string>`,
        `\t\t<key>ToggleMacroUID</key>`,
        `\t\t<string>00000000-0000-0000-0000-000000000000</string>`,
        `\t\t<key>UID</key>`,
        `\t\t<string>${groupUID}</string>`,
        `\t</dict>`,
        `</array>`,
        `</plist>`,
    ].join("\n");
    return groupPlist;
}
function handleKMGroupExport(actionsXml, groupName, macroName) {
    // Lazy imports to avoid CEP environment issues
    const fs = require("fs");
    const path = require("path");
    const os = require("os");
    console.log(chalk.blue(`Importing "${macroName}" to KM group "${groupName}"...`));
    // Create the proper macro group plist structure
    const plistXml = createMacroGroupPlist(actionsXml, macroName, groupName);
    // Create temporary file
    const tempPath = path.join(os.tmpdir(), `kmjs-generated-${Date.now()}.kmmacros`);
    try {
        // Write temporary .kmmacros file
        fs.writeFileSync(tempPath, plistXml, "utf8");
        // Delete existing macro with same name to prevent duplicates
        console.log(chalk.gray(`Deleting existing macro "${macroName}" if present...`));
        const spawnSync = getSafeSpawnSync();
        const deleteResult = spawnSync("osascript", [
            "-e",
            `tell application "Keyboard Maestro" to deleteMacro "${macroName}"`,
        ], { encoding: "utf8" });
        if (deleteResult.status === 0) {
            console.log(chalk.gray(`Deleted existing macro "${macroName}"`));
        }
        else {
            console.log(chalk.gray(`No existing macro "${macroName}" to delete`));
        }
        // Import the macro using AppleScript
        const importResult = spawnSync("osascript", [
            "-e",
            `tell application "Keyboard Maestro" to importMacros (POSIX file "${tempPath}" as alias)`,
        ], { encoding: "utf8" });
        if (importResult.status !== 0) {
            throw new Error(`Import failed: ${importResult.stderr.trim() || importResult.stdout.trim()}`);
        }
        console.log(chalk.green(`✅ Successfully imported "${macroName}" to group "${groupName}"`));
    }
    catch (error) {
        console.error(chalk.red(`❌ Failed to import to KM group: ${error instanceof Error ? error.message : String(error)}`));
        throw error;
    }
    finally {
        // Clean up temporary file
        try {
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
        catch (cleanupError) {
            console.warn(chalk.yellow(`Warning: Could not delete temp file ${tempPath}`));
        }
    }
}

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
function isInstanceVariable(name) {
    return INSTANCE_PREFIX.test(name);
}
/**
 * Get the value of a Keyboard Maestro variable.
 *
 * @param name - Variable name (prefix INSTANCE or LOCAL for instance vars).
 * @returns The variable’s value, or empty string if not set.
 * @throws If `KMINSTANCE` is missing when accessing an instance/local variable.
 */
function get(name) {
    var _a;
    // Safe process.env access for CEP environments
    const kmInstance = typeof process !== "undefined" && process.env
        ? ((_a = process.env.KMINSTANCE) !== null && _a !== void 0 ? _a : "")
        : "";
    let script;
    if (isInstanceVariable(name)) {
        if (!kmInstance) {
            throw new Error(`KMINSTANCE env var is not set – cannot access instance/local variable “${name}”.`);
        }
        script = `tell application "Keyboard Maestro Engine" to getvariable "${name}" instance "${kmInstance}"`;
    }
    else {
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
function set(name, value) {
    var _a;
    // Safe process.env access for CEP environments
    const kmInstance = typeof process !== "undefined" && process.env
        ? ((_a = process.env.KMINSTANCE) !== null && _a !== void 0 ? _a : "")
        : "";
    let script;
    if (isInstanceVariable(name)) {
        if (!kmInstance) {
            throw new Error(`KMINSTANCE env var is not set – cannot set instance/local variable “${name}”.`);
        }
        script = `tell application "Keyboard Maestro Engine" to setvariable "${name}" to "${value}" instance "${kmInstance}"`;
    }
    else {
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
const kmvar = Object.assign(function (name, value) {
    return typeof value === "undefined" ? get(name) : set(name, value);
}, { get, set });

//FILE: src/virtual_actions/kmjs.virtualAction.playSound.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro PlaySound action.
 *
 * @param opts - PlaySoundOptions to configure sound, path, async behavior, etc.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 */
function createVirtualPlaySound(opts = {}) {
    console.log(chalk.cyan(`[VirtualAction] PlaySound:`), chalk.grey(JSON.stringify(opts)));
    const { sound = "Tink", path, asynchronously = true, volume = 75, 
    // KM appears to always serialize TimeOutAbortsMacro = true for PlaySound.
    // We accept the option for API symmetry but ignore falsy values to avoid diffs.
    timeoutAborts = true, } = opts;
    // Determine output device: custom files should use SOUNDEFFECTS to match KM behavior
    const isCustomPath = typeof path === "string" && path.includes("/");
    const deviceID = "SOUNDEFFECTS";
    const soundPath = isCustomPath
        ? path
        : `/System/Library/Sounds/${sound}.aiff`;
    // KM ordering observed in retrieved XML:
    // ActionUID, Asynchronously?, DeviceID, MacroActionType, Path, TimeOutAbortsMacro, Volume?
    const volInt = Math.max(0, Math.min(100, Math.round(volume)));
    const includeVolume = volInt !== 100; // KM omits when default (100) — observed in retrieval.
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        asynchronously ? "\t\t<key>Asynchronously</key>" : "",
        asynchronously ? "\t\t<true/>" : "",
        "\t\t<key>DeviceID</key>",
        `\t\t<string>${deviceID}</string>`,
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>PlaySound</string>",
        "\t\t<key>Path</key>",
        `\t\t<string>${escapeForXml(soundPath)}</string>`,
        // Force TimeOutAbortsMacro true (KM seems to always set)
        "\t\t<key>TimeOutAbortsMacro</key>",
        "\t\t<true/>",
        includeVolume ? "\t\t<key>Volume</key>" : "",
        includeVolume ? `\t\t<integer>${volInt}</integer>` : "",
        "\t</dict>",
    ].filter(Boolean);
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.notification.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Notification.
 * @param opts - NotificationOptions with title, body, subtitle, and optional sound.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic usage
 * createVirtualNotification({ title: "Alert", body: "Something happened" })
 *
 * @example
 * // Token presets
 * createVirtualNotification({
 *   title: "",
 *   titleTokenPreset: "FrontApplicationName",
 *   body: "",
 *   bodyTokenPreset: "CurrentMouseLocation"
 * })
 */
function createVirtualNotification(opts) {
    console.log(chalk.cyan(`[VirtualAction] Notification:`), chalk.grey(JSON.stringify(opts)));
    const { title, subtitle = "", body, sound = "", titleTokenPreset, subtitleTokenPreset, bodyTokenPreset, } = opts;
    // Resolve token presets
    const finalTitle = resolveTokenPreset(title, titleTokenPreset);
    const finalSubtitle = resolveTokenPreset(subtitle, subtitleTokenPreset);
    const finalBody = resolveTokenPreset(body, bodyTokenPreset);
    // Detect custom file path if it contains a slash
    const isCustomPath = sound.includes("/");
    // Build notification XML (no SoundName if using custom path)
    const xmlLines = [
        `\t<dict>`,
        ...generateActionUIDXml(),
        `\t\t<key>MacroActionType</key>`,
        `\t\t<string>Notification</string>`,
        `\t\t<key>SoundName</key>`,
        isCustomPath
            ? `\t\t<string></string>`
            : `\t\t<string>${escapeForXml(sound)}</string>`,
        `\t\t<key>Subtitle</key>`,
        `\t\t<string>${escapeForXml(finalSubtitle)}</string>`,
        `\t\t<key>Text</key>`,
        `\t\t<string>${escapeForXml(finalBody)}</string>`,
        `\t\t<key>Title</key>`,
        `\t\t<string>${escapeForXml(finalTitle)}</string>`,
        `\t</dict>`,
    ].join("\n");
    // If custom path, append a PlaySound action
    if (isCustomPath) {
        const playAction = createVirtualPlaySound({ path: sound });
        const combined = [xmlLines, playAction.toXml().trim()].join("\n");
        return { toXml: () => formatXmlAction(combined) };
    }
    // Default built‑in notification sound
    return { toXml: () => formatXmlAction(xmlLines) };
}

//FILE: src/kmjs.notify.ts
/**
 * @file kmjs.notify.ts
 * @module kmjs.notify
 * @description Sends a notification using a virtual Keyboard Maestro Notification action.
 *
 * The return value of this function corresponds to the final 'Return'
 * action if you add one to the virtual macro.
 *
 * @example
 * import { notify } from 'kmjs';
 * notify({ title: 'Done', body: 'Finished', sound: 'Ping' });
 */
/**
 * Convenience function to immediately display a Keyboard Maestro notification using a virtual action.
 *
 * This is a fire-and-forget utility: import and call it directly to show a notification in KM.
 * It automatically generates and executes a transient macro containing a single notification action.
 *
 * @param options - Notification options (title, body, optional subtitle, sound)
 * @returns void
 *
 * @example
 * import { notify } from 'kmjs';
 * notify({ title: 'Done', body: 'Finished', sound: 'Glass' });
 * notify({ title: 'Alert', body: 'Something happened', subtitle: 'Heads up!' });
 */
function notify({ title, body, subtitle = "", sound = "", }) {
    console.log(chalk.magenta(`→ [kmjs.notify] Using virtual notification action`));
    const action = createVirtualNotification({ title, body, subtitle, sound });
    console.log(chalk.blue("Sending virtual Keyboard Maestro notification…"));
    runVirtualMacro([action], "notify");
    console.log(chalk.green("Notification sent."));
}
/* ------------------------------------------------------------------ */
/* Optional CLI usage:                                                */
/* node dist/kmjs.notify.js "Hello" "World" "Hero"                    */
/* ------------------------------------------------------------------ */
// Safe CLI entry point for environments where require.main might not exist
try {
    if (require.main === module) {
        const argv = typeof process !== "undefined" && process.argv
            ? process.argv.slice(2)
            : [];
        const [title, body, sound] = argv;
        if (!title || !body) {
            console.error("Usage: node kmjs.notify.js <title> <body> [sound]");
            if (typeof process !== "undefined" && process.exit)
                process.exit(1);
        }
        else {
            try {
                notify({ title, body, sound });
            }
            catch (err) {
                console.error("Error sending notification:", err.message);
                if (typeof process !== "undefined" && process.exit)
                    process.exit(1);
            }
        }
    }
}
catch (error) {
    // Silently ignore if require.main is not available (e.g., in CEP environments)
}

// FILE: src/tokens/km.token.lookup.ts
/**
 * A cached map of all token data for fast lookups.
 */
let tokenData = null;
/**
 * Loads and caches the token mapping data from the JSON file.
 * This function is called automatically on the first lookup.
 */
function loadTokenData() {
    if (tokenData) {
        return;
    }
    try {
        let tokenMap = [];
        // Try multiple approaches to load the token data
        let tokenMapLoaded = false;
        // Approach 1: Try direct require (works in some bundled environments)
        try {
            tokenMap = require("./data/km.tokens.mapping.json");
            tokenMapLoaded = true;
        }
        catch (_a) {
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
                        const existsSync = typeof fs.existsSync === "function" ? fs.existsSync : () => false;
                        if (existsSync(tokenMapPath)) {
                            tokenMap = JSON.parse(fs.readFileSync(tokenMapPath, "utf8"));
                            tokenMapLoaded = true;
                            break;
                        }
                    }
                    catch (_b) {
                        // Continue to next path
                    }
                }
            }
            // Approach 3: Use embedded data (for bundled versions)
            if (!tokenMapLoaded) {
                try {
                    tokenMap = getEmbeddedTokenData();
                    tokenMapLoaded = true;
                }
                catch (_c) {
                    throw new Error("Could not locate token mapping data file");
                }
            }
        }
        const lookupByHuman = new Map();
        const lookupByPascal = new Map();
        const lookupByToken = new Map();
        for (const entry of tokenMap) {
            lookupByHuman.set(entry.human, entry);
            lookupByPascal.set(entry.pascal, entry);
            lookupByToken.set(entry.token, entry);
        }
        tokenData = { lookupByHuman, lookupByPascal, lookupByToken };
    }
    catch (error) {
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
function getEmbeddedTokenData() {
    return [{"human":"A Random Unique ID","pascal":"ARandomUniqueID","token":"%RandomUUID%"},{"human":"AddressBook Email","pascal":"AddressBookEmail","token":"%AddressBook%Email%"},{"human":"AddressBook First Name","pascal":"AddressBookFirstName","token":"%AddressBook%First%"},{"human":"AddressBook Last Name","pascal":"AddressBookLastName","token":"%AddressBook%Last%"},{"human":"AddressBook Name","pascal":"AddressBookName","token":"%AddressBook%Name%"},{"human":"AddressBook Nickname","pascal":"AddressBookNickname","token":"%AddressBook%Nickname%"},{"human":"AddressBook Note","pascal":"AddressBookNote","token":"%AddressBook%Note%"},{"human":"AddressBook Organization","pascal":"AddressBookOrganization","token":"%AddressBook%Organization%"},{"human":"All Audio Input Devices","pascal":"AllAudioInputDevices","token":"%AudioInputDevices%"},{"human":"All Audio Output Devices","pascal":"AllAudioOutputDevices","token":"%AudioOutputDevices%"},{"human":"All Background Application Names","pascal":"AllBackgroundApplicationNames","token":"%Application%Background%"},{"human":"All Foreground Application Names","pascal":"AllForegroundApplicationNames","token":"%Application%Foreground%"},{"human":"All Running Application Names","pascal":"AllRunningApplicationNames","token":"%Application%All%"},{"human":"All Screen Frames","pascal":"AllScreenFrames","token":"%Screen%All%"},{"human":"All Window Names","pascal":"AllWindowNames","token":"%WindowName%All%"},{"human":"Calculation","pascal":"Calculation","token":"%Calculate%1+2%"},{"human":"Calculation with Result in Binary","pascal":"CalculationWithResultInBinary","token":"%Bin8%1+2%"},{"human":"Calculation with Result in Decimal","pascal":"CalculationWithResultInDecimal","token":"%Dec2%1+2%"},{"human":"Calculation with Result in Hex","pascal":"CalculationWithResultInHex","token":"%Hex2%1+2%"},{"human":"Calculation with Result in Octal","pascal":"CalculationWithResultInOctal","token":"%Oct3%1+2%"},{"human":"Comma-separated list of the current execution instances","pascal":"CommaSeparatedListOfTheCurrentExecutionInstances","token":"%ExecutingInstances%"},{"human":"Comma-separated list of variables accessed by this macro","pascal":"CommaSeparatedListOfVariablesAccessedByThisMacro","token":"%AccessedVariables%"},{"human":"Current Audio Input Device","pascal":"CurrentAudioInputDevice","token":"%AudioInputDevice%"},{"human":"Current Audio Input Device UID","pascal":"CurrentAudioInputDeviceUID","token":"%AudioInputDeviceUID%"},{"human":"Current Audio Output Device","pascal":"CurrentAudioOutputDevice","token":"%AudioOutputDevice%"},{"human":"Current Audio Output Device UID","pascal":"CurrentAudioOutputDeviceUID","token":"%AudioOutputDeviceUID%"},{"human":"Current Audio Sound Effects Device","pascal":"CurrentAudioSoundEffectsDevice","token":"%AudioSoundEffectsDevice%"},{"human":"Current Audio Sound Effects Device UID","pascal":"CurrentAudioSoundEffectsDeviceUID","token":"%AudioSoundEffectsDeviceUID%"},{"human":"Current Mouse Location","pascal":"CurrentMouseLocation","token":"%CurrentMouse%"},{"human":"Current Track Album","pascal":"CurrentTrackAlbum","token":"%CurrentTrack%album%"},{"human":"Current Track Artist","pascal":"CurrentTrackArtist","token":"%CurrentTrack%artist%"},{"human":"Current Track Name","pascal":"CurrentTrackName","token":"%CurrentTrack%name%"},{"human":"Current Track Rating","pascal":"CurrentTrackRating","token":"%CurrentTrack%ratingstars%"},{"human":"Delete (Hide a Variable)","pascal":"Delete","token":"%Delete%"},{"human":"Executing Macro","pascal":"ExecutingMacro","token":"%ExecutingMacro%"},{"human":"Executing Macro Group","pascal":"ExecutingMacroGroup","token":"%ExecutingMacroGroup%"},{"human":"Executing Macro Group UUID","pascal":"ExecutingMacroGroupUUID","token":"%ExecutingMacroGroupUUID%"},{"human":"Executing Macro UUID","pascal":"ExecutingMacroUUID","token":"%ExecutingMacroUUID%"},{"human":"Executing This Macro","pascal":"ExecutingThisMacro","token":"%ExecutingThisMacro%"},{"human":"Executing This Macro Group","pascal":"ExecutingThisMacroGroup","token":"%ExecutingThisMacroGroup%"},{"human":"Executing This Macro Group UUID","pascal":"ExecutingThisMacroGroupUUID","token":"%ExecutingThisMacroGroupUUID%"},{"human":"Executing This Macro UUID","pascal":"ExecutingThisMacroUUID","token":"%ExecutingThisMacroUUID%"},{"human":"Find Pasteboard","pascal":"FindPasteboard","token":"%FindPasteboard%"},{"human":"Finder Insertion Location Path","pascal":"FinderInsertionLocationPath","token":"%FinderInsertionLocation%"},{"human":"First Screen Frame","pascal":"FirstScreenFrame","token":"%Screen%1%"},{"human":"Formatted (ICU) Date Time","pascal":"FormattedICUDateTime","token":"%ICUDateTime%EEE, MMM d, yyyy h:mm%"},{"human":"Formatted (ICU) Date Time For","pascal":"FormattedICUDateTimeFor","token":"%ICUDateTimeFor%NOW()+20%EEE, MMM d, yyyy h:mm%"},{"human":"Formatted (ICU) Date Time Minus","pascal":"FormattedICUDateTimeMinus","token":"%ICUDateTimeMinus%3*7%Days%EEE, MMM d, yyyy h:mm%"},{"human":"Formatted (ICU) Date Time Plus","pascal":"FormattedICUDateTimePlus","token":"%ICUDateTimePlus%3*7%Days%EEE, MMM d, yyyy h:mm%"},{"human":"Formatted Calculation","pascal":"FormattedCalculation","token":"%CalculateFormat%1+2%#,##0.00#%"},{"human":"Front Application Bundle ID","pascal":"FrontApplicationBundleID","token":"%ApplicationBundleID%1%"},{"human":"Front Application Long Version","pascal":"FrontApplicationLongVersion","token":"%ApplicationLongVersion%1%"},{"human":"Front Application Name","pascal":"FrontApplicationName","token":"%Application%1%"},{"human":"Front Application Path","pascal":"FrontApplicationPath","token":"%ApplicationPath%1%"},{"human":"Front Application Version","pascal":"FrontApplicationVersion","token":"%ApplicationVersion%1%"},{"human":"Front Browser Bundle ID","pascal":"FrontBrowserBundleID","token":"%FrontBrowserBundleID%"},{"human":"Front Browser Document Title","pascal":"FrontBrowserDocumentTitle","token":"%FrontBrowserTitle%"},{"human":"Front Browser Document URL","pascal":"FrontBrowserDocumentURL","token":"%FrontBrowserURL%"},{"human":"Front Browser Field","pascal":"FrontBrowserField","token":"%FrontBrowserField%document.forms[0][0]%"},{"human":"Front Browser JavaScript","pascal":"FrontBrowserJavaScript","token":"%FrontBrowserJavaScript%document.forms[0].innerHTML%"},{"human":"Front Browser Long Version","pascal":"FrontBrowserLongVersion","token":"%FrontBrowserLongVersion%"},{"human":"Front Browser Name","pascal":"FrontBrowserName","token":"%FrontBrowserName%"},{"human":"Front Browser Path","pascal":"FrontBrowserPath","token":"%FrontBrowserPath%"},{"human":"Front Browser Ready State","pascal":"FrontBrowserReadyState","token":"%FrontBrowserReadyState%"},{"human":"Front Browser Version","pascal":"FrontBrowserVersion","token":"%FrontBrowserVersion%"},{"human":"Front Browser Window Name","pascal":"FrontBrowserWindowName","token":"%FrontBrowserWindowName%"},{"human":"Front Window Frame","pascal":"FrontWindowFrame","token":"%WindowFrame%1%"},{"human":"Front Window Name","pascal":"FrontWindowName","token":"%WindowName%1%"},{"human":"Front Window Position","pascal":"FrontWindowPosition","token":"%WindowPosition%1%"},{"human":"Front Window Size","pascal":"FrontWindowSize","token":"%WindowSize%1%"},{"human":"Google Chrome Bundle ID","pascal":"GoogleChromeBundleID","token":"%ChromeBundleID%"},{"human":"Google Chrome Document Title","pascal":"GoogleChromeDocumentTitle","token":"%ChromeTitle%"},{"human":"Google Chrome Document URL","pascal":"GoogleChromeDocumentURL","token":"%ChromeURL%"},{"human":"Google Chrome Field","pascal":"GoogleChromeField","token":"%ChromeField%document.forms[0][0]%"},{"human":"Google Chrome JavaScript","pascal":"GoogleChromeJavaScript","token":"%ChromeJavaScript%document.forms[0].innerHTML%"},{"human":"Google Chrome Long Version","pascal":"GoogleChromeLongVersion","token":"%ChromeLongVersion%"},{"human":"Google Chrome Name","pascal":"GoogleChromeName","token":"%ChromeName%"},{"human":"Google Chrome Path","pascal":"GoogleChromePath","token":"%ChromePath%"},{"human":"Google Chrome Ready State","pascal":"GoogleChromeReadyState","token":"%ChromeReadyState%"},{"human":"Google Chrome Version","pascal":"GoogleChromeVersion","token":"%ChromeVersion%"},{"human":"Google Chrome Window Name","pascal":"GoogleChromeWindowName","token":"%ChromeWindowName%"},{"human":"ID of Last Keyboard Maestro Engine Window Opened by This Macro","pascal":"IDOfLastKeyboardMaestroEngineWindowOpenedByThisMacro","token":"%LastWindowID%"},{"human":"ID of the Last Aborted Action","pascal":"IDOfTheLastAbortedAction","token":"%LastAbortedActionID%"},{"human":"JSON From Dictionary","pascal":"JSONFromDictionary","token":"%JSONFromDictionary%DictionaryName%"},{"human":"JSON From Variables","pascal":"JSONFromVariables","token":"%JSONFromVariables%Prefix%"},{"human":"JSON Value","pascal":"JSONValue","token":"%JSONValue%VariableName.field(field)[1]%"},{"human":"Keyboard Layout Input Source","pascal":"KeyboardLayoutInputSource","token":"%KeyboardLayout%"},{"human":"Keyboard Maestro Long Version","pascal":"KeyboardMaestroLongVersion","token":"%KeyboardMaestroLongVersion%"},{"human":"Keyboard Maestro Version","pascal":"KeyboardMaestroVersion","token":"%KeyboardMaestroVersion%"},{"human":"Linefeed (\\n)","pascal":"Linefeed","token":"%LineFeed%"},{"human":"Long Date","pascal":"LongDate","token":"%LongDate%"},{"human":"Machine IP Address","pascal":"MachineIPAddress","token":"%MacIPAddress%"},{"human":"Machine Name","pascal":"MachineName","token":"%MacName%"},{"human":"Machine Unique ID","pascal":"MachineUniqueID","token":"%MacUUID%"},{"human":"Macro Name for UUID","pascal":"MacroNameForUUID","token":"%MacroNameForUUID%UUID%"},{"human":"Mail BCC Recipients","pascal":"MailBCCRecipients","token":"%MailBCCRecipients%"},{"human":"Mail CC Recipients","pascal":"MailCCRecipients","token":"%MailCCRecipients%"},{"human":"Mail Contents","pascal":"MailContents","token":"%MailContents%"},{"human":"Mail Raw Source","pascal":"MailRawSource","token":"%MailRawSource%"},{"human":"Mail Recipients","pascal":"MailRecipients","token":"%MailRecipients%"},{"human":"Mail Reply To","pascal":"MailReplyTo","token":"%MailReplyTo%"},{"human":"Mail Sender","pascal":"MailSender","token":"%MailSender%"},{"human":"Mail Subject","pascal":"MailSubject","token":"%MailSubject%"},{"human":"Mail To Recipients","pascal":"MailToRecipients","token":"%MailToRecipients%"},{"human":"Main Screen Frame","pascal":"MainScreenFrame","token":"%Screen%Main%"},{"human":"Main Screen Possible Resolutions (array of resolutions)","pascal":"MainScreenPossibleResolutions","token":"%ScreenResolutions%Main%"},{"human":"Main Screen Resolution (width,height,pixelwidth,pixelheight,refresh)","pascal":"MainScreenResolution","token":"%ScreenResolution%Main%"},{"human":"Main Screen Visible Frame","pascal":"MainScreenVisibleFrame","token":"%ScreenVisible%Main%"},{"human":"Music Player State (stopped/playing/paused/fast forwarding/rewinding/not running)","pascal":"MusicPlayerState","token":"%MusicPlayerState%"},{"human":"Named Clipboard","pascal":"NamedClipboard","token":"%NamedClipboard%A Named Clipboard%"},{"human":"Named Clipboard Flavors","pascal":"NamedClipboardFlavors","token":"%NamedClipboardFlavors%A Named Clipboard%"},{"human":"Network Location","pascal":"NetworkLocation","token":"%NetworkLocation%"},{"human":"Number Date","pascal":"NumberDate","token":"%NumberDate%"},{"human":"Opaque ID of the Current Execution Instance","pascal":"OpaqueIDOfTheCurrentExecutionInstance","token":"%ExecutingInstance%"},{"human":"Option-Return (Insert Text by Typing Only)","pascal":"OptionReturn","token":"%OptionReturn%"},{"human":"Past Clipboard","pascal":"PastClipboard","token":"%PastClipboard%1%"},{"human":"Past Clipboard Flavors","pascal":"PastClipboardFlavors","token":"%PastClipboardFlavors%1%"},{"human":"Position Cursor (Insert Text Only)","pascal":"PositionCursor","token":"%|%"},{"human":"Previous Application Name","pascal":"PreviousApplicationName","token":"%Application%2%"},{"human":"Prompt for Snippet Placeholder (Default from Variable)","pascal":"PromptForSnippetPlaceholderDefaultFromVariable","token":"%Ask20:VarName%"},{"human":"Prompt for Snippet Placeholder (Default Text)","pascal":"PromptForSnippetPlaceholderDefaultText","token":"%Ask20:Default%"},{"human":"Return (\\r)","pascal":"Return","token":"%Return%"},{"human":"Safari Bundle ID","pascal":"SafariBundleID","token":"%SafariBundleID%"},{"human":"Safari Document Title","pascal":"SafariDocumentTitle","token":"%SafariTitle%"},{"human":"Safari Document URL","pascal":"SafariDocumentURL","token":"%SafariURL%"},{"human":"Safari Field","pascal":"SafariField","token":"%SafariField%document.forms[0][0]%"},{"human":"Safari JavaScript","pascal":"SafariJavaScript","token":"%SafariJavaScript%document.forms[0].innerHTML%"},{"human":"Safari Long Version","pascal":"SafariLongVersion","token":"%SafariLongVersion%"},{"human":"Safari Name","pascal":"SafariName","token":"%SafariName%"},{"human":"Safari Path","pascal":"SafariPath","token":"%SafariPath%"},{"human":"Safari Ready State","pascal":"SafariReadyState","token":"%SafariReadyState%"},{"human":"Safari Version","pascal":"SafariVersion","token":"%SafariVersion%"},{"human":"Safari Window Name","pascal":"SafariWindowName","token":"%SafariWindowName%"},{"human":"Second Screen Frame","pascal":"SecondScreenFrame","token":"%Screen%2%"},{"human":"Short Date","pascal":"ShortDate","token":"%ShortDate%"},{"human":"Space","pascal":"Space","token":"%Space%"},{"human":"Success Result of Last Action","pascal":"SuccessResultOfLastAction","token":"%ActionResult%"},{"human":"System Clipboard","pascal":"SystemClipboard","token":"%SystemClipboard%"},{"human":"System Clipboard Flavors","pascal":"SystemClipboardFlavors","token":"%SystemClipboardFlavors%"},{"human":"System Long Version","pascal":"SystemLongVersion","token":"%SystemLongVersion%"},{"human":"System Version","pascal":"SystemVersion","token":"%SystemVersion%"},{"human":"System Volume","pascal":"SystemVolume","token":"%SystemVolume%"},{"human":"Tab (\\t)","pascal":"Tab","token":"%Tab%"},{"human":"The Last Alert Button Selected","pascal":"TheLastAlertButtonSelected","token":"%AlertButton%"},{"human":"The Last Custom HTML Result","pascal":"TheLastCustomHTMLResult","token":"%HTMLResult%"},{"human":"The Last Found Image","pascal":"TheLastFoundImage","token":"%FoundImage%"},{"human":"The Last Prompt Button Selected","pascal":"TheLastPromptButtonSelected","token":"%PromptButton%"},{"human":"The Macro Name of the Specified Instance","pascal":"TheMacroNameOfTheSpecifiedInstance","token":"%ExecutingInstanceName%"},{"human":"The Modifiers Used When Completing a Prompt With List Action","pascal":"TheModifiersUsedWhenCompletingAPromptWithListAction","token":"%PromptWithListModifiers%"},{"human":"The Path of the Front Window’s Document","pascal":"ThePathOfTheFrontWindowDocument","token":"%FrontDocumentPath%"},{"human":"The Path of the Selected Finder Item","pascal":"ThePathOfTheSelectedFinderItem","token":"%FinderSelection%"},{"human":"The Paths of the Selected Finder Items","pascal":"ThePathsOfTheSelectedFinderItems","token":"%FinderSelections%"},{"human":"The Text Entered in a Paste by Name Action","pascal":"TheTextEnteredInAPasteByNameAction","token":"%PasteByNameText%"},{"human":"The Text Entered in a Prompt With List Action","pascal":"TheTextEnteredInAPromptWithListAction","token":"%PromptWithListText%"},{"human":"The Text Entered in a Select Menu by Name Action","pascal":"TheTextEnteredInASelectMenuByNameAction","token":"%SelectMenuByNameText%"},{"human":"Time","pascal":"Time","token":"%ShortTime%"},{"human":"Time With Seconds","pascal":"TimeWithSeconds","token":"%LongTime%"},{"human":"Tripped Trigger Clipboard Flavors","pascal":"TrippedTriggerClipboardFlavors","token":"%TriggerClipboardFlavors%"},{"human":"Tripped Trigger Clipboard Value","pascal":"TrippedTriggerClipboardValue","token":"%TriggerClipboard%"},{"human":"Tripped Trigger Text","pascal":"TrippedTriggerText","token":"%Trigger%"},{"human":"Tripped Trigger Type","pascal":"TrippedTriggerType","token":"%TriggerBase%"},{"human":"Tripped Trigger Value","pascal":"TrippedTriggerValue","token":"%TriggerValue%"},{"human":"User Home Directory","pascal":"UserHomeDirectory","token":"%UserHome%"},{"human":"User Login ID","pascal":"UserLoginID","token":"%UserLoginID%"},{"human":"User Name","pascal":"UserName","token":"%UserName%"},{"human":"Wireless Network Name(s)","pascal":"WirelessNetworkNames","token":"%WirelessNetwork%"}];
}
function lookupKMToken(query, returnKey) {
    var _a, _b;
    loadTokenData();
    const { lookupByHuman, lookupByPascal, lookupByToken } = tokenData;
    const found = (_b = (_a = lookupByHuman.get(query)) !== null && _a !== void 0 ? _a : lookupByPascal.get(query)) !== null && _b !== void 0 ? _b : lookupByToken.get(query);
    if (!found) {
        throw new Error(`Unknown Keyboard Maestro token: "${query}"`);
    }
    if (returnKey) {
        return found[returnKey];
    }
    const result = { ...found };
    if (query === found.human)
        delete result.human;
    if (query === found.pascal)
        delete result.pascal;
    if (query === found.token)
        delete result.token;
    return result;
}

//FILE: src/queries/kmjs.query.getMousePosition.ts
/**
 * @file kmjs.query.getMousePosition.ts
 * @module kmjs.query.getMousePosition
 * @description Returns the current mouse position using a virtual macro.
 *
 * This function executes a virtual macro that returns the value of the
 * Keyboard Maestro %CurrentMouse% token, abstracting away all boilerplate.
 * Supports both string format (default Keyboard Maestro behavior) and array format.
 *
 * @example
 * import { getMousePosition } from 'kmjs';
 *
 * // Default string format
 * const pos = getMousePosition(); // "123,456"
 *
 * // Array format for more structured coordinate access
 * const [x, y] = getMousePosition(true); // [123, 456]
 */
// CLI entry point
if (require.main === module) {
    require("./kmjs.query.cli");
}
function getMousePosition(asArray) {
    try {
        console.log(chalk.gray("[getMousePosition] Querying current mouse position..."));
        // The %CurrentMouse% token returns the current mouse position as "x,y"
        // We use runVirtualMacro with captureReturnValue=true to get the result
        const result = runVirtualMacro([], "getMousePosition", KM_TOKENS.CurrentMouseLocation, true);
        if (!result || typeof result !== "string") {
            throw new Error("No result returned from Keyboard Maestro");
        }
        // Validate the format is "x,y" and both are valid numbers
        const trimmedResult = result.trim();
        if (!trimmedResult) {
            throw new Error("Empty result returned from Keyboard Maestro");
        }
        const parts = trimmedResult.split(",");
        if (parts.length !== 2) {
            throw new Error(`Invalid mouse position format: expected "x,y", got "${trimmedResult}"`);
        }
        const [xStr, yStr] = parts;
        const x = parseInt(xStr.trim(), 10);
        const y = parseInt(yStr.trim(), 10);
        if (isNaN(x)) {
            throw new Error(`Invalid X coordinate: "${xStr.trim()}" is not a valid number`);
        }
        if (isNaN(y)) {
            throw new Error(`Invalid Y coordinate: "${yStr.trim()}" is not a valid number`);
        }
        console.log(chalk.green(`[getMousePosition] Successfully retrieved position: ${trimmedResult} (X: ${x}, Y: ${y})`));
        // Return as array if requested, otherwise return as string (default KM behavior)
        return asArray ? [x, y] : trimmedResult;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red("[getMousePosition] Error:"), errorMessage);
        throw new Error(`Failed to get mouse position: ${errorMessage}`);
    }
}

//FILE: src/queries/kmjs.query.getFrontAppInfo.ts
/**
 * @file kmjs.query.getFrontAppInfo.ts
 * @module kmjs.query
 * @description Provides a function to query information about the frontmost application.
 */
/**
 * Queries Keyboard Maestro for details about the frontmost application.
 *
 * This function retrieves the name, bundle identifier, and file path of the
 * application that is currently active.
 *
 * @returns An object containing the name, bundleId, and path of the front app.
 * @throws {Error} If the application info cannot be retrieved.
 *
 * @example
 * const appInfo = getFrontAppInfo();
 * // -> { name: "Finder", bundleId: "com.apple.finder", path: "/System/Library/CoreServices/Finder.app" }
 */
function getFrontAppInfo() {
    try {
        // We can retrieve multiple tokens at once by separating them with a unique delimiter.
        const delimiter = "::KMJS_DELIMITER::";
        const tokenString = [
            KM_TOKENS.FrontApplicationName,
            KM_TOKENS.FrontApplicationBundleID,
            KM_TOKENS.FrontApplicationPath,
        ].join(delimiter);
        const result = runVirtualMacro([], "query:getFrontAppInfo", tokenString, true);
        const [name, bundleId, path] = result.split(delimiter);
        if (!name || !bundleId || !path) {
            throw new Error(`Incomplete app info returned from KM: "${result}"`);
        }
        return { name, bundleId, path };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get front app info: ${message}`);
    }
}
// CLI entry point
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getFrontWindowInfo.ts
/**
 * @file kmjs.query.getFrontWindowInfo.ts
 * @module kmjs.query
 * @description Provides a function to query information about the frontmost window.
 */
/**
 * Queries Keyboard Maestro for details about the frontmost window of the active application.
 *
 * @returns An object containing the window's name and its frame (x, y, width, height).
 * @throws {Error} If the window info cannot be retrieved or is in an invalid format.
 *
 * @example
 * const windowInfo = getFrontWindowInfo();
 * // -> { name: "my-file.txt - VSCode", frame: { x: 100, y: 50, width: 1280, height: 800 } }
 */
function getFrontWindowInfo() {
    try {
        const delimiter = "::KMJS_DELIMITER::";
        const tokenString = [
            KM_TOKENS.FrontWindowName,
            KM_TOKENS.FrontWindowFrame,
        ].join(delimiter);
        const result = runVirtualMacro([], "query:getFrontWindowInfo", tokenString, true);
        const [name, frameString] = result.split(delimiter);
        const frameParts = frameString.split(",").map(Number);
        if (!name || frameParts.length !== 4 || frameParts.some(isNaN)) {
            throw new Error(`Invalid window info returned from KM: "${result}"`);
        }
        const [x, y, width, height] = frameParts;
        return { name, frame: { x, y, width, height } };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get front window info: ${message}`);
    }
}
// CLI entry point
if (require.main === module) {
    require("./kmjs.query.cli");
}

// FILE: src/queries/kmjs.query.getFinderSelections.ts
/**
 * @file kmjs.query.getFinderSelections.ts
 * @module kmjs.query
 * @description Provides functions to query the current selection in Finder.
 */
/**
 * Queries Keyboard Maestro for the paths of all currently selected items in Finder.
 *
 * @returns An array of strings, where each string is the full path to a selected item.
 *          Returns an empty array if no items are selected.
 * @throws {Error} If the query fails.
 *
 * @example
 * const selectedFiles = getFinderSelections();
 * // -> ["/Users/USERNAME/Documents/file1.txt", "/Users/USERNAME/Documents/image.png"]
 */
function getFinderSelections() {
    try {
        const result = runVirtualMacro([], "query:getFinderSelections", KM_TOKENS.ThePathsOfTheSelectedFinderItems, true);
        // If the result is empty, it means no files are selected.
        // Split on newline and filter out any empty strings that might result.
        return result ? result.split("\n").filter(Boolean) : [];
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get Finder selections: ${message}`);
    }
}
// CLI entry point
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getSystemClipboard.ts
/**
 * @file kmjs.query.getSystemClipboard.ts
 * @module kmjs.query
 * @description Provides a function to query the system clipboard content.
 */
/**
 * Queries Keyboard Maestro for the current text content of the system clipboard.
 * Note: This retrieves plain text only. For other data types, see `getSystemClipboardFlavors`.
 *
 * @returns The text content of the system clipboard.
 * @throws {Error} If the query fails.
 *
 * @example
 * const clipboardText = getSystemClipboard();
 * // -> "This is the text that was on my clipboard."
 */
function getSystemClipboard() {
    try {
        const result = runVirtualMacro([], "query:getSystemClipboard", KM_TOKENS.SystemClipboard, true);
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get system clipboard: ${message}`);
    }
}
// CLI entry point
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getSystemVolume.ts
/**
 * @file kmjs.query.getSystemVolume.ts
 * @module kmjs.query
 * @description Provides a function to query the current system audio volume.
 */
/**
 * Queries Keyboard Maestro for the current system volume level.
 *
 * The `%SystemVolume%` token returns the volume as a number from 0 to 100.
 *
 * @returns The current system volume as a number (0-100).
 * @throws {Error} If the volume level cannot be retrieved or parsed.
 *
 * @example
 * const volume = getSystemVolume();
 * // -> 75
 */
function getSystemVolume() {
    try {
        // Execute a virtual macro to return the value of the SystemVolume token.
        const result = runVirtualMacro([], "query:getSystemVolume", KM_TOKENS.SystemVolume, true);
        // Parse the result string into an integer.
        const volume = parseInt(result, 10);
        // Validate that the result is a valid number.
        if (isNaN(volume)) {
            throw new Error(`Invalid volume level returned: "${result}"`);
        }
        return volume;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get system volume: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getScreenFrames.ts
/**
 * @file kmjs.query.getScreenFrames.ts
 * @module kmjs.query
 * @description Provides a function to query the frames of all connected screens.
 */
/**
 * Queries Keyboard Maestro for the frames of all connected screens.
 *
 * The `%AllScreenFrames%` token returns a multi-line string, with each line
 * containing the comma-separated frame of a screen (`x,y,width,height`).
 *
 * @returns An array of ScreenFrame objects, one for each connected display.
 * @throws {Error} If screen frames cannot be retrieved or parsed.
 *
 * @example
 * const screens = getScreenFrames();
 * // -> [{ x: 0, y: 0, width: 1920, height: 1080 }, { x: 1920, y: 0, width: 1440, height: 900 }]
 */
function getScreenFrames() {
    try {
        // Execute a virtual macro to return the value of the AllScreenFrames token.
        const result = runVirtualMacro([], "query:getScreenFrames", KM_TOKENS.AllScreenFrames, true);
        // If the result is empty, return an empty array.
        if (!result) {
            return [];
        }
        // Split the multi-line string into individual lines and parse each one.
        return result
            .split("\n")
            .filter(Boolean) // Remove any empty lines
            .map((line, index) => {
            const parts = line.split(",").map(Number);
            if (parts.length !== 4 || parts.some(isNaN)) {
                throw new Error(`Invalid screen frame format on line ${index + 1}: "${line}"`);
            }
            const [x, y, width, height] = parts;
            return { x, y, width, height };
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get screen frames: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getRunningApps.ts
/**
 * @file kmjs.query.getRunningApps.ts
 * @module kmjs.query
 * @description Provides a function to get a list of all running applications.
 */
/**
 * Queries Keyboard Maestro for a list of all running applications.
 *
 * This includes both foreground applications (with a UI) and background
 * applications (agents, daemons).
 *
 * @returns An array of strings, where each string is the name of a running application.
 * @throws {Error} If the list of applications cannot be retrieved.
 *
 * @example
 * const apps = getRunningApps();
 * // -> ["Finder", "Safari", "SystemUIServer", "Dropbox", ...]
 */
function getRunningApps() {
    try {
        // The token returns a multi-line string of application names.
        const result = runVirtualMacro([], "query:getRunningApps", KM_TOKENS.AllRunningApplicationNames, true);
        // If the result is empty, return an empty array.
        if (!result) {
            return [];
        }
        // Split the multi-line string into an array of names.
        return result.split("\n").filter(Boolean);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get running applications: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getNetworkInfo.ts
/**
 * @file kmjs.query.getNetworkInfo.ts
 * @module kmjs.query
 * @description Provides a function to query various network details.
 */
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
function getNetworkInfo() {
    try {
        // Combine multiple tokens into a single query for efficiency.
        const delimiter = "::KMJS_DELIMITER::";
        const tokenString = [
            KM_TOKENS.NetworkLocation,
            KM_TOKENS.WirelessNetworkNames,
            KM_TOKENS.MachineIPAddress,
        ].join(delimiter);
        const result = runVirtualMacro([], "query:getNetworkInfo", tokenString, true);
        const [location, wireless, ipAddress] = result.split(delimiter);
        if (location === undefined ||
            wireless === undefined ||
            ipAddress === undefined) {
            throw new Error(`Incomplete network info returned from KM: "${result}"`);
        }
        return {
            location,
            // Wireless network names can also be multi-line if connected to multiple.
            wirelessNames: wireless ? wireless.split("\n").filter(Boolean) : [],
            ipAddress,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get network info: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getUserInfo.ts
/**
 * @file kmjs.query.getUserInfo.ts
 * @module kmjs.query
 * @description Provides a function to query details about the current macOS user.
 */
/**
 * Queries Keyboard Maestro for details about the current macOS user.
 *
 * Retrieves the user's full name, short login ID, and home directory path.
 *
 * @returns An object containing the user's name, loginId, and home directory.
 * @throws {Error} If the user information cannot be retrieved.
 *
 * @example
 * const user = getUserInfo();
 * // -> { name: "John Smith", loginId: "johnsmith", home: "/Users/johnsmith" }
 */
function getUserInfo() {
    try {
        const delimiter = "::KMJS_DELIMITER::";
        const tokenString = [
            KM_TOKENS.UserName,
            KM_TOKENS.UserLoginID,
            KM_TOKENS.UserHomeDirectory,
        ].join(delimiter);
        const result = runVirtualMacro([], "query:getUserInfo", tokenString, true);
        const [name, loginId, home] = result.split(delimiter);
        if (!name || !loginId || !home) {
            throw new Error(`Incomplete user info returned from KM: "${result}"`);
        }
        return { name, loginId, home };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get user info: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getSystemVersion.ts
/**
 * @file kmjs.query.getSystemVersion.ts
 * @module kmjs.query
 * @description Provides a function to query the current macOS version.
 */
/**
 * Queries Keyboard Maestro for the current version of macOS.
 *
 * Retrieves both the short version (e.g., "14.1.1") and the long version,
 * which may include the build number.
 *
 * @returns An object containing the short and long version strings.
 * @throws {Error} If the version information cannot be retrieved.
 *
 * @example
 * const version = getSystemVersion();
 * // -> { short: "14.1.1", long: "Version 14.1.1 (Build 23B81)" }
 */
function getSystemVersion() {
    try {
        const delimiter = "::KMJS_DELIMITER::";
        const tokenString = [
            KM_TOKENS.SystemVersion,
            KM_TOKENS.SystemLongVersion,
        ].join(delimiter);
        const result = runVirtualMacro([], "query:getSystemVersion", tokenString, true);
        const [short, long] = result.split(delimiter);
        if (!short || !long) {
            throw new Error(`Incomplete system version returned from KM: "${result}"`);
        }
        return { short, long };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get system version: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getPastClipboard.ts
/**
 * @file kmjs.query.getPastClipboard.ts
 * @module kmjs.query
 * @description Provides a function to query the clipboard history.
 */
/**
 * Queries Keyboard Maestro for a specific entry from the clipboard history.
 *
 * This function uses a dynamically constructed token, `%PastClipboard%<index>%`, to
 * retrieve an item from the clipboard history.
 *
 * Note: Index `0` is the current system clipboard. Index `1` is the previous item.
 *
 * @param index - The history index to retrieve (0-based). Must be a non-negative integer.
 * @returns The text content of the specified clipboard history entry.
 * @throws {Error} If the index is invalid or the query fails.
 *
 * @example
 * // Get the most recent clipboard item (same as getSystemClipboard())
 * const current = getPastClipboard(0);
 *
 * @example
 * // Get the item before the current one
 * const previous = getPastClipboard(1);
 */
function getPastClipboard(index) {
    // Validate that the index is a non-negative integer.
    if (!Number.isInteger(index) || index < 0) {
        throw new Error(`Clipboard history index must be a non-negative integer, but received: ${index}`);
    }
    try {
        // The %PastClipboard% token is dynamic, so we construct it manually.
        const tokenString = `%PastClipboard%${index}%`;
        const result = runVirtualMacro([], `query:getPastClipboard:${index}`, tokenString, true);
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get past clipboard at index ${index}: ${message}`);
    }
}
// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
    require("./kmjs.query.cli");
}

//FILE: src/queries/kmjs.query.getScreenResolution.ts
/**
 * @file kmjs.query.getScreenResolution.ts
 * @module kmjs.query
 * @description Returns the resolution of a specified screen.
 *
 * This module provides a function to query the resolution of a specific screen or all screens
 * via Keyboard Maestro tokens. It parses the result into a strongly-typed object or array of objects.
 *
 * The function is robust to token errors and will throw if the result is not in the expected format.
 *
 * Inline documentation is provided to assist new contributors and LLM agents in understanding the
 * control flow and the purpose of each variable and function.
 */
/**
 * Queries Keyboard Maestro for the resolution of a given screen or all screens.
 *
 * @param screenSpecifier - The screen to query. Accepts "Main", "Second", a numeric index, "Mouse", or "All".
 *   Defaults to "Main". If "All" is provided, returns an array of records for all screens.
 * @returns A single {@link ScreenResolutionRecord} for a specific screen, or an array of records for all screens.
 * @throws {Error} If the result cannot be parsed into the expected format.
 *
 * @example
 * // Get resolution for the main display
 * const main = getScreenResolution();
 * // → { nominalWidth: 1512, nominalHeight: 982, pixelWidth: 2880, pixelHeight: 1800, refreshRate: 60 }
 *
 * @example
 * // Get resolutions for all displays
 * const all = getScreenResolution("All");
 * // → [ { ... }, { ... } ]
 */
function getScreenResolution(screenSpecifier = "Main") {
    // Construct the Keyboard Maestro token for the requested screen.
    // Example: "%ScreenResolution%Main%" or "%ScreenResolution%All%"
    const token = `%ScreenResolution%${screenSpecifier}%`;
    // Execute the virtual macro to retrieve the raw result string.
    // The result is expected to be a comma-separated string for a single screen,
    // or a newline-separated list of comma-separated strings for all screens.
    const raw = runVirtualMacro([], "query:getScreenResolution", token, true);
    /**
     * Parses a single line of screen resolution data into a ScreenResolutionRecord.
     *
     * @param line - A comma-separated string representing one screen's resolution.
     * @returns A ScreenResolutionRecord object.
     * @throws {Error} If the line does not contain exactly 5 numeric values.
     */
    const parse = (line) => {
        // Split the line into its numeric components.
        const parts = line.split(",").map(Number);
        // Validate the format: must have 5 numbers, all valid.
        if (parts.length !== 5 || parts.some(isNaN)) {
            throw new Error(`Invalid ScreenResolution format: “${line}”`);
        }
        // Destructure the values for clarity.
        const [nominalWidth, nominalHeight, pixelWidth, pixelHeight, refreshRate] = parts;
        return {
            nominalWidth,
            nominalHeight,
            pixelWidth,
            pixelHeight,
            refreshRate,
        };
    };
    // If querying all screens, split the result by newlines and parse each line.
    if (screenSpecifier.toLowerCase() === "all") {
        // Each line represents one screen's resolution.
        return raw
            .split(/\n|\r|\r\n/)
            .filter(Boolean)
            .map(parse);
    }
    // Otherwise, parse the single result line.
    return parse(raw);
}
// CLI entry point for direct execution
if (require.main === module) {
    require("./kmjs.query.cli");
}

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
const runQuery = { ...queryFns };
const queries = { ...queryFns };

//FILE: src/virtual_actions/kmjs.virtualAction.activate.ts
/**
 * Constructs a VirtualAction for ActivateApplication.
 */
function createVirtualActivate(opts = {}) {
    const { target = "Front", specific = {}, allWindows = false, reopenWindows = false, alreadyActivatedAction = "Normal", timeoutAborts = true, } = opts;
    console.log(chalk.cyan("[VirtualAction] ActivateApplication:"), chalk.yellowBright(JSON.stringify(opts)));
    // Build the <Application> dict (or empty)
    let applicationXml;
    if (target === "Specific") {
        const { name, bundleIdentifier, path, match, newFile } = specific;
        const appData = {};
        if (bundleIdentifier)
            appData.BundleIdentifier = bundleIdentifier;
        if (match)
            appData.Match = match;
        if (name)
            appData.Name = name;
        if (newFile)
            appData.NewFile = newFile;
        if (path)
            appData.Path = path;
        const orderedKeys = kmKeyOrder(Object.keys(appData), "application");
        const lines = ["<dict>"];
        for (const key of orderedKeys) {
            lines.push(`<key>${key}</key>`);
            lines.push(`<string>${escapeForXml(appData[key])}</string>`);
        }
        lines.push("</dict>");
        applicationXml = lines.join("\n");
    }
    else {
        applicationXml = "<dict/>";
    }
    /**
     * Canonical KM order (including ActionUID — stripped later in test normalisation):
     *  ActionUID
     *  AllWindows
     *  AlreadyActivatedActionType
     *  Application
     *  MacroActionType
     *  ReopenWindows
     *  TimeOutAbortsMacro
     */
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>AllWindows</key>",
        allWindows ? "\t\t<true/>" : "\t\t<false/>",
        "\t\t<key>AlreadyActivatedActionType</key>",
        `\t\t<string>${alreadyActivatedAction}</string>`,
        "\t\t<key>Application</key>",
        ...applicationXml.split("\n").map((l) => "\t\t" + l),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>ActivateApplication</string>",
        "\t\t<key>ReopenWindows</key>",
        reopenWindows ? "\t\t<true/>" : "\t\t<false/>",
        "\t\t<key>TimeOutAbortsMacro</key>",
        timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.cancel.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Cancel action.
 * Supports all cancel variants, including canceling all macros, this macro, a specific macro, and loop control.
 *
 * @param opts - CancelActionOptions specifying the variant and (if needed) the macro instance to cancel.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualCancel({ variant: "CancelAllMacros" })
 * createVirtualCancel({ variant: "CancelSpecificMacro", instance: "MyMacroNameOrUUID" })
 */
function createVirtualCancel(opts) {
    const { cancelType, instance } = opts;
    // Validate required field for CancelSpecificMacro
    if (cancelType === "CancelSpecificMacro" && !instance) {
        throw new Error("CancelSpecificMacro requires an 'instance' (macro name or UUID) to cancel.");
    }
    // Use generateActionUIDXml() directly, as in other actions, with no extra string manipulation
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        `\t\t<string>${cancelType}</string>`,
        ...generateActionUIDXml(),
        ...(cancelType === "CancelSpecificMacro"
            ? [
                "\t\t<key>Instance</key>",
                `\t\t<string>${escapeForXml(instance !== null && instance !== void 0 ? instance : "")}</string>`,
            ]
            : []),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>Cancel</string>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/utils/template.xml.ui.ts
/**
 * Normalises a found image condition to ensure it has all required fields.
 * - Always supplies a ScreenArea (defaults to ScreenAll).
 * - Removes template-source keys that KM never serialises for conditions.
 * - Ensures DisplayMatches + Fuzz have sane values.
 * @param cond - The condition to normalise.
 * @returns Normalised condition object.
 */
function normaliseFoundImage(cond) {
    if (cond.ConditionType !== "ScreenImage")
        return cond;
    // 1. Always supply a ScreenArea (KM defaults to ScreenAll)
    if (!cond.ScreenArea ||
        typeof cond.ScreenArea !== "object" ||
        !cond.ScreenArea.type) {
        cond.ScreenArea = { type: "ScreenAll" };
    }
    // 1b. KM also serialises ImageScreenArea for Screen source;
    // mirror ScreenArea if not explicitly provided.
    if (cond.ImageSource === "Screen" && !cond.ImageScreenArea) {
        cond.ImageScreenArea = cond.ScreenArea;
    }
    // 2. Remove template-source keys that KM never serialises for conditions
    delete cond.ImageSelection; // never used
    if (cond.ImageSource === "Image" || !cond.ImageSource) {
        delete cond.ImagePath;
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
        delete cond.ImageSource; // KM omits default
    }
    else if (cond.ImageSource === "File") {
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
    }
    else if (cond.ImageSource === "NamedClipboard") {
        delete cond.ImagePath;
    }
    else if (cond.ImageSource === "SystemClipboard" ||
        cond.ImageSource === "TriggerClipboard") {
        // KM does not serialize the *named* clipboard metadata for system/trigger clipboards
        delete cond.ImagePath;
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
    }
    else if (cond.ImageSource === "Icon") {
        delete cond.ImagePath;
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
    }
    else if (cond.ImageSource === "Screen") {
        delete cond.ImagePath;
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
    }
    // 3. Ensure DisplayMatches + Fuzz have sane values
    if (cond.DisplayMatches === undefined)
        cond.DisplayMatches = false;
    if (cond.Fuzz === undefined)
        cond.Fuzz = 0;
    return cond;
}
/**
 * Renders a <dict> for ScreenArea / ImageScreenArea.
 * @param keyName  Either "ScreenArea" or "ImageScreenArea".
 * @param area     The ScreenArea definition.
 */
function screenAreaToXml(keyName, area) {
    switch (area.type) {
        /* -----------------------------------------------------------
         * 1)  Screen / Window by **index**
         * --------------------------------------------------------- */
        case "ScreenIndex":
            return [
                `<key>${keyName}</key>`,
                `<dict>`,
                `\t<key>IndexExpression</key>`,
                `\t<string>${area.index}</string>`,
                `\t<key>ScreenAreaType</key>`,
                `\t<string>ScreenIndex</string>`,
                `</dict>`,
            ].join("\n");
        case "WindowIndex":
            return [
                `<key>${keyName}</key>`,
                `<dict>`,
                `\t<key>IndexExpression</key>`,
                `\t<string>${area.index}</string>`,
                `\t<key>ScreenAreaType</key>`,
                `\t<string>WindowIndex</string>`,
                `</dict>`,
            ].join("\n");
        /* -----------------------------------------------------------
         * 2)  Rectangular **Area**
         *     Height → Left → ScreenAreaType → Top → Width
         * --------------------------------------------------------- */
        case "Area":
            return [
                `<key>${keyName}</key>`,
                `<dict>`,
                `\t<key>HeightExpression</key>`,
                `\t<string>${area.height}</string>`,
                `\t<key>LeftExpression</key>`,
                `\t<string>${area.left}</string>`,
                `\t<key>ScreenAreaType</key>`,
                `\t<string>Area</string>`,
                `\t<key>TopExpression</key>`,
                `\t<string>${area.top}</string>`,
                `\t<key>WidthExpression</key>`,
                `\t<string>${area.width}</string>`,
                `</dict>`,
            ].join("\n");
        /* -----------------------------------------------------------
         * 3)  Window-by-name variants (same order as before)
         * --------------------------------------------------------- */
        case "WindowName":
        case "WindowNameContaining":
        case "WindowNameMatching":
            return [
                `<key>${keyName}</key>`,
                `<dict>`,
                `\t<key>ScreenAreaType</key>`,
                `\t<string>${area.type}</string>`,
                `\t<key>WindowName</key>`,
                `\t<string>${area.name}</string>`,
                `</dict>`,
            ].join("\n");
        /* -----------------------------------------------------------
         * 4)  All simple, flag-only variants
         * --------------------------------------------------------- */
        default:
            return [
                `<key>${keyName}</key>`,
                `<dict>`,
                `\t<key>ScreenAreaType</key>`,
                `\t<string>${area.type}</string>`,
                `</dict>`,
            ].join("\n");
    }
}

//FILE: src/utils/utils.keystroke.mapping.ts
/* ---------------------- */
/* Functions
/* ---------------------- */
/**
 * Returns the canonical modifier name (“Cmd”, “Shift”, “Option”, “Control”),
 * or the original token if it is not recognized as a modifier.
 * @param token - Modifier or alias string.
 * @returns Canonical modifier name or original token.
 */
function canonicalizeModifier(token) {
    var _a;
    return (_a = MODIFIER_ALIASES[token]) !== null && _a !== void 0 ? _a : token;
}
/**
 * Looks up the AppleScript key code for a given JavaScript `event.code` string.
 * @param code - JavaScript event.code string (e.g. 'KeyD', 'Digit5').
 * @returns AppleScript key code (number) or undefined if not mapped.
 */
function toAppleScriptKeyCode(code) {
    return JS_CODE_TO_AS_KEY_CODE[code];
}
/* ---------------------- */
/* Mappings
/* ---------------------- */
/**
 * Acceptable modifier aliases.
 * Maps various modifier names and aliases to their canonical form (Cmd, Shift, Option, Control).
 */
const MODIFIER_ALIASES = {
    /* Command -------------------------------------------------------------- */
    Cmd: "Cmd",
    Command: "Cmd",
    Meta: "Cmd",
    CmdLeft: "Cmd",
    CmdRight: "Cmd",
    CommandLeft: "Cmd",
    CommandRight: "Cmd",
    MetaLeft: "Cmd",
    MetaRight: "Cmd",
    Win: "Cmd", // Windows key on Apple keyboards
    WinLeft: "Cmd", // Windows key on Apple keyboards
    WinRight: "Cmd", // Windows key on Apple keyboards
    Windows: "Cmd", // Windows key on Apple keyboards
    WindowsLeft: "Cmd", // Windows key on Apple keyboards
    WindowsRight: "Cmd", // Windows key on Apple keyboards
    /* Shift ---------------------------------------------------------------- */
    Shift: "Shift",
    ShiftLeft: "Shift",
    ShiftRight: "Shift",
    /* Option / Alt --------------------------------------------------------- */
    Option: "Option",
    OptionLeft: "Option",
    OptionRight: "Option",
    Opt: "Option",
    OptLeft: "Option",
    OptRight: "Option",
    Alt: "Option",
    AltLeft: "Option",
    AltRight: "Option",
    /* Control -------------------------------------------------------------- */
    Ctrl: "Control",
    CtrlLeft: "Control",
    CtrlRight: "Control",
    Control: "Control",
    ControlLeft: "Control",
    ControlRight: "Control",
    macControl: "Control", // Adobe-specific alias
};
/**
 * Single-modifier → AppleScript mask values.
 * Maps canonical modifier names to their AppleScript mask values.
 */
const MAC_MODIFIER_CODES = {
    Cmd: 256, // 0x0100
    Shift: 512, // 0x0200
    Option: 2048, // 0x0800
    Control: 4096, // 0x1000
};
/**
 * JavaScript event.code → AppleScript key code mapping.
 * Full static list for every key present on a standard Mac keyboard.
 */
const JS_CODE_TO_AS_KEY_CODE = {
    /* 4.1 –– Alphanumeric row --------------------------------------------- */
    Backquote: 50, // ` ~
    Digit1: 18, // 1 !
    Digit2: 19, // 2 @
    Digit3: 20, // 3 #
    Digit4: 21, // 4 $
    Digit5: 23, // 5 %
    Digit6: 22, // 6 ^
    Digit7: 26, // 7 &
    Digit8: 28, // 8 *
    Digit9: 25, // 9 (
    Digit0: 29, // 0 )
    Minus: 27, // - _
    Equal: 24, // = +
    /* 4.2 –– QWERTY row ---------------------------------------------------- */
    KeyQ: 12,
    KeyW: 13,
    KeyE: 14,
    KeyR: 15,
    KeyT: 17,
    KeyY: 16,
    KeyU: 32,
    KeyI: 34,
    KeyO: 31,
    KeyP: 35,
    BracketLeft: 33, // [ {
    BracketRight: 30, // ] }
    Backslash: 42, // \ |
    /* 4.3 –– ASDF row ------------------------------------------------------ */
    KeyA: 0,
    KeyS: 1,
    KeyD: 2,
    KeyF: 3,
    KeyG: 5,
    KeyH: 4,
    KeyJ: 38,
    KeyK: 40,
    KeyL: 37,
    Semicolon: 41, // ; :
    Quote: 39, // ' "
    /* 4.4 –– ZXCV row ------------------------------------------------------ */
    KeyZ: 6,
    KeyX: 7,
    KeyC: 8,
    KeyV: 9,
    KeyB: 11,
    KeyN: 45,
    KeyM: 46,
    Comma: 43, // , <
    Period: 47, // . >
    Slash: 44, // / ?
    /* 4.5 –– Whitespace & editing ----------------------------------------- */
    Space: 49,
    Tab: 48,
    Enter: 36, // Return (main)
    NumpadEnter: 76, // Enter (numeric pad)
    Backspace: 51, // Delete ⌫ (backwards)
    Delete: 51, // alias for Backspace
    Escape: 53,
    CapsLock: 57,
    /* 4.6 –– Arrow / navigation ------------------------------------------- */
    ArrowLeft: 123,
    ArrowRight: 124,
    ArrowDown: 125,
    ArrowUp: 126,
    Home: 115,
    End: 119,
    PageUp: 116,
    PageDown: 121,
    /* 4.7 –– Function keys ------------------------------------------------- */
    F1: 122,
    F2: 120,
    F3: 99,
    F4: 118,
    F5: 96,
    F6: 97,
    F7: 98,
    F8: 100,
    F9: 101,
    F10: 109,
    F11: 103,
    F12: 111,
    F13: 105,
    F14: 107,
    F15: 113,
    F16: 106,
    F17: 64,
    F18: 79,
    F19: 80,
    F20: 90,
    /* 4.8 –– Numpad -------------------------------------------------------- */
    Numpad0: 82,
    Numpad1: 83,
    Numpad2: 84,
    Numpad3: 85,
    Numpad4: 86,
    Numpad5: 87,
    Numpad6: 88,
    Numpad7: 89,
    Numpad8: 91,
    Numpad9: 92,
    NumpadMultiply: 67,
    NumpadAdd: 69,
    NumpadSubtract: 78,
    NumpadDivide: 75,
    NumpadDecimal: 65,
    NumpadEqual: 81,
    NumLock: 71, // “Clear”
    /* 4.9 –– Misc system keys --------------------------------------------- */
    Insert: 114, // “Help” on Apple keyboards
    PrintScreen: 114, // same physical key as Help
    Pause: 131, // F16 top-function variant
};

//FILE: src/utils/utils.keystroke.ts
/**
 * Keyboard Shortcut Utilities for macOS Automation
 *
 * This module provides functions for parsing, normalizing, and converting keyboard shortcuts
 * into AppleScript/Keyboard Maestro compatible formats. The main entry point is
 * {@link normalizeAppleScriptShortcut}, which accepts a shortcut in various forms (string, number,
 * or mask→key map) and returns a normalized map suitable for automation scripting.
 *
 * Key features:
 * - Parse human-readable javascript shortcut strings (e.g. "Cmd+Shift+KeyD")
 * - Convert to AppleScript modifier mask and key code
 * - Handle modifier aliases and canonicalization
 * - Utility functions for sorting, combining, and mapping modifiers
 * - Support for single-character keys and digit keys
 * - Handles passing in existing mask→key maps directly without modification for a seamless interface
 *
 * See also:
 * - keystroke.mapping.ts: Contains static tables for modifier aliases, key code mapping, and mask values.
 *  - Included converting from JavaScript `event.code`, and windows modifier aliases for convenience.
 *  - Directional modifers like "CmdLeft" and "OptRight" are flattened to non-directional variants
 *
 * Example usage:
 *   import { normalizeAppleScriptShortcut } from "./keystroke.utils";
 *   const shortcut = normalizeAppleScriptShortcut("Cmd+Option+O"); // { 2304: 31 }
 *
 * For lower-level utilities, see {@link processKeys}, {@link toAppleScript}, {@link comboMask}, etc.
 */
/* ---------------------- */
/* Functions
/* ---------------------- */
/**
 * Checks if a token is a recognized modifier (Cmd, Shift, Option, Control or any alias).
 * @param token - The string to test (e.g. 'Cmd', 'Alt', 'Control', 'Foo').
 * @returns True if the token is a modifier or alias, false otherwise.
 */
function isModifier(token) {
    return token in MODIFIER_ALIASES;
}
/**
 * Sorts an array of modifiers into canonical macOS order: Cmd → Option → Shift → Control.
 * @param mods - Array of unsorted modifier names (canonical or aliases).
 * @returns Sorted array of canonical modifier names.
 */
function sortModifiers(mods) {
    const order = ["Cmd", "Option", "Shift", "Control"];
    return [...mods].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
/**
 * Combines an array of modifiers into a single AppleScript modifier mask value.
 * @param mods - Array of canonical modifier names.
 * @returns Numeric mask (e.g. 768 for Cmd+Shift).
 */
function buildModifierMask(mods) {
    return mods.reduce((acc, m) => acc + MAC_MODIFIER_CODES[m], 0);
}
/**
 * Parses a shortcut string (e.g. 'Cmd+Shift+KeyD') into its modifier and key components.
 * @param shortcut - Shortcut string to parse.
 * @returns ParsedShortcut object with sorted modifiers and keyToken.
 */
function parseShortcut(shortcut) {
    const parts = shortcut
        .split("+")
        .map((p) => p.trim())
        .filter(Boolean);
    const modifiers = [];
    let keyToken = "";
    for (const part of parts) {
        if (isModifier(part)) {
            modifiers.push(canonicalizeModifier(part));
        }
        else {
            keyToken = part;
        }
    }
    return {
        modifiers: sortModifiers(modifiers),
        keyToken,
    };
}
/**
 * Converts a human-readable shortcut (e.g. 'Cmd+Shift+KeyD' or 'd')
 * into an AppleScriptShortcut object with modifier mask and key code.
 * Throws an Error if the key or modifiers are unknown.
 * @param shortcut - Shortcut string to process.
 * @returns AppleScriptShortcut object.
 */
function processKeys(shortcut) {
    const { modifiers, keyToken } = parseShortcut(shortcut);
    // Compute modifier mask
    const modifierMask = buildModifierMask(modifiers);
    // Explicit KeyCode:NN optional syntax (always wins)
    let rawToken = keyToken;
    let explicitRaw = false;
    const keyCodePrefixMatch = /^KeyCode:(\d+)$/.exec(rawToken);
    if (keyCodePrefixMatch) {
        explicitRaw = true;
        rawToken = keyCodePrefixMatch[1];
    }
    // 1) Direct lookup (event.code style already, e.g. Digit1 / KeyA)
    let keyCode = !explicitRaw ? toAppleScriptKeyCode(rawToken) : undefined;
    // 2) Single-character alphanumeric → map to DigitX / KeyX
    if (!explicitRaw && keyCode === undefined && rawToken.length === 1) {
        const ch = rawToken.toUpperCase();
        const code = /[A-Z]/.test(ch)
            ? `Key${ch}`
            : /[0-9]/.test(ch)
                ? `Digit${ch}`
                : undefined;
        if (code)
            keyCode = toAppleScriptKeyCode(code);
    }
    // 3) Raw numeric keycode fallback:
    //    - explicit "KeyCode:NN"
    //    - OR multi-digit numeric string (length > 1 and all digits)
    if (keyCode === undefined &&
        /^\d+$/.test(rawToken) &&
        (explicitRaw || rawToken.length > 1)) {
        const numeric = Number(rawToken);
        if (numeric >= 0 && numeric <= 255) {
            keyCode = numeric;
        }
    }
    // (Do *not* treat single-digit numeric string without prefix as raw code; already resolved above.)
    // 4. Give up if still undefined
    if (keyCode === undefined) {
        throw new Error(`Unsupported key token: "${keyToken}"`);
    }
    return { modifier: modifierMask, key: keyCode };
}
/**
 * Converts a shortcut string (e.g. 'Cmd+Shift+KeyD') into a map of modifier mask to key code.
 * Always returns an object with a single key-value pair: {modifierMask: keyCode}.
 * @param shortcut - Shortcut string to convert.
 * @returns Record<number, number> mapping modifier mask to key code.
 */
function toAppleScript(shortcut) {
    const { modifier, key } = processKeys(shortcut);
    // Always return the mask→key map, even when modifier === 0
    return { [modifier]: key };
}
/**
 * Normalize any form of shortcut input into a ready-to-use AppleScript modifier mask → key code map.
 *
 * This is the main entry point for keystroke processing in kmjs. It accepts various input formats
 * and converts them to a standardized format suitable for AppleScript/Keyboard Maestro automation.
 *
 * **Supported Input Formats:**
 * - **String shortcuts**: Human-readable combinations like "Cmd+S", "Shift+KeyA", "Option+F1"
 * - **Single characters**: "a", "1", "A" (automatically mapped to KeyA, Digit1, etc.)
 * - **Event codes**: JavaScript event.code strings like "KeyA", "Digit1", "Space", "Enter"
 * - **Raw key codes**: Numeric values (0-255) representing AppleScript key codes
 * - **Explicit key codes**: "KeyCode:36" format for explicit raw key code specification
 * - **Modifier-only**: "Cmd", "Shift+Option" (returns null key with modifier mask)
 * - **Existing maps**: Pre-formatted {mask: keyCode} objects (returned as-is)
 *
 * **Modifier Support:**
 * - Cmd/Command/Meta (aliases supported)
 * - Shift
 * - Option/Alt (aliases supported)
 * - Control/Ctrl (aliases supported)
 * - All combinations: "Cmd+Shift+Option+Control"
 *
 * **Return Format:**
 * Returns a Record<number, number | null> where:
 * - Key: AppleScript modifier mask (0-6912)
 * - Value: AppleScript key code (0-255) or null for modifier-only shortcuts
 *
 * @param input - The keystroke input to normalize. Can be:
 *   - `string`: Human-readable shortcut like "Cmd+S" or "KeyA" or modifier-only like "Cmd"
 *   - `number`: Raw AppleScript key code (0-255)
 *   - `Record<number, number | null>`: Pre-formatted mask→key map (returned verbatim)
 *
 * @returns A normalized AppleScript-compatible map with modifier mask as key and key code as value.
 *   For modifier-only shortcuts, the value will be null.
 *
 * @throws {Error} When key code is out of valid range (0-255) or input format is invalid
 *
 * @example
 * ```typescript
 * // String shortcuts
 * normalizeAppleScriptShortcut("Cmd+S")           // { 256: 1 }
 * normalizeAppleScriptShortcut("Shift+KeyA")      // { 512: 0 }
 * normalizeAppleScriptShortcut("Cmd+Option+F1")   // { 2304: 122 }
 *
 * // Single characters (auto-mapped)
 * normalizeAppleScriptShortcut("a")               // { 0: 0 }
 * normalizeAppleScriptShortcut("1")               // { 0: 18 }
 *
 * // Event codes
 * normalizeAppleScriptShortcut("Space")           // { 0: 49 }
 * normalizeAppleScriptShortcut("Enter")           // { 0: 36 }
 *
 * // Raw key codes
 * normalizeAppleScriptShortcut(36)                // { 0: 36 }
 * normalizeAppleScriptShortcut("KeyCode:36")      // { 0: 36 }
 *
 * // Modifier-only (returns null key)
 * normalizeAppleScriptShortcut("Cmd")             // { 256: null }
 * normalizeAppleScriptShortcut("Shift+Option")    // { 2560: null }
 *
 * // Pre-formatted maps (returned as-is)
 * normalizeAppleScriptShortcut({ 256: 1 })       // { 256: 1 }
 * ```
 *
 * @see {@link processKeys} For the underlying string processing logic
 * @see {@link toAppleScript} For direct string-to-map conversion
 * @see {@link buildModifierMask} For modifier mask calculation
 */
function normalizeAppleScriptShortcut(input) {
    // Raw numeric keyCode (no modifiers) – treat as already-resolved
    if (typeof input === "number" && Number.isInteger(input)) {
        // Guard: ensure plausible keycode range (0–255 typical; KM uses <= 126 main keys, some higher fn keys)
        if (input < 0 || input > 255) {
            throw new Error(`Key code out of range: ${input}`);
        }
        return { 0: input };
    }
    // NOTE: numeric *string* forms are handled in processKeys():
    //  - Single digit "1" → Digit1 key (NOT raw code 1)
    //  - Multi-digit "36" → raw keyCode 36
    //  - "KeyCode:1"     → raw keyCode 1 (explicit override)
    // Already a mask→key map?
    if (typeof input === "object" &&
        input !== null &&
        Object.keys(input).length === 1 &&
        Object.entries(input).every(([mask, key]) => !isNaN(Number(mask)) && (typeof key === "number" || key === null))) {
        return input;
    }
    // If input is a string of just modifiers, allow mask→key map with key null
    if (typeof input === "string") {
        const parsed = parseShortcut(input);
        if (parsed.keyToken === "" && parsed.modifiers.length > 0) {
            const mask = buildModifierMask(parsed.modifiers);
            return { [mask]: null };
        }
    }
    // Otherwise treat as human-readable (or numeric) shortcut
    return toAppleScript(String(input));
}

//FILE: src/utils/utils.mouse.ts
/* ----------------------------- */
/* Mouse mappings
/* ----------------------------- */
const BUTTON_INT = {
    Left: 0,
    Right: 1,
    Center: 2,
    Button4: 3,
    Button5: 4,
    Button6: 5,
};
const CLICK_COUNT_INT = {
    Click: 1,
    DoubleClick: 2,
    TripleClick: 3,
};

//FILE: src/virtual_actions/kmjs.virtualAction.clickAtFoundImage.ts
/* ------------------------------------------------------------------ */
/* Main factory function                                               */
/* ------------------------------------------------------------------ */
/**
 * Creates a Keyboard Maestro virtual action that clicks at a found image on the screen.
 * This is the most comprehensive mouse action, supporting image search, coordinate systems, and advanced click behaviors.
 *
 * ## Advanced Mouse Control with Image Recognition
 *
 * This function combines image recognition with mouse automation, making it perfect for:
 * - Clicking on UI elements that may move or change
 * - Dragging elements found via image search
 * - Complex automation that adapts to different screen layouts
 * - Precise clicking relative to visual landmarks
 *
 * ### Key Concepts:
 *
 * **Image-Based vs Coordinate-Based Operation:**
 * - When `relative: "Image"` (default): Finds an image first, then clicks relative to it
 * - When `relative: "Screen"/"Window"/"Mouse"/"Absolute"`: Uses this as a pure coordinate-based click (like createVirtualMoveAndClick)
 *
 * **Image Sources (`imageSource` parameter):**
 * - `"Image"` - Uses an image pasted into the Keyboard Maestro action (default)
 * - `"File"` - Loads template image from file path (requires `filePath`)
 * - `"NamedClipboard"` - Uses image from named clipboard (requires `namedClipboardUUID`)
 * - `"Screen"` - Uses a screenshot of specified area as template
 *
 * **Coordinate Systems (`relative` parameter):**
 * - `"Image"` - Relative to the found image (0,0 = image center by default)
 * - `"Screen"` - Absolute screen coordinates (0,0 = top-left of main screen)
 * - `"Window"` - Relative to the front window (0,0 = top-left of window content)
 * - `"Mouse"` - Relative to current mouse position (0,0 = current mouse location)
 * - `"Absolute"` - Same as Screen but uses different internal handling
 *
 * **Drag Operations for Image-Based Actions:**
 * - `"None"` - Just click, no dragging
 * - `"Absolute"` - Drag from found image to absolute screen coordinates
 * - `"Relative"` - Drag by offset from the found image position
 * - `"To"` - Drag to specific coordinates
 * - `"From"` - Start drag from specific coordinates
 *
 * @param opts - Options to configure the click action
 * @param opts.clickKind - Type of click: "Click", "DoubleClick", "RightClick", "Move", "Release" (default: "Click")
 * @param opts.button - Mouse button: "Left", "Right", "Middle" (default: "Left")
 * @param opts.clickModifiers - Modifier keys as string, number, or object (default: 0)
 * @param opts.horizontal - X coordinate offset (default: 0)
 * @param opts.vertical - Y coordinate offset (default: 0)
 * @param opts.relative - Coordinate reference: "Image", "Window", "Screen", "Mouse", "Absolute" (default: "Image")
 * @param opts.relativeCorner - Corner for relative positioning: "TopLeft", "TopRight", "BottomLeft", "BottomRight", "Center" (default: "Center" for Image, "TopLeft" for Mouse/Absolute)
 * @param opts.imageSource - Template image source: "Image", "File", "NamedClipboard", "Screen", etc. (default: "Image")
 * @param opts.fuzz - Image match tolerance 0-100 (default: 15)
 * @param opts.waitForImage - Wait for image to appear (default: true)
 * @param opts.imageSelection - Which image if multiple found: "Unique", "Best", "TopLeft", etc. (default: "Unique")
 * @param opts.namedClipboardUUID - UUID for named clipboard (required if imageSource is "NamedClipboard")
 * @param opts.filePath - File path for image (required if imageSource is "File")
 * @param opts.screenArea - Area to search/click (default: entire screen)
 * @param opts.imageScreenArea - Area to crop image search when imageSource is "Screen"
 * @param opts.mouseDrag - Mouse drag behavior: "None", "Absolute", "Relative", "To", "From" (default: "None")
 * @param opts.dragTargetX - X coordinate for drag target (default: 0)
 * @param opts.dragTargetY - Y coordinate for drag target (default: 0)
 * @param opts.restoreMouseLocation - Restore mouse position after click (default: false)
 *
 * @example
 * // Find and click on a button image (basic image-based clicking)
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/button.png"
 * })
 *
 * // Click 20px to the right and 10px below a found image
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/reference.png",
 *   horizontal: 20,
 *   vertical: 10,
 *   relative: "Image"  // Relative to the found image
 * })
 *
 * // Drag from a found image to a specific screen location
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/draggable-item.png",
 *   relative: "Image",
 *   mouseDrag: "Absolute",  // Drag to absolute coordinates
 *   dragTargetX: 500,       // Target screen X
 *   dragTargetY: 300,       // Target screen Y
 *   clickKind: "Click"
 * })
 *
 * // Find an image and drag it by a relative offset
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/slider-handle.png",
 *   relative: "Image",
 *   mouseDrag: "Relative",  // Drag by offset
 *   dragTargetX: 100,       // Move 100px right from image
 *   dragTargetY: 0,         // No vertical movement
 *   clickKind: "Click"
 * })
 *
 * // Use as coordinate-based click (ignoring image search)
 * createVirtualClickAtFoundImage({
 *   horizontal: 400,
 *   vertical: 300,
 *   relative: "Screen",     // Pure coordinate-based
 *   clickKind: "Click"
 * })
 *
 * // Complex drag: Find image, then drag to another found location
 * // (This would typically be done in multiple steps)
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/source.png",
 *   relative: "Image",
 *   mouseDrag: "Absolute",
 *   dragTargetX: 600,       // Coordinates of destination
 *   dragTargetY: 400,
 *   clickKind: "Click",
 *   restoreMouseLocation: true  // Return mouse to original position
 * })
 *
 * // Move mouse to found image without clicking (useful for positioning)
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/target.png",
 *   relative: "Image",
 *   clickKind: "Move"       // Just move, don't click
 * })
 *
 * @returns A VirtualAction object that can render itself as KM XML.
 */
function createVirtualClickAtFoundImage(opts = {}) {
    var _a;
    /**
     * Extract and set defaults for all click/image options.
     * @see ClickAtFoundImageOptions for details on each option.
     */
    const { clickKind = "Click", // Type of click (single, double, etc.)
    button = "Left", // Mouse button to use
    clickModifiers = 0, // Modifier keys
    horizontal = 0, // Horizontal position
    vertical = 0, // Vertical position
    relative = "Image", // Relative source for position
    // relativeCorner = "Center", // Corner to use for relative positioning
    relativeCorner, // Corner to use for relative positioning
    imageSource = "Image", // Template image source
    fuzz, // Image match fuzziness
    waitForImage = true, // Wait for image to appear
    imageSelection = "Unique", // Which image to select if multiple found
    namedClipboardUUID, // Named clipboard UUID if needed
    filePath, // File path if needed
    screenArea = { type: "ScreenAll" }, // Area to search/click
    imageScreenArea, // Area to crop image search
    mouseDrag = "None", // Mouse drag behaviour
    dragTargetX = 0, // Drag target X
    dragTargetY = 0, // Drag target Y
    restoreMouseLocation: _restoreMouseLocation = false, // Restore mouse location after click
     } = opts;
    // Release actions ignore restoreMouseLocation (GUI hides it)
    const restoreMouseLocation = clickKind === "Release" ? false : _restoreMouseLocation;
    /* -----------------------------------------------------------
     * 1) Normalize relativeCorner:
     *    • If caller passed one, use it.
     *    • Else if relative is Mouse or Absolute → TopLeft (KM uses
     *      these as vestigal reference for some reason).
     *    • Otherwise → Center.
     * --------------------------------------------------------- */
    const _relativeCorner = relativeCorner !== undefined
        ? relativeCorner
        : relative === "Mouse" || relative === "Absolute"
            ? "TopLeft"
            : "Center";
    /* -----------------------------------------------------------
     * Named Clipboard handling
     * --------------------------------------------------------- */
    const DEFAULT_CLIPBOARD_UUID = "FE1390C3-74DF-4983-9C6B-E2C441F97963";
    const DEFAULT_CLIPBOARD_LABEL = "Unnamed Named Clipboard";
    // If the template comes from a named clipboard but the caller did
    // not supply a UUID, just mimic KM’s own fallback.
    const clipboardUUID = imageSource === "NamedClipboard"
        ? (namedClipboardUUID !== null && namedClipboardUUID !== void 0 ? namedClipboardUUID : DEFAULT_CLIPBOARD_UUID)
        : undefined;
    /**
     * Validate required options for certain image sources.
     */
    if (imageSource === "File" && !filePath) {
        throw new Error("filePath must be supplied when imageSource === 'File'");
    }
    /**
     * Resolve the modifier mask for the click action.
     * Converts clickModifiers to a numeric mask.
     */
    const mask = (() => {
        if (typeof clickModifiers === "number")
            return clickModifiers;
        const map = normalizeAppleScriptShortcut(clickModifiers);
        return Number(Object.keys(map)[0]);
    })();
    /**
     * Determine the action string and click count for the KM XML.
     * Uses centralized mapping for click counts.
     */
    let actionString;
    let clickCount;
    switch (clickKind) {
        case "Move":
            actionString = "Move";
            clickCount = 0;
            break;
        case "Release":
            // KM serialises Release as MoveAndClick + ClickCount -1.
            // Ignore restoreMouseLocation (GUI hides it).
            actionString = "MoveAndClick";
            clickCount = -1;
            break;
        default:
            // Use mapping for click counts
            clickCount = CLICK_COUNT_INT[clickKind];
            actionString = restoreMouseLocation ? "Click" : "MoveAndClick";
            break;
    }
    /** ----------------------------------------------------------------
     *  Mouse-drag sanity
     *  ----------------------------------------------------------------
     *  KM silently resets MouseDrag → “None” whenever you pick
     *  Click / DoubleClick *and* ask for a drag phase that makes no sense
     *  (“From”, “Drag”, “Release”).  Re-create that behaviour so our
     *  generated XML round-trips 1-for-1.
     */
    let effectiveMouseDrag = mouseDrag;
    if ((clickKind === "Click" || clickKind === "DoubleClick") &&
        (mouseDrag === "From" ||
            mouseDrag === "Drag" ||
            mouseDrag === "Release")) {
        effectiveMouseDrag = "None";
    }
    /**
     * Build the KM XML for the click action with proper structure.
     */
    const fuzzValue = typeof fuzz === "number"
        ? Math.max(0, Math.min(100, Math.round(fuzz)))
        : 15; // KM default
    /* ----------------------------------------------------------------
     * TEMPLATE-SOURCE KEYS
     * ----------------------------------------------------------------
     * Only keep the template‐source keys (ImagePath/ImageSource/...),
     * when we're positioning *relative to the found image*.
     */
    const keepTemplateSourceKeys = relative === "Image";
    const imagePathXml = keepTemplateSourceKeys && imageSource === "File"
        ? ["\t\t<key>ImagePath</key>", `\t\t<string>${filePath}</string>`]
        : [];
    const namedClipboardXml = keepTemplateSourceKeys && imageSource === "NamedClipboard"
        ? [
            `\t\t<key>ImageNamedClipboardName</key>`,
            `\t\t<string>${clipboardUUID}</string>`,
            `\t\t<key>ImageNamedClipboardRedundandDisplayName</key>`,
            `\t\t<string>${DEFAULT_CLIPBOARD_LABEL}</string>`,
        ]
        : [];
    const imageScreenAreaXml = keepTemplateSourceKeys && imageSource === "Screen"
        ? screenAreaToXml("ImageScreenArea", (_a = imageScreenArea !== null && imageScreenArea !== void 0 ? imageScreenArea : screenArea) !== null && _a !== void 0 ? _a : { type: "ScreenAll" })
            .split("\n")
            .map((l) => (l ? `\t\t${l}` : l))
        : [];
    const imageSelectionXml = imageSelection !== "Unique" && relative === "Image"
        ? [
            `\t\t<key>ImageSelection</key>`,
            `\t\t<string>${imageSelection}</string>`,
        ]
        : [];
    const relativeCornerXml = _relativeCorner
        ? [
            `\t\t<key>RelativeCorner</key>`,
            `\t\t<string>${_relativeCorner}</string>`,
        ]
        : [];
    /* -----------------------------------------------------------
     * Only include <ScreenArea> when the click is measured
     * relative to the *found image*.
     * --------------------------------------------------------- */
    const includeScreenArea = relative === "Image";
    const screenAreaLines = includeScreenArea
        ? screenAreaToXml("ScreenArea", screenArea)
            .split("\n")
            .map((l) => (l ? `\t\t${l}` : l))
        : [];
    const imageSourceXml = keepTemplateSourceKeys && imageSource !== "Image"
        ? ["\t\t<key>ImageSource</key>", `\t\t<string>${imageSource}</string>`]
        : [];
    // Only emit KM’s timeout block when waitForImage is explicitly true.
    let waitForImageXml = [];
    if (opts.waitForImage === true) {
        waitForImageXml = [
            `\t\t<key>TimeOutAbortsMacro</key>`,
            `\t\t<true/>`,
            `\t\t<key>WaitForImage</key>`,
            `\t\t<true/>`,
        ];
    }
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        `\t\t<string>${actionString}</string>`,
        ...generateActionUIDXml(),
        "\t\t<key>Button</key>",
        `\t\t<integer>${BUTTON_INT[button]}</integer>`,
        "\t\t<key>ClickCount</key>",
        `\t\t<integer>${clickCount}</integer>`,
        "\t\t<key>DisplayMatches</key>",
        "\t\t<false/>",
        "\t\t<key>DragHorizontalPosition</key>",
        `\t\t<string>${dragTargetX}</string>`,
        "\t\t<key>DragVerticalPosition</key>",
        `\t\t<string>${dragTargetY}</string>`,
        "\t\t<key>Fuzz</key>",
        `\t\t<integer>${fuzzValue}</integer>`,
        "\t\t<key>HorizontalPositionExpression</key>",
        `\t\t<string>${horizontal}</string>`,
        ...imagePathXml,
        ...namedClipboardXml,
        ...imageScreenAreaXml,
        ...imageSelectionXml,
        ...imageSourceXml,
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>MouseMoveAndClick</string>",
        "\t\t<key>Modifiers</key>",
        `\t\t<integer>${mask}</integer>`,
        "\t\t<key>MouseDrag</key>",
        `\t\t<string>${effectiveMouseDrag}</string>`,
        "\t\t<key>Relative</key>",
        `\t\t<string>${relative}</string>`,
        ...relativeCornerXml,
        "\t\t<key>RestoreMouseLocation</key>",
        `\t\t<${restoreMouseLocation ? "true" : "false"}/>`,
        ...screenAreaLines,
        "\t\t<key>VerticalPositionExpression</key>",
        `\t\t<string>${vertical}</string>`,
        ...waitForImageXml,
        "\t</dict>",
    ];
    /**
     * Return the VirtualAction object with XML rendering.
     */
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.copy.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Copy action.
 * Copies the current selection to the clipboard.
 *
 * @param opts - CopyActionOptions for timeout behavior configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualCopy()
 * createVirtualCopy({ notifyOnTimeout: false, timeoutAborts: true })
 */
function createVirtualCopy(opts = {}) {
    const { notifyOnTimeout = true, timeoutAborts = true } = opts;
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        "\t\t<string>Copy</string>",
        ...generateActionUIDXml(),
        "\t\t<key>IsDisclosed</key>",
        "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>CutCopyPaste</string>",
        ...renderTimeoutXml({ notifyOnTimeout, timeoutAborts }),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.cut.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Cut action.
 * Cuts the current selection to the clipboard.
 *
 * @param opts - CutActionOptions for timeout behavior configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualCut()
 * createVirtualCut({ notifyOnTimeout: false, timeoutAborts: true })
 */
function createVirtualCut(opts = {}) {
    const { notifyOnTimeout = true, timeoutAborts = false } = opts;
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        "\t\t<string>Cut</string>",
        ...generateActionUIDXml(),
        "\t\t<key>IsDisclosed</key>",
        "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>CutCopyPaste</string>",
        ...renderTimeoutXml({ notifyOnTimeout, timeoutAborts }),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/utils/template.xml.condition.window.ts
/* ──────────────────────────────────────────────────────────────────────────
 *  Helpers to coerce   FrontWindowCondition / AnyWindowCondition
 *  into the exact key/value surface Keyboard Maestro serialises.
 * ────────────────────────────────────────────────────────────────────────── */
const FRONT_OP_TITLE_NEEDED = new Set([
    "TitleIs",
    "TitleIsNot",
    "TitleContains",
    "TitleDoesNotContain",
    "TitleMatches",
    "TitleDoesNotMatch",
]);
const FRONT_OP_TITLE_OPTIONAL = new Set([
    "ExistsButTitleIsNot",
    "ExistsButTitleDoesNotContain",
    "ExistsButTitleDoesNotMatch",
]);
function normaliseWindowCondition(raw) {
    if (raw.ConditionType !== "FrontWindow" &&
        raw.ConditionType !== "AnyWindow") {
        return raw;
    }
    // Shallow-copy to avoid mutating the caller’s object
    const c = { ...raw };
    // 1. Ensure IsFrontApplication and Application are mutually-valid
    if (c.IsFrontApplication === undefined)
        c.IsFrontApplication = true;
    if (c.IsFrontApplication) {
        delete c.Application; // KM drops the dict entirely
    }
    else {
        // Guarantee an <Application><dict/></Application> – KM never serialises
        // a bare <dict/>
        if (!c.Application || Object.keys(c.Application).length === 0) {
            c.Application = {}; // empty dict is fine – template.xml will emit <dict/>
        }
    }
    // 2. Title key semantics (FrontWindow only)
    if (c.ConditionType === "FrontWindow") {
        const op = c.FrontWindowConditionType;
        if (FRONT_OP_TITLE_NEEDED.has(op)) {
            if (c.FrontWindowTitle === undefined)
                c.FrontWindowTitle = "Untitled";
        }
        else if (FRONT_OP_TITLE_OPTIONAL.has(op)) {
            if (c.FrontWindowTitle === undefined)
                c.FrontWindowTitle = "";
        }
        else {
            delete c.FrontWindowTitle; // KM omits key entirely
        }
    }
    // 3. AnyWindow always has AnyWindowTitle (may be empty string)
    if (c.ConditionType === "AnyWindow") {
        if (c.AnyWindowTitle === undefined)
            c.AnyWindowTitle = "";
    }
    return c;
}

//FILE: src/utils/template.xml.condition.script.ts
/**
 * Normalises a ScriptCondition so IncludedVariables is always present.
 *
 * Rules:
 *  - If the user supplies IncludedVariables: use it verbatim.
 *  - If they set includeAllVariables flag: emit sentinel ["9999"].
 *  - If neither provided: emit [] (no variables).
 *
 * The helper property `includeAllVariables` is removed before serialisation.
 */
function normaliseScriptCondition(raw) {
    if (raw.ConditionType !== "Script")
        return raw;
    const c = { ...raw };
    if (Array.isArray(c.IncludedVariables)) ;
    else if (c.includeAllVariables === true) {
        c.IncludedVariables = ["9999"];
    }
    else {
        c.IncludedVariables = [];
    }
    delete c.includeAllVariables;
    return c;
}

//FILE: src/utils/template.xml.condition.ocr.ts
/**
 * @fileoverview OCR (Optical Character Recognition) condition template utilities for Keyboard Maestro XML generation.
 *
 * This module provides utilities for normalizing and rendering OCR-based conditions in Keyboard Maestro macros.
 * OCR conditions allow macros to detect and respond to text found on screen through image recognition.
 *
 * @module template.xml.condition.ocr
 * @since 1.0.0
 */
/**
 * Normalizes an OCR condition object by removing unnecessary properties based on the image source type.
 *
 * OCR conditions in Keyboard Maestro can use different image sources (File, NamedClipboard, Screen, etc.),
 * and each source type requires different XML properties. This function ensures that only the relevant
 * properties are included in the final XML output by removing properties that don't apply to the
 * specified image source.
 *
 * ## Image Source Types and Their Properties:
 *
 * - **File**: Uses `ImagePath`, removes clipboard and screen area properties
 * - **NamedClipboard**: Uses clipboard properties, removes file path and screen area
 * - **Screen**: Uses `ImageScreenArea`, removes file path and clipboard properties
 * - **SystemClipboard/TriggerClipboard/Icon/Image**: Uses minimal properties, removes most others
 *
 * @param cond - The OCR condition object to normalize
 * @param cond.ConditionType - Must be "OCR" for this function to process the condition
 * @param cond.ImageSource - The source type for the OCR image ("File", "NamedClipboard", "Screen", etc.)
 * @param cond.ImagePath - File path (used when ImageSource is "File")
 * @param cond.ImageNamedClipboardName - Named clipboard identifier (used when ImageSource is "NamedClipboard")
 * @param cond.ImageNamedClipboardRedundandDisplayName - Display name for named clipboard
 * @param cond.ImageScreenArea - Screen area definition (used when ImageSource is "Screen")
 *
 * @returns The normalized condition object with unnecessary properties removed
 *
 * @example
 * ```typescript
 * // File-based OCR condition
 * const fileCondition = {
 *   ConditionType: "OCR",
 *   ImageSource: "File",
 *   ImagePath: "/path/to/template.png",
 *   ImageNamedClipboardName: "unused", // Will be removed
 *   ImageScreenArea: { type: "ScreenAll" } // Will be removed
 * };
 *
 * const normalized = normaliseOCRCondition(fileCondition);
 * // Result: { ConditionType: "OCR", ImageSource: "File", ImagePath: "/path/to/template.png" }
 * ```
 *
 * @example
 * ```typescript
 * // Screen-based OCR condition
 * const screenCondition = {
 *   ConditionType: "OCR",
 *   ImageSource: "Screen",
 *   ImagePath: "/unused/path.png", // Will be removed
 *   ImageScreenArea: { type: "ScreenAll" }
 * };
 *
 * const normalized = normaliseOCRCondition(screenCondition);
 * // Result: { ConditionType: "OCR", ImageSource: "Screen", ImageScreenArea: { type: "ScreenAll" } }
 * ```
 *
 * @example
 * ```typescript
 * // Non-OCR condition (passes through unchanged)
 * const otherCondition = { ConditionType: "Variable", Variable: "MyVar" };
 * const result = normaliseOCRCondition(otherCondition);
 * // Result: { ConditionType: "Variable", Variable: "MyVar" } (unchanged)
 * ```
 */
function normaliseOCRCondition(cond) {
    // Only process OCR conditions, pass through others unchanged
    if (cond.ConditionType !== "OCR")
        return cond;
    const src = cond.ImageSource;
    // Remove properties that don't apply to File-based image sources
    if (src === "File") {
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
        delete cond.ImageScreenArea;
    }
    // Remove properties that don't apply to NamedClipboard-based image sources
    else if (src === "NamedClipboard") {
        delete cond.ImagePath;
        delete cond.ImageScreenArea;
    }
    // Remove properties that don't apply to Screen-based image sources
    else if (src === "Screen") {
        delete cond.ImagePath;
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
    }
    // Remove properties that don't apply to clipboard/icon/image sources
    else if (src === "SystemClipboard" ||
        src === "TriggerClipboard" ||
        src === "Icon" ||
        src === "Image") {
        delete cond.ImagePath;
        delete cond.ImageNamedClipboardName;
        delete cond.ImageNamedClipboardRedundandDisplayName;
        delete cond.ImageScreenArea;
        // For default "Image" source, remove the ImageSource property entirely
        if (src === "Image") {
            delete cond.ImageSource;
        }
    }
    // Clean up any undefined properties that may have been set
    Object.keys(cond).forEach((k) => {
        if (cond[k] === undefined)
            delete cond[k];
    });
    return cond;
}
/**
 * Renders the ImageScreenArea XML for OCR conditions that use screen-based image sources.
 *
 * This function generates the XML representation of a screen area definition specifically
 * for OCR conditions. It uses the shared `screenAreaToXml` utility and formats the output
 * with proper indentation for inclusion in Keyboard Maestro XML.
 *
 * The ImageScreenArea defines the region of the screen where OCR text detection should occur.
 * This is particularly useful for limiting OCR processing to specific areas of the screen
 * for better performance and accuracy.
 *
 * @param value - The screen area definition object
 * @param value.type - The type of screen area ("ScreenAll", "ScreenMain", "ScreenWithMouse", etc.)
 * @param value.frame - Optional frame coordinates for custom screen areas
 * @param value.screen - Optional screen identifier for multi-monitor setups
 *
 * @returns Array of XML strings representing the ImageScreenArea, properly indented for inclusion in conditions
 *
 * @example
 * ```typescript
 * // Full screen OCR area
 * const fullScreen = { type: "ScreenAll" };
 * const xml = renderOCRImageScreenAreaXml(fullScreen);
 * // Returns:
 * // [
 * //   "\t<key>ImageScreenArea</key>",
 * //   "\t<dict>",
 * //   "\t\t<key>Type</key>",
 * //   "\t\t<string>ScreenAll</string>",
 * //   "\t</dict>"
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Custom screen area with specific coordinates
 * const customArea = {
 *   type: "ScreenCustom",
 *   frame: { x: 100, y: 100, width: 500, height: 300 }
 * };
 * const xml = renderOCRImageScreenAreaXml(customArea);
 * // Returns properly formatted XML for the custom screen area
 * ```
 *
 * @example
 * ```typescript
 * // Main screen only (useful for multi-monitor setups)
 * const mainScreen = { type: "ScreenMain" };
 * const xml = renderOCRImageScreenAreaXml(mainScreen);
 * // Returns XML targeting only the main display
 * ```
 *
 * @see {@link screenAreaToXml} - The underlying utility function for screen area XML generation
 */
function renderOCRImageScreenAreaXml(value) {
    // Use shared renderer for correct key mapping and consistent XML structure
    const xml = screenAreaToXml("ImageScreenArea", value);
    // Split into lines, remove empty lines, and add proper indentation
    return xml
        .split("\n")
        .filter(Boolean) // Remove empty lines
        .map((l) => "\t" + l); // Add one level of indentation for condition context
}

//FILE: src/utils/template.xml.condition.pixel.ts
/**
 * Normalizes a PixelCondition to ensure only valid combinations of PixelConditionType and PixelConditionTypeGood are serialized.
 * - Ensures types are not identical.
 * - Ensures mutually exclusive pairs are not generated.
 * - Optionally corrects or skips invalid combinations.
 */
function normalisePixelCondition(raw) {
    if (raw.ConditionType !== "Pixel")
        return { ...raw };
    const PAIRS = {
        Is: "IsNot",
        IsNot: "IsBrighter",
        IsBrighter: "IsDarker",
        IsDarker: "IsMoreRed",
        IsMoreRed: "IsLessRed",
        IsLessRed: "IsMoreGreen",
        IsMoreGreen: "IsLessGreen",
        IsLessGreen: "IsMoreBlue",
        IsMoreBlue: "IsLessBlueIsNot",
        IsLessBlue: "IsLessBlue", // self-pair
    };
    const validBad = new Set(Object.values(PAIRS));
    const validGood = new Set(Object.keys(PAIRS));
    let { PixelConditionType: bad, PixelConditionTypeGood: good, ...rest } = raw;
    // 1) Fallback to known good values if either side is illegal
    if (!validBad.has(bad))
        bad = "IsNot";
    if (!validGood.has(good))
        good = "Is";
    // 2) Realign mismatched pairs
    if (PAIRS[good] !== bad)
        bad = PAIRS[good];
    return {
        ...rest,
        ConditionType: "Pixel",
        PixelConditionType: bad,
        PixelConditionTypeGood: good,
    };
}

//FILE: src/utils/template.xml.condition.ts
/**
 * Converts a single KMCondition object into its XML representation.
 * @param condition - The condition object to serialize.
 * @returns An XML string for the condition dictionary.
 */
function conditionToXml(condition) {
    // If the condition is FoundImageCondition (actually 'ScreenImage' in KM)
    if (condition.ConditionType === "ScreenImage") {
        // Normalize it first
        condition = normaliseFoundImage(condition);
    }
    // If the condition is OCRCondition, normalize it
    if (condition.ConditionType === "OCR") {
        condition = normaliseOCRCondition(condition);
    }
    // If the condition is FrontWindow or AnyWindow, normalize it for window conditions
    if (condition.ConditionType === "FrontWindow" ||
        condition.ConditionType === "AnyWindow") {
        condition = normaliseWindowCondition(condition);
    }
    // If the condition is PixelCondition, normalize it for valid type pairs
    if (condition.ConditionType === "Pixel") {
        condition = normalisePixelCondition(condition);
    }
    // If the condition is ScriptCondition, normalize it
    if (condition.ConditionType === "Script") {
        condition = normaliseScriptCondition(condition);
    }
    const lines = ["<dict>"];
    const orderedKeys = kmKeyOrder(Object.keys(condition), "condition");
    for (const key of orderedKeys) {
        const value = condition[key];
        if (value === undefined || value === null)
            continue;
        // Special handling for ImageScreenArea in OCRCondition
        if (condition.ConditionType === "OCR" &&
            key === "ImageScreenArea" &&
            typeof value === "object" &&
            "type" in value) {
            renderOCRImageScreenAreaXml(value).forEach((l) => lines.push(l));
            continue;
        }
        // --- Special handling for ScreenArea / ImageScreenArea in ScreenImage conditions ---
        if (condition.ConditionType === "ScreenImage" &&
            (key === "ScreenArea" || key === "ImageScreenArea") &&
            typeof value === "object" &&
            "type" in value) {
            // Re-use existing renderer so ordering for complex variants matches KM.
            const xml = screenAreaToXml(key, value);
            xml
                .split("\n")
                .filter(Boolean)
                .forEach((l) => lines.push("\t" + l));
            continue;
        }
        // Special handling for MouseButtonCondition.Pressed
        if (condition.ConditionType === "MouseButton" && key === "Pressed") {
            // Only serialize if false; KM omits if true
            if (value === false) {
                lines.push(`\t<key>Pressed</key>`);
                lines.push(`\t<false/>`);
            }
            continue;
        }
        // Generic rendering
        lines.push(`\t<key>${key}</key>`);
        if (typeof value === "string") {
            // KM uses a self-closing form for empty strings
            lines.push(value === "" ? "\t<string/>" : `\t<string>${value}</string>`);
        }
        else if (typeof value === "number") {
            lines.push(`\t<integer>${value}</integer>`);
        }
        else if (typeof value === "boolean") {
            lines.push(`\t${value ? "<true/>" : "<false/>"}`);
        }
        else if (Array.isArray(value)) {
            lines.push("\t<array>");
            value.forEach((item) => lines.push(`\t\t<string>${item}</string>`));
            lines.push("\t</array>");
        }
        else if (typeof value === "object") {
            // For nested dicts (Application, ScreenArea…) use canonical ordering
            lines.push("\t<dict>");
            const nestedKeys = kmKeyOrder(Object.keys(value), key === "Application" ? "application" : undefined);
            for (const subKey of nestedKeys) {
                const subValue = value[subKey];
                if (subValue === undefined || subValue === null)
                    continue;
                lines.push(`\t\t<key>${subKey}</key>`);
                lines.push(typeof subValue === "string" && subValue === ""
                    ? "\t\t<string/>"
                    : `\t\t<string>${subValue}</string>`);
            }
            lines.push("\t</dict>");
        }
    }
    lines.push("</dict>");
    return lines.join("\n");
}

//FILE: src/virtual_actions/kmjs.virtualAction.if.ts
/**
 * Creates a virtual "If/Then/Else" action for Keyboard Maestro.
 * This is one of the most powerful and complex actions, allowing for conditional logic flows.
 *
 * @param opts - The configuration for the If/Then/Else block.
 * @returns A VirtualAction object that can be executed in a macro.
 *
 * @example
 * // If the front window of Finder is named "Downloads", activate Chrome.
 * createVirtualIf({
 *   match: 'All',
 *   conditions: [
 *     {
 *       ConditionType: 'FrontWindow',
 *       IsFrontApplication: false,
 *       FrontWindowConditionType: 'TitleIs',
 *       FrontWindowTitle: 'Downloads',
 *       Application: {
 *         BundleIdentifier: 'com.apple.finder',
 *         Name: 'Finder'
 *       }
 *     }
 *   ],
 *   then: [
 *     createVirtualActivate({
 *       target: 'Specific',
 *       specific: { BundleIdentifier: 'com.google.Chrome', Name: 'Google Chrome' }
 *     })
 *   ],
 *   else: [
 *     createVirtualNotification({ title: 'Condition Not Met', body: 'The front window was not "Downloads".' })
 *   ]
 * });
 */
function createVirtualIf(opts) {
    const { conditions, match = "All", then, else: elseActions = [], timeoutAborts = true, } = opts;
    // Generate XML for nested actions
    const thenXml = then.map((a) => a.toXml()).join("\n");
    const elseXml = elseActions.map((a) => a.toXml()).join("\n");
    // Generate XML for conditions array
    const conditionsArray = conditions.length > 0
        ? conditions
            .map(conditionToXml)
            .map((xml) => xml
            .split("\n")
            .map((line) => "\t\t\t" + line)
            .join("\n"))
            .join("\n")
        : "";
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>ActionUID</key>",
        `\t\t<integer>${Math.floor(Date.now() / 1000)}</integer>`,
        "\t\t<key>Conditions</key>",
        "\t\t<dict>",
        "\t\t\t<key>ConditionList</key>",
        conditionsArray ? "\t\t\t<array>" : "\t\t\t<array/>",
        ...(conditionsArray ? [conditionsArray, "\t\t\t</array>"] : []),
        "\t\t\t<key>ConditionListMatch</key>",
        `\t\t\t<string>${match}</string>`,
        "\t\t</dict>",
        "\t\t<key>ElseActions</key>",
        elseXml ? "\t\t<array>" : "\t\t<array/>",
        ...(elseXml
            ? [
                elseXml
                    .split("\n")
                    .map((line) => "\t\t\t" + line)
                    .join("\n"),
                "\t\t</array>",
            ]
            : []),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>IfThenElse</string>",
        "\t\t<key>ThenActions</key>",
        thenXml ? "\t\t<array>" : "\t\t<array/>",
        ...(thenXml
            ? [
                thenXml
                    .split("\n")
                    .map((line) => "\t\t\t" + line)
                    .join("\n"),
                "\t\t</array>",
            ]
            : []),
        "\t\t<key>TimeOutAbortsMacro</key>",
        `\t\t${timeoutAborts ? "<true/>" : "<false/>"}`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/utils/template.xml.application.ts
/**
 * Generates the XML for an Application key-value pair used in KM actions.
 * This is shared between Quit, ManipulateWindow, and other actions that target applications.
 *
 * @param target - Whether to target the front app or a specific one
 * @param specific - If targeting a specific app, provide identification options
 * @returns Array of XML lines for the Application section
 */
function generateApplicationXml(target = "Front", specific = {}) {
    if (target === "Specific") {
        const { name, bundleIdentifier, path, match, newFile } = specific;
        // Create object and use canonical ordering
        const appData = {};
        if (bundleIdentifier)
            appData.BundleIdentifier = bundleIdentifier;
        if (match)
            appData.Match = match;
        if (name)
            appData.Name = name;
        if (newFile)
            appData.NewFile = newFile;
        if (path)
            appData.Path = path;
        const orderedKeys = kmKeyOrder(Object.keys(appData), "application");
        return [
            "<dict>",
            ...orderedKeys.flatMap((key) => [
                `<key>${key}</key>`,
                `<string>${escapeForXml(appData[key])}</string>`,
            ]),
            "</dict>",
        ];
    }
    else {
        // Frontmost app: empty dict
        return ["<dict/>"];
    }
}
/**
 * Gets the default expressions for MoveAndResize presets.
 * Returns [horizontal, vertical, width, height] expressions.
 */
function getMoveAndResizeDefaults(preset) {
    switch (preset) {
        case "Custom":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)",
                "SCREENVISIBLE(Main,Height)",
            ];
        case "FullScreen":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)",
                "SCREENVISIBLE(Main,Height)",
            ];
        case "LeftColumn":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)*50%",
                "SCREENVISIBLE(Main,Height)",
            ];
        case "RightColumn":
            return [
                "SCREENVISIBLE(Main,MidX)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)*50%",
                "SCREENVISIBLE(Main,Height)",
            ];
        case "TopHalf":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)",
                "SCREENVISIBLE(Main,Height)*50%",
            ];
        case "BottomHalf":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,MidY)",
                "SCREENVISIBLE(Main,Width)",
                "SCREENVISIBLE(Main,Height)*50%",
            ];
        case "TopLeft":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)*50%",
                "SCREENVISIBLE(Main,Height)*50%",
            ];
        case "TopRight":
            return [
                "SCREENVISIBLE(Main,MidX)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)*50%",
                "SCREENVISIBLE(Main,Height)*50%",
            ];
        case "BottomLeft":
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,MidY)",
                "SCREENVISIBLE(Main,Width)*50%",
                "SCREENVISIBLE(Main,Height)*50%",
            ];
        case "BottomRight":
            return [
                "SCREENVISIBLE(Main,MidX)",
                "SCREENVISIBLE(Main,MidY)",
                "SCREENVISIBLE(Main,Width)*50%",
                "SCREENVISIBLE(Main,Height)*50%",
            ];
        default:
            return [
                "SCREENVISIBLE(Main,Left)",
                "SCREENVISIBLE(Main,Top)",
                "SCREENVISIBLE(Main,Width)",
                "SCREENVISIBLE(Main,Height)",
            ];
    }
}

//FILE: src/virtual_actions/kmjs.virtualAction.manipulateWindow.ts
/**
 * Constructs a VirtualAction that manipulates windows in Keyboard Maestro.
 * This function generates the correct XML fragment for the Manipulate Window action,
 * supporting all permutations of window manipulation, targeting, and application options.
 *
 * The function is highly modular: each XML sub-block is generated by a dedicated helper,
 * making the final XML structure easy to read and maintain.
 *
 * @param opts - ManipulateWindowOptions specifying the manipulation type, window/app targeting, and parameters.
 * @returns A VirtualAction object with a toXml() method for rendering the KM XML.
 */
function createVirtualManipulateWindow(opts = {}) {
    const { manipulation = "CenterWindow", values = ["0", "0"], moveAndResizePreset = "Custom", customValues, windowTarget = "FrontWindow", windowIdentifier = "", windowIndex = 1, applicationTarget = "Front", specificApplication = {}, stopOnFailure, notifyOnFailure, } = opts;
    // Use the manipulation value directly (now matches KM action string)
    const actionName = manipulation;
    // --- Compute all expression values up front ---
    let horizontal = values[0], vertical = values[1], width = values[0], height = values[1];
    if ([
        "ResizeBy",
        "ResizeTo",
        "ResizeWindowByPercent",
        "ScaleBy",
        "MoveBy",
        "MoveTo",
        "MoveWindowBy",
        "MoveWindowTo",
        "MoveAndResize",
        "Center",
        "CenterAt",
        "Close",
        "Zoom",
        "Minimize",
        "ReallyMinimizeWindow",
        "Unminimize",
        "ToggleMinimize",
        "BringToFront",
        "SelectWindow",
    ].includes(actionName)) {
        if (manipulation === "MoveAndResize") {
            let expressions;
            if (customValues && customValues.length === 4) {
                // 4-element array: full control over horizontal, vertical, width, height
                expressions = [
                    customValues[0], // horizontal
                    customValues[1], // vertical
                    customValues[2], // width
                    customValues[3], // height
                ];
            }
            else {
                // Use preset defaults
                expressions = getMoveAndResizeDefaults(moveAndResizePreset);
            }
            horizontal = expressions[0];
            vertical = expressions[1];
            width = expressions[2];
            height = expressions[3];
        }
        else if (manipulation === "CenterWindowAt" &&
            customValues &&
            customValues.length >= 3) {
            // CenterAt uses 3-element array: [x, y, z] where z might be radius or size
            horizontal = customValues[0]; // x position
            vertical = customValues[1]; // y position
            width = customValues[2]; // size or radius
            height = customValues[2]; // same as width for center operations
        }
        else if (customValues && customValues.length >= 2) {
            horizontal = customValues[0];
            vertical = customValues[1];
        }
    }
    // TargetApplication block: present for all except KMWindowID/KMLastWindow
    let targetAppXml = [];
    if (windowTarget !== "KMWindowID" && windowTarget !== "KMLastWindow") {
        if (applicationTarget === "Specific") {
            targetAppXml = [
                "\t\t<key>TargetApplication</key>",
                ...generateApplicationXml(applicationTarget, specificApplication).map((line) => "\t\t" + line),
            ];
        }
        else {
            targetAppXml = ["\t\t<key>TargetApplication</key>", "\t\t<dict/>"];
        }
    }
    // Build XML as an array of lines, not a joined string
    const xmlLines = [
        "\t<dict>",
        // Action
        "\t\t<key>Action</key>",
        `\t\t<string>${actionName}</string>`,
        // ActionUID (use generateActionUIDXml for block)
        ...generateActionUIDXml().map((l) => "\t\t" + l.trim()),
        // HeightExpression
        "\t\t<key>HeightExpression</key>",
        `\t\t<string>${escapeForXml(height)}</string>`,
        // HorizontalExpression
        "\t\t<key>HorizontalExpression</key>",
        `\t\t<string>${escapeForXml(horizontal)}</string>`,
        // MacroActionType
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>ManipulateWindow</string>",
        // Add failure handling options (right after MacroActionType, matching ground truth)
        ...(notifyOnFailure !== undefined
            ? renderNotifyOnFailureXml(notifyOnFailure)
            : []),
        ...(stopOnFailure !== undefined
            ? renderStopOnFailureXml(stopOnFailure)
            : []),
        // TargetApplication (present for all except KMWindowID/KMLastWindow)
        ...targetAppXml,
        // Targeting
        "\t\t<key>Targeting</key>",
        `\t\t<string>${windowTarget}</string>`,
        // TargetingType (only for non-KMWindowID/KMLastWindow)
        ...(windowTarget !== "KMWindowID" && windowTarget !== "KMLastWindow"
            ? [
                "\t\t<key>TargetingType</key>",
                `\t\t<string>${applicationTarget}</string>`,
            ]
            : []),
        // VerticalExpression
        "\t\t<key>VerticalExpression</key>",
        `\t\t<string>${escapeForXml(vertical)}</string>`,
        // WidthExpression
        "\t\t<key>WidthExpression</key>",
        `\t\t<string>${escapeForXml(width)}</string>`,
        // --- Window-specific keys in correct order ---
        ...(windowTarget === "KMWindowID"
            ? [
                "\t\t<key>WindowID</key>",
                `\t\t<string>${escapeForXml(windowIdentifier)}</string>`,
                "\t\t<key>WindowIndexExpression</key>",
                `\t\t<string></string>`,
                "\t\t<key>WindowName</key>",
                `\t\t<string></string>`,
            ]
            : windowTarget === "WindowIndex"
                ? [
                    "\t\t<key>WindowIndexExpression</key>",
                    `\t\t<string>${windowIndex}</string>`,
                    "\t\t<key>WindowName</key>",
                    `\t\t<string></string>`,
                ]
                : windowTarget === "NamedWindow" ||
                    windowTarget === "WindowNameContaining" ||
                    windowTarget === "WindowNameMatching"
                    ? [
                        "\t\t<key>WindowIndexExpression</key>",
                        `\t\t<string></string>`,
                        "\t\t<key>WindowName</key>",
                        `\t\t<string>${escapeForXml(windowIdentifier)}</string>`,
                    ]
                    : [
                        // Default: FrontWindow, KMLastWindow, etc.
                        "\t\t<key>WindowIndexExpression</key>",
                        `\t\t<string>2</string>`,
                        "\t\t<key>WindowName</key>",
                        `\t\t<string></string>`,
                    ]),
        "\t</dict>",
    ];
    /**
     * Renders the fully-formed Keyboard Maestro XML for this ManipulateWindow action.
     * @returns {string} The formatted XML string.
     */
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.pause.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Pause action.
 * @param opts - PauseOptions to configure the duration and unit.
 * @returns A VirtualAction emitting the correct KM XML when `toXml()` is called.
 */
function createVirtualPause(opts = {}) {
    console.log(chalk.cyan(`[VirtualAction] Pause:`), chalk.grey(JSON.stringify(opts)));
    // Determine if `time` was explicitly provided by the user
    const hasTime = Object.prototype.hasOwnProperty.call(opts, "time");
    const { time = 0.05, unit } = opts;
    if (!hasTime && unit !== undefined) {
        throw new Error("Cannot specify 'unit' without 'time'.");
    }
    const xmlLines = [
        `\t<dict>`,
        ...generateActionUIDXml(),
        `\t\t<key>MacroActionType</key>`,
        `\t\t<string>Pause</string>`,
        `\t\t<key>Time</key>`,
        `\t\t<string>${time}</string>`,
        `\t\t<key>TimeOutAbortsMacro</key>`,
        `\t\t<true/>`,
        // Only include Unit if provided and not seconds (seconds is default and has no XML key)
        unit && unit !== "Seconds" ? `\t\t<key>Unit</key>` : ``,
        unit && unit !== "Seconds" ? `\t\t<string>${unit}</string>` : ``,
        `\t</dict>`,
    ].filter(Boolean);
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.quit.ts
/**
 * Constructs a VirtualAction that quits or (optionally) relaunches applications.
 */
function createVirtualQuit(opts = {}) {
    const { variant = "Quit", target = "Front", specific = {}, timeoutAborts = true, } = opts;
    // Build the <dict> for the Application key with canonical ordering
    const appLines = generateApplicationXml(target, specific);
    // Assemble the full XML fragment
    const xmlLines = [
        "\t<dict>",
        // KM ordering for QuitSpecificApp puts Action BEFORE ActionUID.
        "\t\t<key>Action</key>",
        `\t\t<string>${variant}</string>`,
        ...generateActionUIDXml(),
        "\t\t<key>Application</key>",
        ...appLines.map((line) => `\t\t${line}`),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>QuitSpecificApp</string>",
        "\t\t<key>Target</key>",
        `\t\t<string>${target}</string>`,
        "\t\t<key>TimeOutAbortsMacro</key>",
        timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/utils/template.xml.text.ts
/**
 * Renders XML key/value pairs for an action that has a “Text” style source
 * with an optional TextProcessingMode flag.  When `mode` is undefined we omit
 * the key (which Keyboard Maestro treats as “Process Text Normally”).
 *
 * @param text Raw text content (may be empty string).
 * @param mode Optional processing mode.
 */
function renderTextWithProcessingMode(text, mode) {
    const out = [];
    out.push("\t\t<key>Text</key>");
    out.push(text === "" ? "\t\t<string/>" : `\t\t<string>${text}</string>`);
    if (mode) {
        out.push("\t\t<key>TextProcessingMode</key>");
        out.push(`\t\t<string>${mode}</string>`);
    }
    return out;
}

//FILE: src/virtual_actions/kmjs.virtualAction.switchCase.ts
/* -------------------------------------------------------------------------- */
/*  Implementation                                                            */
/* -------------------------------------------------------------------------- */
function createVirtualSwitchCase(opts) {
    const { source, variable, text = "", textProcessingMode, calculation = "", environmentVariable = "", path = "", namedClipboard, cases, } = opts;
    if (!cases || cases.length === 0) {
        throw new Error("SwitchCase requires at least one case entry.");
    }
    // Serialise case entries
    const caseXml = cases
        .map((c) => {
        var _a, _b;
        const actionsXml = ((_a = c.actions) !== null && _a !== void 0 ? _a : [])
            .map((a) => a
            .toXml()
            .split("\n")
            .map((line) => "\t\t\t\t\t" + line)
            .join("\n"))
            .join("\n");
        const actionsSection = c.actions && c.actions.length
            ? ["\t\t\t\t<array>", actionsXml, "\t\t\t\t</array>"].join("\n")
            : "\t\t\t\t<array/>";
        // KM always serialises TestValue; use empty string if undefined
        const testValue = (_b = c.testValue) !== null && _b !== void 0 ? _b : "";
        return [
            "\t\t\t<dict>",
            "\t\t\t\t<key>Actions</key>",
            actionsSection,
            "\t\t\t\t<key>ConditionType</key>",
            `\t\t\t\t<string>${c.operator}</string>`,
            "\t\t\t\t<key>TestValue</key>",
            testValue === ""
                ? "\t\t\t\t<string/>"
                : `\t\t\t\t<string>${testValue}</string>`,
            "\t\t\t</dict>",
        ].join("\n");
    })
        .join("\n");
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>ActionUID</key>",
        `\t\t<integer>${Math.floor(Date.now() / 1000)}</integer>`,
        // For Calculation sources KM serialises the <Calculation> key *before* CaseEntries.
        ...(source === "Calculation"
            ? [
                "\t\t<key>Calculation</key>",
                calculation ? `\t\t<string>${calculation}</string>` : "\t\t<string/>",
            ]
            : []),
        "\t\t<key>CaseEntries</key>",
        cases.length ? "\t\t<array>" : "\t\t<array/>",
        ...(cases.length ? [caseXml, "\t\t</array>"] : []),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>Switch</string>",
        // For File sources KM places <Path> *before* <Source>
        ...(source === "File"
            ? [
                "\t\t<key>Path</key>",
                path === "" ? "\t\t<string/>" : `\t\t<string>${path}</string>`,
            ]
            : []),
        "\t\t<key>Source</key>",
        `\t\t<string>${source}</string>`,
        // Source-specific keys
        ...(source === "Variable"
            ? [
                "\t\t<key>Variable</key>",
                variable && variable !== ""
                    ? `\t\t<string>${variable}</string>`
                    : "\t\t<string/>",
            ]
            : source === "Text"
                ? renderTextWithProcessingMode(text, textProcessingMode)
                : source === "EnvironmentVariable"
                    ? [
                        "\t\t<key>Text</key>",
                        environmentVariable === ""
                            ? "\t\t<string/>"
                            : `\t\t<string>${environmentVariable}</string>`,
                    ]
                    : source === "NamedClipboard" && namedClipboard
                        ? [
                            "\t\t<key>ClipboardSourceNamedClipboardUID</key>",
                            `\t\t<string>${namedClipboard.uid}</string>`,
                            "\t\t<key>ClipboardSourceNamedClipboardRedundantDisplayName</key>",
                            `\t\t<string>${namedClipboard.redundantDisplayName}</string>`,
                        ]
                        : []),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.typeKeystroke.ts
/**
 * Constructs a VirtualAction for simulating keystrokes in Keyboard Maestro.
 */
function createVirtualTypeKeystroke(opts) {
    console.log(chalk.cyan("[VirtualAction] TypeKeystroke:"), chalk.grey(JSON.stringify(opts)));
    const { keystroke, pressAndHold = false, pressAndRepeat = false, holdTime, } = opts;
    // Validate incompatible options
    if (pressAndRepeat && (pressAndHold || holdTime !== undefined)) {
        throw new Error("pressAndRepeat cannot be combined with pressAndHold or holdTime");
    }
    // Determine if we should use hold flow
    const useHold = holdTime !== undefined ? true : pressAndHold;
    // Normalize the keystroke into an AppleScript mask→key map
    const shortcutMap = normalizeAppleScriptShortcut(keystroke);
    const [[modifiers, keyCode]] = Object.entries(shortcutMap).map(([mask, key]) => [Number(mask), key]);
    // Validate that we have a valid key code (not null for modifier-only)
    if (keyCode === null) {
        throw new Error(`TypeKeystroke action requires a key, but received modifier-only keystroke: ${JSON.stringify(keystroke)}. ` +
            `Modifier-only keystrokes (like "Cmd" or "Shift") cannot be used with typeKeystroke actions.`);
    }
    // Helper to build a simulate keystroke action dict
    const buildSimulate = (pressType) => {
        const xmlLines = [
            `\t<dict>`,
            ...generateActionUIDXml(),
            `\t\t<key>KeyCode</key>`,
            `\t\t<integer>${keyCode}</integer>`,
            `\t\t<key>MacroActionType</key>`,
            `\t\t<string>SimulateKeystroke</string>`,
            `\t\t<key>Modifiers</key>`,
            `\t\t<integer>${modifiers}</integer>`,
            pressType ? `\t\t<key>Press</key>` : ``,
            pressType ? `\t\t<string>${pressType}</string>` : ``,
            `\t\t<key>ReleaseAll</key>`,
            `\t\t<false/>`,
            `\t\t<key>TargetApplication</key>`,
            `\t\t<dict/>`,
            `\t\t<key>TargetingType</key>`,
            `\t\t<string>Front</string>`,
            `\t</dict>`,
        ]
            .filter(Boolean)
            .join("\n");
        return { toXml: () => formatXmlAction(xmlLines) };
    };
    // Flow 3: press and hold (with optional pause)
    if (useHold) {
        const pressAction = buildSimulate("PressAndHold");
        const pauseOpts = holdTime !== undefined ? { time: holdTime } : {};
        const pauseAction = createVirtualPause(pauseOpts);
        const releaseAction = buildSimulate("Release");
        const fragments = [
            pressAction,
            pauseAction,
            releaseAction,
        ];
        return { toXml: () => fragments.map((a) => a.toXml().trim()).join("\n") };
    }
    // Flow 2: press and repeat
    if (pressAndRepeat) {
        return buildSimulate("PressAndRepeat");
    }
    // Flow 1: default single keystroke
    return buildSimulate();
}

//FILE: src/virtual_actions/kmjs.virtualAction.setVariable.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Set Variable action.
 * @param opts - SetVariableOptions for variable name, value, processing, where, preset, and scope.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic usage
 * createVirtualSetVariable({ variable: "MyVar", text: "Hello" })
 * createVirtualSetVariable({ variable: "MyVar", text: "Hello", scope: "local" })
 *
 * @example
 * // KM GUI suggested presets
 * createVirtualSetVariable({ variable: "MyVar", presetMode: "delete" })
 * createVirtualSetVariable({ variable: "MyVar", presetMode: "positionCursor" })
 *
 * @example
 * // Token presets
 * createVirtualSetVariable({ variable: "UUID", presetMode: "ARandomUniqueID" })
 * createVirtualSetVariable({ variable: "AppName", presetMode: "FrontApplicationName" })
 * createVirtualSetVariable({ variable: "MousePos", presetMode: "CurrentMouseLocation" })
 */
function createVirtualSetVariable(opts) {
    const { variable, text = "", processingMode, where, presetMode, scope = "global", } = opts;
    // Handle preset modes
    let finalText = text;
    if (presetMode === "delete") {
        finalText = "%Delete%";
    }
    else if (presetMode === "positionCursor") {
        finalText = "%|%";
    }
    else if (presetMode && presetMode in KM_TOKENS) {
        // Use token from KM_TOKENS
        finalText = KM_TOKENS[presetMode];
    }
    // Apply variable scope prefix if needed
    let scopedVariable = variable;
    if (scope === "local")
        scopedVariable = `LOCAL${variable}`;
    else if (scope === "instance")
        scopedVariable = `INSTANCE${variable}`;
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>SetVariableToText</string>",
        ...renderSetVariableProcessingModeXml(processingMode),
        "\t\t<key>Text</key>",
        `\t\t<string>${escapeForXml(finalText)}</string>`,
        "\t\t<key>Variable</key>",
        `\t\t<string>${escapeForXml(scopedVariable)}</string>`,
        ...renderSetVariableWhereXml(where),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.setVariableToCalculation.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro SetVariableToCalculation action.
 *
 * @param opts - SetVariableToCalculationOptions for variable, calculation, and formatting.
 * @returns A VirtualAction that emits the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualSetVariableToCalculation({ variable: "Result", text: "1+2" })
 * createVirtualSetVariableToCalculation({ variable: "Result", text: "1+2", format: "0.00" })
 */
function createVirtualSetVariableToCalculation(opts) {
    const { variable, text, format, stopOnFailure, notifyOnFailure } = opts;
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        ...(format
            ? [
                "\t\t<key>Format</key>",
                `\t\t<string>${escapeForXml(format)}</string>`,
            ]
            : []),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>SetVariableToCalculation</string>",
        ...(notifyOnFailure === false ? renderNotifyOnFailureXml(false) : []),
        ...(stopOnFailure === false ? renderStopOnFailureXml(false) : []),
        "\t\t<key>Text</key>",
        `\t\t<string>${escapeForXml(text)}</string>`,
        "\t\t<key>UseFormat</key>",
        format ? "\t\t<true/>" : "\t\t<false/>",
        "\t\t<key>Variable</key>",
        `\t\t<string>${escapeForXml(variable)}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.retryThisLoop.ts
/**
 * RETRY THIS LOOP WRAPPER
 *
 * Provides a VirtualAction for the Keyboard Maestro 'Retry This Loop' action.
 * Internally uses Cancel with cancelType "RetryThisLoop" to jump to the top of the loop.
 *
 * @example
 * // Restart the current loop iteration
 * createVirtualRetryThisLoop();
 */
/**
 * Creates a VirtualAction to retry the current loop in Keyboard Maestro.
 *
 * Uses the generic Cancel action with cancelType "RetryThisLoop" to re-enter the loop.
 *
 * @returns A VirtualAction for the 'RetryThisLoop' variant.
 */
function createVirtualRetryThisLoop() {
    return createVirtualCancel({ cancelType: "RetryThisLoop" });
}

//FILE: src/virtual_actions/kmjs.virtualAction.continueLoop.ts
/**
 * CONTINUE LOOP WRAPPER
 *
 * Provides a VirtualAction for the Keyboard Maestro 'Continue Loop' action.
 * This is a specialized variant of the generic Cancel action, using cancelType "ContinueLoop".
 *
 * Inline documentation clarifies that loop control is implemented via Cancel under the hood.
 */
/**
 * Creates a VirtualAction to continue the current loop in Keyboard Maestro.
 *
 * Under the hood, this wraps the generic Cancel action with cancelType "ContinueLoop".
 *
 * @example
 * // Continue execution of the enclosing loop
 * createVirtualContinueLoop();
 *
 * @returns A VirtualAction for the 'ContinueLoop' cancel variant.
 */
function createVirtualContinueLoop() {
    return createVirtualCancel({ cancelType: "ContinueLoop" });
}

//FILE: src/virtual_actions/kmjs.virtualAction.breakFromLoop.ts
/**
 * BREAK FROM LOOP WRAPPER
 *
 * Provides a VirtualAction for the Keyboard Maestro 'Break From Loop' action.
 * Internally implemented via the generic Cancel action with cancelType "BreakFromLoop".
 *
 * Use this to exit the nearest enclosing loop immediately.
 *
 * @example
 * // Exit the current loop
 * createVirtualBreakFromLoop();
 */
/**
 * Creates a VirtualAction to break out of the current loop in Keyboard Maestro.
 *
 * Wraps the generic Cancel action with cancelType "BreakFromLoop".
 *
 * @returns A VirtualAction for the 'BreakFromLoop' variant.
 */
function createVirtualBreakFromLoop() {
    return createVirtualCancel({ cancelType: "BreakFromLoop" });
}

//FILE: src/virtual_actions/kmjs.virtualAction.moveAndClick.ts
/**
 * Creates a Keyboard Maestro virtual action that moves and clicks the mouse at a specified position.
 * This is a wrapper around createVirtualClickAtFoundImage, with image search options omitted and defaults set to match KM's MoveAndClick action.
 *
 * ## Mouse Movement and Dragging Guide
 *
 * This function is your primary tool for mouse automation. It can:
 * - Move the mouse cursor without clicking (clickKind: "Move")
 * - Click at specific coordinates
 * - Drag elements from one location to another
 * - Perform complex multi-step drag operations
 *
 * ### Key Concepts:
 *
 * **Coordinate Systems (`relative` parameter):**
 * - `"Screen"` - Absolute screen coordinates (0,0 = top-left of main screen)
 * - `"Window"` - Relative to the front window (0,0 = top-left of window content)
 * - `"Mouse"` - Relative to current mouse position (0,0 = current mouse location)
 * - `"Absolute"` - Same as Screen but uses different internal handling
 *
 * **Drag Operations (`mouseDrag` parameter):**
 * - `"None"` - Just move/click, no dragging
 * - `"Absolute"` - Drag from current position to absolute coordinates (dragTargetX, dragTargetY)
 * - `"Relative"` - Drag by a relative offset (dragTargetX/Y are offsets from start position)
 * - `"To"` - Drag to specific coordinates
 * - `"From"` - Start drag from specific coordinates
 *
 * @param opts - Options for the move and click action
 * @param opts.clickKind - Type of click: "Click", "DoubleClick", "RightClick", "Move", "Release" (default: "Click")
 * @param opts.button - Mouse button: "Left", "Right", or "Middle" (default: "Left")
 * @param opts.clickModifiers - Modifier keys (string, number, or record; default: 0)
 * @param opts.horizontal - X coordinate (default: 0)
 * @param opts.vertical - Y coordinate (default: 0)
 * @param opts.relative - Coordinate reference system: "Window", "Screen", "Mouse", or "Absolute" (default: "Window")
 * @param opts.relativeCorner - Corner for relative positioning: "TopLeft", etc. (default: "TopLeft")
 * @param opts.mouseDrag - Mouse drag operation: "None", "Absolute", "Relative", "To", "From" (default: "None")
 * @param opts.dragTargetX - Drag target X coordinate (default: 0)
 * @param opts.dragTargetY - Drag target Y coordinate (default: 0)
 * @param opts.restoreMouseLocation - Restore mouse position after click (default: false)
 *
 * @example
 * // Basic clicking at screen coordinates
 * createVirtualMoveAndClick({ horizontal: 100, vertical: 200, relative: "Screen" })
 *
 * // Just move the mouse cursor without clicking
 * createVirtualMoveAndClick({
 *   horizontal: 300,
 *   vertical: 400,
 *   relative: "Screen",
 *   clickKind: "Move"
 * })
 *
 * // Drag an element from one screen location to another (absolute drag)
 * createVirtualMoveAndClick({
 *   horizontal: 100,        // Start position X
 *   vertical: 100,          // Start position Y
 *   relative: "Screen",
 *   mouseDrag: "Absolute",  // Drag to absolute coordinates
 *   dragTargetX: 300,       // End position X
 *   dragTargetY: 400,       // End position Y
 *   clickKind: "Click"
 * })
 *
 * // Drag by a relative offset (move 200px right, 100px down from start)
 * createVirtualMoveAndClick({
 *   horizontal: 150,
 *   vertical: 150,
 *   relative: "Screen",
 *   mouseDrag: "Relative",  // Drag by offset
 *   dragTargetX: 200,       // Move 200px right
 *   dragTargetY: 100,       // Move 100px down
 *   clickKind: "Click"
 * })
 *
 * // Resize a window by dragging its bottom-right corner
 * createVirtualMoveAndClick({
 *   horizontal: 692,        // Position at window corner
 *   vertical: 631,
 *   relative: "Screen",
 *   mouseDrag: "Relative",  // Drag by offset
 *   dragTargetX: 50,        // Expand 50px wider
 *   dragTargetY: 30,        // Expand 30px taller
 *   clickKind: "Click"
 * })
 *
 * // Multi-step drag operation: First move to position, then drag
 * // Step 1: Move to starting position
 * createVirtualMoveAndClick({
 *   horizontal: 681,
 *   vertical: 622,
 *   relative: "Screen",
 *   clickKind: "Move"       // Just move, don't click yet
 * })
 * // Step 2: Drag from current position
 * createVirtualMoveAndClick({
 *   mouseDrag: "Relative",
 *   relative: "Mouse",      // Start from current mouse position
 *   horizontal: 0,          // No additional offset
 *   vertical: 0,
 *   dragTargetX: 12,        // Drag 12px right
 *   dragTargetY: 11,        // Drag 11px down
 *   clickKind: "Click"
 * })
 *
 * @returns A VirtualAction object that can render itself as KM XML.
 */
function createVirtualMoveAndClick(opts = {}) {
    // Only allow window/screen/mouse/absolute relative, never image search
    const { clickKind = "Click", button = "Left", clickModifiers = 0, horizontal = 0, vertical = 0, relative = "Window", relativeCorner = "TopLeft", mouseDrag = "None", dragTargetX = 0, dragTargetY = 0, restoreMouseLocation = false, } = opts;
    // Call the underlying clickAtFoundImage with imageSource omitted and defaults set
    // Do NOT emit waitForImage or TimeOutAbortsMacro for MoveAndClick (window-relative)
    return createVirtualClickAtFoundImage({
        clickKind,
        button,
        clickModifiers,
        horizontal,
        vertical,
        relative,
        relativeCorner,
        mouseDrag,
        dragTargetX,
        dragTargetY,
        restoreMouseLocation,
        // Omit all image search options: imageSource, filePath, namedClipboardUUID, etc.
        // Fuzz, waitForImage, imageSelection, screenArea, imageScreenArea are not needed for MoveAndClick
        fuzz: 15,
        imageSelection: "Unique",
        // Do NOT set waitForImage or TimeOutAbortsMacro
    });
}

// FILE: src/utils/template.xml.clipboard.ts
/**
 * Type guard to check if a value is a NamedClipboardDestination object.
 * @param dest - The destination value to check
 * @returns True if dest is a NamedClipboardDestination
 */
function isNamedClipboard(dest) {
    return !!dest && typeof dest === "object" && "name" in dest;
}
/**
 * Generates the XML lines for clipboard destination options in KM actions.
 *
 * @param destination - Clipboard destination (undefined, "TriggerClipboard", or NamedClipboardDestination)
 * @returns Array of XML lines for the clipboard destination section
 *
 * - If destination is undefined, returns an empty array (SystemClipboard)
 * - If destination is "TriggerClipboard", returns the appropriate XML keys
 * - If destination is a NamedClipboardDestination, returns XML for name, UID (if present), and use flag
 */
function generateClipboardDestinationXml(destination) {
    // All lines must be indented to match the rest of the action XML (\t\t)
    if (destination === "TriggerClipboard") {
        // Use the trigger clipboard as the destination
        return ["\t\t<key>DestinationUseTriggerClipboard</key>", "\t\t<true/>"];
    }
    else if (isNamedClipboard(destination)) {
        // Use a named clipboard as the destination
        return [
            "\t\t<key>DestinationNamedClipboardRedundantDisplayName</key>",
            `\t\t<string>${destination.name}</string>`,
            // Only include UID if provided
            ...(destination.uid
                ? [
                    "\t\t<key>DestinationNamedClipboardUID</key>",
                    `\t\t<string>${destination.uid}</string>`,
                ]
                : []),
            "\t\t<key>DestinationUseNamedClipboard</key>",
            "\t\t<true/>",
        ];
    }
    // Default: SystemClipboard (no XML keys needed)
    return [];
}

//FILE: src/virtual_actions/kmjs.virtualAction.screenCapture.ts
/**
 * Creates a virtual ScreenCapture action for Keyboard Maestro.
 *
 * This function generates a VirtualAction that, when serialized to XML,
 * produces a valid Keyboard Maestro ScreenCapture action. It supports
 * specifying the screen area, clipboard destination, and error handling options.
 *
 * @param opts - ScreenCaptureOptions for customizing the action
 * @returns VirtualAction that emits the correct KM XML when toXml() is called
 */
function createVirtualScreenCapture(opts = {}) {
    const { screenArea = { type: "ScreenAll" }, destination, alwaysNominalResolution = false, stopOnFailure = false, notifyOnFailure = true, } = opts;
    // Compose the XML lines for the ScreenCapture action.
    // The clipboard destination XML is generated by the clipboard template helper.
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>AlwaysNominalResolution</key>",
        "\t\t<" + (alwaysNominalResolution ? "true" : "false") + "/>",
        ...generateClipboardDestinationXml(destination),
        "\t\t<key>IncludeShadows</key>",
        "\t\t<true/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>ScreenCapture</string>",
        ...(notifyOnFailure === false
            ? renderNotifyOnFailureXml(notifyOnFailure)
            : []),
        ...screenAreaToXml("ScreenArea", screenArea)
            .split("\n")
            .map(function (l) {
            return "\t\t" + l;
        }),
        ...(stopOnFailure === true ? renderStopOnFailureXml(stopOnFailure) : []),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.file.ts
/**
 * Creates a virtual File action for Keyboard Maestro.
 *
 * @param opts - FileActionOptions
 * @returns VirtualAction
 *
 * The UID is auto-generated. MacroActionType is always "File".
 *
 * Example XML output: (see canonical examples)
 */
function createVirtualFile(opts) {
    const { operation, source = "", destination = "", outputPath, stopOnFailure, notifyOnFailure, } = opts;
    // Operations that require only one string (destination must be empty)
    const singleStringOps = [
        "Reveal",
        "Duplicate",
        "Trash",
        "Delete",
        "RecursiveDelete",
    ];
    const destValue = singleStringOps.includes(operation)
        ? ""
        : destination || "";
    // Only include OutputPath for CreateUnique, always present (even if empty)
    const includeOutputPath = operation === "CreateUnique";
    const outputPathValue = includeOutputPath ? (outputPath !== null && outputPath !== void 0 ? outputPath : "") : undefined;
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml().map((line) => `\t\t${line}`),
        "\t\t<key>Destination</key>",
        `\t\t<string>${escapeForXml(destValue)}</string>`,
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>File</string>",
        notifyOnFailure === false
            ? `\t\t<key>NotifyOnFailure</key>\n\t\t<false/>`
            : undefined,
        "\t\t<key>Operation</key>",
        `\t\t<string>${escapeForXml(operation)}</string>`,
        includeOutputPath
            ? `\t\t<key>OutputPath</key>\n\t\t<string>${escapeForXml(outputPathValue)}</string>`
            : undefined,
        "\t\t<key>Source</key>",
        `\t\t<string>${escapeForXml(source)}</string>`,
        stopOnFailure === true
            ? `\t\t<key>StopOnFailure</key>\n\t\t<true/>`
            : undefined,
        "\t</dict>",
    ].filter(Boolean);
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.paste.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Paste action.
 * Pastes the current clipboard contents.
 *
 * @param opts - PasteActionOptions for timeout behavior configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualPaste()
 * createVirtualPaste({ notifyOnTimeout: true, timeoutAborts: false })
 */
function createVirtualPaste(opts = {}) {
    const { notifyOnTimeout = true, timeoutAborts = false } = opts;
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        "\t\t<string>Paste</string>",
        ...generateActionUIDXml(),
        "\t\t<key>IsDisclosed</key>",
        "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>CutCopyPaste</string>",
        ...renderTimeoutXml({ notifyOnTimeout, timeoutAborts }),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.setClipboardToText.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Set Clipboard to Text action.
 *
 * This action sets the clipboard content to the specified text, with support for
 * styled text, text processing options, and different clipboard destinations.
 *
 * @param opts - SetClipboardToTextOptions for text content, processing, styling, and destination.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic clipboard text setting
 * createVirtualSetClipboardToText({ text: "Hello World" })
 *
 * @example
 * // Set clipboard with styled text
 * createVirtualSetClipboardToText({
 *   text: "Styled Text",
 *   includeStyledText: true
 * })
 *
 * @example
 * // Set named clipboard with text tokens only
 * createVirtualSetClipboardToText({
 *   text: "Variable: %Variable%MyVar%",
 *   processingMode: "TextTokensOnly",
 *   destination: { name: "MyClipboard", uid: "12345" }
 * })
 *
 * @example
 * // KM GUI suggested presets
 * createVirtualSetClipboardToText({ presetMode: "delete" })
 * createVirtualSetClipboardToText({ presetMode: "positionCursor" })
 *
 * @example
 * // Token presets
 * createVirtualSetClipboardToText({ presetMode: "ARandomUniqueID" })
 * createVirtualSetClipboardToText({ presetMode: "FrontApplicationName" })
 * createVirtualSetClipboardToText({ presetMode: "CurrentMouseLocation" })
 */
function createVirtualSetClipboardToText(opts = {}) {
    const { text = "", presetMode, processingMode, includeStyledText = false, rtfContent, destination, stopOnFailure, notifyOnFailure, } = opts;
    // Handle preset modes
    let finalText = text;
    if (presetMode === "delete") {
        finalText = "%Delete%";
    }
    else if (presetMode === "positionCursor") {
        finalText = "%|%";
    }
    else if (presetMode && presetMode in KM_TOKENS) {
        // Use token from KM_TOKENS
        finalText = KM_TOKENS[presetMode];
    }
    // Build styled text data if requested
    let styledTextXml = "";
    if (includeStyledText) {
        // Generate RTF content if not provided
        let finalRtfContent = rtfContent;
        if (!finalRtfContent) {
            finalRtfContent = generateBasicRtf(text);
        }
        try {
            // Encode the RTF as base64 styled text data
            const styledTextData = encodeStyledTextData(finalRtfContent);
            const indentedData = styledTextData
                .split("\n")
                .map((line) => `\t\t${line}`)
                .join("\n");
            styledTextXml = [
                "\t\t<key>StyledText</key>",
                "\t\t<data>",
                indentedData,
                "\t\t</data>",
            ].join("\n");
            // When using custom RTF, extract the plain text from it for the Text field
            // This matches Keyboard Maestro's behavior
            if (rtfContent) {
                finalText = stripRtfToPlainText(finalRtfContent);
            }
        }
        catch (error) {
            // If styled text encoding fails, fall back to plain text
            console.warn(`[setClipboardToText] Failed to encode styled text, falling back to plain text: ${error}`);
        }
    }
    // Build clipboard destination XML
    generateClipboardDestinationXml(destination);
    // Handle special clipboard destination keys for SetClipboardToText action
    let targetClipboardXml = [];
    if (destination === "TriggerClipboard") {
        targetClipboardXml = [
            "\t\t<key>TargetUseTriggerClipboard</key>",
            "\t\t<true/>",
        ];
    }
    else if (destination &&
        typeof destination === "object" &&
        "name" in destination) {
        targetClipboardXml = [
            "\t\t<key>TargetNamedClipboardRedundantDisplayName</key>",
            `\t\t<string>${destination.name}</string>`,
            ...(destination.uid
                ? [
                    "\t\t<key>TargetNamedClipboardUID</key>",
                    `\t\t<string>${destination.uid}</string>`,
                ]
                : []),
            "\t\t<key>TargetUseNamedClipboard</key>",
            "\t\t<true/>",
        ];
    }
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>JustDisplay</key>",
        "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>SetClipboardToText</string>",
        ...renderNotifyOnFailureXml(notifyOnFailure),
        ...(processingMode
            ? renderSetVariableProcessingModeXml(processingMode)
            : []),
        ...renderStopOnFailureXml(stopOnFailure),
        ...(styledTextXml ? [styledTextXml] : []),
        ...targetClipboardXml,
        "\t\t<key>Text</key>",
        `\t\t<string>${escapeForXml(finalText)}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.showSpecificApp.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro ShowSpecificApp action.
 *
 * @param opts - ShowSpecificAppOptions for app selection
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualShowSpecificApp({ specific: { name: "Finder", bundleIdentifier: "com.apple.finder", path: "/System/Library/CoreServices/Finder.app" } })
 */
function createVirtualShowSpecificApp(opts) {
    const { target = "Specific", specific } = opts;
    const appLines = generateApplicationXml(target, specific);
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>Application</key>",
        ...appLines.map((line) => `\t\t${line}`),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>ShowSpecificApp</string>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.pressButton.ts
/**
 * Maps button action types to their corresponding AXAction values.
 */
const BUTTON_ACTION_TO_AX_ACTION = {
    PressButtonNamed: undefined, // No AXAction for basic press
    ShowMenuOfButtonNamed: "AXShowMenu",
    DecrementSliderNamed: "AXDecrement",
    IncrementSliderNamed: "AXIncrement",
    CancelButtonNamed: "AXCancel",
};
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Press Button action.
 * @param opts - PressButtonOptions for button action type, name, and various timeout/failure settings.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic button press
 * createVirtualPressButton({
 *   action: "PressButtonNamed",
 *   buttonName: "OK"
 * })
 *
 * @example
 * // Show menu with timeout settings
 * createVirtualPressButton({
 *   action: "ShowMenuOfButtonNamed",
 *   buttonName: "Options",
 *   waitForEnabledButton: true,
 *   timeoutAborts: false,
 *   notifyOnTimeout: true
 * })
 */
function createVirtualPressButton(opts) {
    const { action, buttonName, waitForEnabledButton = false, timeoutAborts = true, notifyOnTimeout = true, stopOnFailure, notifyOnFailure, } = opts;
    const axAction = BUTTON_ACTION_TO_AX_ACTION[action];
    const xmlLines = [
        "\t<dict>",
        ...(axAction
            ? ["\t\t<key>AXAction</key>", `\t\t<string>${axAction}</string>`]
            : []),
        ...generateActionUIDXml(),
        "\t\t<key>ButtonName</key>",
        `\t\t<string>${escapeForXml(buttonName)}</string>`,
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>PressButton</string>",
        ...renderNotifyOnFailureXml(notifyOnFailure),
        ...(waitForEnabledButton &&
            ((timeoutAborts === true && notifyOnTimeout === false) ||
                (timeoutAborts === false && notifyOnTimeout === true))
            ? [
                "\t\t<key>NotifyOnTimeOut</key>",
                notifyOnTimeout ? "\t\t<true/>" : "\t\t<false/>",
            ]
            : []),
        ...(stopOnFailure === false
            ? ["\t\t<key>StopOnFailure</key>", "\t\t<false/>"]
            : []),
        ...(waitForEnabledButton
            ? [
                "\t\t<key>TimeOutAbortsMacro</key>",
                timeoutAborts ? "\t\t<true/>" : "\t\t<false/>",
            ]
            : []),
        ...(waitForEnabledButton
            ? ["\t\t<key>WaitForEnabledButton</key>", "\t\t<true/>"]
            : []),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.while.ts
/**
 * Creates a virtual "While" action for Keyboard Maestro.
 * This action repeatedly executes a set of actions while the specified conditions remain true.
 *
 * @param opts - The configuration for the While loop.
 * @returns A VirtualAction object that can be executed in a macro.
 *
 * @example
 * // While a specific image is found on screen, click it
 * createVirtualWhile({
 *   match: 'All',
 *   conditions: [
 *     {
 *       ConditionType: 'ScreenImage',
 *       ScreenImageConditionType: 'Contains',
 *       ScreenArea: { type: 'ScreenAll' },
 *       Fuzz: 15
 *     }
 *   ],
 *   actions: [
 *     createVirtualClickAtFoundImage({
 *       image: { source: 'File', path: '/path/to/image.png' },
 *       screenArea: { type: 'ScreenAll' }
 *     })
 *   ]
 * });
 */
function createVirtualWhile(opts) {
    const { conditions, match = "All", actions, timeoutAborts = true, notifyOnTimeout, } = opts;
    // Generate XML for nested actions
    const actionsXml = actions.map((a) => a.toXml()).join("\n");
    // Generate XML for conditions array
    const conditionsArray = conditions.length > 0
        ? conditions
            .map(conditionToXml)
            .map((xml) => xml
            .split("\n")
            .map((line) => "\t\t\t" + line)
            .join("\n"))
            .join("\n")
        : "";
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>ActionUID</key>",
        `\t\t<integer>${Math.floor(Date.now() / 1000)}</integer>`,
        "\t\t<key>Actions</key>",
        actionsXml ? "\t\t<array>" : "\t\t<array/>",
        ...(actionsXml
            ? [
                actionsXml
                    .split("\n")
                    .map((line) => "\t\t\t" + line)
                    .join("\n"),
                "\t\t</array>",
            ]
            : []),
        "\t\t<key>Conditions</key>",
        "\t\t<dict>",
        "\t\t\t<key>ConditionList</key>",
        conditionsArray ? "\t\t\t<array>" : "\t\t\t<array/>",
        ...(conditionsArray ? [conditionsArray, "\t\t\t</array>"] : []),
        "\t\t\t<key>ConditionListMatch</key>",
        `\t\t\t<string>${match}</string>`,
        "\t\t</dict>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>While</string>",
        ...(notifyOnTimeout !== undefined
            ? [
                "\t\t<key>NotifyOnTimeOut</key>",
                `\t\t${notifyOnTimeout ? "<true/>" : "<false/>"}`,
            ]
            : []),
        "\t\t<key>TimeOutAbortsMacro</key>",
        `\t\t${timeoutAborts ? "<true/>" : "<false/>"}`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.clearTypedStringBuffer.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Clear Typed String Buffer action.
 *
 * The Clear Typed String Buffer action simply resets the Typed String buffer — the same thing
 * that happens if you change applications, type Shift-Space, or simply do not press a key for
 * a period of time. This action lets you clear the buffer explicitly if it is necessary for
 * any reason.
 *
 * This action clears the buffer of typed string triggers. It takes no parameters.
 *
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualClearTypedStringBuffer()
 */
function createVirtualClearTypedStringBuffer() {
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>IsDisclosed</key>",
        "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>SystemAction</string>",
        "\t\t<key>SystemAction</key>",
        "\t\t<string>ClearTypedString</string>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.open.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Open action.
 *
 * @param opts - OpenActionOptions for configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualOpen({ path: "/Applications/Safari.app" })
 */
function createVirtualOpen(opts) {
    const { path, target = "Front", specific = {}, stopOnFailure = true, notifyOnFailure = true, } = opts;
    const isDefaultApp = target === "Front" || !specific || Object.keys(specific).length === 0;
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        // Only include Application if not default
        ...(!isDefaultApp
            ? [
                "\t\t<key>Application</key>",
                ...generateApplicationXml(target, specific).map((line) => `\t\t${line}`),
            ]
            : []),
        "\t\t<key>IsDefaultApplication</key>",
        isDefaultApp ? "\t\t<true/>" : "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>Open1File</string>",
        // Only include NotifyOnFailure if false
        ...(notifyOnFailure === false ? renderNotifyOnFailureXml(false) : []),
        "\t\t<key>Path</key>",
        `\t\t<string>${escapeForXml(path)}</string>`,
        // Only include StopOnFailure if false
        ...(stopOnFailure === false ? renderStopOnFailureXml(false) : []),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.openURL.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Open URL action.
 *
 * @param opts - OpenURLActionOptions for configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualOpenURL({ url: "https://www.keyboardmaestro.com/" })
 */
function createVirtualOpenURL(opts) {
    const { url, target = "Front", specific = {}, processingMode, openInBackground = false, stopOnFailure = true, notifyOnFailure = true, timeoutAborts = true, notifyOnTimeout = true, } = opts;
    const isDefaultApp = target === "Front" || !specific || Object.keys(specific).length === 0;
    const timeoutXml = renderTimeoutXml({ notifyOnTimeout, timeoutAborts });
    const notifyOnTimeOutIdx = timeoutXml.findIndex((line) => line.includes("NotifyOnTimeOut"));
    const notifyOnTimeOutXml = notifyOnTimeOutIdx !== -1
        ? timeoutXml.slice(notifyOnTimeOutIdx, notifyOnTimeOutIdx + 2)
        : [];
    // TimeOutAbortsMacro is always present and is always the last two lines of timeoutXml
    const timeOutAbortsMacroXml = timeoutXml.slice(-2);
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        // Only include Application if not default
        ...(!isDefaultApp
            ? [
                "\t\t<key>Application</key>",
                ...generateApplicationXml(target, specific).map((line) => `\t\t${line}`),
            ]
            : []),
        "\t\t<key>IsDefaultApplication</key>",
        isDefaultApp ? "\t\t<true/>" : "\t\t<false/>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>OpenURL</string>",
        // Only include NotifyOnFailure if false
        ...(notifyOnFailure === false ? renderNotifyOnFailureXml(false) : []),
        // Only include NotifyOnTimeOut if present
        ...notifyOnTimeOutXml,
        // OpenInBackground (if present)
        ...(openInBackground
            ? ["\t\t<key>OpenInBackground</key>", "\t\t<true/>"]
            : []),
        // Processing mode (if present)
        ...(processingMode
            ? [
                "\t\t<key>ProcessingMode</key>",
                `\t\t<string>${processingMode}</string>`,
            ]
            : []),
        // Only include StopOnFailure if false
        ...(stopOnFailure === false ? renderStopOnFailureXml(false) : []),
        // Always include TimeOutAbortsMacro
        ...timeOutAbortsMacroXml,
        // URL
        "\t\t<key>URL</key>",
        `\t\t<string>${escapeForXml(url)}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.selectMenuItem.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro SelectMenuItem action.
 *
 * @param opts - selectMenuOptions for application targeting, menu title/item, and failure options.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualselectMenuItem({
 *   target: "Specific",
 *   specific: { name: "Safari", bundleIdentifier: "com.apple.Safari" },
 *   menuPath: ["Safari", "About Safari"],
 *   stopOnFailure: false,
 *   notifyOnFailure: false,
 * })
 */
function createVirtualselectMenuItem(opts) {
    const { target = "Front", specific = {}, menuPath, stopOnFailure, notifyOnFailure, } = opts;
    if (!menuPath || !Array.isArray(menuPath) || menuPath.length === 0) {
        throw new Error("menuPath (array of menu/submenu strings) is required");
    }
    // Build the <dict> for the Application key with canonical ordering
    const appLines = generateApplicationXml(target, specific);
    // Build the Menu array (arbitrary depth)
    const menuXml = [
        "\t\t<key>Menu</key>",
        "\t\t<array>",
        ...menuPath.map((s) => `\t\t\t<string>${s !== null && s !== void 0 ? s : ""}</string>`),
        "\t\t</array>",
    ];
    // Only emit StopOnFailure if explicitly false (KM omits when true)
    function renderSelectMenuStopOnFailureXml(stopOnFailure) {
        if (stopOnFailure === false) {
            return ["\t\t<key>StopOnFailure</key>", "\t\t<false/>"];
        }
        return [];
    }
    // Assemble the full XML fragment in canonical KM order
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>SelectMenuItem</string>",
        ...menuXml,
        ...renderNotifyOnFailureXml(notifyOnFailure),
        ...renderSelectMenuStopOnFailureXml(stopOnFailure),
        "\t\t<key>TargetApplication</key>",
        ...appLines.map((line) => `\t\t${line}`),
        "\t\t<key>TargetingType</key>",
        `\t\t<string>${target}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.showStatusMenu.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro ShowStatusMenu action.
 * This action displays the Keyboard Maestro status menu. It takes no parameters.
 *
 * @param opts - ShowStatusMenuOptions (currently unused, for future extensibility)
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualShowStatusMenu()
 */
function createVirtualShowStatusMenu(opts = {}) {
    // The only non-default key is IsDisclosed, which is always false in ground truth.
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>IsDisclosed</key>",
        "\t\t<false/>", // Unknown what this does, but it's always false in ground truth, and cannot be configured in the KM UI.
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>SystemAction</string>",
        "\t\t<key>SystemAction</key>",
        "\t\t<string>ShowStatusMenu</string>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.useVariable.ts
/**
 * Creates a virtual UseVariable action for Keyboard Maestro.
 *
 * @param opts - UseVariableOptions
 * @returns VirtualAction
 *
 * The UID is auto-generated. MacroActionType is always "UseVariable".
 *
 * Example XML output:
 * <dict>
 *   <key>Action</key>
 *   <string>SetMouse</string>
 *   <key>ActionUID</key>
 *   <integer>...</integer>
 *   <key>MacroActionType</key>
 *   <string>UseVariable</string>
 *   <key>Variable</key>
 *   <string>...</string>
 *   ...
 * </dict>
 */
function createVirtualUseVariable(opts) {
    const { variable, action, stopOnFailure = false, notifyOnFailure = true, } = opts;
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>Action</key>",
        "\t\t<string>" + action + "</string>",
        ...generateActionUIDXml(),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>UseVariable</string>",
        ...(notifyOnFailure === false
            ? renderNotifyOnFailureXml(notifyOnFailure)
            : []),
        ...(stopOnFailure === true ? renderStopOnFailureXml(stopOnFailure) : []),
        "\t\t<key>Variable</key>",
        "\t\t<string>" + (variable || "") + "</string>",
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.group.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Group action.
 *
 * Groups are organizational containers that can hold multiple actions and provide
 * visual structure in the Keyboard Maestro editor. They can have names, colors,
 * and timeout behavior.
 *
 * @param opts - GroupOptions with name, actions array, and optional styling
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * // Basic group with actions
 * createVirtualGroup({
 *   name: "Setup Variables",
 *   actions: [
 *     createVirtualSetVariable({ variable: "Width", text: "1920" }),
 *     createVirtualSetVariable({ variable: "Height", text: "1080" })
 *   ]
 * })
 *
 * @example
 * // Colored group with timeout settings
 * createVirtualGroup({
 *   name: "Window Management",
 *   color: "Blue",
 *   timeOutAbortsMacro: false,
 *   actions: [
 *     createVirtualManipulateWindow({ manipulation: "Center" }),
 *     createVirtualPause({ time: 0.5 })
 *   ]
 * })
 */
function createVirtualGroup(opts) {
    console.log(chalk.cyan(`[VirtualAction] Group:`), chalk.grey(JSON.stringify({ name: opts.name, actionCount: opts.actions.length })));
    const { name, actions, timeOutAbortsMacro = true } = opts;
    // Generate XML for all sub-actions
    const actionsXml = actions.map((action) => action.toXml()).join("\n");
    // Build the group XML structure
    const xmlLines = [
        "\t<dict>",
        "\t\t<key>ActionName</key>",
        `\t\t<string>${escapeForXml(name)}</string>`,
        ...generateActionUIDXml(),
        "\t\t<key>Actions</key>",
        "\t\t<array>",
        // Indent the sub-actions properly (they already have their own indentation)
        ...actionsXml.split("\n").map((line) => (line ? "\t\t" + line : line)),
        "\t\t</array>",
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>Group</string>",
        ...renderTimeoutXml({ timeoutAborts: timeOutAbortsMacro }),
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.comment.ts
/**
 * Constructs a VirtualAction representing a Keyboard Maestro Comment action.
 *
 * The Comment action displays a styled text comment in the macro editor. The text is always encoded as RTF.
 *
 * @param opts - CommentOptions for title, text, and optional RTF content.
 * @returns A VirtualAction that emits the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualComment({ title: "My Note", text: "This is a comment." })
 *
 * @example
 * createVirtualComment({ title: "Styled", text: "Bold text", rtfContent: "{\\rtf1...}" })
 */
function createVirtualComment(opts) {
    const { title, text, rtfContent } = opts;
    // Use provided RTF or generate a basic RTF from plain text
    const rtf = rtfContent || generateBasicRtf(text);
    const styledTextData = encodeStyledTextData(rtf);
    const indentedData = styledTextData
        .split("\n")
        .map((line) => `\t\t${line}`)
        .join("\n");
    const xmlLines = [
        "\t<dict>",
        ...generateActionUIDXml(),
        "\t\t<key>MacroActionType</key>",
        "\t\t<string>Comment</string>",
        "\t\t<key>StyledText</key>",
        "\t\t<data>",
        indentedData,
        "\t\t</data>",
        "\t\t<key>Title</key>",
        `\t\t<string>${escapeForXml(title)}</string>`,
        "\t</dict>",
    ];
    return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}

//FILE: src/virtual_actions/kmjs.virtualAction.scrollWheelEvent.ts
/**
 * Creates a Keyboard Maestro virtual action for ScrollWheelEvent.
 *
 * @param opts - Options for scroll wheel event
 * @returns VirtualAction
 */
function createVirtualScrollWheelEvent(opts) {
    const { scrollAmount, direction, stopOnFailure, notifyOnFailure, actionUID } = opts;
    // Use provided UID or let KM assign one
    const actionUIDXml = actionUID !== undefined
        ? [`\t<key>ActionUID</key>`, `\t<integer>${actionUID}</integer>`]
        : generateActionUIDXml();
    const xmlLines = [
        "\t<dict>",
        ...actionUIDXml,
        "\t<key>MacroActionType</key>",
        "\t<string>ScrollWheelEvent</string>",
        ...renderNotifyOnFailureXml(notifyOnFailure),
        "\t<key>ScrollAmountExpression</key>",
        `\t<string>${scrollAmount}</string>`,
        "\t<key>ScrollDirection</key>",
        `\t<string>${direction}</string>`,
        ...renderStopOnFailureXml(stopOnFailure),
        "\t</dict>",
    ];
    return {
        toXml: () => formatXmlAction(xmlLines.join("\n")),
    };
}

var validator = {};

var util = {};

var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util;
	hasRequiredUtil = 1;
	(function (exports) {

		const nameStartChar = ':A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
		const nameChar = nameStartChar + '\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
		const nameRegexp = '[' + nameStartChar + '][' + nameChar + ']*';
		const regexName = new RegExp('^' + nameRegexp + '$');

		const getAllMatches = function(string, regex) {
		  const matches = [];
		  let match = regex.exec(string);
		  while (match) {
		    const allmatches = [];
		    allmatches.startIndex = regex.lastIndex - match[0].length;
		    const len = match.length;
		    for (let index = 0; index < len; index++) {
		      allmatches.push(match[index]);
		    }
		    matches.push(allmatches);
		    match = regex.exec(string);
		  }
		  return matches;
		};

		const isName = function(string) {
		  const match = regexName.exec(string);
		  return !(match === null || typeof match === 'undefined');
		};

		exports.isExist = function(v) {
		  return typeof v !== 'undefined';
		};

		exports.isEmptyObject = function(obj) {
		  return Object.keys(obj).length === 0;
		};

		/**
		 * Copy all the properties of a into b.
		 * @param {*} target
		 * @param {*} a
		 */
		exports.merge = function(target, a, arrayMode) {
		  if (a) {
		    const keys = Object.keys(a); // will return an array of own properties
		    const len = keys.length; //don't make it inline
		    for (let i = 0; i < len; i++) {
		      if (arrayMode === 'strict') {
		        target[keys[i]] = [ a[keys[i]] ];
		      } else {
		        target[keys[i]] = a[keys[i]];
		      }
		    }
		  }
		};
		/* exports.merge =function (b,a){
		  return Object.assign(b,a);
		} */

		exports.getValue = function(v) {
		  if (exports.isExist(v)) {
		    return v;
		  } else {
		    return '';
		  }
		};

		// const fakeCall = function(a) {return a;};
		// const fakeCallNoReturn = function() {};

		exports.isName = isName;
		exports.getAllMatches = getAllMatches;
		exports.nameRegexp = nameRegexp; 
	} (util));
	return util;
}

var hasRequiredValidator;

function requireValidator () {
	if (hasRequiredValidator) return validator;
	hasRequiredValidator = 1;

	const util = requireUtil();

	const defaultOptions = {
	  allowBooleanAttributes: false, //A tag can have attributes without any value
	  unpairedTags: []
	};

	//const tagsPattern = new RegExp("<\\/?([\\w:\\-_\.]+)\\s*\/?>","g");
	validator.validate = function (xmlData, options) {
	  options = Object.assign({}, defaultOptions, options);

	  //xmlData = xmlData.replace(/(\r\n|\n|\r)/gm,"");//make it single line
	  //xmlData = xmlData.replace(/(^\s*<\?xml.*?\?>)/g,"");//Remove XML starting tag
	  //xmlData = xmlData.replace(/(<!DOCTYPE[\s\w\"\.\/\-\:]+(\[.*\])*\s*>)/g,"");//Remove DOCTYPE
	  const tags = [];
	  let tagFound = false;

	  //indicates that the root tag has been closed (aka. depth 0 has been reached)
	  let reachedRoot = false;

	  if (xmlData[0] === '\ufeff') {
	    // check for byte order mark (BOM)
	    xmlData = xmlData.substr(1);
	  }
	  
	  for (let i = 0; i < xmlData.length; i++) {

	    if (xmlData[i] === '<' && xmlData[i+1] === '?') {
	      i+=2;
	      i = readPI(xmlData,i);
	      if (i.err) return i;
	    }else if (xmlData[i] === '<') {
	      //starting of tag
	      //read until you reach to '>' avoiding any '>' in attribute value
	      let tagStartPos = i;
	      i++;
	      
	      if (xmlData[i] === '!') {
	        i = readCommentAndCDATA(xmlData, i);
	        continue;
	      } else {
	        let closingTag = false;
	        if (xmlData[i] === '/') {
	          //closing tag
	          closingTag = true;
	          i++;
	        }
	        //read tagname
	        let tagName = '';
	        for (; i < xmlData.length &&
	          xmlData[i] !== '>' &&
	          xmlData[i] !== ' ' &&
	          xmlData[i] !== '\t' &&
	          xmlData[i] !== '\n' &&
	          xmlData[i] !== '\r'; i++
	        ) {
	          tagName += xmlData[i];
	        }
	        tagName = tagName.trim();
	        //console.log(tagName);

	        if (tagName[tagName.length - 1] === '/') {
	          //self closing tag without attributes
	          tagName = tagName.substring(0, tagName.length - 1);
	          //continue;
	          i--;
	        }
	        if (!validateTagName(tagName)) {
	          let msg;
	          if (tagName.trim().length === 0) {
	            msg = "Invalid space after '<'.";
	          } else {
	            msg = "Tag '"+tagName+"' is an invalid name.";
	          }
	          return getErrorObject('InvalidTag', msg, getLineNumberForPosition(xmlData, i));
	        }

	        const result = readAttributeStr(xmlData, i);
	        if (result === false) {
	          return getErrorObject('InvalidAttr', "Attributes for '"+tagName+"' have open quote.", getLineNumberForPosition(xmlData, i));
	        }
	        let attrStr = result.value;
	        i = result.index;

	        if (attrStr[attrStr.length - 1] === '/') {
	          //self closing tag
	          const attrStrStart = i - attrStr.length;
	          attrStr = attrStr.substring(0, attrStr.length - 1);
	          const isValid = validateAttributeString(attrStr, options);
	          if (isValid === true) {
	            tagFound = true;
	            //continue; //text may presents after self closing tag
	          } else {
	            //the result from the nested function returns the position of the error within the attribute
	            //in order to get the 'true' error line, we need to calculate the position where the attribute begins (i - attrStr.length) and then add the position within the attribute
	            //this gives us the absolute index in the entire xml, which we can use to find the line at last
	            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
	          }
	        } else if (closingTag) {
	          if (!result.tagClosed) {
	            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
	          } else if (attrStr.trim().length > 0) {
	            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
	          } else if (tags.length === 0) {
	            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
	          } else {
	            const otg = tags.pop();
	            if (tagName !== otg.tagName) {
	              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
	              return getErrorObject('InvalidTag',
	                "Expected closing tag '"+otg.tagName+"' (opened in line "+openPos.line+", col "+openPos.col+") instead of closing tag '"+tagName+"'.",
	                getLineNumberForPosition(xmlData, tagStartPos));
	            }

	            //when there are no more tags, we reached the root level.
	            if (tags.length == 0) {
	              reachedRoot = true;
	            }
	          }
	        } else {
	          const isValid = validateAttributeString(attrStr, options);
	          if (isValid !== true) {
	            //the result from the nested function returns the position of the error within the attribute
	            //in order to get the 'true' error line, we need to calculate the position where the attribute begins (i - attrStr.length) and then add the position within the attribute
	            //this gives us the absolute index in the entire xml, which we can use to find the line at last
	            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
	          }

	          //if the root level has been reached before ...
	          if (reachedRoot === true) {
	            return getErrorObject('InvalidXml', 'Multiple possible root nodes found.', getLineNumberForPosition(xmlData, i));
	          } else if(options.unpairedTags.indexOf(tagName) !== -1); else {
	            tags.push({tagName, tagStartPos});
	          }
	          tagFound = true;
	        }

	        //skip tag text value
	        //It may include comments and CDATA value
	        for (i++; i < xmlData.length; i++) {
	          if (xmlData[i] === '<') {
	            if (xmlData[i + 1] === '!') {
	              //comment or CADATA
	              i++;
	              i = readCommentAndCDATA(xmlData, i);
	              continue;
	            } else if (xmlData[i+1] === '?') {
	              i = readPI(xmlData, ++i);
	              if (i.err) return i;
	            } else {
	              break;
	            }
	          } else if (xmlData[i] === '&') {
	            const afterAmp = validateAmpersand(xmlData, i);
	            if (afterAmp == -1)
	              return getErrorObject('InvalidChar', "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
	            i = afterAmp;
	          }else {
	            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
	              return getErrorObject('InvalidXml', "Extra text at the end", getLineNumberForPosition(xmlData, i));
	            }
	          }
	        } //end of reading tag text value
	        if (xmlData[i] === '<') {
	          i--;
	        }
	      }
	    } else {
	      if ( isWhiteSpace(xmlData[i])) {
	        continue;
	      }
	      return getErrorObject('InvalidChar', "char '"+xmlData[i]+"' is not expected.", getLineNumberForPosition(xmlData, i));
	    }
	  }

	  if (!tagFound) {
	    return getErrorObject('InvalidXml', 'Start tag expected.', 1);
	  }else if (tags.length == 1) {
	      return getErrorObject('InvalidTag', "Unclosed tag '"+tags[0].tagName+"'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
	  }else if (tags.length > 0) {
	      return getErrorObject('InvalidXml', "Invalid '"+
	          JSON.stringify(tags.map(t => t.tagName), null, 4).replace(/\r?\n/g, '')+
	          "' found.", {line: 1, col: 1});
	  }

	  return true;
	};

	function isWhiteSpace(char){
	  return char === ' ' || char === '\t' || char === '\n'  || char === '\r';
	}
	/**
	 * Read Processing insstructions and skip
	 * @param {*} xmlData
	 * @param {*} i
	 */
	function readPI(xmlData, i) {
	  const start = i;
	  for (; i < xmlData.length; i++) {
	    if (xmlData[i] == '?' || xmlData[i] == ' ') {
	      //tagname
	      const tagname = xmlData.substr(start, i - start);
	      if (i > 5 && tagname === 'xml') {
	        return getErrorObject('InvalidXml', 'XML declaration allowed only at the start of the document.', getLineNumberForPosition(xmlData, i));
	      } else if (xmlData[i] == '?' && xmlData[i + 1] == '>') {
	        //check if valid attribut string
	        i++;
	        break;
	      } else {
	        continue;
	      }
	    }
	  }
	  return i;
	}

	function readCommentAndCDATA(xmlData, i) {
	  if (xmlData.length > i + 5 && xmlData[i + 1] === '-' && xmlData[i + 2] === '-') {
	    //comment
	    for (i += 3; i < xmlData.length; i++) {
	      if (xmlData[i] === '-' && xmlData[i + 1] === '-' && xmlData[i + 2] === '>') {
	        i += 2;
	        break;
	      }
	    }
	  } else if (
	    xmlData.length > i + 8 &&
	    xmlData[i + 1] === 'D' &&
	    xmlData[i + 2] === 'O' &&
	    xmlData[i + 3] === 'C' &&
	    xmlData[i + 4] === 'T' &&
	    xmlData[i + 5] === 'Y' &&
	    xmlData[i + 6] === 'P' &&
	    xmlData[i + 7] === 'E'
	  ) {
	    let angleBracketsCount = 1;
	    for (i += 8; i < xmlData.length; i++) {
	      if (xmlData[i] === '<') {
	        angleBracketsCount++;
	      } else if (xmlData[i] === '>') {
	        angleBracketsCount--;
	        if (angleBracketsCount === 0) {
	          break;
	        }
	      }
	    }
	  } else if (
	    xmlData.length > i + 9 &&
	    xmlData[i + 1] === '[' &&
	    xmlData[i + 2] === 'C' &&
	    xmlData[i + 3] === 'D' &&
	    xmlData[i + 4] === 'A' &&
	    xmlData[i + 5] === 'T' &&
	    xmlData[i + 6] === 'A' &&
	    xmlData[i + 7] === '['
	  ) {
	    for (i += 8; i < xmlData.length; i++) {
	      if (xmlData[i] === ']' && xmlData[i + 1] === ']' && xmlData[i + 2] === '>') {
	        i += 2;
	        break;
	      }
	    }
	  }

	  return i;
	}

	const doubleQuote = '"';
	const singleQuote = "'";

	/**
	 * Keep reading xmlData until '<' is found outside the attribute value.
	 * @param {string} xmlData
	 * @param {number} i
	 */
	function readAttributeStr(xmlData, i) {
	  let attrStr = '';
	  let startChar = '';
	  let tagClosed = false;
	  for (; i < xmlData.length; i++) {
	    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
	      if (startChar === '') {
	        startChar = xmlData[i];
	      } else if (startChar !== xmlData[i]) ; else {
	        startChar = '';
	      }
	    } else if (xmlData[i] === '>') {
	      if (startChar === '') {
	        tagClosed = true;
	        break;
	      }
	    }
	    attrStr += xmlData[i];
	  }
	  if (startChar !== '') {
	    return false;
	  }

	  return {
	    value: attrStr,
	    index: i,
	    tagClosed: tagClosed
	  };
	}

	/**
	 * Select all the attributes whether valid or invalid.
	 */
	const validAttrStrRegxp = new RegExp('(\\s*)([^\\s=]+)(\\s*=)?(\\s*([\'"])(([\\s\\S])*?)\\5)?', 'g');

	//attr, ="sd", a="amit's", a="sd"b="saf", ab  cd=""

	function validateAttributeString(attrStr, options) {
	  //console.log("start:"+attrStr+":end");

	  //if(attrStr.trim().length === 0) return true; //empty string

	  const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
	  const attrNames = {};

	  for (let i = 0; i < matches.length; i++) {
	    if (matches[i][1].length === 0) {
	      //nospace before attribute name: a="sd"b="saf"
	      return getErrorObject('InvalidAttr', "Attribute '"+matches[i][2]+"' has no space in starting.", getPositionFromMatch(matches[i]))
	    } else if (matches[i][3] !== undefined && matches[i][4] === undefined) {
	      return getErrorObject('InvalidAttr', "Attribute '"+matches[i][2]+"' is without value.", getPositionFromMatch(matches[i]));
	    } else if (matches[i][3] === undefined && !options.allowBooleanAttributes) {
	      //independent attribute: ab
	      return getErrorObject('InvalidAttr', "boolean attribute '"+matches[i][2]+"' is not allowed.", getPositionFromMatch(matches[i]));
	    }
	    /* else if(matches[i][6] === undefined){//attribute without value: ab=
	                    return { err: { code:"InvalidAttr",msg:"attribute " + matches[i][2] + " has no value assigned."}};
	                } */
	    const attrName = matches[i][2];
	    if (!validateAttrName(attrName)) {
	      return getErrorObject('InvalidAttr', "Attribute '"+attrName+"' is an invalid name.", getPositionFromMatch(matches[i]));
	    }
	    if (!attrNames.hasOwnProperty(attrName)) {
	      //check for duplicate attribute.
	      attrNames[attrName] = 1;
	    } else {
	      return getErrorObject('InvalidAttr', "Attribute '"+attrName+"' is repeated.", getPositionFromMatch(matches[i]));
	    }
	  }

	  return true;
	}

	function validateNumberAmpersand(xmlData, i) {
	  let re = /\d/;
	  if (xmlData[i] === 'x') {
	    i++;
	    re = /[\da-fA-F]/;
	  }
	  for (; i < xmlData.length; i++) {
	    if (xmlData[i] === ';')
	      return i;
	    if (!xmlData[i].match(re))
	      break;
	  }
	  return -1;
	}

	function validateAmpersand(xmlData, i) {
	  // https://www.w3.org/TR/xml/#dt-charref
	  i++;
	  if (xmlData[i] === ';')
	    return -1;
	  if (xmlData[i] === '#') {
	    i++;
	    return validateNumberAmpersand(xmlData, i);
	  }
	  let count = 0;
	  for (; i < xmlData.length; i++, count++) {
	    if (xmlData[i].match(/\w/) && count < 20)
	      continue;
	    if (xmlData[i] === ';')
	      break;
	    return -1;
	  }
	  return i;
	}

	function getErrorObject(code, message, lineNumber) {
	  return {
	    err: {
	      code: code,
	      msg: message,
	      line: lineNumber.line || lineNumber,
	      col: lineNumber.col,
	    },
	  };
	}

	function validateAttrName(attrName) {
	  return util.isName(attrName);
	}

	// const startsWithXML = /^xml/i;

	function validateTagName(tagname) {
	  return util.isName(tagname) /* && !tagname.match(startsWithXML) */;
	}

	//this function returns the line number for the character at the given index
	function getLineNumberForPosition(xmlData, index) {
	  const lines = xmlData.substring(0, index).split(/\r?\n/);
	  return {
	    line: lines.length,

	    // column number is last line's length + 1, because column numbering starts at 1:
	    col: lines[lines.length - 1].length + 1
	  };
	}

	//this function returns the position of the first character of match within attrStr
	function getPositionFromMatch(match) {
	  return match.startIndex + match[1].length;
	}
	return validator;
}

var OptionsBuilder = {};

var hasRequiredOptionsBuilder;

function requireOptionsBuilder () {
	if (hasRequiredOptionsBuilder) return OptionsBuilder;
	hasRequiredOptionsBuilder = 1;
	const defaultOptions = {
	    preserveOrder: false,
	    attributeNamePrefix: '@_',
	    attributesGroupName: false,
	    textNodeName: '#text',
	    ignoreAttributes: true,
	    removeNSPrefix: false, // remove NS from tag name or attribute name if true
	    allowBooleanAttributes: false, //a tag can have attributes without any value
	    //ignoreRootElement : false,
	    parseTagValue: true,
	    parseAttributeValue: false,
	    trimValues: true, //Trim string values of tag and attributes
	    cdataPropName: false,
	    numberParseOptions: {
	      hex: true,
	      leadingZeros: true,
	      eNotation: true
	    },
	    tagValueProcessor: function(tagName, val) {
	      return val;
	    },
	    attributeValueProcessor: function(attrName, val) {
	      return val;
	    },
	    stopNodes: [], //nested tags will not be parsed even for errors
	    alwaysCreateTextNode: false,
	    isArray: () => false,
	    commentPropName: false,
	    unpairedTags: [],
	    processEntities: true,
	    htmlEntities: false,
	    ignoreDeclaration: false,
	    ignorePiTags: false,
	    transformTagName: false,
	    transformAttributeName: false,
	    updateTag: function(tagName, jPath, attrs){
	      return tagName
	    },
	    // skipEmptyListItem: false
	};
	   
	const buildOptions = function(options) {
	    return Object.assign({}, defaultOptions, options);
	};

	OptionsBuilder.buildOptions = buildOptions;
	OptionsBuilder.defaultOptions = defaultOptions;
	return OptionsBuilder;
}

var xmlNode;
var hasRequiredXmlNode;

function requireXmlNode () {
	if (hasRequiredXmlNode) return xmlNode;
	hasRequiredXmlNode = 1;

	class XmlNode{
	  constructor(tagname) {
	    this.tagname = tagname;
	    this.child = []; //nested tags, text, cdata, comments in order
	    this[":@"] = {}; //attributes map
	  }
	  add(key,val){
	    // this.child.push( {name : key, val: val, isCdata: isCdata });
	    if(key === "__proto__") key = "#__proto__";
	    this.child.push( {[key]: val });
	  }
	  addChild(node) {
	    if(node.tagname === "__proto__") node.tagname = "#__proto__";
	    if(node[":@"] && Object.keys(node[":@"]).length > 0){
	      this.child.push( { [node.tagname]: node.child, [":@"]: node[":@"] });
	    }else {
	      this.child.push( { [node.tagname]: node.child });
	    }
	  };
	}

	xmlNode = XmlNode;
	return xmlNode;
}

var DocTypeReader;
var hasRequiredDocTypeReader;

function requireDocTypeReader () {
	if (hasRequiredDocTypeReader) return DocTypeReader;
	hasRequiredDocTypeReader = 1;
	const util = requireUtil();

	//TODO: handle comments
	function readDocType(xmlData, i){
	    
	    const entities = {};
	    if( xmlData[i + 3] === 'O' &&
	         xmlData[i + 4] === 'C' &&
	         xmlData[i + 5] === 'T' &&
	         xmlData[i + 6] === 'Y' &&
	         xmlData[i + 7] === 'P' &&
	         xmlData[i + 8] === 'E')
	    {    
	        i = i+9;
	        let angleBracketsCount = 1;
	        let hasBody = false, comment = false;
	        let exp = "";
	        for(;i<xmlData.length;i++){
	            if (xmlData[i] === '<' && !comment) { //Determine the tag type
	                if( hasBody && isEntity(xmlData, i)){
	                    i += 7; 
	                    let entityName, val;
	                    [entityName, val,i] = readEntityExp(xmlData,i+1);
	                    if(val.indexOf("&") === -1) //Parameter entities are not supported
	                        entities[ validateEntityName(entityName) ] = {
	                            regx : RegExp( `&${entityName};`,"g"),
	                            val: val
	                        };
	                }
	                else if( hasBody && isElement(xmlData, i))  i += 8;//Not supported
	                else if( hasBody && isAttlist(xmlData, i))  i += 8;//Not supported
	                else if( hasBody && isNotation(xmlData, i)) i += 9;//Not supported
	                else if( isComment)                         comment = true;
	                else                                        throw new Error("Invalid DOCTYPE");

	                angleBracketsCount++;
	                exp = "";
	            } else if (xmlData[i] === '>') { //Read tag content
	                if(comment){
	                    if( xmlData[i - 1] === "-" && xmlData[i - 2] === "-"){
	                        comment = false;
	                        angleBracketsCount--;
	                    }
	                }else {
	                    angleBracketsCount--;
	                }
	                if (angleBracketsCount === 0) {
	                  break;
	                }
	            }else if( xmlData[i] === '['){
	                hasBody = true;
	            }else {
	                exp += xmlData[i];
	            }
	        }
	        if(angleBracketsCount !== 0){
	            throw new Error(`Unclosed DOCTYPE`);
	        }
	    }else {
	        throw new Error(`Invalid Tag instead of DOCTYPE`);
	    }
	    return {entities, i};
	}

	function readEntityExp(xmlData,i){
	    //External entities are not supported
	    //    <!ENTITY ext SYSTEM "http://normal-website.com" >

	    //Parameter entities are not supported
	    //    <!ENTITY entityname "&anotherElement;">

	    //Internal entities are supported
	    //    <!ENTITY entityname "replacement text">
	    
	    //read EntityName
	    let entityName = "";
	    for (; i < xmlData.length && (xmlData[i] !== "'" && xmlData[i] !== '"' ); i++) {
	        // if(xmlData[i] === " ") continue;
	        // else 
	        entityName += xmlData[i];
	    }
	    entityName = entityName.trim();
	    if(entityName.indexOf(" ") !== -1) throw new Error("External entites are not supported");

	    //read Entity Value
	    const startChar = xmlData[i++];
	    let val = "";
	    for (; i < xmlData.length && xmlData[i] !== startChar ; i++) {
	        val += xmlData[i];
	    }
	    return [entityName, val, i];
	}

	function isComment(xmlData, i){
	    if(xmlData[i+1] === '!' &&
	    xmlData[i+2] === '-' &&
	    xmlData[i+3] === '-') return true
	    return false
	}
	function isEntity(xmlData, i){
	    if(xmlData[i+1] === '!' &&
	    xmlData[i+2] === 'E' &&
	    xmlData[i+3] === 'N' &&
	    xmlData[i+4] === 'T' &&
	    xmlData[i+5] === 'I' &&
	    xmlData[i+6] === 'T' &&
	    xmlData[i+7] === 'Y') return true
	    return false
	}
	function isElement(xmlData, i){
	    if(xmlData[i+1] === '!' &&
	    xmlData[i+2] === 'E' &&
	    xmlData[i+3] === 'L' &&
	    xmlData[i+4] === 'E' &&
	    xmlData[i+5] === 'M' &&
	    xmlData[i+6] === 'E' &&
	    xmlData[i+7] === 'N' &&
	    xmlData[i+8] === 'T') return true
	    return false
	}

	function isAttlist(xmlData, i){
	    if(xmlData[i+1] === '!' &&
	    xmlData[i+2] === 'A' &&
	    xmlData[i+3] === 'T' &&
	    xmlData[i+4] === 'T' &&
	    xmlData[i+5] === 'L' &&
	    xmlData[i+6] === 'I' &&
	    xmlData[i+7] === 'S' &&
	    xmlData[i+8] === 'T') return true
	    return false
	}
	function isNotation(xmlData, i){
	    if(xmlData[i+1] === '!' &&
	    xmlData[i+2] === 'N' &&
	    xmlData[i+3] === 'O' &&
	    xmlData[i+4] === 'T' &&
	    xmlData[i+5] === 'A' &&
	    xmlData[i+6] === 'T' &&
	    xmlData[i+7] === 'I' &&
	    xmlData[i+8] === 'O' &&
	    xmlData[i+9] === 'N') return true
	    return false
	}

	function validateEntityName(name){
	    if (util.isName(name))
		return name;
	    else
	        throw new Error(`Invalid entity name ${name}`);
	}

	DocTypeReader = readDocType;
	return DocTypeReader;
}

var strnum;
var hasRequiredStrnum;

function requireStrnum () {
	if (hasRequiredStrnum) return strnum;
	hasRequiredStrnum = 1;
	const hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
	const numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
	// const octRegex = /^0x[a-z0-9]+/;
	// const binRegex = /0x[a-z0-9]+/;

	 
	const consider = {
	    hex :  true,
	    // oct: false,
	    leadingZeros: true,
	    decimalPoint: "\.",
	    eNotation: true,
	    //skipLike: /regex/
	};

	function toNumber(str, options = {}){
	    options = Object.assign({}, consider, options );
	    if(!str || typeof str !== "string" ) return str;
	    
	    let trimmedStr  = str.trim();
	    
	    if(options.skipLike !== undefined && options.skipLike.test(trimmedStr)) return str;
	    else if(str==="0") return 0;
	    else if (options.hex && hexRegex.test(trimmedStr)) {
	        return parse_int(trimmedStr, 16);
	    // }else if (options.oct && octRegex.test(str)) {
	    //     return Number.parseInt(val, 8);
	    }else if (trimmedStr.search(/[eE]/)!== -1) { //eNotation
	        const notation = trimmedStr.match(/^([-\+])?(0*)([0-9]*(\.[0-9]*)?[eE][-\+]?[0-9]+)$/); 
	        // +00.123 => [ , '+', '00', '.123', ..
	        if(notation){
	            // console.log(notation)
	            if(options.leadingZeros){ //accept with leading zeros
	                trimmedStr = (notation[1] || "") + notation[3];
	            }else {
	                if(notation[2] === "0" && notation[3][0]=== ".");else {
	                    return str;
	                }
	            }
	            return options.eNotation ? Number(trimmedStr) : str;
	        }else {
	            return str;
	        }
	    // }else if (options.parseBin && binRegex.test(str)) {
	    //     return Number.parseInt(val, 2);
	    }else {
	        //separate negative sign, leading zeros, and rest number
	        const match = numRegex.exec(trimmedStr);
	        // +00.123 => [ , '+', '00', '.123', ..
	        if(match){
	            const sign = match[1];
	            const leadingZeros = match[2];
	            let numTrimmedByZeros = trimZeros(match[3]); //complete num without leading zeros
	            //trim ending zeros for floating number
	            
	            if(!options.leadingZeros && leadingZeros.length > 0 && sign && trimmedStr[2] !== ".") return str; //-0123
	            else if(!options.leadingZeros && leadingZeros.length > 0 && !sign && trimmedStr[1] !== ".") return str; //0123
	            else if(options.leadingZeros && leadingZeros===str) return 0; //00
	            
	            else {//no leading zeros or leading zeros are allowed
	                const num = Number(trimmedStr);
	                const numStr = "" + num;

	                if(numStr.search(/[eE]/) !== -1){ //given number is long and parsed to eNotation
	                    if(options.eNotation) return num;
	                    else return str;
	                }else if(trimmedStr.indexOf(".") !== -1){ //floating number
	                    if(numStr === "0" && (numTrimmedByZeros === "") ) return num; //0.0
	                    else if(numStr === numTrimmedByZeros) return num; //0.456. 0.79000
	                    else if( sign && numStr === "-"+numTrimmedByZeros) return num;
	                    else return str;
	                }
	                
	                if(leadingZeros){
	                    return (numTrimmedByZeros === numStr) || (sign+numTrimmedByZeros === numStr) ? num : str
	                }else  {
	                    return (trimmedStr === numStr) || (trimmedStr === sign+numStr) ? num : str
	                }
	            }
	        }else { //non-numeric string
	            return str;
	        }
	    }
	}

	/**
	 * 
	 * @param {string} numStr without leading zeros
	 * @returns 
	 */
	function trimZeros(numStr){
	    if(numStr && numStr.indexOf(".") !== -1){//float
	        numStr = numStr.replace(/0+$/, ""); //remove ending zeros
	        if(numStr === ".")  numStr = "0";
	        else if(numStr[0] === ".")  numStr = "0"+numStr;
	        else if(numStr[numStr.length-1] === ".")  numStr = numStr.substr(0,numStr.length-1);
	        return numStr;
	    }
	    return numStr;
	}

	function parse_int(numStr, base){
	    //polyfill
	    if(parseInt) return parseInt(numStr, base);
	    else if(Number.parseInt) return Number.parseInt(numStr, base);
	    else if(window && window.parseInt) return window.parseInt(numStr, base);
	    else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported")
	}

	strnum = toNumber;
	return strnum;
}

var ignoreAttributes;
var hasRequiredIgnoreAttributes;

function requireIgnoreAttributes () {
	if (hasRequiredIgnoreAttributes) return ignoreAttributes;
	hasRequiredIgnoreAttributes = 1;
	function getIgnoreAttributesFn(ignoreAttributes) {
	    if (typeof ignoreAttributes === 'function') {
	        return ignoreAttributes
	    }
	    if (Array.isArray(ignoreAttributes)) {
	        return (attrName) => {
	            for (const pattern of ignoreAttributes) {
	                if (typeof pattern === 'string' && attrName === pattern) {
	                    return true
	                }
	                if (pattern instanceof RegExp && pattern.test(attrName)) {
	                    return true
	                }
	            }
	        }
	    }
	    return () => false
	}

	ignoreAttributes = getIgnoreAttributesFn;
	return ignoreAttributes;
}

var OrderedObjParser_1;
var hasRequiredOrderedObjParser;

function requireOrderedObjParser () {
	if (hasRequiredOrderedObjParser) return OrderedObjParser_1;
	hasRequiredOrderedObjParser = 1;
	///@ts-check

	const util = requireUtil();
	const xmlNode = requireXmlNode();
	const readDocType = requireDocTypeReader();
	const toNumber = requireStrnum();
	const getIgnoreAttributesFn = requireIgnoreAttributes();

	// const regx =
	//   '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)'
	//   .replace(/NAME/g, util.nameRegexp);

	//const tagsRegx = new RegExp("<(\\/?[\\w:\\-\._]+)([^>]*)>(\\s*"+cdataRegx+")*([^<]+)?","g");
	//const tagsRegx = new RegExp("<(\\/?)((\\w*:)?([\\w:\\-\._]+))([^>]*)>([^<]*)("+cdataRegx+"([^<]*))*([^<]+)?","g");

	class OrderedObjParser{
	  constructor(options){
	    this.options = options;
	    this.currentNode = null;
	    this.tagsNodeStack = [];
	    this.docTypeEntities = {};
	    this.lastEntities = {
	      "apos" : { regex: /&(apos|#39|#x27);/g, val : "'"},
	      "gt" : { regex: /&(gt|#62|#x3E);/g, val : ">"},
	      "lt" : { regex: /&(lt|#60|#x3C);/g, val : "<"},
	      "quot" : { regex: /&(quot|#34|#x22);/g, val : "\""},
	    };
	    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val : "&"};
	    this.htmlEntities = {
	      "space": { regex: /&(nbsp|#160);/g, val: " " },
	      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
	      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
	      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
	      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
	      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
	      "cent" : { regex: /&(cent|#162);/g, val: "¢" },
	      "pound" : { regex: /&(pound|#163);/g, val: "£" },
	      "yen" : { regex: /&(yen|#165);/g, val: "¥" },
	      "euro" : { regex: /&(euro|#8364);/g, val: "€" },
	      "copyright" : { regex: /&(copy|#169);/g, val: "©" },
	      "reg" : { regex: /&(reg|#174);/g, val: "®" },
	      "inr" : { regex: /&(inr|#8377);/g, val: "₹" },
	      "num_dec": { regex: /&#([0-9]{1,7});/g, val : (_, str) => String.fromCharCode(Number.parseInt(str, 10)) },
	      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val : (_, str) => String.fromCharCode(Number.parseInt(str, 16)) },
	    };
	    this.addExternalEntities = addExternalEntities;
	    this.parseXml = parseXml;
	    this.parseTextData = parseTextData;
	    this.resolveNameSpace = resolveNameSpace;
	    this.buildAttributesMap = buildAttributesMap;
	    this.isItStopNode = isItStopNode;
	    this.replaceEntitiesValue = replaceEntitiesValue;
	    this.readStopNodeData = readStopNodeData;
	    this.saveTextToParentTag = saveTextToParentTag;
	    this.addChild = addChild;
	    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
	  }

	}

	function addExternalEntities(externalEntities){
	  const entKeys = Object.keys(externalEntities);
	  for (let i = 0; i < entKeys.length; i++) {
	    const ent = entKeys[i];
	    this.lastEntities[ent] = {
	       regex: new RegExp("&"+ent+";","g"),
	       val : externalEntities[ent]
	    };
	  }
	}

	/**
	 * @param {string} val
	 * @param {string} tagName
	 * @param {string} jPath
	 * @param {boolean} dontTrim
	 * @param {boolean} hasAttributes
	 * @param {boolean} isLeafNode
	 * @param {boolean} escapeEntities
	 */
	function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
	  if (val !== undefined) {
	    if (this.options.trimValues && !dontTrim) {
	      val = val.trim();
	    }
	    if(val.length > 0){
	      if(!escapeEntities) val = this.replaceEntitiesValue(val);
	      
	      const newval = this.options.tagValueProcessor(tagName, val, jPath, hasAttributes, isLeafNode);
	      if(newval === null || newval === undefined){
	        //don't parse
	        return val;
	      }else if(typeof newval !== typeof val || newval !== val){
	        //overwrite
	        return newval;
	      }else if(this.options.trimValues){
	        return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
	      }else {
	        const trimmedVal = val.trim();
	        if(trimmedVal === val){
	          return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
	        }else {
	          return val;
	        }
	      }
	    }
	  }
	}

	function resolveNameSpace(tagname) {
	  if (this.options.removeNSPrefix) {
	    const tags = tagname.split(':');
	    const prefix = tagname.charAt(0) === '/' ? '/' : '';
	    if (tags[0] === 'xmlns') {
	      return '';
	    }
	    if (tags.length === 2) {
	      tagname = prefix + tags[1];
	    }
	  }
	  return tagname;
	}

	//TODO: change regex to capture NS
	//const attrsRegx = new RegExp("([\\w\\-\\.\\:]+)\\s*=\\s*(['\"])((.|\n)*?)\\2","gm");
	const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])([\\s\\S]*?)\\3)?', 'gm');

	function buildAttributesMap(attrStr, jPath, tagName) {
	  if (this.options.ignoreAttributes !== true && typeof attrStr === 'string') {
	    // attrStr = attrStr.replace(/\r?\n/g, ' ');
	    //attrStr = attrStr || attrStr.trim();

	    const matches = util.getAllMatches(attrStr, attrsRegx);
	    const len = matches.length; //don't make it inline
	    const attrs = {};
	    for (let i = 0; i < len; i++) {
	      const attrName = this.resolveNameSpace(matches[i][1]);
	      if (this.ignoreAttributesFn(attrName, jPath)) {
	        continue
	      }
	      let oldVal = matches[i][4];
	      let aName = this.options.attributeNamePrefix + attrName;
	      if (attrName.length) {
	        if (this.options.transformAttributeName) {
	          aName = this.options.transformAttributeName(aName);
	        }
	        if(aName === "__proto__") aName  = "#__proto__";
	        if (oldVal !== undefined) {
	          if (this.options.trimValues) {
	            oldVal = oldVal.trim();
	          }
	          oldVal = this.replaceEntitiesValue(oldVal);
	          const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
	          if(newVal === null || newVal === undefined){
	            //don't parse
	            attrs[aName] = oldVal;
	          }else if(typeof newVal !== typeof oldVal || newVal !== oldVal){
	            //overwrite
	            attrs[aName] = newVal;
	          }else {
	            //parse
	            attrs[aName] = parseValue(
	              oldVal,
	              this.options.parseAttributeValue,
	              this.options.numberParseOptions
	            );
	          }
	        } else if (this.options.allowBooleanAttributes) {
	          attrs[aName] = true;
	        }
	      }
	    }
	    if (!Object.keys(attrs).length) {
	      return;
	    }
	    if (this.options.attributesGroupName) {
	      const attrCollection = {};
	      attrCollection[this.options.attributesGroupName] = attrs;
	      return attrCollection;
	    }
	    return attrs
	  }
	}

	const parseXml = function(xmlData) {
	  xmlData = xmlData.replace(/\r\n?/g, "\n"); //TODO: remove this line
	  const xmlObj = new xmlNode('!xml');
	  let currentNode = xmlObj;
	  let textData = "";
	  let jPath = "";
	  for(let i=0; i< xmlData.length; i++){//for each char in XML data
	    const ch = xmlData[i];
	    if(ch === '<'){
	      // const nextIndex = i+1;
	      // const _2ndChar = xmlData[nextIndex];
	      if( xmlData[i+1] === '/') {//Closing Tag
	        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
	        let tagName = xmlData.substring(i+2,closeIndex).trim();

	        if(this.options.removeNSPrefix){
	          const colonIndex = tagName.indexOf(":");
	          if(colonIndex !== -1){
	            tagName = tagName.substr(colonIndex+1);
	          }
	        }

	        if(this.options.transformTagName) {
	          tagName = this.options.transformTagName(tagName);
	        }

	        if(currentNode){
	          textData = this.saveTextToParentTag(textData, currentNode, jPath);
	        }

	        //check if last tag of nested tag was unpaired tag
	        const lastTagName = jPath.substring(jPath.lastIndexOf(".")+1);
	        if(tagName && this.options.unpairedTags.indexOf(tagName) !== -1 ){
	          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
	        }
	        let propIndex = 0;
	        if(lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1 ){
	          propIndex = jPath.lastIndexOf('.', jPath.lastIndexOf('.')-1);
	          this.tagsNodeStack.pop();
	        }else {
	          propIndex = jPath.lastIndexOf(".");
	        }
	        jPath = jPath.substring(0, propIndex);

	        currentNode = this.tagsNodeStack.pop();//avoid recursion, set the parent tag scope
	        textData = "";
	        i = closeIndex;
	      } else if( xmlData[i+1] === '?') {

	        let tagData = readTagExp(xmlData,i, false, "?>");
	        if(!tagData) throw new Error("Pi Tag is not closed.");

	        textData = this.saveTextToParentTag(textData, currentNode, jPath);
	        if( (this.options.ignoreDeclaration && tagData.tagName === "?xml") || this.options.ignorePiTags);else {
	  
	          const childNode = new xmlNode(tagData.tagName);
	          childNode.add(this.options.textNodeName, "");
	          
	          if(tagData.tagName !== tagData.tagExp && tagData.attrExpPresent){
	            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
	          }
	          this.addChild(currentNode, childNode, jPath);

	        }


	        i = tagData.closeIndex + 1;
	      } else if(xmlData.substr(i + 1, 3) === '!--') {
	        const endIndex = findClosingIndex(xmlData, "-->", i+4, "Comment is not closed.");
	        if(this.options.commentPropName){
	          const comment = xmlData.substring(i + 4, endIndex - 2);

	          textData = this.saveTextToParentTag(textData, currentNode, jPath);

	          currentNode.add(this.options.commentPropName, [ { [this.options.textNodeName] : comment } ]);
	        }
	        i = endIndex;
	      } else if( xmlData.substr(i + 1, 2) === '!D') {
	        const result = readDocType(xmlData, i);
	        this.docTypeEntities = result.entities;
	        i = result.i;
	      }else if(xmlData.substr(i + 1, 2) === '![') {
	        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
	        const tagExp = xmlData.substring(i + 9,closeIndex);

	        textData = this.saveTextToParentTag(textData, currentNode, jPath);

	        let val = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
	        if(val == undefined) val = "";

	        //cdata should be set even if it is 0 length string
	        if(this.options.cdataPropName){
	          currentNode.add(this.options.cdataPropName, [ { [this.options.textNodeName] : tagExp } ]);
	        }else {
	          currentNode.add(this.options.textNodeName, val);
	        }
	        
	        i = closeIndex + 2;
	      }else {//Opening tag
	        let result = readTagExp(xmlData,i, this.options.removeNSPrefix);
	        let tagName= result.tagName;
	        const rawTagName = result.rawTagName;
	        let tagExp = result.tagExp;
	        let attrExpPresent = result.attrExpPresent;
	        let closeIndex = result.closeIndex;

	        if (this.options.transformTagName) {
	          tagName = this.options.transformTagName(tagName);
	        }
	        
	        //save text as child node
	        if (currentNode && textData) {
	          if(currentNode.tagname !== '!xml'){
	            //when nested tag is found
	            textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
	          }
	        }

	        //check if last tag was unpaired tag
	        const lastTag = currentNode;
	        if(lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1 ){
	          currentNode = this.tagsNodeStack.pop();
	          jPath = jPath.substring(0, jPath.lastIndexOf("."));
	        }
	        if(tagName !== xmlObj.tagname){
	          jPath += jPath ? "." + tagName : tagName;
	        }
	        if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
	          let tagContent = "";
	          //self-closing tag
	          if(tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1){
	            if(tagName[tagName.length - 1] === "/"){ //remove trailing '/'
	              tagName = tagName.substr(0, tagName.length - 1);
	              jPath = jPath.substr(0, jPath.length - 1);
	              tagExp = tagName;
	            }else {
	              tagExp = tagExp.substr(0, tagExp.length - 1);
	            }
	            i = result.closeIndex;
	          }
	          //unpaired tag
	          else if(this.options.unpairedTags.indexOf(tagName) !== -1){
	            
	            i = result.closeIndex;
	          }
	          //normal tag
	          else {
	            //read until closing tag is found
	            const result = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
	            if(!result) throw new Error(`Unexpected end of ${rawTagName}`);
	            i = result.i;
	            tagContent = result.tagContent;
	          }

	          const childNode = new xmlNode(tagName);
	          if(tagName !== tagExp && attrExpPresent){
	            childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
	          }
	          if(tagContent) {
	            tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
	          }
	          
	          jPath = jPath.substr(0, jPath.lastIndexOf("."));
	          childNode.add(this.options.textNodeName, tagContent);
	          
	          this.addChild(currentNode, childNode, jPath);
	        }else {
	  //selfClosing tag
	          if(tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1){
	            if(tagName[tagName.length - 1] === "/"){ //remove trailing '/'
	              tagName = tagName.substr(0, tagName.length - 1);
	              jPath = jPath.substr(0, jPath.length - 1);
	              tagExp = tagName;
	            }else {
	              tagExp = tagExp.substr(0, tagExp.length - 1);
	            }
	            
	            if(this.options.transformTagName) {
	              tagName = this.options.transformTagName(tagName);
	            }

	            const childNode = new xmlNode(tagName);
	            if(tagName !== tagExp && attrExpPresent){
	              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
	            }
	            this.addChild(currentNode, childNode, jPath);
	            jPath = jPath.substr(0, jPath.lastIndexOf("."));
	          }
	    //opening tag
	          else {
	            const childNode = new xmlNode( tagName);
	            this.tagsNodeStack.push(currentNode);
	            
	            if(tagName !== tagExp && attrExpPresent){
	              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
	            }
	            this.addChild(currentNode, childNode, jPath);
	            currentNode = childNode;
	          }
	          textData = "";
	          i = closeIndex;
	        }
	      }
	    }else {
	      textData += xmlData[i];
	    }
	  }
	  return xmlObj.child;
	};

	function addChild(currentNode, childNode, jPath){
	  const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
	  if(result === false);else if(typeof result === "string"){
	    childNode.tagname = result;
	    currentNode.addChild(childNode);
	  }else {
	    currentNode.addChild(childNode);
	  }
	}

	const replaceEntitiesValue = function(val){

	  if(this.options.processEntities){
	    for(let entityName in this.docTypeEntities){
	      const entity = this.docTypeEntities[entityName];
	      val = val.replace( entity.regx, entity.val);
	    }
	    for(let entityName in this.lastEntities){
	      const entity = this.lastEntities[entityName];
	      val = val.replace( entity.regex, entity.val);
	    }
	    if(this.options.htmlEntities){
	      for(let entityName in this.htmlEntities){
	        const entity = this.htmlEntities[entityName];
	        val = val.replace( entity.regex, entity.val);
	      }
	    }
	    val = val.replace( this.ampEntity.regex, this.ampEntity.val);
	  }
	  return val;
	};
	function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
	  if (textData) { //store previously collected data as textNode
	    if(isLeafNode === undefined) isLeafNode = currentNode.child.length === 0;
	    
	    textData = this.parseTextData(textData,
	      currentNode.tagname,
	      jPath,
	      false,
	      currentNode[":@"] ? Object.keys(currentNode[":@"]).length !== 0 : false,
	      isLeafNode);

	    if (textData !== undefined && textData !== "")
	      currentNode.add(this.options.textNodeName, textData);
	    textData = "";
	  }
	  return textData;
	}

	//TODO: use jPath to simplify the logic
	/**
	 * 
	 * @param {string[]} stopNodes 
	 * @param {string} jPath
	 * @param {string} currentTagName 
	 */
	function isItStopNode(stopNodes, jPath, currentTagName){
	  const allNodesExp = "*." + currentTagName;
	  for (const stopNodePath in stopNodes) {
	    const stopNodeExp = stopNodes[stopNodePath];
	    if( allNodesExp === stopNodeExp || jPath === stopNodeExp  ) return true;
	  }
	  return false;
	}

	/**
	 * Returns the tag Expression and where it is ending handling single-double quotes situation
	 * @param {string} xmlData 
	 * @param {number} i starting index
	 * @returns 
	 */
	function tagExpWithClosingIndex(xmlData, i, closingChar = ">"){
	  let attrBoundary;
	  let tagExp = "";
	  for (let index = i; index < xmlData.length; index++) {
	    let ch = xmlData[index];
	    if (attrBoundary) {
	        if (ch === attrBoundary) attrBoundary = "";//reset
	    } else if (ch === '"' || ch === "'") {
	        attrBoundary = ch;
	    } else if (ch === closingChar[0]) {
	      if(closingChar[1]){
	        if(xmlData[index + 1] === closingChar[1]){
	          return {
	            data: tagExp,
	            index: index
	          }
	        }
	      }else {
	        return {
	          data: tagExp,
	          index: index
	        }
	      }
	    } else if (ch === '\t') {
	      ch = " ";
	    }
	    tagExp += ch;
	  }
	}

	function findClosingIndex(xmlData, str, i, errMsg){
	  const closingIndex = xmlData.indexOf(str, i);
	  if(closingIndex === -1){
	    throw new Error(errMsg)
	  }else {
	    return closingIndex + str.length - 1;
	  }
	}

	function readTagExp(xmlData,i, removeNSPrefix, closingChar = ">"){
	  const result = tagExpWithClosingIndex(xmlData, i+1, closingChar);
	  if(!result) return;
	  let tagExp = result.data;
	  const closeIndex = result.index;
	  const separatorIndex = tagExp.search(/\s/);
	  let tagName = tagExp;
	  let attrExpPresent = true;
	  if(separatorIndex !== -1){//separate tag name and attributes expression
	    tagName = tagExp.substring(0, separatorIndex);
	    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
	  }

	  const rawTagName = tagName;
	  if(removeNSPrefix){
	    const colonIndex = tagName.indexOf(":");
	    if(colonIndex !== -1){
	      tagName = tagName.substr(colonIndex+1);
	      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
	    }
	  }

	  return {
	    tagName: tagName,
	    tagExp: tagExp,
	    closeIndex: closeIndex,
	    attrExpPresent: attrExpPresent,
	    rawTagName: rawTagName,
	  }
	}
	/**
	 * find paired tag for a stop node
	 * @param {string} xmlData 
	 * @param {string} tagName 
	 * @param {number} i 
	 */
	function readStopNodeData(xmlData, tagName, i){
	  const startIndex = i;
	  // Starting at 1 since we already have an open tag
	  let openTagCount = 1;

	  for (; i < xmlData.length; i++) {
	    if( xmlData[i] === "<"){ 
	      if (xmlData[i+1] === "/") {//close tag
	          const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
	          let closeTagName = xmlData.substring(i+2,closeIndex).trim();
	          if(closeTagName === tagName){
	            openTagCount--;
	            if (openTagCount === 0) {
	              return {
	                tagContent: xmlData.substring(startIndex, i),
	                i : closeIndex
	              }
	            }
	          }
	          i=closeIndex;
	        } else if(xmlData[i+1] === '?') { 
	          const closeIndex = findClosingIndex(xmlData, "?>", i+1, "StopNode is not closed.");
	          i=closeIndex;
	        } else if(xmlData.substr(i + 1, 3) === '!--') { 
	          const closeIndex = findClosingIndex(xmlData, "-->", i+3, "StopNode is not closed.");
	          i=closeIndex;
	        } else if(xmlData.substr(i + 1, 2) === '![') { 
	          const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
	          i=closeIndex;
	        } else {
	          const tagData = readTagExp(xmlData, i, '>');

	          if (tagData) {
	            const openTagName = tagData && tagData.tagName;
	            if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length-1] !== "/") {
	              openTagCount++;
	            }
	            i=tagData.closeIndex;
	          }
	        }
	      }
	  }//end for loop
	}

	function parseValue(val, shouldParse, options) {
	  if (shouldParse && typeof val === 'string') {
	    //console.log(options)
	    const newval = val.trim();
	    if(newval === 'true' ) return true;
	    else if(newval === 'false' ) return false;
	    else return toNumber(val, options);
	  } else {
	    if (util.isExist(val)) {
	      return val;
	    } else {
	      return '';
	    }
	  }
	}


	OrderedObjParser_1 = OrderedObjParser;
	return OrderedObjParser_1;
}

var node2json = {};

var hasRequiredNode2json;

function requireNode2json () {
	if (hasRequiredNode2json) return node2json;
	hasRequiredNode2json = 1;

	/**
	 * 
	 * @param {array} node 
	 * @param {any} options 
	 * @returns 
	 */
	function prettify(node, options){
	  return compress( node, options);
	}

	/**
	 * 
	 * @param {array} arr 
	 * @param {object} options 
	 * @param {string} jPath 
	 * @returns object
	 */
	function compress(arr, options, jPath){
	  let text;
	  const compressedObj = {};
	  for (let i = 0; i < arr.length; i++) {
	    const tagObj = arr[i];
	    const property = propName(tagObj);
	    let newJpath = "";
	    if(jPath === undefined) newJpath = property;
	    else newJpath = jPath + "." + property;

	    if(property === options.textNodeName){
	      if(text === undefined) text = tagObj[property];
	      else text += "" + tagObj[property];
	    }else if(property === undefined){
	      continue;
	    }else if(tagObj[property]){
	      
	      let val = compress(tagObj[property], options, newJpath);
	      const isLeaf = isLeafTag(val, options);

	      if(tagObj[":@"]){
	        assignAttributes( val, tagObj[":@"], newJpath, options);
	      }else if(Object.keys(val).length === 1 && val[options.textNodeName] !== undefined && !options.alwaysCreateTextNode){
	        val = val[options.textNodeName];
	      }else if(Object.keys(val).length === 0){
	        if(options.alwaysCreateTextNode) val[options.textNodeName] = "";
	        else val = "";
	      }

	      if(compressedObj[property] !== undefined && compressedObj.hasOwnProperty(property)) {
	        if(!Array.isArray(compressedObj[property])) {
	            compressedObj[property] = [ compressedObj[property] ];
	        }
	        compressedObj[property].push(val);
	      }else {
	        //TODO: if a node is not an array, then check if it should be an array
	        //also determine if it is a leaf node
	        if (options.isArray(property, newJpath, isLeaf )) {
	          compressedObj[property] = [val];
	        }else {
	          compressedObj[property] = val;
	        }
	      }
	    }
	    
	  }
	  // if(text && text.length > 0) compressedObj[options.textNodeName] = text;
	  if(typeof text === "string"){
	    if(text.length > 0) compressedObj[options.textNodeName] = text;
	  }else if(text !== undefined) compressedObj[options.textNodeName] = text;
	  return compressedObj;
	}

	function propName(obj){
	  const keys = Object.keys(obj);
	  for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
	    if(key !== ":@") return key;
	  }
	}

	function assignAttributes(obj, attrMap, jpath, options){
	  if (attrMap) {
	    const keys = Object.keys(attrMap);
	    const len = keys.length; //don't make it inline
	    for (let i = 0; i < len; i++) {
	      const atrrName = keys[i];
	      if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
	        obj[atrrName] = [ attrMap[atrrName] ];
	      } else {
	        obj[atrrName] = attrMap[atrrName];
	      }
	    }
	  }
	}

	function isLeafTag(obj, options){
	  const { textNodeName } = options;
	  const propCount = Object.keys(obj).length;
	  
	  if (propCount === 0) {
	    return true;
	  }

	  if (
	    propCount === 1 &&
	    (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)
	  ) {
	    return true;
	  }

	  return false;
	}
	node2json.prettify = prettify;
	return node2json;
}

var XMLParser_1;
var hasRequiredXMLParser;

function requireXMLParser () {
	if (hasRequiredXMLParser) return XMLParser_1;
	hasRequiredXMLParser = 1;
	const { buildOptions} = requireOptionsBuilder();
	const OrderedObjParser = requireOrderedObjParser();
	const { prettify} = requireNode2json();
	const validator = requireValidator();

	class XMLParser{
	    
	    constructor(options){
	        this.externalEntities = {};
	        this.options = buildOptions(options);
	        
	    }
	    /**
	     * Parse XML dats to JS object 
	     * @param {string|Buffer} xmlData 
	     * @param {boolean|Object} validationOption 
	     */
	    parse(xmlData,validationOption){
	        if(typeof xmlData === "string");else if( xmlData.toString){
	            xmlData = xmlData.toString();
	        }else {
	            throw new Error("XML data is accepted in String or Bytes[] form.")
	        }
	        if( validationOption){
	            if(validationOption === true) validationOption = {}; //validate with default options
	            
	            const result = validator.validate(xmlData, validationOption);
	            if (result !== true) {
	              throw Error( `${result.err.msg}:${result.err.line}:${result.err.col}` )
	            }
	          }
	        const orderedObjParser = new OrderedObjParser(this.options);
	        orderedObjParser.addExternalEntities(this.externalEntities);
	        const orderedResult = orderedObjParser.parseXml(xmlData);
	        if(this.options.preserveOrder || orderedResult === undefined) return orderedResult;
	        else return prettify(orderedResult, this.options);
	    }

	    /**
	     * Add Entity which is not by default supported by this library
	     * @param {string} key 
	     * @param {string} value 
	     */
	    addEntity(key, value){
	        if(value.indexOf("&") !== -1){
	            throw new Error("Entity value can't have '&'")
	        }else if(key.indexOf("&") !== -1 || key.indexOf(";") !== -1){
	            throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'")
	        }else if(value === "&"){
	            throw new Error("An entity with value '&' is not permitted");
	        }else {
	            this.externalEntities[key] = value;
	        }
	    }
	}

	XMLParser_1 = XMLParser;
	return XMLParser_1;
}

var orderedJs2Xml;
var hasRequiredOrderedJs2Xml;

function requireOrderedJs2Xml () {
	if (hasRequiredOrderedJs2Xml) return orderedJs2Xml;
	hasRequiredOrderedJs2Xml = 1;
	const EOL = "\n";

	/**
	 * 
	 * @param {array} jArray 
	 * @param {any} options 
	 * @returns 
	 */
	function toXml(jArray, options) {
	    let indentation = "";
	    if (options.format && options.indentBy.length > 0) {
	        indentation = EOL;
	    }
	    return arrToStr(jArray, options, "", indentation);
	}

	function arrToStr(arr, options, jPath, indentation) {
	    let xmlStr = "";
	    let isPreviousElementTag = false;

	    for (let i = 0; i < arr.length; i++) {
	        const tagObj = arr[i];
	        const tagName = propName(tagObj);
	        if(tagName === undefined) continue;

	        let newJPath = "";
	        if (jPath.length === 0) newJPath = tagName;
	        else newJPath = `${jPath}.${tagName}`;

	        if (tagName === options.textNodeName) {
	            let tagText = tagObj[tagName];
	            if (!isStopNode(newJPath, options)) {
	                tagText = options.tagValueProcessor(tagName, tagText);
	                tagText = replaceEntitiesValue(tagText, options);
	            }
	            if (isPreviousElementTag) {
	                xmlStr += indentation;
	            }
	            xmlStr += tagText;
	            isPreviousElementTag = false;
	            continue;
	        } else if (tagName === options.cdataPropName) {
	            if (isPreviousElementTag) {
	                xmlStr += indentation;
	            }
	            xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
	            isPreviousElementTag = false;
	            continue;
	        } else if (tagName === options.commentPropName) {
	            xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
	            isPreviousElementTag = true;
	            continue;
	        } else if (tagName[0] === "?") {
	            const attStr = attr_to_str(tagObj[":@"], options);
	            const tempInd = tagName === "?xml" ? "" : indentation;
	            let piTextNodeName = tagObj[tagName][0][options.textNodeName];
	            piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : ""; //remove extra spacing
	            xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr}?>`;
	            isPreviousElementTag = true;
	            continue;
	        }
	        let newIdentation = indentation;
	        if (newIdentation !== "") {
	            newIdentation += options.indentBy;
	        }
	        const attStr = attr_to_str(tagObj[":@"], options);
	        const tagStart = indentation + `<${tagName}${attStr}`;
	        const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
	        if (options.unpairedTags.indexOf(tagName) !== -1) {
	            if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
	            else xmlStr += tagStart + "/>";
	        } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
	            xmlStr += tagStart + "/>";
	        } else if (tagValue && tagValue.endsWith(">")) {
	            xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
	        } else {
	            xmlStr += tagStart + ">";
	            if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
	                xmlStr += indentation + options.indentBy + tagValue + indentation;
	            } else {
	                xmlStr += tagValue;
	            }
	            xmlStr += `</${tagName}>`;
	        }
	        isPreviousElementTag = true;
	    }

	    return xmlStr;
	}

	function propName(obj) {
	    const keys = Object.keys(obj);
	    for (let i = 0; i < keys.length; i++) {
	        const key = keys[i];
	        if(!obj.hasOwnProperty(key)) continue;
	        if (key !== ":@") return key;
	    }
	}

	function attr_to_str(attrMap, options) {
	    let attrStr = "";
	    if (attrMap && !options.ignoreAttributes) {
	        for (let attr in attrMap) {
	            if(!attrMap.hasOwnProperty(attr)) continue;
	            let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
	            attrVal = replaceEntitiesValue(attrVal, options);
	            if (attrVal === true && options.suppressBooleanAttributes) {
	                attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
	            } else {
	                attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
	            }
	        }
	    }
	    return attrStr;
	}

	function isStopNode(jPath, options) {
	    jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
	    let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
	    for (let index in options.stopNodes) {
	        if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName) return true;
	    }
	    return false;
	}

	function replaceEntitiesValue(textValue, options) {
	    if (textValue && textValue.length > 0 && options.processEntities) {
	        for (let i = 0; i < options.entities.length; i++) {
	            const entity = options.entities[i];
	            textValue = textValue.replace(entity.regex, entity.val);
	        }
	    }
	    return textValue;
	}
	orderedJs2Xml = toXml;
	return orderedJs2Xml;
}

var json2xml;
var hasRequiredJson2xml;

function requireJson2xml () {
	if (hasRequiredJson2xml) return json2xml;
	hasRequiredJson2xml = 1;
	//parse Empty Node as self closing node
	const buildFromOrderedJs = requireOrderedJs2Xml();
	const getIgnoreAttributesFn = requireIgnoreAttributes();

	const defaultOptions = {
	  attributeNamePrefix: '@_',
	  attributesGroupName: false,
	  textNodeName: '#text',
	  ignoreAttributes: true,
	  cdataPropName: false,
	  format: false,
	  indentBy: '  ',
	  suppressEmptyNode: false,
	  suppressUnpairedNode: true,
	  suppressBooleanAttributes: true,
	  tagValueProcessor: function(key, a) {
	    return a;
	  },
	  attributeValueProcessor: function(attrName, a) {
	    return a;
	  },
	  preserveOrder: false,
	  commentPropName: false,
	  unpairedTags: [],
	  entities: [
	    { regex: new RegExp("&", "g"), val: "&amp;" },//it must be on top
	    { regex: new RegExp(">", "g"), val: "&gt;" },
	    { regex: new RegExp("<", "g"), val: "&lt;" },
	    { regex: new RegExp("\'", "g"), val: "&apos;" },
	    { regex: new RegExp("\"", "g"), val: "&quot;" }
	  ],
	  processEntities: true,
	  stopNodes: [],
	  // transformTagName: false,
	  // transformAttributeName: false,
	  oneListGroup: false
	};

	function Builder(options) {
	  this.options = Object.assign({}, defaultOptions, options);
	  if (this.options.ignoreAttributes === true || this.options.attributesGroupName) {
	    this.isAttribute = function(/*a*/) {
	      return false;
	    };
	  } else {
	    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
	    this.attrPrefixLen = this.options.attributeNamePrefix.length;
	    this.isAttribute = isAttribute;
	  }

	  this.processTextOrObjNode = processTextOrObjNode;

	  if (this.options.format) {
	    this.indentate = indentate;
	    this.tagEndChar = '>\n';
	    this.newLine = '\n';
	  } else {
	    this.indentate = function() {
	      return '';
	    };
	    this.tagEndChar = '>';
	    this.newLine = '';
	  }
	}

	Builder.prototype.build = function(jObj) {
	  if(this.options.preserveOrder){
	    return buildFromOrderedJs(jObj, this.options);
	  }else {
	    if(Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1){
	      jObj = {
	        [this.options.arrayNodeName] : jObj
	      };
	    }
	    return this.j2x(jObj, 0, []).val;
	  }
	};

	Builder.prototype.j2x = function(jObj, level, ajPath) {
	  let attrStr = '';
	  let val = '';
	  const jPath = ajPath.join('.');
	  for (let key in jObj) {
	    if(!Object.prototype.hasOwnProperty.call(jObj, key)) continue;
	    if (typeof jObj[key] === 'undefined') {
	      // supress undefined node only if it is not an attribute
	      if (this.isAttribute(key)) {
	        val += '';
	      }
	    } else if (jObj[key] === null) {
	      // null attribute should be ignored by the attribute list, but should not cause the tag closing
	      if (this.isAttribute(key)) {
	        val += '';
	      } else if (key === this.options.cdataPropName) {
	        val += '';
	      } else if (key[0] === '?') {
	        val += this.indentate(level) + '<' + key + '?' + this.tagEndChar;
	      } else {
	        val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
	      }
	      // val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
	    } else if (jObj[key] instanceof Date) {
	      val += this.buildTextValNode(jObj[key], key, '', level);
	    } else if (typeof jObj[key] !== 'object') {
	      //premitive type
	      const attr = this.isAttribute(key);
	      if (attr && !this.ignoreAttributesFn(attr, jPath)) {
	        attrStr += this.buildAttrPairStr(attr, '' + jObj[key]);
	      } else if (!attr) {
	        //tag value
	        if (key === this.options.textNodeName) {
	          let newval = this.options.tagValueProcessor(key, '' + jObj[key]);
	          val += this.replaceEntitiesValue(newval);
	        } else {
	          val += this.buildTextValNode(jObj[key], key, '', level);
	        }
	      }
	    } else if (Array.isArray(jObj[key])) {
	      //repeated nodes
	      const arrLen = jObj[key].length;
	      let listTagVal = "";
	      let listTagAttr = "";
	      for (let j = 0; j < arrLen; j++) {
	        const item = jObj[key][j];
	        if (typeof item === 'undefined') ; else if (item === null) {
	          if(key[0] === "?") val += this.indentate(level) + '<' + key + '?' + this.tagEndChar;
	          else val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
	          // val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
	        } else if (typeof item === 'object') {
	          if(this.options.oneListGroup){
	            const result = this.j2x(item, level + 1, ajPath.concat(key));
	            listTagVal += result.val;
	            if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
	              listTagAttr += result.attrStr;
	            }
	          }else {
	            listTagVal += this.processTextOrObjNode(item, key, level, ajPath);
	          }
	        } else {
	          if (this.options.oneListGroup) {
	            let textValue = this.options.tagValueProcessor(key, item);
	            textValue = this.replaceEntitiesValue(textValue);
	            listTagVal += textValue;
	          } else {
	            listTagVal += this.buildTextValNode(item, key, '', level);
	          }
	        }
	      }
	      if(this.options.oneListGroup){
	        listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
	      }
	      val += listTagVal;
	    } else {
	      //nested node
	      if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
	        const Ks = Object.keys(jObj[key]);
	        const L = Ks.length;
	        for (let j = 0; j < L; j++) {
	          attrStr += this.buildAttrPairStr(Ks[j], '' + jObj[key][Ks[j]]);
	        }
	      } else {
	        val += this.processTextOrObjNode(jObj[key], key, level, ajPath);
	      }
	    }
	  }
	  return {attrStr: attrStr, val: val};
	};

	Builder.prototype.buildAttrPairStr = function(attrName, val){
	  val = this.options.attributeValueProcessor(attrName, '' + val);
	  val = this.replaceEntitiesValue(val);
	  if (this.options.suppressBooleanAttributes && val === "true") {
	    return ' ' + attrName;
	  } else return ' ' + attrName + '="' + val + '"';
	};

	function processTextOrObjNode (object, key, level, ajPath) {
	  const result = this.j2x(object, level + 1, ajPath.concat(key));
	  if (object[this.options.textNodeName] !== undefined && Object.keys(object).length === 1) {
	    return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
	  } else {
	    return this.buildObjectNode(result.val, key, result.attrStr, level);
	  }
	}

	Builder.prototype.buildObjectNode = function(val, key, attrStr, level) {
	  if(val === ""){
	    if(key[0] === "?") return  this.indentate(level) + '<' + key + attrStr+ '?' + this.tagEndChar;
	    else {
	      return this.indentate(level) + '<' + key + attrStr + this.closeTag(key) + this.tagEndChar;
	    }
	  }else {

	    let tagEndExp = '</' + key + this.tagEndChar;
	    let piClosingChar = "";
	    
	    if(key[0] === "?") {
	      piClosingChar = "?";
	      tagEndExp = "";
	    }
	  
	    // attrStr is an empty string in case the attribute came as undefined or null
	    if ((attrStr || attrStr === '') && val.indexOf('<') === -1) {
	      return ( this.indentate(level) + '<' +  key + attrStr + piClosingChar + '>' + val + tagEndExp );
	    } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
	      return this.indentate(level) + `<!--${val}-->` + this.newLine;
	    }else {
	      return (
	        this.indentate(level) + '<' + key + attrStr + piClosingChar + this.tagEndChar +
	        val +
	        this.indentate(level) + tagEndExp    );
	    }
	  }
	};

	Builder.prototype.closeTag = function(key){
	  let closeTag = "";
	  if(this.options.unpairedTags.indexOf(key) !== -1){ //unpaired
	    if(!this.options.suppressUnpairedNode) closeTag = "/";
	  }else if(this.options.suppressEmptyNode){ //empty
	    closeTag = "/";
	  }else {
	    closeTag = `></${key}`;
	  }
	  return closeTag;
	};

	Builder.prototype.buildTextValNode = function(val, key, attrStr, level) {
	  if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
	    return this.indentate(level) + `<![CDATA[${val}]]>` +  this.newLine;
	  }else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
	    return this.indentate(level) + `<!--${val}-->` +  this.newLine;
	  }else if(key[0] === "?") {//PI tag
	    return  this.indentate(level) + '<' + key + attrStr+ '?' + this.tagEndChar; 
	  }else {
	    let textValue = this.options.tagValueProcessor(key, val);
	    textValue = this.replaceEntitiesValue(textValue);
	  
	    if( textValue === ''){
	      return this.indentate(level) + '<' + key + attrStr + this.closeTag(key) + this.tagEndChar;
	    }else {
	      return this.indentate(level) + '<' + key + attrStr + '>' +
	         textValue +
	        '</' + key + this.tagEndChar;
	    }
	  }
	};

	Builder.prototype.replaceEntitiesValue = function(textValue){
	  if(textValue && textValue.length > 0 && this.options.processEntities){
	    for (let i=0; i<this.options.entities.length; i++) {
	      const entity = this.options.entities[i];
	      textValue = textValue.replace(entity.regex, entity.val);
	    }
	  }
	  return textValue;
	};

	function indentate(level) {
	  return this.options.indentBy.repeat(level);
	}

	function isAttribute(name /*, options*/) {
	  if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
	    return name.substr(this.attrPrefixLen);
	  } else {
	    return false;
	  }
	}

	json2xml = Builder;
	return json2xml;
}

var fxp;
var hasRequiredFxp;

function requireFxp () {
	if (hasRequiredFxp) return fxp;
	hasRequiredFxp = 1;

	const validator = requireValidator();
	const XMLParser = requireXMLParser();
	const XMLBuilder = requireJson2xml();

	fxp = {
	  XMLParser: XMLParser,
	  XMLValidator: validator,
	  XMLBuilder: XMLBuilder
	};
	return fxp;
}

var fxpExports = requireFxp();

// FILE: src/utils/utils.kmet.ts
// -------------------------------------------------------------------------------------------------
// KMET (Keyboard Maestro Edit‑as‑Text) — Node/TypeScript helpers
// -------------------------------------------------------------------------------------------------
// This module condenses the functionality of Dan Thomas's excellent "KMET: Edit KM Objects as Text"
// macro library (v1.3)¹ into a single, strongly‑typed utility that can be consumed by JavaScript/
// TypeScript projects.  It focuses on the *text* transformation pieces rather than the KM‑UI glue
// (copy‑as‑XML menus, GUI scripting, etc.), which are better handled by existing KMJS helpers.
//
// ¹ https://forum.keyboardmaestro.com/t/kmet-edit-km-objects-as-text-search-replace-version-1-3/22549
//
// Credits:
//   • Dan Thomas — original KMET macros and JavaScript for Automation logic.
//   • KM community members who contributed testing and refinements.
// -------------------------------------------------------------------------------------------------
// Key capabilities exposed here:
//   • encodeTextForJson / encodeTextForXml – escape arbitrary strings so they can be embedded in JSON
//     or XML literal values inside KM actions/macros.
//   • xmlToJson / jsonToXml                – loss‑tolerant bidirectional conversion between KM's
//     plist‑XML snippets and a more readable JSON form, using fast‑xml‑parser under the hood.
//   • searchReplaceInText                  – one‑shot RegExp or literal search‑and‑replace that plays
//     nicely with either XML or JSON blocks (handy for variable refactors).
//   • CLI (ts‑node)                        – run `yarn kmet` for a mini‑tool that wraps the helpers
//     for quick one‑off terminal use (encode, decode, convert, replace, etc.).
//
// All functions log through chalk‑colourised messages so that errors/warnings stand out during
// development but remain silent when imported as a library.
// -------------------------------------------------------------------------------------------------
// Usage examples:
//   import {
//     encodeTextForJson,
//     encodeTextForXml,
//     xmlToJson,
//     jsonToXml,
//     searchReplaceInText,
//   } from "./utils/utils.kmet";
//
//   const escaped = encodeTextForXml("< & > ' \"");
//   const json    = xmlToJson(kmXmlSnippet);
//   const xml     = jsonToXml(jsonObject);
//   const updated = searchReplaceInText(json, /Local_/g, "Global_");
// -------------------------------------------------------------------------------------------------
// ------------------------------
// XML Parser Configuration
// ------------------------------
// These options configure fast-xml-parser to handle Keyboard Maestro's plist XML format
// in a way that preserves the structure and allows round-trip conversion
/**
 * Configuration for parsing XML to JavaScript objects.
 * Tailored for Keyboard Maestro's plist XML structure.
 */
const XML_PARSE_OPTIONS = {
    /** Preserve XML attributes during parsing (essential for KM XML) */
    ignoreAttributes: false,
    /** Prefix for attribute names to distinguish from element content */
    attributeNamePrefix: "@_", // e.g., id="1" becomes "@_id": "1"
    /** Name for text content nodes when mixed with attributes */
    textNodeName: "#text", // e.g., <item id="1">text</item> becomes { "@_id": "1", "#text": "text" }
    /** Don't trim whitespace from values (preserves KM formatting) */
    trimValues: false,
    /** Don't parse tag values as numbers/booleans (keep as strings) */
    parseTagValue: false,
    /** Don't parse attribute values as numbers/booleans (keep as strings) */
    parseAttributeValue: false,
};
/**
 * Configuration for building XML from JavaScript objects.
 * Matches Keyboard Maestro's formatting conventions.
 */
const XML_BUILD_OPTIONS = {
    /** Include attributes in XML output */
    ignoreAttributes: false,
    /** Attribute prefix must match parsing configuration */
    attributeNamePrefix: "@_",
    /** Text node name must match parsing configuration */
    textNodeName: "#text",
    /** Pretty-print XML with proper indentation */
    format: true,
    /** Use tabs for indentation (matches KM's style) */
    indentBy: "\t",
    /** Don't suppress empty nodes (preserves KM structure) */
    suppressEmptyNode: false,
};
// Lazy-loaded parser and builder instances to avoid CEP environment issues
let xmlParser = null;
let xmlBuilder = null;
function getXmlParser() {
    if (!xmlParser) {
        xmlParser = new fxpExports.XMLParser(XML_PARSE_OPTIONS);
    }
    return xmlParser;
}
function getXmlBuilder() {
    if (!xmlBuilder) {
        xmlBuilder = new fxpExports.XMLBuilder(XML_BUILD_OPTIONS);
    }
    return xmlBuilder;
}
// -------------------------------------------------------------------------------------------------
// Text Encoding Functions
// -------------------------------------------------------------------------------------------------
// These functions prepare raw text for safe inclusion in JSON or XML contexts.
// They handle special characters that would otherwise break the target format.
/**
 * Escape a raw string so it is safe for inclusion inside **JSON** double‑quoted literals.
 *
 * This function uses JSON.stringify's built-in escaping mechanism to handle all JSON
 * special characters (quotes, backslashes, control characters, etc.) and then strips
 * the outer quotes to return just the escaped content.
 *
 * @param raw - The raw string that may contain JSON special characters
 * @returns The escaped string ready for embedding in JSON, without outer quotes
 * @throws {Error} If the input cannot be JSON-encoded (extremely rare)
 *
 * @example
 * ```typescript
 * encodeTextForJson('He said "Hello" and used \\backslash')
 * // Returns: 'He said \\"Hello\\" and used \\\\backslash'
 * ```
 */
function encodeTextForJson(raw) {
    try {
        // JSON.stringify handles all JSON escaping rules correctly
        // We slice(1, -1) to remove the outer quotes that stringify adds
        return JSON.stringify(raw).slice(1, -1);
    }
    catch (err) {
        // Log error with context for debugging
        const msg = `[utils.kmet] Failed to encode text for JSON – ${err.message}`;
        console.error(chalk.red(msg));
        throw err;
    }
}
/**
 * Escape a raw string so it is safe for inclusion inside **XML** text nodes or attribute values.
 *
 * This function extends the base XML escaping from utils.xml with additional backslash
 * handling required for JavaScript for Automation (JXA) compatibility in Keyboard Maestro.
 *
 * The escaping process:
 * 1. Apply standard XML entity escaping for <>&'" characters
 * 2. Double-escape backslashes for JXA string handling
 *
 * @param raw - The raw string that may contain XML special characters
 * @returns The escaped string ready for embedding in XML
 *
 * @example
 * ```typescript
 * encodeTextForXml('<tag attr="value">Path\\to\\file & more</tag>')
 * // Returns: '&lt;tag attr=&quot;value&quot;&gt;Path\\\\to\\\\file &amp; more&lt;/tag&gt;'
 * ```
 */
function encodeTextForXml(raw) {
    // First apply standard XML escaping from our shared utility
    // This handles: < > & ' " characters
    const xmlEscaped = escapeForXml(raw);
    // Then handle backslashes for JXA compatibility
    // JXA requires double-escaped backslashes in string literals
    return xmlEscaped.replace(/\\/g, "\\\\");
}
/**
 * Convert a **Keyboard Maestro plist‑XML snippet** to JSON.
 *
 * This function parses KM's XML format (which uses Apple's plist structure) and converts
 * it to a JSON representation that's easier to read and manipulate programmatically.
 *
 * The conversion preserves:
 * - XML attributes (prefixed with @_)
 * - Text content (stored as #text when mixed with attributes)
 * - Nested structure and arrays
 * - Original data types as strings (no automatic type conversion)
 *
 * @param xml - The XML string to convert (typically a KM action or macro snippet)
 * @param options - Configuration options for the conversion
 * @returns JSON string representation of the XML structure
 * @throws {Error} If the XML is malformed or cannot be parsed
 *
 * @example
 * ```typescript
 * const kmXml = '<dict><key>MacroActionType</key><string>Notification</string></dict>';
 * const json = xmlToJson(kmXml);
 * // Returns formatted JSON with dict.key and dict.string arrays
 * ```
 */
function xmlToJson(xml, options = {}) {
    var _a;
    try {
        // Parse XML into JavaScript object using our configured parser
        const jsObj = getXmlParser().parse(xml);
        // Convert to JSON string with optional pretty-printing
        // Default to 2-space indentation for readability, or compact if pretty=false
        return JSON.stringify(jsObj, null, ((_a = options.pretty) !== null && _a !== void 0 ? _a : true) ? 2 : 0);
    }
    catch (err) {
        // Provide context about what failed for easier debugging
        const msg = `[utils.kmet] xmlToJson() failed – ${err.message}`;
        console.error(chalk.red(msg));
        throw err;
    }
}
/**
 * Convert **JSON** (string or object) back to plist‑XML suitable for Keyboard Maestro.
 *
 * This function takes a JSON representation (either as a string or JavaScript object)
 * and converts it back to the plist XML format that Keyboard Maestro expects.
 *
 * The conversion handles:
 * - Attribute reconstruction (from @_ prefixed properties)
 * - Text content reconstruction (from #text properties)
 * - Proper XML formatting with KM-style indentation
 * - Array serialization to repeated XML elements
 *
 * @param json - The JSON to convert (string or object)
 * @param options - Configuration options for the conversion
 * @returns XML string in KM's plist format
 * @throws {Error} If the JSON is malformed or cannot be converted
 *
 * @example
 * ```typescript
 * const jsonObj = { dict: { key: "MacroActionType", string: "Notification" } };
 * const xml = jsonToXml(jsonObj);
 * // Returns properly formatted KM XML with tabs and structure
 * ```
 */
function jsonToXml(json, options = {}) {
    try {
        // Parse JSON string to object if needed, or use object directly
        const jsObj = typeof json === "string" ? JSON.parse(json) : json;
        // Choose builder based on minification preference
        // Minified version removes formatting for compact output
        const builder = options.minify
            ? new fxpExports.XMLBuilder({ ...XML_BUILD_OPTIONS, format: false })
            : getXmlBuilder();
        // Build XML from JavaScript object
        return builder.build(jsObj);
    }
    catch (err) {
        // Provide context about what failed for easier debugging
        const msg = `[utils.kmet] jsonToXml() failed – ${err.message}`;
        console.error(chalk.red(msg));
        throw err;
    }
}
/**
 * Perform a search‑and‑replace on an XML/JSON string *without* breaking its structure.
 *
 * This function operates at the text level, making it safe for bulk operations like
 * variable renaming across KM macros. It's designed to work with both XML and JSON
 * content while preserving the underlying structure.
 *
 * **Important**: This function works on raw text, so callers must ensure that
 * replacements don't break XML/JSON syntax (e.g., don't replace quotes or brackets
 * that are part of the structure).
 *
 * The function supports:
 * - Literal string replacement (with automatic regex escaping)
 * - Regular expression replacement with capture groups
 * - Case-sensitive and case-insensitive matching
 * - Global replacement (all occurrences)
 *
 * @param input - The XML/JSON string to search within
 * @param searchPattern - String or RegExp to search for
 * @param replacement - Replacement string (supports $1, $2, etc. for regex capture groups)
 * @param opts - Options controlling search behavior
 * @returns The input string with all matches replaced
 *
 * @example
 * ```typescript
 * // Literal replacement (safe for special characters)
 * searchReplaceInText(xmlString, "Local_OldVar", "Global_NewVar", { literal: true });
 *
 * // Regex replacement with capture groups
 * searchReplaceInText(xmlString, /Local_(\w+)/g, "Global_$1");
 *
 * // Case-insensitive literal replacement
 * searchReplaceInText(jsonString, "oldvalue", "newvalue", { literal: true, ignoreCase: true });
 * ```
 */
function searchReplaceInText(input, searchPattern, replacement, opts = {}) {
    let pattern;
    // Handle literal string patterns vs regex patterns
    if (opts.literal || typeof searchPattern === "string") {
        // For literal patterns, we need to escape special regex characters
        // to prevent them from being interpreted as regex syntax
        const escaped = (typeof searchPattern === "string" ? searchPattern : String(searchPattern)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& represents the matched character
        // Create regex with appropriate flags
        // 'g' for global (replace all), 'i' for case-insensitive if requested
        pattern = new RegExp(escaped, opts.ignoreCase ? "gi" : "g");
    }
    else {
        // Use the provided RegExp directly
        pattern = searchPattern;
    }
    // Perform the replacement using the constructed pattern
    return input.replace(pattern, replacement);
}
// -------------------------------------------------------------------------------------------------
// Command Line Interface (CLI)
// -------------------------------------------------------------------------------------------------
// This section provides a simple CLI wrapper around the KMET functions for quick terminal use.
// The CLI supports encoding, conversion, and search/replace operations on files.
/**
 * Parse command line arguments into a structured options object.
 *
 * This function processes process.argv to extract flags and their values,
 * supporting both --flag=value and --flag value formats.
 *
 * @param argv - Command line arguments array (typically process.argv)
 * @returns Object mapping flag names to their values (string or boolean)
 */
function parseCliFlags(argv) {
    const out = {};
    // Start from index 2 to skip 'node' and script name
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        // Only process arguments that start with --
        if (arg.startsWith("--")) {
            const [k, v] = arg.split("=");
            if (v !== undefined) {
                // Handle --flag=value format
                out[k.slice(2)] = v; // Remove -- prefix
            }
            else {
                // Handle --flag value format or boolean flags
                const next = argv[i + 1];
                if (next && !next.startsWith("--")) {
                    // Next argument is the value
                    out[k.slice(2)] = next;
                    i++; // Skip the value argument in next iteration
                }
                else {
                    // Boolean flag (no value)
                    out[k.slice(2)] = true;
                }
            }
        }
    }
    return out;
}
/**
 * Display CLI help information with usage examples and flag descriptions.
 *
 * This function outputs comprehensive help text including:
 * - Usage examples for common operations
 * - Description of all available flags
 * - Expected input/output formats
 */
function cliHelp() {
    console.log(`
${chalk.bold("KMET CLI – quick Keyboard Maestro text‑object helper")}

Examples:
  ${chalk.cyan("yarn kmet --encode-json --text 'He said \"hello\" <&>'")}
  ${chalk.cyan("yarn kmet --encode-xml  --text '5 < 7 & 7 > 5'")}
  ${chalk.cyan("yarn kmet --xml2json --file ./object.xml > object.json")}
  ${chalk.cyan("yarn kmet --json2xml --file ./object.json > object.xml")}
  ${chalk.cyan("yarn kmet --replace --file ./macro.json --find Local_ --to Global_ > out.json")}

Flags:
  --encode-json           Escape a plain string for JSON embedding.
  --encode-xml            Escape a plain string for XML embedding.
  --xml2json              Convert plist‑XML → JSON.
  --json2xml              Convert JSON → plist‑XML.
  --replace               Search & replace within file contents.
  --text   <string>       Raw text for encode operations.
  --file   <path>         Path to input file (XML or JSON).
  --find   <pattern>      String/RegExp (default literal string) to search for.
  --to     <string>       Replacement string (used with --replace).
  --regex                 Treat --find as a regular expression.
  --ignore-case           Case‑insensitive search.
`);
}
/**
 * Main CLI execution function that processes arguments and performs requested operations.
 *
 * This async function:
 * 1. Parses command line arguments
 * 2. Determines which operation to perform
 * 3. Executes the operation with appropriate error handling
 * 4. Outputs results to stdout or shows help
 *
 * Operations supported:
 * - Text encoding for JSON/XML
 * - File conversion between XML and JSON
 * - Search and replace in files
 *
 * @throws {Error} If file operations fail or required arguments are missing
 */
async function runCli() {
    // Import fs/promises dynamically to avoid loading it unless CLI is used
    const fs = await import('fs/promises');
    const args = parseCliFlags(process.argv);
    // Handle JSON encoding operation
    if (args["encode-json"]) {
        if (!args.text)
            return cliHelp(); // Show help if required argument missing
        console.log(encodeTextForJson(String(args.text)));
        return;
    }
    // Handle XML encoding operation
    if (args["encode-xml"]) {
        if (!args.text)
            return cliHelp(); // Show help if required argument missing
        console.log(encodeTextForXml(String(args.text)));
        return;
    }
    // Handle XML to JSON conversion
    if (args["xml2json"]) {
        if (!args.file)
            return cliHelp(); // Show help if required argument missing
        const xml = await fs.readFile(String(args.file), "utf8");
        console.log(xmlToJson(xml));
        return;
    }
    // Handle JSON to XML conversion
    if (args["json2xml"]) {
        if (!args.file)
            return cliHelp(); // Show help if required argument missing
        const json = await fs.readFile(String(args.file), "utf8");
        console.log(jsonToXml(json));
        return;
    }
    // Handle search and replace operation
    if (args.replace) {
        // Validate required arguments
        if (!args.file || !args.find || args.to === undefined)
            return cliHelp();
        // Read input file
        const text = await fs.readFile(String(args.file), "utf8");
        // Perform search and replace with appropriate pattern type
        const updated = searchReplaceInText(text, 
        // Create regex if --regex flag is set, otherwise use literal string
        args.regex
            ? new RegExp(String(args.find), args["ignore-case"] ? "gi" : "g")
            : String(args.find), String(args.to), {
            literal: !args.regex, // Literal mode unless --regex is specified
            ignoreCase: !!args["ignore-case"], // Case-insensitive if flag is set
        });
        console.log(updated);
        return;
    }
    // No valid operation specified, show help
    cliHelp();
}
// -------------------------------------------------------------------------------------------------
// CLI Entry Point
// -------------------------------------------------------------------------------------------------
// This section handles CLI execution when the script is run directly (not imported as a module).
// Check if this script is being run directly (not imported)
// Use try-catch to avoid issues in environments where require.main might not exist
try {
    if (require.main === module) {
        // Execute CLI with proper error handling
        runCli().catch((err) => {
            // Log any uncaught errors with context and exit with error code
            console.error(chalk.red("[KMET CLI] Uncaught error:"), err);
            process.exit(1);
        });
    }
}
catch (error) {
    // Silently ignore if require.main is not available (e.g., in CEP environments)
}

exports.KM_TOKENS = KM_TOKENS;
exports.buildEphemeralMacroXml = buildEphemeralMacroXml;
exports.createVirtualActivate = createVirtualActivate;
exports.createVirtualBreakFromLoop = createVirtualBreakFromLoop;
exports.createVirtualCancel = createVirtualCancel;
exports.createVirtualClearTypedStringBuffer = createVirtualClearTypedStringBuffer;
exports.createVirtualClickAtFoundImage = createVirtualClickAtFoundImage;
exports.createVirtualComment = createVirtualComment;
exports.createVirtualContinueLoop = createVirtualContinueLoop;
exports.createVirtualCopy = createVirtualCopy;
exports.createVirtualCut = createVirtualCut;
exports.createVirtualDisplayTextBriefly = createVirtualDisplayTextBriefly;
exports.createVirtualDisplayTextWindow = createVirtualDisplayTextWindow;
exports.createVirtualFile = createVirtualFile;
exports.createVirtualGroup = createVirtualGroup;
exports.createVirtualIf = createVirtualIf;
exports.createVirtualInsertText = createVirtualInsertText;
exports.createVirtualManipulateWindow = createVirtualManipulateWindow;
exports.createVirtualMoveAndClick = createVirtualMoveAndClick;
exports.createVirtualNotification = createVirtualNotification;
exports.createVirtualOpen = createVirtualOpen;
exports.createVirtualOpenURL = createVirtualOpenURL;
exports.createVirtualPaste = createVirtualPaste;
exports.createVirtualPause = createVirtualPause;
exports.createVirtualPlaySound = createVirtualPlaySound;
exports.createVirtualPressButton = createVirtualPressButton;
exports.createVirtualQuit = createVirtualQuit;
exports.createVirtualRetryThisLoop = createVirtualRetryThisLoop;
exports.createVirtualReturn = createVirtualReturn;
exports.createVirtualScreenCapture = createVirtualScreenCapture;
exports.createVirtualScrollWheelEvent = createVirtualScrollWheelEvent;
exports.createVirtualSetClipboardToText = createVirtualSetClipboardToText;
exports.createVirtualSetVariable = createVirtualSetVariable;
exports.createVirtualSetVariableToCalculation = createVirtualSetVariableToCalculation;
exports.createVirtualShowSpecificApp = createVirtualShowSpecificApp;
exports.createVirtualShowStatusMenu = createVirtualShowStatusMenu;
exports.createVirtualSwitchCase = createVirtualSwitchCase;
exports.createVirtualTypeKeystroke = createVirtualTypeKeystroke;
exports.createVirtualUseVariable = createVirtualUseVariable;
exports.createVirtualWhile = createVirtualWhile;
exports.createVirtualselectMenuItem = createVirtualselectMenuItem;
exports.decodeStyledTextData = decodeStyledTextData;
exports.encodeStyledTextData = encodeStyledTextData;
exports.encodeTextForJson = encodeTextForJson;
exports.encodeTextForXml = encodeTextForXml;
exports.generateBasicRtf = generateBasicRtf;
exports.generateMacro = generateMacro;
exports.getFinderSelections = getFinderSelections;
exports.getFrontAppInfo = getFrontAppInfo;
exports.getFrontWindowInfo = getFrontWindowInfo;
exports.getMousePosition = getMousePosition;
exports.getNetworkInfo = getNetworkInfo;
exports.getPastClipboard = getPastClipboard;
exports.getRunningApps = getRunningApps;
exports.getScreenFrames = getScreenFrames;
exports.getScreenResolution = getScreenResolution;
exports.getSystemClipboard = getSystemClipboard;
exports.getSystemVersion = getSystemVersion;
exports.getSystemVolume = getSystemVolume;
exports.getUserInfo = getUserInfo;
exports.getVariable = get;
exports.jsonToXml = jsonToXml;
exports.kmvar = kmvar;
exports.lookupKMToken = lookupKMToken;
exports.normalizeAppleScriptShortcut = normalizeAppleScriptShortcut;
exports.notify = notify;
exports.queries = queries;
exports.runMacro = runMacro;
exports.runQuery = runQuery;
exports.runVirtualMacro = runVirtualMacro;
exports.searchReplaceInText = searchReplaceInText;
exports.setVariable = set;
exports.stripRtfToPlainText = stripRtfToPlainText;
exports.updateStyledTextInXml = updateStyledTextInXml;
exports.xmlToJson = xmlToJson;
//# sourceMappingURL=kmjs.js.map
