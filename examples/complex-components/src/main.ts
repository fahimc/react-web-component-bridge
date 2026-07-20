import "@codedia/react-web-component-bridge-test-components/web-components";
import { sampleCustomers } from "@codedia/react-web-component-bridge-test-components";

const grid = document.querySelector("rwcb-customer-grid") as HTMLElement & { rows: unknown[] };
grid.rows = sampleCustomers();

document.querySelector("rwcb-modal-dialog")?.addEventListener("close-request", (event) => {
  (event.currentTarget as HTMLElement).removeAttribute("open");
});
