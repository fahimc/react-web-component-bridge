# @codedia/react-to-web-component-runtime

Runtime primitives and metadata contracts for compiling React-shaped TSX into standards-based Web Components.

Most users should pair this package with `@codedia/react-to-web-component-compiler`. The compiler is the no-React production path: it removes React imports, lowers TSX, and emits browser-native Custom Element modules. This runtime package provides the shared tag contract, metadata helpers, controller primitives, and optional authoring facade used by that workflow.

## Install

```bash
pnpm add @codedia/react-to-web-component-runtime
pnpm add -D @codedia/react-to-web-component-compiler
```

React can remain in the authoring workspace for types, tests, and migration. Angular, plain HTML, Vue, or CMS consumers of the compiled output should not need React or ReactDOM in their production bundle.

## Package Exports

```ts
import {
  createReactElement,
  defineReactElement,
  defineReactElements,
  createMetadata
} from "@codedia/react-to-web-component-runtime";
```

```ts
import React, {
  defineComponentTag,
  useMemo,
  useState
} from "@codedia/react-to-web-component-runtime/react";
```

- `@codedia/react-to-web-component-runtime` exposes the lower-level element definition APIs and metadata helpers.
- `@codedia/react-to-web-component-runtime/react` exposes a React-compatible authoring facade. Use it when component authors want inline `defineComponentTag` metadata in source.
- `@codedia/react-to-web-component-runtime/metadata` exposes metadata helpers for generators and tooling.

## Runtime Role In The No-React Compiler Path

The compiler consumes the runtime contract but does not use React as a hidden renderer. In the no-React path:

1. Component source can keep normal `react` imports.
2. Tag metadata describes the browser contract.
3. The compiler strips React imports from output.
4. JSX lowers to compiler-runtime virtual nodes.
5. Hooks and helpers map to per-element browser runtime state.
6. Generated Custom Element classes own attributes, properties, events, methods, slots, styles, and lifecycle.

The emitted consumer module must not import `react`, `react-dom`, the JSX runtime, or `createRoot`.

## Define Inline Metadata

Inline metadata is useful when the component source should carry its own Web Component contract.

```tsx
import React, {
  defineComponentTag,
  useMemo,
  useState
} from "@codedia/react-to-web-component-runtime/react";

type Customer = { id: string; name: string };

function CustomerPicker(props: {
  customers?: Customer[];
  selectedId?: string;
  onCustomerSelect?: (customer: Customer) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => (props.customers ?? []).filter((customer) => customer.name.includes(query)),
    [props.customers, query]
  );

  return (
    <section>
      <input value={query} onInput={(event) => setQuery(event.currentTarget.value)} />
      {matches.map((customer) => (
        <button onClick={() => props.onCustomerSelect?.(customer)}>{customer.name}</button>
      ))}
    </section>
  );
}

defineComponentTag("acme-customer-picker", CustomerPicker, {
  shadow: { mode: "open" },
  props: {
    customers: { attribute: false, default: [] },
    selectedId: { attribute: "selected-id", type: "string", reflect: true }
  },
  events: {
    onCustomerSelect: {
      name: "customer-select",
      detail: (customer) => customer
    }
  },
  styles: ":host{display:block}"
});
```

## Web Component Contract

The tag options describe how React-shaped props and component behavior cross the browser boundary.

- `props`: Maps attributes and DOM properties into component props. Primitive values can reflect to attributes; arrays, objects, functions, and nodes should stay property-only.
- `events`: Maps callback props to native `CustomEvent` dispatchers with configurable event names and detail payloads.
- `slots`: Projects consumer DOM into default or named slots.
- `methods`: Exposes public methods on the custom-element instance.
- `styles`: Injects static styles into the custom element's root.
- `shadow`: Chooses open shadow DOM, closed shadow DOM, or light DOM behavior.
- `form`: Supports form-associated custom element behavior where configured.

## Compatibility Notes

The package still contains compatibility APIs for the older React-backed runtime bridge. That path treats React and ReactDOM as peer dependencies and creates internal React roots. It is useful for compatibility and tests, but it is not the production path for Angular teams that require no React in the final bundle.

For no-React production output, use the compiler package and scan emitted bundles for React runtime markers.

```bash
react-to-web-component-compiler compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.web-components.js \
  --definition customer-picker.rwcb.json
```

## More Documentation

- Website: https://react-to-web-component-compiler.netlify.app
- Repository: https://github.com/fahimc/react-to-web-component-compiler
- Markdown overview: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/overview.md
- Editor preview workflow: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/editor-preview.md
- Supported React API: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/supported-react-api.md
- Architecture workflow: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/architecture-workflow.md
- Angular and HTML consumption: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/angular-html-consumption.md
