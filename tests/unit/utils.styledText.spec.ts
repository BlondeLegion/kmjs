//FILE: tests/unit/utils.styledText.spec.ts

// Tests for src/utils/utils.styledText.ts

import { describe, it, expect } from "vitest";
import {
  decodeStyledTextData,
  encodeStyledTextData,
  updateStyledTextInXml,
  stripRtfToPlainText,
  wrapBase64,
  StyledTextError,
  type DecodedStyledText,
} from "../../src/utils/utils.styledText.js";

describe("utils.styledText", () => {
  // Real Keyboard Maestro StyledText examples
  const kmExample1 = {
    base64:
      "cnRmZAAAAAADAAAAAgAAAAcAAABUWFQucnRmAQAAAC5sAQAAKwAAAAEAAABkAQAAe1xydGYxXGFuc2lcYW5zaWNwZzEyNTJcY29jb2FydGYyODIyClxjb2NvYXRleHRzY2FsaW5nMFxjb2NvYXBsYXRmb3JtMHtcZm9udHRibFxmMFxmcm9tYW5cZmNoYXJzZXQwIFRpbWVzLUJvbGQ7fQp7XGNvbG9ydGJsO1xyZWQyNTVcZ3JlZW4yNTVcYmx1ZTI1NTtccmVkMFxncmVlbjBcYmx1ZTA7fQp7XCpcZXhwYW5kZWRjb2xvcnRibDs7XGNzc3JnYlxjMFxjMFxjMDt9ClxkZWZ0YWI3MjAKXHBhcmRccGFyZGVmdGFiNzIwXHNhMjk4XHBhcnRpZ2h0ZW5mYWN0b3IwCgpcZjBcYlxmczM2IFxjZjAgXGV4cG5kMFxleHBuZHR3MFxrZXJuaW5nMApcb3V0bDBcc3Ryb2tld2lkdGgwIFxzdHJva2VjMiBFeGFtcGxlUlRGVGV4dDFcCn0BAAAAIwAAAAEAAAAHAAAAVFhULnJ0ZhAAAAATQ4RotgEAAAAAAAAAAAAA",
    expectedText: "ExampleRTFText1",
  };

  const kmExample2 = {
    base64:
      "cnRmZAAAAAADAAAAAgAAAAcAAABUWFQucnRmAQAAAC4WAQAAKwAAAAEAAAAOAQAAe1xydGYxXGFuc2lcYW5zaWNwZzEyNTJcY29jb2FydGYyODIyClxjb2NvYXRleHRzY2FsaW5nMFxjb2NvYXBsYXRmb3JtMHtcZm9udHRibFxmMFxmbmlsXGZjaGFyc2V0MCBDb21pY1NhbnNNUy1Cb2xkO30Ke1xjb2xvcnRibDtccmVkMjU1XGdyZWVuMjU1XGJsdWUyNTU7fQp7XCpcZXhwYW5kZWRjb2xvcnRibDs7fQpcZGVmdGFiNzA5ClxwYXJkXHBhcmRlZnRhYjcwOVxwYXJ0aWdodGVuZmFjdG9yMAoKXGYwXGJcZnM4MCBcY2YwIFx1bCBcdWxjMCBFeGFtcGxlUlRGVGV4dDJ9AQAAACMAAAABAAAABwAAAFRYVC5ydGYQAAAAVkOEaLYBAAAAAAAAAAAAAA==",
    expectedText: "ExampleRTFText2",
  };

  // Sample XML with real KM StyledText data
  const sampleKmXml1 = `<dict>
  <key>StyledText</key>
  <data>
${kmExample1.base64}
  </data>
  <key>Text</key>
  <string>${kmExample1.expectedText}</string>
</dict>`;

  describe("decodeStyledTextData", () => {
    it("should decode real Keyboard Maestro StyledText data (Example 1)", () => {
      const result = decodeStyledTextData(kmExample1.base64);

      expect(result.rtf).toContain("rtf1");
      expect(result.rtf).toContain("Times-Bold");
      expect(result.text).toContain(kmExample1.expectedText);
    });

    it("should decode real Keyboard Maestro StyledText data (Example 2)", () => {
      const result = decodeStyledTextData(kmExample2.base64);

      expect(result.rtf).toContain("rtf1");
      expect(result.rtf).toContain("ComicSansMS-Bold");
      expect(result.text).toContain(kmExample2.expectedText);
    });

    it("should handle base64 with whitespace and newlines", () => {
      // Test with wrapped base64 (KM often wraps at 76 chars)
      const wrappedBase64 =
        kmExample1.base64.match(/.{1,40}/g)?.join("\n") || kmExample1.base64;

      const result = decodeStyledTextData(wrappedBase64);

      expect(result.rtf).toContain("rtf1");
      expect(result.text).toContain(kmExample1.expectedText);
    });

    it("should handle invalid base64 gracefully", () => {
      // Node.js Buffer.from() is quite forgiving, so let's test what actually happens
      const result = decodeStyledTextData("!!!invalid!!!");

      // Should still return a result, but the RTF might be garbled
      expect(result).toHaveProperty("rtf");
      expect(result).toHaveProperty("text");
      expect(typeof result.rtf).toBe("string");
      expect(typeof result.text).toBe("string");
    });

    it("should return DecodedStyledText interface", () => {
      const result: DecodedStyledText = decodeStyledTextData(kmExample1.base64);

      expect(result).toHaveProperty("rtf");
      expect(result).toHaveProperty("text");
      expect(typeof result.rtf).toBe("string");
      expect(typeof result.text).toBe("string");
    });
  });

  describe("encodeStyledTextData", () => {
    it("should encode and decode round-trip with real KM data", () => {
      // First decode real KM data
      const decoded = decodeStyledTextData(kmExample1.base64);

      // Then encode it back
      const reencoded = encodeStyledTextData(decoded.rtf, false);

      // Decode again to verify
      const redecoded = decodeStyledTextData(reencoded);

      expect(redecoded.rtf).toBe(decoded.rtf);
      expect(redecoded.text).toContain(kmExample1.expectedText);
    });

    it("should wrap base64 at 76 characters by default", () => {
      const decoded = decodeStyledTextData(kmExample1.base64);
      const result = encodeStyledTextData(decoded.rtf);

      const lines = result.split("\n");
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(76);
      });
    });

    it("should not wrap when wrap=false", () => {
      const decoded = decodeStyledTextData(kmExample1.base64);
      const result = encodeStyledTextData(decoded.rtf, false);

      expect(result).not.toContain("\n");
    });
  });

  describe("stripRtfToPlainText", () => {
    it("should extract plain text from real KM RTF (Example 1)", () => {
      const decoded = decodeStyledTextData(kmExample1.base64);
      const result = stripRtfToPlainText(decoded.rtf);

      expect(result).toContain(kmExample1.expectedText);
      // Should not contain RTF control words
      expect(result).not.toContain("\\rtf1");
      expect(result).not.toContain("\\f0");
    });

    it("should extract plain text from real KM RTF (Example 2)", () => {
      const decoded = decodeStyledTextData(kmExample2.base64);
      const result = stripRtfToPlainText(decoded.rtf);

      expect(result).toContain(kmExample2.expectedText);
      // Should not contain RTF control words
      expect(result).not.toContain("\\rtf1");
      expect(result).not.toContain("\\ul");
    });

    it("should handle RTF control words", () => {
      const rtf = "{\\rtf1\\ansi\\deff0\\f0\\fs24 Hello \\b World\\b0}";
      const result = stripRtfToPlainText(rtf);

      expect(result).toBe("Hello World");
    });

    it("should convert hex escapes", () => {
      const rtf = "{\\rtf1\\ansi\\deff0 Hello\\'20World}"; // \\'20 is space
      const result = stripRtfToPlainText(rtf);

      expect(result).toContain("Hello World");
    });

    it("should collapse multiple whitespace", () => {
      const rtf = "{\\rtf1\\ansi\\deff0   Hello    World   }";
      const result = stripRtfToPlainText(rtf);

      expect(result).toBe("Hello World");
    });

    it("should handle empty or minimal RTF", () => {
      expect(stripRtfToPlainText("{}")).toBe("");
      expect(stripRtfToPlainText("{\\rtf1}")).toBe("");
      expect(stripRtfToPlainText("")).toBe("");
    });
  });

  describe("wrapBase64", () => {
    it("should wrap base64 at specified width", () => {
      const base64 = "A".repeat(100);
      const result = wrapBase64(base64, 10);

      const lines = result.split("\n");
      expect(lines).toHaveLength(10);
      lines.forEach((line) => {
        expect(line.length).toBe(10);
      });
    });

    it("should use default width of 76", () => {
      const base64 = "A".repeat(152); // 2 * 76
      const result = wrapBase64(base64);

      const lines = result.split("\n");
      expect(lines).toHaveLength(2);
      expect(lines[0]).toHaveLength(76);
      expect(lines[1]).toHaveLength(76);
    });

    it("should handle strings shorter than wrap width", () => {
      const base64 = "ABC";
      const result = wrapBase64(base64, 10);

      expect(result).toBe("ABC");
    });

    it("should handle empty string", () => {
      const result = wrapBase64("", 10);
      expect(result).toBe("");
    });
  });

  describe("updateStyledTextInXml", () => {
    it("should update StyledText data and Text string with real KM data", () => {
      const transformer = (rtf: string) =>
        rtf.replace("ExampleRTFText1", "UpdatedText1");

      const result = updateStyledTextInXml(sampleKmXml1, transformer);

      expect(result).toContain("UpdatedText1");
      expect(result).not.toContain("ExampleRTFText1");
    });

    it("should handle XML without StyledText", () => {
      const xmlWithoutStyledText = `
<dict>
  <key>SomeOtherKey</key>
  <string>Value</string>
</dict>`.trim();

      const transformer = (rtf: string) => rtf;
      const result = updateStyledTextInXml(xmlWithoutStyledText, transformer);

      expect(result).toBe(xmlWithoutStyledText);
    });

    it("should handle XML without Text key", () => {
      const xmlWithoutText = `
<dict>
  <key>StyledText</key>
  <data>
${kmExample1.base64}
  </data>
</dict>`.trim();

      const transformer = (rtf: string) =>
        rtf.replace("ExampleRTFText1", "UpdatedText1");
      const result = updateStyledTextInXml(xmlWithoutText, transformer);

      // Should still update StyledText even without Text key
      expect(result).toContain("StyledText");
    });

    it("should escape XML entities in updated text", () => {
      const transformer = (rtf: string) =>
        rtf.replace("ExampleRTFText1", 'Hello <World> & "Friends"');

      const result = updateStyledTextInXml(sampleKmXml1, transformer);

      expect(result).toContain("&lt;World&gt; &amp; &quot;Friends&quot;");
    });
  });

  describe("StyledTextError", () => {
    it("should be an instance of Error", () => {
      const error = new StyledTextError("test message");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StyledTextError);
      expect(error.name).toBe("StyledTextError");
      expect(error.message).toBe("test message");
    });

    it("should be catchable with instanceof", () => {
      try {
        throw new StyledTextError("test");
      } catch (error) {
        expect(error instanceof StyledTextError).toBe(true);
      }
    });
  });

  describe("integration tests with real KM data", () => {
    it("should round-trip encode/decode correctly with real data", () => {
      const originalDecoded = decodeStyledTextData(kmExample1.base64);

      const encoded = encodeStyledTextData(originalDecoded.rtf);
      const decoded = decodeStyledTextData(encoded);

      expect(decoded.rtf).toBe(originalDecoded.rtf);
      expect(decoded.text).toContain(kmExample1.expectedText);
    });

    it("should handle complex RTF with real KM formatting", () => {
      const decoded1 = decodeStyledTextData(kmExample1.base64);
      const decoded2 = decodeStyledTextData(kmExample2.base64);

      // Example 1 should have Times-Bold font
      expect(decoded1.rtf).toContain("Times-Bold");
      expect(decoded1.text).toContain("ExampleRTFText1");

      // Example 2 should have ComicSansMS-Bold font and underline
      expect(decoded2.rtf).toContain("ComicSansMS-Bold");
      expect(decoded2.rtf).toContain("\\ul"); // underline
      expect(decoded2.text).toContain("ExampleRTFText2");
    });

    it("should preserve RTF structure when transforming text", () => {
      const transformer = (rtf: string) =>
        rtf.replace("ExampleRTFText1", "NewText");
      const result = updateStyledTextInXml(sampleKmXml1, transformer);

      // Should still contain RTF structure
      expect(result).toContain("StyledText");
      expect(result).toContain("data");
      expect(result).toContain("NewText");

      // Verify the updated data can be decoded
      const dataMatch = result.match(/<data>\s*([\s\S]*?)\s*<\/data>/);
      expect(dataMatch).toBeTruthy();

      if (dataMatch) {
        const updatedData = dataMatch[1].replace(/\s+/g, "");
        const decoded = decodeStyledTextData(updatedData);
        expect(decoded.text).toContain("NewText");
        expect(decoded.rtf).toContain("Times-Bold"); // Should preserve formatting
      }
    });
  });
});
