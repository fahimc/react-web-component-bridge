# @codedia/react-to-web-component-compiler

Compile React-shaped TSX into browser-native Custom Element modules that do not ship React, ReactDOM, the JSX runtime, or `createRoot` to the consumer bundle.

This package is the build-time half of React To Web Component Compiler. It lets teams keep familiar React component authoring patterns while producing standards-based tags that Angular, plain HTML, Vue, CMS pages, and mixed-framework applications can consume without installing React.

## What It Does

The compiler reads component source plus a Web Component tag contract, then emits vanilla browser JavaScript.

1. Parses React-shaped TSX.
2. Reads registration metadata from CLI flags, a `.rwcb.json` definition file, or inline `defineComponentTag` calls.
3. Removes `react`, `react-dom`, JSX runtime, and optional facade imports from production output.
4. Lowers JSX into a small virtual-node representation.
5. Translates supported hooks and React helpers to compiler-runtime equivalents.
6. Generates a Custom Element class with attribute/property mapping, events, slots, methods, styles, and lifecycle behavior.
7. Emits a module that defines one or more custom-element tags.

The result is a browser module, not a React wrapper. Angular users import that generated module once and then place tags such as `<acme-customer-picker>` in templates.

## Install

```bash
pnpm add -D @codedia/react-to-web-component-compiler
pnpm add @codedia/react-to-web-component-runtime
```

`@codedia/react-to-web-component-runtime` is installed because the compiler uses its public metadata contract and shared runtime primitives. The compiled consumer bundle must still scan clean for React runtime imports when using the no-React compiler path.

## Compile One Component

```bash
react-to-web-component-compiler compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.web-components.js \
  --tag acme-customer-picker \
  --component CustomerPicker
```

The source can keep normal React imports:

```tsx
import React, { useMemo, useState } from "react";

export function CustomerPicker({ customers = [], onCustomerSelect }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => customers.filter((customer) => customer.name.includes(query)),
    [customers, query]
  );

  return (
    <section>
      <input value={query} onInput={(event) => setQuery(event.currentTarget.value)} />
      {matches.map((customer) => (
        <button onClick={() => onCustomerSelect?.(customer)}>{customer.name}</button>
      ))}
    </section>
  );
}
```

## Use A Definition File

Use a definition file when the tag contract needs explicit props, events, slots, methods, styles, or form behavior.

```json
{
  "tagName": "acme-customer-picker",
  "component": "CustomerPicker",
  "options": {
    "shadow": { "mode": "open" },
    "props": {
      "customers": { "attribute": false, "default": [] },
      "selectedId": { "attribute": "selected-id", "type": "string", "reflect": true }
    },
    "events": {
      "onCustomerSelect": {
        "name": "customer-select"
      }
    },
    "styles": ":host{display:block}"
  }
}
```

```bash
react-to-web-component-compiler compile \
  --input src/customer-picker.tsx \
  --out-file dist/customer-picker.web-components.js \
  --definition customer-picker.rwcb.json
```

## Compile A Folder

```bash
react-to-web-component-compiler compile-folder \
  --dir src/components \
  --out-dir dist/components
```

Folder compilation is intended for component libraries and larger migrations. Keep definition files beside source files, or pass explicit registrations when compiling individual entries.

## Optional Import Replacement

Changing imports is not required for the compiler path. Existing code can continue to import from `react`; the compiler removes those imports from emitted output.

Use import replacement only when authors want to use bridge-only metadata helpers inline:

```bash
react-to-web-component-compiler replace-react-imports --dir src/components --dry-run
react-to-web-component-compiler replace-react-imports --dir src/components
```

This changes exact `react` imports to the authoring facade:

```diff
- import React, { useState } from "react";
+ import React, { useState } from "@codedia/react-to-web-component-runtime/react";
```

The command intentionally leaves `react-dom`, `react-dom/client`, and `react/jsx-runtime` for manual review because those imports usually indicate app bootstrapping or rendering behavior that needs an explicit migration decision.

## Supported React-Shaped API

The no-React compiler supports:

- TSX elements and fragments
- Function components
- `useState`, `useReducer`, `useMemo`, `useCallback`, `memo`, and `useRef`
- `useEffect`, `useLayoutEffect`, and `useInsertionEffect`
- `createContext` and `useContext`
- `forwardRef`, `createRef`, and `useImperativeHandle`
- `createPortal`
- `lazy` and `Suspense` fallback rendering
- `useTransition`, `startTransition`, and `useDeferredValue`
- `useSyncExternalStore`
- `createElement`, `cloneElement`, `isValidElement`, and `Children`
- `useId` and `useDebugValue`
- Props, reflected primitive attributes, property-only complex values, slots, CustomEvents, public methods, and static styles

Compatibility boundaries:

- Effects run from the Custom Element lifecycle, not React's scheduler.
- Transitions are synchronous browser-runtime shims.
- Lazy components resolve promises and rerender the owning custom element.
- The current renderer uses replace-rendering rather than React reconciliation.
- Callback props become native `CustomEvent` dispatchers.
- React SyntheticEvents, React hydration, and runtime CSS-in-JS extraction are outside the no-React Web Component contract.

## Angular Consumption

```ts
import "./generated/customer-picker.web-components.js";

@Component({
  selector: "app-root",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <acme-customer-picker
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

Use attributes for primitive reflected values. Use DOM properties for arrays, objects, functions, nodes, and large data.

## Bundle Verification

After compiling and building the host app, scan the production consumer bundle:

```bash
rg -n 'react-dom|createRoot|ReactDOM|from "react"|from '\''react'\''' dist
```

For the no-React compiler path, that scan should not find React runtime imports in the generated Web Component output.

## More Documentation

- Website: https://react-to-web-component-compiler.netlify.app
- Repository: https://github.com/fahimc/react-to-web-component-compiler
- Markdown overview: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/overview.md
- Editor preview workflow: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/editor-preview.md
- Supported React API: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/supported-react-api.md
- Architecture workflow: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/architecture-workflow.md
- Angular and HTML consumption: https://github.com/fahimc/react-to-web-component-compiler/blob/main/docs/site/angular-html-consumption.md
- Ten source-to-output conversion examples: https://github.com/fahimc/react-to-web-component-compiler/tree/main/examples/conversions
