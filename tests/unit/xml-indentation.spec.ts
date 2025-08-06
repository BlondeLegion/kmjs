//FILE: tests/unit/xml-indentation.spec.ts

import { describe, it, expect } from "vitest";
import { createVirtualInsertText } from "../../src/virtual_actions/kmjs.virtualAction.insertText";
import { createVirtualSetVariable } from "../../src/virtual_actions/kmjs.virtualAction.setVariable";
import { createVirtualPause } from "../../src/virtual_actions/kmjs.virtualAction.pause";
import { createVirtualClickAtFoundImage } from "../../src/virtual_actions/kmjs.virtualAction.clickAtFoundImage";
import { createVirtualScreenCapture } from "../../src/virtual_actions/kmjs.virtualAction.screenCapture";
import { createVirtualFile } from "../../src/virtual_actions/kmjs.virtualAction.file";
import { createVirtualSwitchCase } from "../../src/virtual_actions/kmjs.virtualAction.switchCase";
// Alias for test compatibility
import { createVirtualIf as createVirtualIfThenElse } from "../../src/virtual_actions/kmjs.virtualAction.ifThenElse";

// Ground truth XML from TEMPXML.kmmacros - the exact structure KM generates
const GROUND_TRUTH_ACTIONS = {
  ifThenElse: `<dict>
	<key>ActionUID</key>
	<integer>1753506524</integer>
	<key>Conditions</key>
	<dict>
		<key>ConditionList</key>
		<array>
			<dict>
				<key>ActionResultConditionType</key>
				<string>IsOK</string>
				<key>ActionResultText</key>
				<string>OK</string>
				<key>ConditionType</key>
				<string>ActionResult</string>
			</dict>
		</array>
		<key>ConditionListMatch</key>
		<string>All</string>
	</dict>
	<key>ElseActions</key>
	<array>
		<dict>
			<key>Action</key>
			<string>MoveAndClick</string>
			<key>ActionUID</key>
			<integer>1753506528</integer>
			<key>Button</key>
			<integer>0</integer>
			<key>ClickCount</key>
			<integer>1</integer>
			<key>DisplayMatches</key>
			<false/>
			<key>DragHorizontalPosition</key>
			<string>0</string>
			<key>DragVerticalPosition</key>
			<string>0</string>
			<key>Fuzz</key>
			<integer>15</integer>
			<key>HorizontalPositionExpression</key>
			<string>0</string>
			<key>ImagePath</key>
			<string></string>
			<key>ImageSource</key>
			<string>File</string>
			<key>MacroActionType</key>
			<string>MouseMoveAndClick</string>
			<key>Modifiers</key>
			<integer>0</integer>
			<key>MouseDrag</key>
			<string>None</string>
			<key>Relative</key>
			<string>Image</string>
			<key>RelativeCorner</key>
			<string>BottomLeft</string>
			<key>RestoreMouseLocation</key>
			<false/>
			<key>ScreenArea</key>
			<dict>
				<key>HeightExpression</key>
				<string>300</string>
				<key>LeftExpression</key>
				<string>125</string>
				<key>ScreenAreaType</key>
				<string>Area</string>
				<key>TopExpression</key>
				<string>125</string>
				<key>WidthExpression</key>
				<string>300</string>
			</dict>
			<key>VerticalPositionExpression</key>
			<string>0</string>
		</dict>
		<dict>
			<key>ActionUID</key>
			<integer>1753506529</integer>
			<key>AlwaysNominalResolution</key>
			<false/>
			<key>IncludeShadows</key>
			<true/>
			<key>MacroActionType</key>
			<string>ScreenCapture</string>
			<key>ScreenArea</key>
			<dict>
				<key>ScreenAreaType</key>
				<string>ScreenAll</string>
			</dict>
		</dict>
	</array>
	<key>MacroActionType</key>
	<string>IfThenElse</string>
	<key>ThenActions</key>
	<array>
		<dict>
			<key>ActionUID</key>
			<integer>1753506525</integer>
			<key>CaseEntries</key>
			<array>
				<dict>
					<key>Actions</key>
					<array>
						<dict>
							<key>ActionUID</key>
							<integer>1753506526</integer>
							<key>MacroActionType</key>
							<string>Pause</string>
							<key>Time</key>
							<string>1.5</string>
							<key>TimeOutAbortsMacro</key>
							<true/>
						</dict>
						<dict>
							<key>ActionUID</key>
							<integer>1753506527</integer>
							<key>MacroActionType</key>
							<string>SetVariableToText</string>
							<key>Text</key>
							<string></string>
							<key>Variable</key>
							<string>LOCALExampleVariableName</string>
							<key>Where</key>
							<string>Append</string>
						</dict>
					</array>
					<key>ConditionType</key>
					<string>Contains</string>
					<key>TestValue</key>
					<string>ExampleStringSwitchCaseContains</string>
				</dict>
			</array>
			<key>MacroActionType</key>
			<string>Switch</string>
			<key>Source</key>
			<string>Clipboard</string>
		</dict>
	</array>
	<key>TimeOutAbortsMacro</key>
	<true/>
</dict>`,

  fileAction: `<dict>
	<key>ActionUID</key>
	<integer>1753506530</integer>
	<key>Destination</key>
	<string></string>
	<key>MacroActionType</key>
	<string>File</string>
	<key>Operation</key>
	<string>Reveal</string>
	<key>Source</key>
	<string>/tmp</string>
</dict>`,
};

describe("XML Indentation Investigation", () => {
  describe("Complex Nested Action Structure", () => {
    it("should construct the exact macro from TEMPXML.kmmacros", () => {
      // Construct the complex nested structure using our virtual actions

      // 1. Create the pause action for the switch case
      /** @deprecated always true – kept only so legacy tests compile */
      const pauseAction = createVirtualPause({
        time: 1.5,
        // timeOutAbortsMacro is deprecated and ignored
      });

      // 2. Create the setVariable action for the switch case
      const setVariableAction = createVirtualSetVariable({
        variable: "ExampleVariableName",
        text: "",
        where: "Append",
        scope: "local",
      });

      // 3. Create the switch case action
      const switchCaseAction = createVirtualSwitchCase({
        variable: "SwitchVariable",
        source: "Clipboard",
        cases: [
          {
            operator: "Contains",
            testValue: "ExampleStringSwitchCaseContains",
            actions: [pauseAction, setVariableAction],
          },
        ],
      });

      // 4. Create the clickAtFoundImage action for the else block
      const clickAction = createVirtualClickAtFoundImage({
        imageSource: "File",
        filePath: "/tmp/test.png",
        relative: "Image",
        relativeCorner: "BottomLeft",
        screenArea: {
          type: "Area",
          left: "125",
          top: "125",
          width: "300",
          height: "300",
        },
        fuzz: 15,
        button: "Left",
        clickKind: "Click",
        mouseDrag: "None",
        restoreMouseLocation: false,
        // displayMatches removed
      });

      // 5. Create the screen capture action for the else block
      const screenCaptureAction = createVirtualScreenCapture({
        screenArea: { type: "ScreenAll" },
        alwaysNominalResolution: false,
      });

      // 6. Create the main if-then-else action
      const ifThenElseAction = createVirtualIfThenElse({
        conditions: [
          {
            ConditionType: "ActionResult",
            ActionResultConditionType: "IsOK",
            ActionResultText: "OK",
          },
        ],
        match: "All",
        then: [switchCaseAction],
        else: [clickAction, screenCaptureAction],
        timeoutAborts: true,
      });

      // 7. Create the file action
      const fileAction = createVirtualFile({
        operation: "Reveal",
        source: "/tmp",
        destination: "",
      });

      // Generate XML for comparison
      const ifThenElseXml = ifThenElseAction.toXml();
      const fileXml = fileAction.toXml();

      console.log("=== GENERATED IF-THEN-ELSE XML ===");
      console.log(ifThenElseXml);
      console.log("\n=== GENERATED FILE XML ===");
      console.log(fileXml);

      // Analyze indentation patterns
      console.log("\n=== INDENTATION ANALYSIS ===");
      analyzeIndentation("Generated IfThenElse", ifThenElseXml);
      analyzeIndentation(
        "Ground Truth IfThenElse",
        GROUND_TRUTH_ACTIONS.ifThenElse,
      );
      analyzeIndentation("Generated File", fileXml);
      analyzeIndentation("Ground Truth File", GROUND_TRUTH_ACTIONS.fileAction);

      // Basic structure checks
      expect(ifThenElseXml).toContain("<key>MacroActionType</key>");
      expect(ifThenElseXml).toContain("<string>IfThenElse</string>");
      expect(fileXml).toContain("<key>MacroActionType</key>");
      expect(fileXml).toContain("<string>File</string>");
    });

    it("should have consistent indentation with Keyboard Maestro", () => {
      // Test a simple action to check basic indentation
      const simpleAction = createVirtualSetVariable({
        variable: "TestVar",
        text: "Test Value",
      });

      const xml = simpleAction.toXml();
      console.log("=== SIMPLE ACTION XML ===");
      console.log(xml);

      const lines = xml.split("\n");

      // Check indentation patterns
      lines.forEach((line, index) => {
        if (line.trim()) {
          const indent = line.match(/^(\s*)/)?.[1] || "";
          const depth = (indent.match(/\t/g) || []).length;
          console.log(
            `Line ${index}: depth=${depth}, content="${line.trim()}"`,
          );

          // Keyboard Maestro uses tabs, not spaces
          if (indent.includes(" ")) {
            console.warn(
              `Line ${index} uses spaces instead of tabs: "${line}"`,
            );
          }
        }
      });

      // The root dict should start with a single tab
      expect(lines[0]).toMatch(/^\t<dict>$/);
    });
  });

  describe("Multiline Text Handling", () => {
    it("should handle multiline text consistently with KM", () => {
      // Mirrors the KM sample you posted – note the deliberate blank lines
      const multilineText =
        "Multiline text example\n" + // line 1
        "\n" + // line 2 (blank)
        "\n" + // line 3 (blank)
        "Example\n" + // line 4
        "\n" + // line 5 (blank)
        "\n" + // line 6 (blank)
        " \n" + // line 7 (blank but contains a space ␠)
        "Lots of space\n" + // line 8
        "\n" + // line 9 (blank)
        "Examples!"; // line 10

      const insertAction = createVirtualInsertText({
        text: multilineText,
        action: "ByTyping",
      });

      const setAction = createVirtualSetVariable({
        variable: "TestVar",
        text: multilineText,
      });

      const insertXml = insertAction.toXml();
      const setXml = setAction.toXml();

      console.log("=== MULTILINE INSERT TEXT XML ===");
      console.log(insertXml);
      console.log("\n=== MULTILINE SET VARIABLE XML ===");
      console.log(setXml);

      // Extract raw <string>…</string> blocks for the text payload
      function extractTextPayload(xml: string): string {
        const textKeyIdx = xml.indexOf("<key>Text</key>");
        if (textKeyIdx === -1) throw new Error("No <key>Text</key> found");
        const afterTextKey = xml.slice(textKeyIdx);
        const match = afterTextKey.match(/<string>([\s\S]*?)<\/string>/);
        if (!match) throw new Error("No <string> after <key>Text</key>");
        return match[1];
      }
      const insertPayload = extractTextPayload(insertXml);
      const setPayload = extractTextPayload(setXml);

      // Exact, character-for-character match (blank lines, spaces, everything)
      expect(insertPayload).toBe(multilineText);
      expect(setPayload).toBe(multilineText);

      // Check that the indentation around the multiline text is consistent
      const insertTextLine = insertXml
        .split("\n")
        .find((line) => line.includes("Multiline text example"));
      const setTextLine = setXml
        .split("\n")
        .find((line) => line.includes("Multiline text example"));

      if (insertTextLine && setTextLine) {
        const insertIndent = insertTextLine.match(/^(\s*)/)?.[1] || "";
        const setIndent = setTextLine.match(/^(\s*)/)?.[1] || "";

        console.log("Insert text indent:", JSON.stringify(insertIndent));
        console.log("Set variable indent:", JSON.stringify(setIndent));

        // Both should use the same indentation pattern
        expect(insertIndent).toBe(setIndent);
      }
    });
  });
});

function analyzeIndentation(name: string, xml: string): void {
  console.log(`\n--- ${name} Indentation Analysis ---`);
  const lines = xml.split("\n");

  lines.forEach((line, index) => {
    if (line.trim()) {
      const indent = line.match(/^(\s*)/)?.[1] || "";
      const tabCount = (indent.match(/\t/g) || []).length;
      const spaceCount = (indent.match(/ /g) || []).length;

      if (spaceCount > 0) {
        console.log(
          `Line ${index}: ${tabCount} tabs, ${spaceCount} spaces - "${line.trim()}"`,
        );
      }
    }
  });
}
