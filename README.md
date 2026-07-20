# React To Web Component Compiler

`@codedia/react-to-web-component-runtime` lets teams author components in React-shaped TSX and ship them as browser-native Web Components without React in the final consumer bundle.

The compiler path is the intended Angular/plain HTML integration path:

1. Keep component source close to React authoring patterns.
2. Use `defineComponentTag` metadata to describe props, events, slots, methods, and styles.
3. Run the generator compiler.
4. Import the emitted custom-element JavaScript from Angular, HTML, Vue, or a CMS.

The emitted production module contains no `react`, no `react-dom`, and no `createRoot`.

## Documentation Map

- Website: https://react-to-web-component-compiler.netlify.app
- Markdown site docs: [docs/site/index.md](./docs/site/index.md)
- Overview: [docs/site/overview.md](./docs/site/overview.md)
- Editor preview workflow: [docs/site/editor-preview.md](./docs/site/editor-preview.md)
- Supported React API: [docs/site/supported-react-api.md](./docs/site/supported-react-api.md)
- Architecture and translation workflow: [docs/site/architecture-workflow.md](./docs/site/architecture-workflow.md)
- Angular and HTML consumption: [docs/site/angular-html-consumption.md](./docs/site/angular-html-consumption.md)
- Ten React-to-Web-Component conversion examples: [examples/conversions/README.md](./examples/conversions/README.md)

Regenerate the Markdown site docs after website copy changes:

```bash
pnpm docs:site:md
```

Regenerate the committed conversion examples after compiler changes:

```bash
pnpm examples:conversions
```

## Install

```bash
pnpm add -D @codedia/react-to-web-component-compiler
pnpm add @codedia/react-to-web-component-runtime
```

React can remain in the authoring workspace for types and migration, but Angular consumers of the compiled output do not need to install React or ReactDOM.

## Author React-Shaped TSX

Existing React imports can stay as-is. The compiler strips `react` imports and provides compiler-runtime equivalents in the emitted bundle.

```tsx
import React, { useMemo, useState } from "react";

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
```

Then supply the Web Component tag contract from the CLI or a JSON definition file:

```bash
react-to-web-component-compiler compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.custom-elements.js \
  --tag acme-customer-picker \
  --component CustomerPicker
```

For richer props, events, slots, methods, and styles, use a definition file:

```json
{
  "tagName": "acme-customer-picker",
  "component": "CustomerPicker",
  "options": {
    "props": {
      "customers": { "attribute": false, "default": [] },
      "selectedId": { "attribute": "selected-id", "type": "string" }
    },
    "events": {
      "onCustomerSelect": { "name": "customer-select" }
    },
    "styles": ":host{display:block}"
  }
}
```

```bash
react-to-web-component-compiler compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.custom-elements.js \
  --definition customer-picker.rwcb.json
```

You can still define the tag inline when component authors own the source:

```tsx
import React, {
  defineComponentTag,
  useMemo,
  useState
} from "@codedia/react-to-web-component-runtime/react";

defineComponentTag("acme-customer-picker", CustomerPicker, {
  props: {
    customers: { attribute: false, default: [] },
    selectedId: { attribute: "selected-id", type: "string" }
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

## Compile Without React

```bash
react-to-web-component-compiler compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.custom-elements.js \
  --tag acme-customer-picker \
  --component CustomerPicker
```

For a folder:

```bash
react-to-web-component-compiler compile-folder --dir src/components --out-dir dist/components
```

The compiler:

- removes React imports,
- lowers TSX to a small DOM runtime,
- replaces supported hooks with per-element hook cells,
- turns inline or external tag metadata into custom-element classes,
- emits JavaScript that does not import React or ReactDOM.

## Replace Existing React Imports

Import replacement is optional for the compiler path. Use it only when you want source files to import bridge-only authoring helpers inline.

```bash
react-to-web-component-compiler replace-react-imports --dir src/components --dry-run
react-to-web-component-compiler replace-react-imports --dir src/components
```

```diff
- import React, { useState } from "react";
+ import React, { useState } from "@codedia/react-to-web-component-runtime/react";
```

The command intentionally leaves `react-dom`, `react-dom/client`, and `react/jsx-runtime` alone so compiler migration can review those call sites explicitly.

## Consume From Angular

Import the compiled bundle once and render the tag:

```ts
import "./generated/customer-picker.custom-elements.js";

@Component({
  selector: "app-root",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <acme-customer-picker
      #picker
      selected-id="cust-1002"
      (customer-select)="selectCustomer($event)"
    ></acme-customer-picker>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild("picker", { static: true }) picker!: ElementRef<
    HTMLElement & { customers: Customer[] }
  >;

  ngAfterViewInit() {
    this.picker.nativeElement.customers = this.customers;
  }
}
```

The repo includes `examples/angular-consumer`, which imports `src/generated/react-components.custom-elements.js`. That file is generated from `src/react-components.tsx` and the Angular production bundle scans clean for React runtime markers.

## Supported Compiler Subset

Supported in the no-React compiler path:

- TSX elements and fragments,
- function components,
- `useState`,
- `useReducer`,
- `useMemo`,
- `useRef`,
- `useEffect`, `useLayoutEffect`, and `useInsertionEffect`,
- `useCallback`, `memo`, `useDeferredValue`, `useTransition`, and `startTransition`,
- `useSyncExternalStore`,
- `createContext` and `useContext`,
- `forwardRef` and `useImperativeHandle`,
- `createPortal`,
- `lazy` and `Suspense` fallback rendering,
- `createElement`, `cloneElement`, `isValidElement`, `Children`, and `createRef`,
- `useId` and `useDebugValue`,
- props and primitive attributes,
- property-only arrays/objects,
- named/default slots,
- callback props to `CustomEvent`,
- public custom-element methods,
- static style metadata.

Compatibility notes:

- Effects run from the compiled custom-element lifecycle, not React's scheduler.
- Transitions are synchronous browser-runtime shims.
- Lazy components resolve through promises and rerender the owning custom element.
- The first renderer uses replace-rendering rather than React's reconciler.
- CSS-in-JS runtime extraction and React SyntheticEvent transport are intentionally outside the Web Component contract.

These APIs must never silently pull React into the production bundle.

## Legacy Runtime Bridge

Some existing package exports still support the old React-backed runtime bridge for compatibility and tests. That path uses React as a peer dependency and creates internal React roots. It is not the correct path for Angular users who require no React in production.

## Validation

```bash
pnpm validate
pnpm --filter angular-consumer build
rg -n 'react-dom|createRoot|ReactDOM|from "react"|from '\\''react'\\''' examples/angular-consumer/dist/angular-consumer/browser/main.js
```

The scan should return no matches for the compiled Angular path.
