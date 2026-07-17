# Limitations

## No-React Compiler Path

- The compiler supports a React-shaped subset, not arbitrary React applications.
- React context is not compiled yet.
- `createPortal`, `Suspense`, `lazy`, transitions, and concurrent rendering are not compiled.
- `forwardRef` and `useImperativeHandle` should be replaced with explicit custom-element method metadata.
- `useEffect` and `useLayoutEffect` are no-ops in the first compiler runtime.
- The first DOM runtime uses full replace-rendering per update rather than keyed reconciliation.
- React SyntheticEvents do not cross the Web Component boundary.
- CSS-in-JS runtime extraction is not supported; use static `styles` metadata or regular CSS.
- Render-prop APIs and function-as-children need explicit adapters.
- Custom elements require kebab-case tag names.
- Older browsers may require Custom Elements or Shadow DOM polyfills.

## Legacy Runtime Bridge

The old runtime bridge still exists for compatibility, but it uses React and ReactDOM as peer dependencies. It is not the right integration path when Angular/plain HTML consumers require no React in the production bundle.
