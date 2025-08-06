// FILE: tests/unit/utils.kmet.demo.spec.ts

// Demonstration tests for utils.kmet.ts with detailed input/output logging

import { describe, it, expect } from "vitest";
import {
  encodeTextForJson,
  encodeTextForXml,
  xmlToJson,
  jsonToXml,
  searchReplaceInText,
} from "../../src/utils/utils.kmet.js";

describe("utils.kmet - Detailed Demo", () => {
  describe("encodeTextForJson - Input/Output Examples", () => {
    const testCases = [
      {
        name: "Basic JSON escaping",
        input: 'Hello "world" with \\ and \n newline',
        expected: 'Hello \\"world\\" with \\\\ and \\n newline',
      },
      {
        name: "Empty string",
        input: "",
        expected: "",
      },
      {
        name: "No special characters",
        input: "Hello World",
        expected: "Hello World",
      },
      {
        name: "All JSON escape sequences",
        input: '"\\\b\f\n\r\t',
        expected: '\\"\\\\\\b\\f\\n\\r\\t',
      },
      {
        name: "Unicode characters",
        input: "Hello 🌍 World",
        expected: "Hello 🌍 World",
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const result = encodeTextForJson(input);

        console.log(`\n📝 ${name}:`);
        console.log(`   Input:    ${JSON.stringify(input)}`);
        console.log(`   Output:   ${JSON.stringify(result)}`);
        console.log(`   Expected: ${JSON.stringify(expected)}`);
        console.log(`   Match:    ${result === expected ? "✅" : "❌"}`);

        expect(result).toBe(expected);
      });
    });
  });

  describe("encodeTextForXml - Input/Output Examples", () => {
    const testCases = [
      {
        name: "Basic XML escaping",
        input: '<tag attr="value">content & more</tag>',
        expected:
          "&lt;tag attr=&quot;value&quot;&gt;content &amp; more&lt;/tag&gt;",
      },
      {
        name: "Apostrophes",
        input: "It's a test",
        expected: "It&apos;s a test",
      },
      {
        name: "Backslashes",
        input: "Path\\to\\file",
        expected: "Path\\\\to\\\\file",
      },
      {
        name: "All XML entities",
        input: "<>&'\"\\",
        expected: "&lt;&gt;&amp;&apos;&quot;\\\\",
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const result = encodeTextForXml(input);

        console.log(`\n🏷️  ${name}:`);
        console.log(`   Input:    ${JSON.stringify(input)}`);
        console.log(`   Output:   ${JSON.stringify(result)}`);
        console.log(`   Expected: ${JSON.stringify(expected)}`);
        console.log(`   Match:    ${result === expected ? "✅" : "❌"}`);

        expect(result).toBe(expected);
      });
    });
  });

  describe("xmlToJson - Input/Output Examples", () => {
    const testCases = [
      {
        name: "Simple XML to JSON",
        input: "<root><item>value</item></root>",
        expectedStructure: { root: { item: "value" } },
      },
      {
        name: "XML with attributes",
        input: '<root><item id="1" name="test">value</item></root>',
        expectedKeys: ["@_id", "@_name", "#text"],
      },
      {
        name: "KM-style plist XML",
        input:
          "<dict><key>MacroActionType</key><string>Notification</string><key>Title</key><string>Test</string></dict>",
        expectedKeys: ["key", "string"],
      },
    ];

    testCases.forEach(({ name, input, expectedStructure, expectedKeys }) => {
      it(name, () => {
        const result = xmlToJson(input);
        const parsed = JSON.parse(result);

        console.log(`\n🔄 ${name}:`);
        console.log(`   Input XML:  ${input}`);
        console.log(`   Output JSON:`);
        console.log(`   ${JSON.stringify(parsed, null, 2)}`);

        if (expectedStructure) {
          console.log(
            `   Expected:   ${JSON.stringify(expectedStructure, null, 2)}`,
          );
          expect(parsed).toEqual(expectedStructure);
        }

        if (expectedKeys) {
          const firstKey = Object.keys(parsed)[0];
          let actualKeys;

          // For XML with attributes, we need to look deeper into the structure
          if (name === "XML with attributes") {
            actualKeys = Object.keys(parsed[firstKey].item);
          } else {
            actualKeys = Object.keys(parsed[firstKey]);
          }

          console.log(`   Expected keys: ${expectedKeys.join(", ")}`);
          console.log(`   Actual keys:   ${actualKeys.join(", ")}`);
          expectedKeys.forEach((key) => {
            expect(actualKeys).toContain(key);
          });
        }
      });
    });
  });

  describe("jsonToXml - Input/Output Examples", () => {
    const testCases = [
      {
        name: "Simple JSON to XML",
        input: { root: { item: "value" } },
        expectedContains: ["<root>", "<item>value</item>", "</root>"],
      },
      {
        name: "JSON with attributes",
        input: {
          root: {
            item: {
              "@_id": "1",
              "@_name": "test",
              "#text": "value",
            },
          },
        },
        expectedContains: ['id="1"', 'name="test"', ">value<"],
      },
      {
        name: "JSON with arrays",
        input: { root: { items: ["item1", "item2"] } },
        expectedContains: ["<items>item1</items>", "<items>item2</items>"],
      },
    ];

    testCases.forEach(({ name, input, expectedContains }) => {
      it(name, () => {
        const result = jsonToXml(input);

        console.log(`\n🔄 ${name}:`);
        console.log(`   Input JSON: ${JSON.stringify(input, null, 2)}`);
        console.log(`   Output XML:`);
        console.log(`   ${result}`);
        console.log(`   Expected to contain: ${expectedContains.join(", ")}`);

        expectedContains.forEach((expected) => {
          console.log(
            `   Contains "${expected}": ${result.includes(expected) ? "✅" : "❌"}`,
          );
          expect(result).toContain(expected);
        });
      });
    });
  });

  describe("searchReplaceInText - Input/Output Examples", () => {
    const sampleXml = `<dict><key>Variable</key><string>Local_MyVar</string><key>Text</key><string>Local_Value</string></dict>`;

    const testCases = [
      {
        name: "Literal string replacement",
        input: sampleXml,
        searchPattern: "Local_",
        replacement: "Global_",
        options: { literal: true },
        expectedContains: ["Global_MyVar", "Global_Value"],
        expectedNotContains: ["Local_"],
      },
      {
        name: "Regex replacement with capture groups",
        input: sampleXml,
        searchPattern: /Local_(\w+)/g,
        replacement: "Global_$1",
        options: {},
        expectedContains: ["Global_MyVar", "Global_Value"],
        expectedNotContains: ["Local_"],
      },
      {
        name: "Case-insensitive literal replacement",
        input: "Hello WORLD and hello world",
        searchPattern: "hello",
        replacement: "hi",
        options: { literal: true, ignoreCase: true },
        expectedResult: "hi WORLD and hi world",
      },
      {
        name: "Escape special regex characters",
        input: "Price: $5.99 (special)",
        searchPattern: "$5.99",
        replacement: "$6.99",
        options: { literal: true },
        expectedResult: "Price: $6.99 (special)",
      },
    ];

    testCases.forEach(
      ({
        name,
        input,
        searchPattern,
        replacement,
        options,
        expectedContains,
        expectedNotContains,
        expectedResult,
      }) => {
        it(name, () => {
          const result = searchReplaceInText(
            input,
            searchPattern,
            replacement,
            options,
          );

          console.log(`\n🔍 ${name}:`);
          console.log(`   Input:       ${JSON.stringify(input)}`);
          console.log(
            `   Search:      ${searchPattern instanceof RegExp ? searchPattern.toString() : JSON.stringify(searchPattern)}`,
          );
          console.log(`   Replace:     ${JSON.stringify(replacement)}`);
          console.log(`   Options:     ${JSON.stringify(options)}`);
          console.log(`   Result:      ${JSON.stringify(result)}`);

          if (expectedResult) {
            console.log(`   Expected:    ${JSON.stringify(expectedResult)}`);
            console.log(
              `   Match:       ${result === expectedResult ? "✅" : "❌"}`,
            );
            expect(result).toBe(expectedResult);
          }

          if (expectedContains) {
            expectedContains.forEach((expected) => {
              console.log(
                `   Contains "${expected}": ${result.includes(expected) ? "✅" : "❌"}`,
              );
              expect(result).toContain(expected);
            });
          }

          if (expectedNotContains) {
            expectedNotContains.forEach((notExpected) => {
              console.log(
                `   Does NOT contain "${notExpected}": ${!result.includes(notExpected) ? "✅" : "❌"}`,
              );
              expect(result).not.toContain(notExpected);
            });
          }
        });
      },
    );
  });

  describe("Real-world KM Examples", () => {
    it("Variable renaming in KM macro XML", () => {
      const kmXml = `
        <dict>
          <key>Actions</key>
          <array>
            <dict>
              <key>MacroActionType</key>
              <string>SetVariable</string>
              <key>Variable</key>
              <string>Local_OldName</string>
              <key>Text</key>
              <string>Value for Local_OldName variable</string>
            </dict>
            <dict>
              <key>MacroActionType</key>
              <string>Notification</string>
              <key>Title</key>
              <string>Local_OldName Updated</string>
            </dict>
          </array>
        </dict>
      `.trim();

      console.log(`\n🎯 Real-world Example: Variable Renaming`);
      console.log(`   Original XML:`);
      console.log(`   ${kmXml}`);

      const updated = searchReplaceInText(
        kmXml,
        "Local_OldName",
        "Global_NewName",
        { literal: true },
      );

      console.log(`\n   After renaming Local_OldName → Global_NewName:`);
      console.log(`   ${updated}`);

      console.log(`\n   Changes made:`);
      console.log(`   - Variable name: Local_OldName → Global_NewName ✅`);
      console.log(
        `   - Text content: "Value for Local_OldName" → "Value for Global_NewName" ✅`,
      );
      console.log(
        `   - Notification title: "Local_OldName Updated" → "Global_NewName Updated" ✅`,
      );
      console.log(`   - XML structure preserved ✅`);

      expect(updated).toContain("Global_NewName");
      expect(updated).not.toContain("Local_OldName");
      expect(updated).toContain("<key>MacroActionType</key>");
      expect(updated).toContain("<string>SetVariable</string>");
    });

    it("Converting KM XML to JSON for editing", () => {
      const kmXml =
        "<dict><key>MacroActionType</key><string>Notification</string><key>Title</key><string>Hello World</string><key>Subtitle</key><string>Test Message</string></dict>";

      console.log(`\n🔄 Real-world Example: KM XML → JSON → XML`);
      console.log(`   Original KM XML:`);
      console.log(`   ${kmXml}`);

      const json = xmlToJson(kmXml);
      console.log(`\n   Converted to JSON:`);
      console.log(`   ${json}`);

      const backToXml = jsonToXml(json);
      console.log(`\n   Converted back to XML:`);
      console.log(`   ${backToXml}`);

      // Verify round-trip works
      const originalParsed = JSON.parse(xmlToJson(kmXml, { pretty: false }));
      const roundTripParsed = JSON.parse(
        xmlToJson(backToXml, { pretty: false }),
      );

      console.log(`\n   Round-trip verification:`);
      console.log(
        `   Original structure keys: ${Object.keys(originalParsed.dict).join(", ")}`,
      );
      console.log(
        `   Round-trip structure keys: ${Object.keys(roundTripParsed.dict).join(", ")}`,
      );
      console.log(
        `   Structure preserved: ${JSON.stringify(originalParsed.dict.key) === JSON.stringify(roundTripParsed.dict.key) ? "✅" : "❌"}`,
      );

      expect(originalParsed.dict.key).toEqual(roundTripParsed.dict.key);
      expect(originalParsed.dict.string).toEqual(roundTripParsed.dict.string);
    });
  });
});
