const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const terser = require("@rollup/plugin-terser");
const fs = require("fs");
const path = require("path");

// Plugin to embed token data directly in the bundle
const embedTokenData = () => ({
  name: "embed-token-data",
  renderChunk(code) {
    // Check if this chunk contains the token lookup code
    if (code.includes("getEmbeddedTokenData")) {
      // Read the token mapping data
      const tokenDataPath = path.join(
        __dirname,
        "src",
        "tokens",
        "data",
        "km.tokens.mapping.json",
      );
      const tokenData = JSON.parse(fs.readFileSync(tokenDataPath, "utf8"));

      // Replace the getEmbeddedTokenData function with the actual data
      // This regex matches the compiled JavaScript version
      const embeddedDataFunction = `function getEmbeddedTokenData() {
    return ${JSON.stringify(tokenData)};
}`;

      const modifiedCode = code.replace(
        /function getEmbeddedTokenData\(\)[^{]*\{[\s\S]*?throw new Error\([^)]*\);[\s\S]*?\}/,
        embeddedDataFunction,
      );

      if (modifiedCode !== code) {
        console.log("Embedded token data directly in bundle");
        return {
          code: modifiedCode,
          map: null,
        };
      }
    }
    return null;
  },
});

const createConfig = (minified = false) => ({
  input: "src/index.ts",
  output: {
    file: `bundle/kmjs${minified ? ".min" : ""}.js`,
    format: "cjs",
    exports: "named",
    sourcemap: !minified,
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
      outDir: undefined,
      module: "esnext",
      target: "es2018",
    }),
    embedTokenData(),
    ...(minified ? [terser()] : []),
  ],
  external: [
    // Keep Node.js built-ins external
    "child_process",
    "fs",
    "path",
    "os",
    "util",
  ],
});

module.exports = [
  createConfig(false), // Regular bundle
  createConfig(true), // Minified bundle
];
