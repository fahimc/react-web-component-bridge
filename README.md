# React Web Component Bridge

`@fahimc/react-web-component-bridge` is a React API facade for shipping existing React components as browser-native Web Components. Component authors keep writing normal React components, but import React from the bridge facade. The bridge registers a custom-element tag that can be dropped into Angular, plain HTML, Vue, or any framework that understands Custom Elements.

React is still the renderer under the hood and remains a peer dependency. The package adapts props, attributes, events, slots, form behavior, styles, and lifecycle into a standards-based Web Component boundary.

## Installation

```bash
pnpm add @fahimc/react-web-component-bridge react react-dom
```

Peer dependencies support React 18 and React 19.

## Author React Code

Use the bridge React facade instead of importing directly from `react`.

```tsx
import React, {
  defineComponentTag,
  useMemo,
  useState
} from "@fahimc/react-web-component-bridge/react";

type CustomerPickerProps = {
  customers: Array<{ id: string; name: string }>;
  selectedId?: string;
  onCustomerSelect?: (customer: { id: string; name: string }) => void;
};

export function CustomerPicker({ customers, selectedId, onCustomerSelect }: CustomerPickerProps) {
  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => customers.filter((customer) => customer.name.toLowerCase().includes(query.toLowerCase())),
    [customers, query]
  );

  return (
    <section>
      <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
      {matches.map((customer) => (
        <button
          aria-pressed={customer.id === selectedId}
          key={customer.id}
          type="button"
          onClick={() => onCustomerSelect?.(customer)}
        >
          {customer.name}
        </button>
      ))}
    </section>
  );
}

defineComponentTag("acme-customer-picker", CustomerPicker, {
  shadow: { mode: "open" },
  props: {
    customers: { attribute: false },
    selectedId: { attribute: "selected-id", type: "string", reflect: true }
  },
  events: {
    onCustomerSelect: {
      name: "customer-select",
      detail: (customer) => customer
    }
  }
});
```

`defineComponentTag` registers the Web Component immediately. `createComponentTag` returns a deferred definition with `.define()` when package authors want to export definitions without side effects.

## Replace Existing React Imports

The generator package includes a folder-level import rewrite command for moving existing component source onto the bridge facade.

```bash
pnpm --filter @fahimc/react-web-component-bridge-generator build
react-web-component-bridge replace-react-imports --dir src/components --dry-run
react-web-component-bridge replace-react-imports --dir src/components
```

It rewrites exact `react` module specifiers in `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.mts`, `.cjs`, and `.cts` files:

```diff
- import React, { useState } from "react";
+ import React, { useState } from "@fahimc/react-web-component-bridge/react";
```

It intentionally leaves `react-dom`, `react-dom/client`, and `react/jsx-runtime` alone.

## Consume From Angular

Import the Web Component bundle once, then use the generated tags in templates. Complex values should be assigned as DOM properties because HTML attributes only carry strings.

```ts
import "@acme/customer-components/web-components";

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

  customers = sampleCustomers;

  ngAfterViewInit() {
    this.picker.nativeElement.customers = this.customers;
  }

  selectCustomer(event: Event) {
    console.log((event as CustomEvent<Customer>).detail);
  }
}
```

The repo includes `examples/angular-consumer`, which imports `@fahimc/react-web-component-bridge-test-components/web-components` and renders React-authored tags such as `rwcb-customer-grid`, `rwcb-customer-picker`, `rwcb-address-control`, and `rwcb-modal-dialog`.

## Plain HTML

```html
<script type="module" src="/components/web-components.js"></script>

<acme-customer-picker selected-id="cust-1002"></acme-customer-picker>

<script type="module">
  const picker = document.querySelector("acme-customer-picker");
  picker.customers = [{ id: "cust-1002", name: "Ada Lovelace" }];
  picker.addEventListener("customer-select", (event) => {
    console.log(event.detail);
  });
</script>
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

## Slots, Styles, Portals, And Forms

Default and named slots are mapped to React props using stable `<slot>` wrappers. Shadow DOM styles can be strings, arrays, `CSSStyleSheet` instances, or functions of the host. Portal containers can target the Shadow DOM, host, body, a supplied element, or a function. Form-associated custom elements use `ElementInternals` when available.

## API Reference

Primary React facade export: `@fahimc/react-web-component-bridge/react`.

- React-compatible exports: default `React`, `createElement`, `Fragment`, `StrictMode`, hooks, `memo`, `forwardRef`, `lazy`, common React types, and more.
- Web Component facade exports: `defineComponentTag`, `createComponentTag`, `defineWebComponent`, `createWebComponent`, and `configureReactApi`.
- Advanced runtime exports: `createReactElement`, `defineReactElement`, `defineReactElements`, `configureReactElements`, registry helpers, metadata helpers, and public TypeScript types.

## Validation

Run `pnpm validate` before opening a PR. Releases use Changesets. npm publishing is intentionally disabled unless a token exists and publication is explicitly requested.

## Website

The repository includes a Netlify-ready documentation and preview site in `site/`.

```bash
pnpm build
pnpm build:site
pnpm --filter rwcb-site preview
```

The site documents the module, supported React facade APIs, unsupported behaviors, Angular and HTML consumption, and the runtime architecture. It also includes a live editor that updates a React-authored Web Component preview and generated bridge, HTML, and Angular snippets.
