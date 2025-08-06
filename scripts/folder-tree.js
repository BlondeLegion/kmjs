#!/usr/bin/env node

// -------------------------
// Standalone Folder Tree Generator
// -------------------------
// Converted from Keyboard Maestro script to standalone Node.js script
// Usage: node scripts/folder-tree.js [options] <folder-path>

const fs = require("fs");
const path = require("path");
const chalk = require("chalk").default;

// -------------------------
// Configuration
// -------------------------

// Default folders to exclude for brevity
const DEFAULT_EXCLUDED_FOLDERS = [
  "node_modules",
  ".git",
  "dist",
  ".DS_Store",
  "failures",
];

// -------------------------
// Helper Functions
// -------------------------

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    folderPath: null,
    outputPath: null,
    excludeFolders: [...DEFAULT_EXCLUDED_FOLDERS],
    showSizes: true, // Default to showing file sizes
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--output" || arg === "-o") {
      options.outputPath = args[++i];
    } else if (arg === "--exclude" || arg === "-e") {
      const additionalExcludes = args[++i].split(",").map((s) => s.trim());
      options.excludeFolders.push(...additionalExcludes);
    } else if (arg === "--no-sizes" || arg === "-n") {
      options.showSizes = false;
    } else if (!options.folderPath) {
      options.folderPath = arg;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
${chalk.bold("Folder Tree Generator")}

${chalk.yellow("Usage:")} node scripts/folder-tree.js [options] <folder-path>

${chalk.yellow("Options:")}
  ${chalk.cyan("-h, --help")}              Show this help message
  ${chalk.cyan("-o, --output <path>")}     Output to file instead of console
  ${chalk.cyan("-e, --exclude <list>")}    Additional folders to exclude (comma-separated)
                         ${chalk.dim("Default exclusions:")} ${chalk.dim(DEFAULT_EXCLUDED_FOLDERS.join(", "))}
  ${chalk.cyan("-n, --no-sizes")}          Hide file sizes (default: show sizes)

${chalk.yellow("Examples:")}
  ${chalk.green("node scripts/folder-tree.js .")}
  ${chalk.green("node scripts/folder-tree.js --output tree.txt .")}
  ${chalk.green('node scripts/folder-tree.js --exclude "temp,cache" .')}
  ${chalk.green("node scripts/folder-tree.js --no-sizes .")}
  ${chalk.green('node scripts/folder-tree.js --output tree.txt --exclude "build,tmp" --no-sizes ./src')}

${chalk.yellow("Arguments:")}
  ${chalk.cyan("<folder-path>")}          Path to the folder to analyze (required)
`);
}

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeBytes = stats.size;
    const sizeMB = fileSizeBytes / (1024 * 1024);
    return sizeMB.toFixed(2);
  } catch (error) {
    return "0.00";
  }
}

/**
 * Get file color based on file extension
 */
function getFileStyle(fileName) {
  const ext = path.extname(fileName).toLowerCase();

  // Define file type styling
  const fileTypes = {
    // Code files
    ".ts": chalk.blue,
    ".js": chalk.yellow,
    ".json": chalk.green,
    ".md": chalk.cyan,

    // test files
    ".spec.ts": chalk.orange,

    // Config files
    ".yml": chalk.purple,
    ".yaml": chalk.purple,
    ".toml": chalk.gray,
    ".config": chalk.gray,
    ".editorconfig": chalk.gray,

    // Keyboard Maestro files
    ".kmmacros": chalk.magenta,

    // Other files
    ".txt": chalk.white,
    ".log": chalk.dim,
  };

  const colorFunction = fileTypes[ext] || chalk.white;
  return {
    styledName: colorFunction(fileName),
  };
}

/**
 * Check if path is a directory
 */
function isDirectory(pathStr) {
  try {
    return fs.statSync(pathStr).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * List directory contents
 */
function listDir(pathStr) {
  try {
    return fs.readdirSync(pathStr);
  } catch (error) {
    throw new Error(`Error listing directory ${pathStr}: ${error.message}`);
  }
}

// -------------------------
// Main Functionality
// -------------------------

/**
 * Generate a textual tree representation of the folder structure
 */
function generateTree(currentFolder, level, excludeFolders, showSizes = true) {
  let treeText = "";
  const folderName = path.basename(currentFolder);
  // Style folder names with blue color
  treeText += " ".repeat(level * 4) + chalk.blue.bold(folderName) + "\n";

  // Check if folder should be excluded
  if (excludeFolders.includes(folderName)) {
    treeText +=
      " ".repeat((level + 1) * 4) +
      chalk.dim(`└─ (${folderName} excluded for brevity)`) +
      "\n";
    return treeText;
  }

  try {
    const items = listDir(currentFolder);

    items.forEach((item) => {
      if (item === ".DS_Store") return;

      const fullPath = path.join(currentFolder, item);

      if (isDirectory(fullPath)) {
        treeText += generateTree(
          fullPath,
          level + 1,
          excludeFolders,
          showSizes,
        );
      } else {
        const { styledName } = getFileStyle(item);
        if (showSizes) {
          const sizeMB = getFileSizeMB(fullPath);
          const sizeText = chalk.dim(`${sizeMB} MB`);
          treeText +=
            " ".repeat((level + 1) * 4) +
            `├─ ${styledName} ${chalk.dim("-")} ${sizeText}\n`;
        } else {
          treeText += " ".repeat((level + 1) * 4) + `├─ ${styledName}\n`;
        }
      }
    });
  } catch (error) {
    treeText +=
      " ".repeat((level + 1) * 4) +
      chalk.red(`└─ (Error reading directory: ${error.message})`) +
      "\n";
  }

  return treeText;
}

/**
 * Generate the complete folder tree with XML-style wrapper
 */
function generateFolderTree(folderPath, excludeFolders, showSizes = true) {
  const treeText = generateTree(folderPath, 0, excludeFolders, showSizes);
  const finalTreeText = `

${chalk.bold.cyan("<Folder Structure>")}

${treeText}
${chalk.bold.cyan("</Folder Structure>")}

`;
  return finalTreeText;
}

// -------------------------
// Execution
// -------------------------

function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.folderPath) {
    console.error(chalk.red("Error: Folder path is required"));
    console.error(chalk.yellow("Use --help for usage information"));
    process.exit(1);
  }

  // Resolve the folder path
  const resolvedPath = path.resolve(options.folderPath);

  // Check if the folder exists
  if (!fs.existsSync(resolvedPath)) {
    console.error(chalk.red(`Error: Folder does not exist: ${resolvedPath}`));
    process.exit(1);
  }

  if (!isDirectory(resolvedPath)) {
    console.error(chalk.red(`Error: Path is not a directory: ${resolvedPath}`));
    process.exit(1);
  }

  // Generate the tree
  console.error(
    chalk.blue(`Generating folder tree for: ${chalk.bold(resolvedPath)}`),
  );
  console.error(
    chalk.dim(`   Excluding folders: ${options.excludeFolders.join(", ")}`),
  );
  console.error(
    chalk.dim(
      `   Show file sizes: ${options.showSizes ? chalk.green("yes") : chalk.yellow("no")}`,
    ),
  );

  const treeText = generateFolderTree(
    resolvedPath,
    options.excludeFolders,
    options.showSizes,
  );

  // Output the result
  if (options.outputPath) {
    try {
      fs.writeFileSync(options.outputPath, treeText, "utf8");
      console.error(
        chalk.green(`Tree written to: ${chalk.bold(options.outputPath)}`),
      );
    } catch (error) {
      console.error(chalk.red(`Error writing to file: ${error.message}`));
      process.exit(1);
    }
  } else {
    console.log(treeText);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateFolderTree,
  generateTree,
  parseArgs,
};
