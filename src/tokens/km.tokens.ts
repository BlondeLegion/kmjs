// FILE: src/tokens/km.tokens.ts

/**
 * @file A comprehensive, documented list of all Keyboard Maestro text tokens.
 * @description This file provides a constant object `KM_TOKENS` where each key is a PascalCase
 * representation of a Keyboard Maestro token, and its value is the raw token string (e.g., `%RandomUUID%`).
 * Each token is accompanied by detailed JSDoc documentation sourced from the Keyboard Maestro documentation.
 */

export const KM_TOKENS = {
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
  FormattedICUDateTimeMinus:
    "%ICUDateTimeMinus%3*7%Days%EEE, MMM d, yyyy h:mm%",

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
  FrontBrowserJavaScript:
    "%FrontBrowserJavaScript%document.forms[0].innerHTML%",

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
  TheModifiersUsedWhenCompletingAPromptWithListAction:
    "%PromptWithListModifiers%",

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
} as const;

/**
 * A TypeScript type representing all possible Keyboard Maestro token strings.
 * This is derived from the values of the `KM_TOKENS` object.
 */
export type KMToken = (typeof KM_TOKENS)[keyof typeof KM_TOKENS];
