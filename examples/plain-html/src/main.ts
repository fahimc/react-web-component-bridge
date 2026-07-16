import {
  registerComplexComponents,
  sampleCustomers
} from "@fahimc/react-web-component-bridge-test-components";

registerComplexComponents();

const customers = sampleCustomers().slice(0, 25);
const grid = document.querySelector("rwcb-customer-grid") as HTMLElement & {
  rows: unknown[];
  columns: unknown[];
  focusFilter(): void;
};
grid.rows = customers;
grid.columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" }
];
grid.addEventListener("row-select", (event) =>
  console.log("row-select", (event as CustomEvent).detail)
);

const picker = document.querySelector("rwcb-customer-picker") as HTMLElement & {
  customers: unknown[];
  focusSearch(): void;
};
picker.customers = customers;
picker.addEventListener("customer-select", (event) =>
  console.log("customer-select", (event as CustomEvent).detail)
);

document.querySelector("form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log([...new FormData(event.currentTarget as HTMLFormElement)]);
});
