import React, {
  defineComponentTag,
  useMemo,
  useState
} from "@codedia/react-to-web-component-runtime/react";

type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
};

function CustomerGrid(props: {
  rows?: Customer[];
  columns?: Array<{ key: keyof Customer; label: string }>;
  pageSize?: number;
  loading?: boolean;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  onRowSelect?: (row: Customer, index: number) => void;
  onFilterChange?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const rows = props.rows ?? [];
  const columns = props.columns ?? [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "city" as const, label: "City" }
  ];
  const filtered = useMemo(
    () => rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  return (
    <section part="grid">
      <header part="toolbar">
        {props.toolbar}
        <input
          data-grid-filter
          aria-label="Filter customers"
          value={query}
          onInput={(event) => {
            const value = (event.currentTarget as HTMLInputElement).value;
            setQuery(value);
            props.onFilterChange?.(value);
          }}
        />
      </header>
      {props.loading ? <p part="loading">Loading</p> : null}
      {!props.loading && filtered.length === 0 ? <div part="empty">{props.emptyState}</div> : null}
      <table part="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, props.pageSize ?? 20).map((row, index) => (
            <tr onClick={() => props.onRowSelect?.(row, index)}>
              {columns.map((column) => (
                <td>{String(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <footer part="footer">{props.footer}</footer>
    </section>
  );
}

function CustomerPicker(props: {
  customers?: Customer[];
  selectedId?: string;
  emptyState?: React.ReactNode;
  onCustomerSelect?: (customer: Customer | null) => void;
  onSearchChange?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const customers = props.customers ?? [];
  const selected = customers.find((customer) => customer.id === props.selectedId) ?? null;
  const filtered = customers.filter((customer) =>
    customer.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <label part="picker">
      <span>Customer</span>
      <input
        data-customer-search
        role="combobox"
        value={query || selected?.name || ""}
        onInput={(event) => {
          const value = (event.currentTarget as HTMLInputElement).value;
          setQuery(value);
          props.onSearchChange?.(value);
        }}
      />
      <ul part="listbox" role="listbox">
        {filtered.length === 0 ? <li>{props.emptyState}</li> : null}
        {filtered.map((customer) => (
          <li role="option" aria-selected={customer.id === props.selectedId}>
            <button onClick={() => props.onCustomerSelect?.(customer)}>{customer.name}</button>
          </li>
        ))}
      </ul>
    </label>
  );
}

function AddressControl(props: {
  value?: { street?: string; city?: string; postalCode?: string };
  onAddressChange?: (value: { street?: string; city?: string; postalCode?: string }) => void;
}) {
  const value = props.value ?? {};
  const update = (key: "street" | "city" | "postalCode", next: string) =>
    props.onAddressChange?.({ ...value, [key]: next });

  return (
    <fieldset part="address">
      <input
        aria-label="Street"
        value={value.street ?? ""}
        onInput={(event) => update("street", (event.currentTarget as HTMLInputElement).value)}
      />
      <input
        aria-label="City"
        value={value.city ?? ""}
        onInput={(event) => update("city", (event.currentTarget as HTMLInputElement).value)}
      />
      <input
        aria-label="Postal code"
        value={value.postalCode ?? ""}
        onInput={(event) => update("postalCode", (event.currentTarget as HTMLInputElement).value)}
      />
    </fieldset>
  );
}

function DashboardCard(props: {
  theme?: string;
  header?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article part="card" data-theme={props.theme ?? "default"}>
      <header part="header">{props.header}</header>
      <div part="content">{props.children}</div>
      <footer part="actions">{props.actions}</footer>
    </article>
  );
}

function ModalDialog(props: {
  open?: boolean;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onCloseRequest?: (reason: "button") => void;
}) {
  if (!props.open) return null;
  return (
    <section part="dialog" role="dialog" aria-modal="true">
      <header part="title">{props.title}</header>
      <div part="content">{props.children}</div>
      <footer part="footer">{props.footer}</footer>
      <button onClick={() => props.onCloseRequest?.("button")}>Close</button>
    </section>
  );
}

const surfaceStyles = `
  :host{display:block;font-family:Inter,Arial,sans-serif;color:#172033}
  table{width:100%;border-collapse:collapse;background:white}
  th,td{padding:.55rem;border:1px solid #d8dee7;text-align:left}
  input{box-sizing:border-box;width:100%;padding:.55rem;border:1px solid #aab4c3;border-radius:6px}
  button{border:0;border-radius:6px;background:#172033;color:white;padding:.5rem .75rem;cursor:pointer}
  [part=toolbar],[part=footer],[part=picker],[part=address],[part=dialog],[part=card]{display:grid;gap:.75rem}
  [part=card],[part=dialog]{border:1px solid #d8dee7;border-radius:8px;padding:1rem;background:white}
`;

defineComponentTag("rwcb-customer-grid", CustomerGrid, {
  props: {
    rows: { attribute: false, default: [] },
    columns: { attribute: false },
    pageSize: { attribute: "page-size", type: "number", default: 20 },
    loading: { type: "boolean", default: false }
  },
  events: {
    onRowSelect: { name: "row-select", detail: (row: Customer, index: number) => ({ row, index }) },
    onFilterChange: { name: "filter-change", detail: (query: string) => ({ query }) }
  },
  slots: { toolbar: "toolbar", emptyState: "empty-state", footer: "footer" },
  methods: {
    focusFilter: {
      call: (host: HTMLElement) =>
        host.shadowRoot?.querySelector<HTMLInputElement>("[data-grid-filter]")?.focus()
    }
  },
  styles: surfaceStyles
});

defineComponentTag("rwcb-customer-picker", CustomerPicker, {
  props: {
    customers: { attribute: false, default: [] },
    selectedId: { attribute: "selected-id", type: "string" }
  },
  events: {
    onCustomerSelect: { name: "customer-select", detail: (customer: Customer | null) => customer },
    onSearchChange: { name: "search-change", detail: (query: string) => ({ query }) }
  },
  slots: { emptyState: "empty-state" },
  methods: {
    focusSearch: {
      call: (host: HTMLElement) =>
        host.shadowRoot?.querySelector<HTMLInputElement>("[data-customer-search]")?.focus()
    }
  },
  styles: surfaceStyles
});

defineComponentTag("rwcb-address-control", AddressControl, {
  props: { value: { type: "json", default: {} } },
  events: { onAddressChange: { name: "address-change", detail: (value: unknown) => value } },
  styles: surfaceStyles
});

defineComponentTag("rwcb-dashboard-card", DashboardCard, {
  props: { theme: { type: "string" } },
  slots: { header: "header", actions: "actions", children: true },
  styles: surfaceStyles
});

defineComponentTag("rwcb-modal-dialog", ModalDialog, {
  props: { open: { type: "boolean" } },
  events: { onCloseRequest: { name: "close-request", detail: (reason: string) => ({ reason }) } },
  slots: { title: "title", footer: "footer", children: true },
  styles: surfaceStyles
});
