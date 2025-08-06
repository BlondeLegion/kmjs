//FILE: src/utils/template.xml.ui.ts

import type { ScreenArea } from "../virtual_actions/types";

/**
 * Normalises a found image condition to ensure it has all required fields.
 * - Always supplies a ScreenArea (defaults to ScreenAll).
 * - Removes template-source keys that KM never serialises for conditions.
 * - Ensures DisplayMatches + Fuzz have sane values.
 * @param cond - The condition to normalise.
 * @returns Normalised condition object.
 */
export function normaliseFoundImage(cond: any): any {
  if (cond.ConditionType !== "ScreenImage") return cond;

  // 1. Always supply a ScreenArea (KM defaults to ScreenAll)
  if (
    !cond.ScreenArea ||
    typeof cond.ScreenArea !== "object" ||
    !(cond.ScreenArea as any).type
  ) {
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
  } else if (cond.ImageSource === "File") {
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
  } else if (cond.ImageSource === "NamedClipboard") {
    delete cond.ImagePath;
  } else if (
    cond.ImageSource === "SystemClipboard" ||
    cond.ImageSource === "TriggerClipboard"
  ) {
    // KM does not serialize the *named* clipboard metadata for system/trigger clipboards
    delete cond.ImagePath;
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
  } else if (cond.ImageSource === "Icon") {
    delete cond.ImagePath;
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
  } else if (cond.ImageSource === "Screen") {
    delete cond.ImagePath;
    delete cond.ImageNamedClipboardName;
    delete cond.ImageNamedClipboardRedundandDisplayName;
  }

  // 3. Ensure DisplayMatches + Fuzz have sane values
  if (cond.DisplayMatches === undefined) cond.DisplayMatches = false;
  if (cond.Fuzz === undefined) cond.Fuzz = 0;

  return cond;
}

/**
 * Renders a <dict> for ScreenArea / ImageScreenArea.
 * @param keyName  Either "ScreenArea" or "ImageScreenArea".
 * @param area     The ScreenArea definition.
 */
export function screenAreaToXml(keyName: string, area: ScreenArea): string {
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
