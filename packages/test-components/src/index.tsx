import React, {
  configureReactApi,
  createContext,
  defineComponentTag,
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState
} from "@codedia/react-to-web-component-runtime/react";
import { createPortal } from "react-dom";

export type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
};

export type Column = {
  key: keyof Customer;
  label: string;
};

const ThemeContext = createContext("light");

export type CustomerDataGridHandle = {
  clearSelection(): void;
  focusFilter(): void;
  scrollToRow(id: string): void;
};

export const CustomerDataGrid = forwardRef<
  CustomerDataGridHandle,
  {
    rows?: Customer[];
    columns?: Column[];
    pageSize?: number;
    loading?: boolean;
    toolbar?: React.ReactNode;
    footer?: React.ReactNode;
    emptyState?: React.ReactNode;
    onRowSelect?: (row: Customer, index: number) => void;
    onSortChange?: (key: keyof Customer) => void;
    onFilterChange?: (query: string) => void;
    onPageChange?: (page: number) => void;
  }
>((props, ref) => {
  const rows = props.rows ?? [];
  const columns = props.columns ?? [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" }
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);
  const filtered = rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));
  useImperativeHandle(ref, () => ({
    clearSelection: () => setSelected(null),
    focusFilter: () => filterRef.current?.focus(),
    scrollToRow: (id) => document.getElementById(`row-${id}`)?.scrollIntoView()
  }));
  return (
    <section part="grid">
      <header part="toolbar">
        {props.toolbar}
        <input
          ref={filterRef}
          aria-label="Filter customers"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            props.onFilterChange?.(event.currentTarget.value);
          }}
        />
      </header>
      {props.loading ? <p part="loading">Loading</p> : null}
      {!props.loading && filtered.length === 0 ? <div part="empty">{props.emptyState}</div> : null}
      <table part="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key as string}>
                <button onClick={() => props.onSortChange?.(column.key)}>{column.label}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, props.pageSize ?? 20).map((row, index) => (
            <tr
              id={`row-${row.id}`}
              key={row.id}
              data-selected={selected === row.id}
              onClick={() => {
                setSelected(row.id);
                props.onRowSelect?.(row, index);
              }}
            >
              {columns.map((column) => (
                <td key={column.key as string}>{String(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <footer part="footer">{props.footer}</footer>
    </section>
  );
});
CustomerDataGrid.displayName = "CustomerDataGrid";

export type CustomerPickerHandle = {
  focusSearch(): void;
  clearSelection(): void;
};

export const CustomerPicker = forwardRef<
  CustomerPickerHandle,
  {
    customers?: Customer[];
    selectedId?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    portalContainer?: HTMLElement;
    emptyState?: React.ReactNode;
    loadingState?: React.ReactNode;
    onCustomerSelect?: (customer: Customer | null) => void;
    onSearchChange?: (query: string) => void;
  }
>((props, ref) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const customers = props.customers ?? [];
  const selected = customers.find((customer) => customer.id === props.selectedId) ?? null;
  const filtered = customers.filter((customer) =>
    customer.name.toLowerCase().includes(query.toLowerCase())
  );
  useImperativeHandle(ref, () => ({
    focusSearch: () => searchRef.current?.focus(),
    clearSelection: () => props.onCustomerSelect?.(null)
  }));
  const listbox = (
    <ul part="listbox" role="listbox">
      {filtered.length === 0 ? <li>{props.emptyState}</li> : null}
      {filtered.map((customer) => (
        <li key={customer.id} role="option" aria-selected={customer.id === props.selectedId}>
          <button onClick={() => props.onCustomerSelect?.(customer)}>{customer.name}</button>
        </li>
      ))}
    </ul>
  );
  return (
    <label part="picker">
      <span>Customer</span>
      <input
        ref={searchRef}
        role="combobox"
        aria-expanded={open}
        disabled={props.disabled}
        required={props.required}
        value={query || selected?.name || ""}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          props.onSearchChange?.(event.currentTarget.value);
        }}
      />
      {open && props.portalContainer
        ? createPortal(listbox, props.portalContainer)
        : open
          ? listbox
          : null}
    </label>
  );
});
CustomerPicker.displayName = "CustomerPicker";

export const ModalDialog = (props: {
  open?: boolean;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  portalContainer?: HTMLElement;
  onCloseRequest?: (reason: "escape" | "backdrop" | "button") => void;
}) => {
  const theme = useContext(ThemeContext);
  if (!props.open) return null;
  const dialog = (
    <div part="backdrop" onClick={() => props.onCloseRequest?.("backdrop")}>
      <section
        part="dialog"
        role="dialog"
        aria-modal="true"
        data-theme={theme}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.key === "Escape" && props.onCloseRequest?.("escape")}
      >
        <header part="title">{props.title}</header>
        <slot />
        <footer part="footer">{props.footer}</footer>
        <button onClick={() => props.onCloseRequest?.("button")}>Close</button>
      </section>
    </div>
  );
  return props.portalContainer ? createPortal(dialog, props.portalContainer) : dialog;
};

export const AddressFormControl = (props: {
  value?: { street?: string; city?: string; postalCode?: string };
  required?: boolean;
  disabled?: boolean;
  onAddressChange?: (value: { street?: string; city?: string; postalCode?: string }) => void;
}) => {
  const value = props.value ?? {};
  const update = (key: "street" | "city" | "postalCode", next: string) =>
    props.onAddressChange?.({ ...value, [key]: next });
  return (
    <fieldset part="address" disabled={props.disabled}>
      <input
        aria-label="Street"
        required={props.required}
        value={value.street ?? ""}
        onChange={(event) => update("street", event.currentTarget.value)}
      />
      <input
        aria-label="City"
        value={value.city ?? ""}
        onChange={(event) => update("city", event.currentTarget.value)}
      />
      <input
        aria-label="Postal code"
        value={value.postalCode ?? ""}
        onChange={(event) => update("postalCode", event.currentTarget.value)}
      />
    </fieldset>
  );
};

export const DashboardCard = (props: {
  theme?: string;
  header?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const theme = props.theme ?? useContext(ThemeContext);
  return (
    <article part="card" data-theme={theme}>
      <header part="header">{props.header}</header>
      <div part="content">{props.children}</div>
      <footer part="actions">{props.actions}</footer>
    </article>
  );
};

export function registerExampleWebComponents(): void {
  configureReactApi({
    wrap: (component, host) => (
      <ThemeContext.Provider value={host.getAttribute("theme") ?? "light"}>
        {component}
      </ThemeContext.Provider>
    )
  });
  defineComponentTag("rwcb-customer-grid", CustomerDataGrid, {
    shadow: { mode: "open" },
    props: {
      rows: { attribute: false, default: [] },
      columns: { attribute: false },
      pageSize: { attribute: "page-size", type: "number", reflect: true, default: 20 },
      loading: { type: "boolean", reflect: true, default: false }
    },
    events: {
      onRowSelect: {
        name: "row-select",
        detail: (row: Customer, index: number) => ({ row, index })
      },
      onSortChange: { name: "sort-change", detail: (key: keyof Customer) => ({ key }) },
      onFilterChange: { name: "filter-change", detail: (query: string) => ({ query }) },
      onPageChange: { name: "page-change", detail: (page: number) => ({ page }) }
    },
    slots: { toolbar: "toolbar", emptyState: "empty-state", footer: "footer" },
    methods: {
      clearSelection: { call: (instance) => (instance as CustomerDataGridHandle).clearSelection() },
      focusFilter: { call: (instance) => (instance as CustomerDataGridHandle).focusFilter() },
      scrollToRow: {
        call: (instance, _host, id) => (instance as CustomerDataGridHandle).scrollToRow(String(id))
      }
    },
    styles:
      ":host{display:block}table{width:100%;border-collapse:collapse}td,th{padding:.5rem;border:1px solid #ddd}"
  });
  defineComponentTag("rwcb-customer-picker", CustomerPicker, {
    shadow: { mode: "open", delegatesFocus: true },
    props: {
      customers: { attribute: false, default: [] },
      selectedId: { attribute: "selected-id", type: "string", reflect: true },
      name: { type: "string" },
      required: { type: "boolean", reflect: true },
      disabled: { type: "boolean", reflect: true }
    },
    events: {
      onCustomerSelect: {
        name: "customer-select",
        detail: (customer: Customer | null) => customer
      },
      onSearchChange: { name: "search-change", detail: (query: string) => ({ query }) }
    },
    slots: { emptyState: "empty-state", loadingState: "loading-state" },
    methods: {
      focusSearch: { call: (instance) => (instance as CustomerPickerHandle).focusSearch() },
      clearSelection: { call: (instance) => (instance as CustomerPickerHandle).clearSelection() }
    },
    form: {
      valueProp: "selectedId",
      nameProp: "name",
      disabledProp: "disabled",
      requiredProp: "required",
      changeCallback: "onCustomerSelect"
    },
    portal: { enabled: true, prop: "portalContainer", target: "shadow" }
  });
  defineComponentTag("rwcb-modal-dialog", ModalDialog, {
    props: { open: { type: "boolean", reflect: true } },
    events: {
      onCloseRequest: {
        name: "close-request",
        detail: (reason: "escape" | "backdrop" | "button") => ({ reason })
      }
    },
    slots: { title: "title", footer: "footer", children: true },
    portal: { enabled: true, prop: "portalContainer", target: "body" }
  });
  defineComponentTag("rwcb-address-control", AddressFormControl, {
    props: {
      value: { type: "json", reflect: true, default: {} },
      required: { type: "boolean", reflect: true },
      disabled: { type: "boolean", reflect: true }
    },
    events: {
      onAddressChange: {
        name: "address-change",
        detail: (value: { street?: string; city?: string; postalCode?: string }) => value
      }
    },
    form: {
      valueProp: "value",
      requiredProp: "required",
      disabledProp: "disabled",
      changeCallback: "onAddressChange",
      serializeValue: (value) => JSON.stringify(value ?? {})
    }
  });
  defineComponentTag("rwcb-dashboard-card", DashboardCard, {
    props: { theme: { type: "string", reflect: true } },
    slots: { children: true, header: "header", actions: "actions" },
    styles: ":host{display:block}article{border:1px solid #bbb;padding:1rem;border-radius:8px}"
  });
}

export const registerComplexComponents = registerExampleWebComponents;

export function sampleCustomers(): Customer[] {
  return Array.from({ length: 1000 }, (_, index) => ({
    id: `c${index}`,
    name: `Customer ${index}`,
    email: `customer${index}@example.com`,
    city: index % 2 === 0 ? "London" : "New York"
  }));
}
