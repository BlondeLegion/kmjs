#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Types to generate schemas for
const types = [
  "KMCondition",
  "ClickKind",
  "MouseButton",
  "MouseDrag",
  "RelativeCorner",
  "ImageSource",
  "ImageSelection",
  "ScreenArea",
];

const schemaDir = path.join(__dirname, "../tests/integration/permutations");
const finalSchemaPath = path.join(schemaDir, "schema.json");

// Ensure directory exists
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir, { recursive: true });
}

// Delete existing schema files
fs.readdirSync(schemaDir).forEach((file) => {
  if (file.startsWith("schema") || file.startsWith("temp-")) {
    fs.unlinkSync(path.join(schemaDir, file));
  }
});

console.log("Generating schemas for all types...");

let combinedSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {},
};

let completed = 0;

types.forEach((typeName, index) => {
  const tempFile = path.join(schemaDir, `temp-${typeName}.json`);
  const cmd = `typescript-json-schema src/virtual_actions/types/index.ts ${typeName} --required --noExtraProps --esModuleInterop --skipLibCheck --skipTypeCheck --out ${tempFile}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating schema for ${typeName}:`, error);
      return;
    }

    try {
      const typeSchema = JSON.parse(fs.readFileSync(tempFile, "utf8"));
      console.log(`Processing ${typeName}:`, {
        hasDefinitions: !!typeSchema.definitions,
        hasEnum: !!typeSchema.enum,
        hasAnyOf: !!typeSchema.anyOf,
        keys: Object.keys(typeSchema),
      });

      // Add to combined schema
      if (typeSchema.definitions) {
        Object.assign(combinedSchema.definitions, typeSchema.definitions);
      }

      // For simple enum types that are the root type, add them directly to definitions
      if (typeSchema.enum) {
        combinedSchema.definitions[typeName] = typeSchema;
      } else if (!typeSchema.definitions && !typeSchema.anyOf) {
        // For any other root-level type that's not in definitions
        combinedSchema.definitions[typeName] = typeSchema;
      }

      // Add the main type if it's not in definitions
      if (typeName === "KMCondition" && typeSchema.anyOf) {
        combinedSchema.anyOf = typeSchema.anyOf;
      }

      // Clean up temp file
      fs.unlinkSync(tempFile);
    } catch (parseError) {
      console.error(`Error parsing schema for ${typeName}:`, parseError);
    }

    completed++;

    if (completed === types.length) {
      // Write final combined schema
      fs.writeFileSync(
        finalSchemaPath,
        JSON.stringify(combinedSchema, null, 2),
      );
      console.log(`✅ Combined schema written to ${finalSchemaPath}`);
      console.log(
        `   Included ${Object.keys(combinedSchema.definitions).length} type definitions`,
      );
      console.log(
        `   Definitions: ${Object.keys(combinedSchema.definitions).join(", ")}`,
      );
    }
  });
});
