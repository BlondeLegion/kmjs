# Basic kmjs Usage Example

This example demonstrates how to use `kmjs` in another TypeScript/Node.js project.

## Setup

1. Make sure you've built and linked the main kmjs project:

   ```bash
   # In the main kmjs directory
   cd ../..
   yarn build
   yarn link
   ```

2. Install dependencies and link to kmjs:
   ```bash
   # In this example directory
   yarn install
   yarn link "kmjs"
   ```

## Running the Example

```bash
# Run with ts-node (recommended for development)
yarn dev

# Or compile and run with node
yarn start
```

## What This Example Shows

- **Basic virtual macro creation**: Creating notifications, pauses, and typing actions
- **System information access**: Using KM tokens and query helpers
- **Variable manipulation**: Setting and getting Keyboard Maestro variables
- **Composing complex workflows**: Combining multiple actions into sequences

## Key Takeaways

- Import functions directly from `'kmjs'`
- All virtual actions return objects with a `.toXml()` method
- Use `runVirtualMacro()` to execute action sequences
- Query helpers provide instant access to system information
- Variables can be shared between your Node.js code and Keyboard Maestro macros
