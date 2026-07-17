import { bootstrapApplication } from "@angular/platform-browser";
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from "@angular/core";
import type { ElementRef } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import "./generated/react-components.custom-elements.js";

type CustomerElement = HTMLElement & {
  customers: unknown[];
  focusSearch(): void;
};

type GridElement = HTMLElement & {
  rows: unknown[];
  columns: unknown[];
  focusFilter(): void;
};

type AddressElement = HTMLElement & {
  value: { street?: string; city?: string; postalCode?: string };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
};

function sampleCustomers(): Customer[] {
  return Array.from({ length: 40 }, (_, index) => ({
    id: `c${index}`,
    name: `Customer ${index}`,
    email: `customer${index}@example.com`,
    city: index % 2 === 0 ? "London" : "New York"
  }));
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="shell">
      <section class="panel">
        <h1>Angular shell using React-authored Web Components</h1>
        <p>
          Angular imports a compiled custom-element bundle once, then renders custom element tags.
          The source UI is written in React-shaped TSX, but the shipped bundle contains no React.
        </p>
      </section>

      <rwcb-dashboard-card theme="contrast">
        <span slot="header">Dashboard card from compiled TSX</span>
        <strong>Projected through a Web Component tag</strong>
        <button slot="actions" type="button" (click)="focusGrid()">Focus grid filter</button>
      </rwcb-dashboard-card>

      <section class="layout">
        <rwcb-customer-grid
          #grid
          page-size="8"
          (row-select)="selectRow($event)"
          (filter-change)="lastFilter = $any($event).detail.query"
        >
          <strong slot="toolbar">Angular toolbar slot</strong>
          <span slot="empty-state">No matching customers</span>
          <span slot="footer">Last filter: {{ lastFilter || "none" }}</span>
        </rwcb-customer-grid>

        <form class="panel" (submit)="submit($event)">
          <rwcb-customer-picker
            #picker
            ngDefaultControl
            name="customerId"
            [attr.selected-id]="control.value"
            (customer-select)="selectCustomer($event)"
          >
            <span slot="empty-state">No customers found</span>
          </rwcb-customer-picker>

          <rwcb-address-control
            #address
            required
            (address-change)="addressValue = $any($event).detail"
          ></rwcb-address-control>

          <button type="button" (click)="focusPicker()">Focus picker</button>
          <button type="submit">Submit Angular form</button>
        </form>
      </section>

      <rwcb-modal-dialog [attr.open]="modalOpen ? '' : null" (close-request)="modalOpen = false">
        <span slot="title">Compiled TSX modal rendered from Angular</span>
        <p>Selected customer: {{ control.value || "none" }}</p>
        <button slot="footer" type="button" (click)="modalOpen = false">Done</button>
      </rwcb-modal-dialog>

      <button type="button" class="open" (click)="modalOpen = true">Open modal tag</button>
    </main>
  `
})
class AppComponent {
  @ViewChild("picker", { static: true }) picker!: ElementRef<CustomerElement>;
  @ViewChild("grid", { static: true }) grid!: ElementRef<GridElement>;
  @ViewChild("address", { static: true }) address!: ElementRef<AddressElement>;
  control = new FormControl("c1", { nonNullable: true });
  lastFilter = "";
  modalOpen = false;
  addressValue: { street?: string; city?: string; postalCode?: string } = {};

  ngAfterViewInit(): void {
    const customers = sampleCustomers().slice(0, 40);
    this.picker.nativeElement.customers = customers;
    this.grid.nativeElement.rows = customers;
    this.grid.nativeElement.columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "city", label: "City" }
    ];
    this.address.nativeElement.value = {
      street: "1 Component Way",
      city: "London",
      postalCode: "WC2"
    };
  }

  selectCustomer(event: Event): void {
    const customer = (event as CustomEvent<{ id?: string }>).detail;
    this.control.setValue(customer?.id ?? "");
  }

  selectRow(event: Event): void {
    const row = (event as CustomEvent<{ row?: { id?: string } }>).detail.row;
    this.control.setValue(row?.id ?? "");
  }

  focusPicker(): void {
    this.picker.nativeElement.focusSearch();
  }

  focusGrid(): void {
    this.grid.nativeElement.focusFilter();
  }

  submit(event: Event): void {
    event.preventDefault();
    this.modalOpen = true;
  }
}

bootstrapApplication(AppComponent);
