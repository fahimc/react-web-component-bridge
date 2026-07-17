# React Web Component Bridge

`@fahimc/react-web-component-bridge` lets teams author components in React-shaped TSX and ship them as browser-native Web Components without React in the final consumer bundle.

The compiler path is the intended Angular/plain HTML integration path:

1. Keep component source close to React authoring patterns.
2. Use `defineComponentTag` metadata to describe props, events, slots, methods, and styles.
3. Run the generator compiler.
4. Import the emitted custom-element JavaScript from Angular, HTML, Vue, or a CMS.

The emitted production module contains no `react`, no `react-dom`, and no `createRoot`.

## Install

```bash
pnpm add -D @fahimc/react-web-component-bridge-generator
pnpm add @fahimc/react-web-component-bridge
```

React can remain in the authoring workspace for types and migration, but Angular consumers of the compiled output do not need to install React or ReactDOM.

## Author React-Shaped TSX

```tsx
import React, {
  defineComponentTag,
  useMemo,
  useState
} from "@fahimc/react-web-component-bridge/react";

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
react-web-component-bridge compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.custom-elements.js
```

For a folder:

```bash
react-web-component-bridge compile-folder --dir src/components --out-dir dist/components
```

The compiler:

- removes React facade imports,
- lowers TSX to a small DOM runtime,
- replaces supported hooks with per-element hook cells,
- turns `defineComponentTag` metadata into custom-element classes,
- emits JavaScript that does not import React or ReactDOM.

## Replace Existing React Imports

For migration, rewrite exact `react` imports to the bridge facade before compiling:

```bash
react-web-component-bridge replace-react-imports --dir src/components --dry-run
react-web-component-bridge replace-react-imports --dir src/components
```

```diff
- import React, { useState } from "react";
+ import React, { useState } from "@fahimc/react-web-component-bridge/react";
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
