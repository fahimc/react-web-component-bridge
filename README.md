# React Web Component Bridge

`@fahimc/react-web-component-bridge` exposes existing React components as browser-native Custom Elements. It does not translate React source code into Angular, Vue, or another framework. React remains the runtime renderer and is kept as a peer dependency.

## Installation

```bash
pnpm add @fahimc/react-web-component-bridge react react-dom
```

Peer dependencies support React 18 and React 19.

## Five-minute Quick Start

```tsx
import { defineReactElement } from "@fahimc/react-web-component-bridge";

defineReactElement("acme-customer-picker", CustomerPicker, {
  shadow: { mode: "open" },
  props: {
    customers: { attribute: false },
    selectedId: { attribute: "selected-id", type: "string", reflect: true },
    loading: { type: "boolean", reflect: true, default: false },
    pageSize: { attribute: "page-size", type: "number", reflect: true, default: 20 }
  },
  events: {
    onCustomerSelect: {
      name: "customer-select",
      detail: (customer) => customer,
      bubbles: true,
      composed: true
    }
  },
  slots: {
    children: true,
    emptyState: "empty-state",
    footer: "footer"
  }
});
```

## Props and Attributes

Primitive props can map to attributes. Complex values such as arrays, objects, functions, class instances, and React nodes should stay property-only by using `attribute: false`.

Built-in types are `string`, `number`, `boolean`, `json`, and `date`. Custom `parseAttribute`, `serializeAttribute`, `validate`, and `transform` hooks are available. Reflection is guarded to avoid attribute/property loops, and multiple synchronous updates are batched into a microtask render.

## Events

React callback props can dispatch browser `CustomEvent`s. Events default to `bubbles: true`, `composed: true`, and `cancelable: false`.

```ts
events: {
  onRowSelect: {
    name: "row-select",
    detail: (row, index) => ({ row, index })
  }
}
```

React SyntheticEvents should not cross the custom-element boundary; build event detail from stable data.

## Slots

Default and named slots are mapped to React props using stable `<slot>` wrappers. React does not own the slotted DOM nodes; consumers own them and the wrapper exposes them to the React component.

## Shadow DOM and Light DOM

`shadow: { mode: "open" }` creates a Shadow Root with a stable React mount part. `shadow: false` renders in light DOM. Styles can be strings, arrays, `CSSStyleSheet` instances, or functions of the host. Constructable stylesheets are used when available, with `<style>` fallback.

## Context Providers

Use `configureReactElements({ wrap })` for global providers and `options.wrap` for local providers. Local wrappers run before global wrappers, so application-level providers can consistently surround component-level providers.

## Portals

`portal.enabled` creates an overlay container and passes it to a prop such as `portalContainer`. Targets can be the Shadow DOM, host, body, a supplied element, or a function. Body-level portals may lose Shadow DOM styling.

## Form-associated Controls

`form` enables `static formAssociated = true` and uses `ElementInternals` when available. The runtime updates form value and standard `input`/`change` events when the configured value prop changes.

## Public Methods

Methods call a forwarded React ref and throw clearly before mount unless `queue: true` is enabled.

## Framework Integration

- Plain HTML: assign complex props imperatively and listen with `addEventListener`.
- React: use refs for object/array properties and native event listeners for custom events.
- Angular: use `CUSTOM_ELEMENTS_SCHEMA`, property bindings for primitives, imperative refs for methods, and `ngDefaultControl` or custom value accessors for forms.
- Vue: bind primitive props normally and use refs for method calls or property-only objects.

## SSR Limitations

Importing the package is SSR-safe. Calling `defineReactElement()` requires `customElements` and must run in a browser.

## Browser Support

Modern evergreen browsers are targeted. Older browsers may need Custom Elements, Shadow DOM, or Constructable Stylesheet polyfills.

## Accessibility Guidance

The bridge preserves React output. Accessibility quality still depends on the React component. Examples include combobox semantics, modal roles, focus handling, form labels, disabled states, and validation messages.

## Performance Guidance

Each element normally owns one React root. Updates are batched in a microtask. Use property-only complex data to avoid serialization costs.

## Troubleshooting

- Invalid custom element names must be kebab-case.
- React and ReactDOM must resolve from the consuming app.
- Body portals need global styles.
- Angular forms may need `ngDefaultControl` or a custom control value accessor.

## API Reference

Exports include `createReactElement`, `defineReactElement`, `defineReactElements`, `configureReactElements`, `isReactElementDefined`, `getReactElementDefinition`, and the public TypeScript types listed in `src/types/public.ts`.

## Contribution and Release

Run `pnpm validate` before opening a PR. Releases use Changesets. npm publishing is intentionally disabled unless a token exists and publication is explicitly requested.
