# Publishing Guide for kmjs

This document outlines the steps to prepare and publish the kmjs package.

## Pre-Publishing Checklist

### 1. Validate Package

```bash
yarn validate:package
```

This checks:

- ✅ Build output exists (`dist/` folder)
- ✅ Required files present (README.md, LICENSE, package.json)
- ✅ Package.json has required fields
- ✅ TypeScript compiles without errors

### 2. Create Bundles

```bash
yarn bundle:info
```

This creates:

- `bundle/kmjs.js` - Regular bundle with source maps (~246KB)
- `bundle/kmjs.min.js` - Minified bundle (~63KB)

### 3. Test Local Development Setup

```bash
yarn setup:local
```

This:

- Builds the project
- Creates a yarn link for local testing
- Provides instructions for using in other projects

## Local Testing Workflow

### Method 1: Using npm pack (Recommended)

This method creates a tarball that exactly matches what would be published, avoiding `.git` folder issues:

```bash
# In kmjs directory
yarn build
npm pack

# This creates kmjs-1.0.0.tgz (or current version)
# In your test project
yarn add -D file:/path/to/kmjs/kmjs-1.0.0.tgz

# Import and use
import { runVirtualMacro, createVirtualNotification } from 'kmjs';
```

### Method 2: Using yarn link

```bash
# In kmjs directory
yarn build
yarn link

# In your test project
yarn link "kmjs"

# Import and use
import { runVirtualMacro, createVirtualNotification } from 'kmjs';
```

### Method 3: Using the Bundle

```bash
# Copy bundle/kmjs.js to your project
const { runVirtualMacro, createVirtualNotification } = require('./kmjs.js');
```

**Note**: Avoid using `yarn add file:...` directly as it copies the entire directory including `.git` and dev files.

## Publishing Steps

### 1. Update Version

```bash
# For bug fixes
yarn version patch

# For new features
yarn version minor

# For breaking changes
yarn version major
```

### 2. Final Validation

```bash
yarn validate:package
yarn bundle:info

# Test the actual package contents
npm pack
tar -tzf kmjs-*.tgz | head -20  # Verify only dist/ files are included
```

### 3. Publish to npm

```bash
# Dry run first
yarn publish --dry-run

# Actual publish
yarn publish
```

## Anonymous Publishing

The package is configured for anonymous publishing under the "BlondeLegion" GitHub account:

- **Author**: BlondeLegion (anonymous pseudonym)
- **Repository**: https://github.com/BlondeLegion/kmjs
- **License**: MIT (allows anonymous publishing)

This is completely allowed by npm and GitHub. Many successful packages are published anonymously or under pseudonyms.

## Package Structure

The published package includes only:

- `dist/` - Compiled JavaScript and TypeScript definitions (source files only, no tests)
- `README.md` - Documentation
- `LICENSE` - MIT license
- `CHANGELOG.md` - Version history

**Excluded from package**: `src/`, `tests/`, `scripts/`, `.kiro/`, `.git/`, and all other development files are automatically excluded via the `files` array in `package.json` and `.npmignore`.

## Development Tools

### Available Scripts

- `yarn build` - Compile TypeScript
- `yarn bundle` - Create single-file bundles with Rollup
- `yarn bundle:watch` - Watch mode for bundle development
- `yarn bundle:info` - Create bundles and show file sizes
- `yarn clean` - Remove build artifacts
- `yarn setup:local` - Set up for local development
- `yarn validate:package` - Pre-publishing validation

### Rollup Configuration

The project uses Rollup for bundling to provide:

- tree-shaking
- Multiple output formats
- Source maps for debugging
- Minification with terser
- Experience relevant to Vite/Rollup workflows

## Troubleshooting

### Common Issues

**Problem**: Local install includes `.git` folder and dev files
**Solution**: Use `npm pack` method instead of `yarn add file:...`

**Problem**: Test files appear in `dist/` folder
**Solution**: Ensure `tsconfig.json` excludes test directories and run `yarn clean && yarn build`

**Problem**: Package size is too large
**Solution**: Check `npm pack` output to verify only necessary files are included

## Notes

- Integration tests are not run during validation (they take 30+ minutes)
- The package uses yarn consistently throughout all scripts and documentation
- Chalk v5 compatibility is handled in utility scripts
- Bundle externals include Node.js built-ins to keep size reasonable
- TypeScript configuration excludes test files from compilation to keep package clean
