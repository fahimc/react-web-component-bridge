# Limitations

## No-React Compiler Path

The compiler now supports the previously unsupported React authoring APIs through a standalone browser runtime: context, reducer/effect hooks, forwarded refs, imperative handles, portals, lazy components, Suspense fallbacks, transition/deferred-value shims, external-store subscriptions, and common element helpers.

Compatibility notes:

- The generated bundle still contains no React or ReactDOM.
- Effects run from the compiled custom-element lifecycle, not React's scheduler.
- Transitions are synchronous compatibility shims because there is no React concurrent scheduler.
- Lazy components resolve promises and rerender the owning custom element.
- The first DOM runtime uses full replace-rendering per update rather than React's keyed reconciler.
- React SyntheticEvents do not cross the Web Component boundary; event metadata should emit stable `CustomEvent.detail` data.
- CSS-in-JS runtime extraction is not supported; use static `styles` metadata or regular CSS.
- Custom elements require kebab-case tag names.
- Older browsers may require Custom Elements or Shadow DOM polyfills.

## Legacy Runtime Bridge

The old runtime bridge still exists for compatibility, but it uses React and ReactDOM as peer dependencies. It is not the right integration path when Angular/plain HTML consumers require no React in the production bundle.
