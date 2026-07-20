# @codedia/react-to-web-component-runtime

React Web Component Bridge lets teams author components in React-shaped TSX and expose them through standards-based Custom Elements.

For Angular, plain HTML, Vue, and CMS consumers that need no React in the production bundle, use the companion compiler package:

```bash
pnpm add @codedia/react-to-web-component-runtime
pnpm add -D @codedia/react-to-web-component-compiler
```

The package also exports a React-compatible authoring facade at `@codedia/react-to-web-component-runtime/react` for inline `defineComponentTag` metadata.

Documentation: https://react-to-web-component-compiler.netlify.app

Repository: https://github.com/fahimc/react-to-web-component-compiler
