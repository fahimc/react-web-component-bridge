# @fahimc/react-web-component-bridge-generator

Compiler and metadata tooling for React Web Component Bridge.

Use it to compile React-shaped TSX into browser-native Custom Element modules with no `react`, `react-dom`, JSX runtime import, or `createRoot` in the emitted consumer bundle.

```bash
pnpm add -D @fahimc/react-web-component-bridge-generator
pnpm add @fahimc/react-web-component-bridge
```

Compile one component:

```bash
react-web-component-bridge compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.custom-elements.js \
  --tag acme-customer-picker \
  --component CustomerPicker
```

Compile a folder:

```bash
react-web-component-bridge compile-folder --dir src/components --out-dir dist/components
```

Documentation: https://react-web-component-bridge-site.netlify.app

Repository: https://github.com/fahimc/react-web-component-bridge
