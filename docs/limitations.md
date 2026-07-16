# Limitations

- React remains part of the runtime.
- One React root normally exists per custom-element instance.
- Complex ReactNode callback props cannot automatically become HTML slots.
- Render-prop APIs require adapters.
- React SyntheticEvents should not cross the Web Component boundary.
- CSS-in-JS libraries may require Shadow DOM integration.
- Body-level portals may lose Shadow DOM styling.
- Angular forms may require `ngDefaultControl` or custom value accessors.
- Server-side rendering is limited to safe imports.
- Custom elements require kebab-case names.
- Closed Shadow DOM reduces debugging and integration capabilities.
- Older browsers may require polyfills.
