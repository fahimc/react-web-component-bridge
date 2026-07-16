import {
  registerComplexComponents,
  sampleCustomers
} from "@fahimc/react-web-component-bridge-test-components";

registerComplexComponents();

const grid = document.querySelector("rwcb-customer-grid") as HTMLElement & { rows: unknown[] };
grid.rows = sampleCustomers();

document.querySelector("rwcb-modal-dialog")?.addEventListener("close-request", (event) => {
  (event.currentTarget as HTMLElement).removeAttribute("open");
});
