//FILE: tests/unit/utils.kmet.spec.ts

// Tests for src/utils/utils.kmet.ts

import { describe, it, expect } from "vitest";
import {
  encodeTextForJson,
  encodeTextForXml,
  xmlToJson,
  jsonToXml,
  searchReplaceInText,
  type XmlToJsonOptions,
  type JsonToXmlOptions,
  type SearchReplaceOptions,
} from "../../src/utils/utils.kmet.js";

describe("utils.kmet", () => {
  describe("encodeTextForJson", () => {
    it("should escape basic JSON special characters", () => {
      const input = 'Hello "world" with \\ and \n newline';
      const result = encodeTextForJson(input);

      expect(result).toBe('Hello \\"world\\" with \\\\ and \\n newline');
    });

    it("should handle empty string", () => {
      const result = encodeTextForJson("");
      expect(result).toBe("");
    });

    it("should handle string with no special characters", () => {
      const input = "Hello World";
      const result = encodeTextForJson(input);
      expect(result).toBe("Hello World");
    });

    it("should handle all JSON escape sequences", () => {
      const input = '"\\\b\f\n\r\t';
      const result = encodeTextForJson(input);
      expect(result).toBe('\\"\\\\\\b\\f\\n\\r\\t');
    });

    it("should handle unicode characters", () => {
      const input = "Hello 🌍 World";
      const result = encodeTextForJson(input);
      expect(result).toBe("Hello 🌍 World");
    });
  });

  describe("encodeTextForXml", () => {
    it("should escape basic XML special characters", () => {
      const input = '<tag attr="value">content & more</tag>';
      const result = encodeTextForXml(input);

      expect(result).toBe(
        "&lt;tag attr=&quot;value&quot;&gt;content &amp; more&lt;/tag&gt;",
      );
    });

    it("should handle apostrophes", () => {
      const input = "It's a test";
      const result = encodeTextForXml(input);
      expect(result).toBe("It&apos;s a test");
    });

    it("should handle backslashes", () => {
      const input = "Path\\to\\file";
      const result = encodeTextForXml(input);
      expect(result).toBe("Path\\\\to\\\\file");
    });

    it("should handle empty string", () => {
      const result = encodeTextForXml("");
      expect(result).toBe("");
    });

    it("should handle string with no special characters", () => {
      const input = "Hello World";
      const result = encodeTextForXml(input);
      expect(result).toBe("Hello World");
    });

    it("should handle all XML entities", () => {
      const input = "<>&'\"\\";
      const result = encodeTextForXml(input);
      expect(result).toBe("&lt;&gt;&amp;&apos;&quot;\\\\");
    });
  });

  describe("xmlToJson", () => {
    it("should convert simple XML to JSON", () => {
      const xml = "<root><item>value</item></root>";
      const result = xmlToJson(xml);

      const parsed = JSON.parse(result);
      expect(parsed.root.item).toBe("value");
    });

    it("should handle XML with attributes", () => {
      const xml = '<root><item id="1" name="test">value</item></root>';
      const result = xmlToJson(xml);

      const parsed = JSON.parse(result);
      expect(parsed.root.item["@_id"]).toBe("1");
      expect(parsed.root.item["@_name"]).toBe("test");
      expect(parsed.root.item["#text"]).toBe("value");
    });

    it("should handle KM-style plist XML", () => {
      const xml = `
        <dict>
          <key>MacroActionType</key>
          <string>Notification</string>
          <key>Title</key>
          <string>Test</string>
        </dict>
      `;
      const result = xmlToJson(xml);

      const parsed = JSON.parse(result);
      expect(parsed.dict).toBeDefined();
    });

    it("should pretty print by default", () => {
      const xml = "<root><item>value</item></root>";
      const result = xmlToJson(xml);

      expect(result).toContain("\n");
      expect(result).toContain("  "); // 2-space indentation
    });

    it("should minify when pretty is false", () => {
      const xml = "<root><item>value</item></root>";
      const result = xmlToJson(xml, { pretty: false });

      expect(result).not.toContain("\n");
    });

    it("should handle empty XML elements", () => {
      const xml = "<root><empty/><item>value</item></root>";
      const result = xmlToJson(xml);

      const parsed = JSON.parse(result);
      expect(parsed.root.empty).toBe("");
      expect(parsed.root.item).toBe("value");
    });

    it("should handle malformed XML gracefully", () => {
      const invalidXml = "<root><unclosed>";
      // fast-xml-parser is quite forgiving, so let's test what actually happens
      const result = xmlToJson(invalidXml);

      expect(typeof result).toBe("string");
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });
  });

  describe("jsonToXml", () => {
    it("should convert simple JSON object to XML", () => {
      const json = { root: { item: "value" } };
      const result = jsonToXml(json);

      expect(result).toContain("<root>");
      expect(result).toContain("<item>value</item>");
      expect(result).toContain("</root>");
    });

    it("should convert JSON string to XML", () => {
      const jsonString = '{"root":{"item":"value"}}';
      const result = jsonToXml(jsonString);

      expect(result).toContain("<root>");
      expect(result).toContain("<item>value</item>");
      expect(result).toContain("</root>");
    });

    it("should handle attributes with @_ prefix", () => {
      const json = {
        root: {
          item: {
            "@_id": "1",
            "@_name": "test",
            "#text": "value",
          },
        },
      };
      const result = jsonToXml(json);

      expect(result).toContain('id="1"');
      expect(result).toContain('name="test"');
      expect(result).toContain(">value<");
    });

    it("should pretty print by default", () => {
      const json = { root: { item: "value" } };
      const result = jsonToXml(json);

      expect(result).toContain("\n");
      expect(result).toContain("\t"); // tab indentation
    });

    it("should minify when requested", () => {
      const json = { root: { item: "value" } };
      const result = jsonToXml(json, { minify: true });

      // Should have minimal whitespace
      expect(result.split("\n").length).toBeLessThan(5);
    });

    it("should handle arrays", () => {
      const json = { root: { items: ["item1", "item2"] } };
      const result = jsonToXml(json);

      expect(result).toContain("<items>item1</items>");
      expect(result).toContain("<items>item2</items>");
    });

    it("should throw error for invalid JSON string", () => {
      const invalidJson = '{"invalid": json}';
      expect(() => jsonToXml(invalidJson)).toThrow();
    });
  });

  describe("searchReplaceInText", () => {
    const sampleXml = `
      <dict>
        <key>MacroActionType</key>
        <string>SetVariable</string>
        <key>Variable</key>
        <string>Local_MyVar</string>
        <key>Text</key>
        <string>Local_Value</string>
      </dict>
    `;

    it("should perform literal string replacement", () => {
      const result = searchReplaceInText(sampleXml, "Local_", "Global_", {
        literal: true,
      });

      expect(result).toContain("Global_MyVar");
      expect(result).toContain("Global_Value");
      expect(result).not.toContain("Local_");
    });

    it("should perform regex replacement", () => {
      const result = searchReplaceInText(
        sampleXml,
        /Local_(\w+)/g,
        "Global_$1",
      );

      expect(result).toContain("Global_MyVar");
      expect(result).toContain("Global_Value");
      expect(result).not.toContain("Local_");
    });

    it("should handle case-insensitive literal replacement", () => {
      const input = "Hello WORLD and hello world";
      const result = searchReplaceInText(input, "hello", "hi", {
        literal: true,
        ignoreCase: true,
      });

      expect(result).toBe("hi WORLD and hi world");
    });

    it("should handle case-insensitive regex replacement", () => {
      const input = "Hello WORLD and hello world";
      const result = searchReplaceInText(input, /hello/gi, "hi");

      expect(result).toBe("hi WORLD and hi world");
    });

    it("should escape special regex characters in literal mode", () => {
      const input = "Price: $5.99 (special)";
      const result = searchReplaceInText(input, "$5.99", "$6.99", {
        literal: true,
      });

      expect(result).toBe("Price: $6.99 (special)");
    });

    it("should handle empty replacement", () => {
      const input = "Remove this text";
      const result = searchReplaceInText(input, "this ", "", { literal: true });

      expect(result).toBe("Remove text");
    });

    it("should handle no matches", () => {
      const input = "No matches here";
      const result = searchReplaceInText(input, "xyz", "abc", {
        literal: true,
      });

      expect(result).toBe(input);
    });

    it("should preserve XML structure during replacement", () => {
      const result = searchReplaceInText(sampleXml, "Local_", "Global_", {
        literal: true,
      });

      // Should still be valid XML structure
      expect(result).toContain("<dict>");
      expect(result).toContain("</dict>");
      expect(result).toContain("<key>MacroActionType</key>");
      expect(result).toContain("<string>SetVariable</string>");
    });

    it("should handle string patterns when literal is false", () => {
      const input = "test123test";
      const result = searchReplaceInText(input, "test", "TEST", {
        literal: false,
      });

      expect(result).toBe("TEST123TEST");
    });
  });

  describe("integration tests", () => {
    it("should round-trip XML to JSON and back preserving structure", () => {
      const originalXml =
        "<dict><key>MacroActionType</key><string>Notification</string><key>Title</key><string>Test Title</string></dict>";

      const json = xmlToJson(originalXml);
      const backToXml = jsonToXml(json);

      // Parse both to compare structure (ignoring whitespace differences)
      const originalParsed = JSON.parse(
        xmlToJson(originalXml, { pretty: false }),
      );
      const roundTripParsed = JSON.parse(
        xmlToJson(backToXml, { pretty: false }),
      );

      // Compare the actual data structure, not whitespace
      expect(originalParsed.dict.key).toEqual(roundTripParsed.dict.key);
      expect(originalParsed.dict.string).toEqual(roundTripParsed.dict.string);
    });

    it("should handle complex KM macro structure", () => {
      const kmMacro = `<dict><key>Actions</key><array><dict><key>MacroActionType</key><string>SetVariable</string><key>Variable</key><string>Local_Test</string><key>Text</key><string>Hello World</string></dict></array><key>CreationDate</key><real>774213049.26031303</real><key>ModificationDate</key><real>774213049.26031303</real></dict>`;

      const json = xmlToJson(kmMacro);
      const parsed = JSON.parse(json);

      // Check that the structure is parsed correctly
      expect(parsed.dict).toBeDefined();
      expect(parsed.dict.key).toBeDefined(); // keys become arrays
      expect(parsed.dict.array).toBeDefined();
      expect(parsed.dict.real).toBeDefined();
    });

    it("should perform variable renaming in KM XML", () => {
      const kmXml = `
        <dict>
          <key>MacroActionType</key>
          <string>SetVariable</string>
          <key>Variable</key>
          <string>Local_OldName</string>
          <key>Text</key>
          <string>Value for Local_OldName</string>
        </dict>
      `;

      const updated = searchReplaceInText(
        kmXml,
        "Local_OldName",
        "Global_NewName",
        { literal: true },
      );

      expect(updated).toContain("Global_NewName");
      expect(updated).not.toContain("Local_OldName");
      expect(updated).toContain("<key>Variable</key>");
      expect(updated).toContain("<string>SetVariable</string>");
    });

    it("should encode and use text in JSON context", () => {
      const rawText = 'He said "Hello" & waved';
      const encoded = encodeTextForJson(rawText);

      const jsonString = `{"message": "${encoded}"}`;
      const parsed = JSON.parse(jsonString);

      expect(parsed.message).toBe(rawText);
    });

    it("should encode and use text in XML context", () => {
      const rawText = '<greeting>Hello & "welcome"</greeting>';
      const encoded = encodeTextForXml(rawText);

      const xmlString = `<root><message>${encoded}</message></root>`;
      const json = xmlToJson(xmlString);
      const parsed = JSON.parse(json);

      expect(parsed.root.message).toBe(rawText);
    });
  });

  describe("type safety", () => {
    it("should accept XmlToJsonOptions", () => {
      const options: XmlToJsonOptions = { pretty: false };
      const xml = "<root><item>test</item></root>";

      const result = xmlToJson(xml, options);
      expect(typeof result).toBe("string");
    });

    it("should accept JsonToXmlOptions", () => {
      const options: JsonToXmlOptions = { minify: true };
      const json = { root: { item: "test" } };

      const result = jsonToXml(json, options);
      expect(typeof result).toBe("string");
    });

    it("should accept SearchReplaceOptions", () => {
      const options: SearchReplaceOptions = { literal: true, ignoreCase: true };
      const input = "Test String";

      const result = searchReplaceInText(input, "test", "demo", options);
      expect(result).toBe("demo String");
    });
  });
});
