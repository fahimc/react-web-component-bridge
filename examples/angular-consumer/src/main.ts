import { bootstrapApplication } from "@angular/platform-browser";
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from "@angular/core";
import type { ElementRef } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  registerComplexComponents,
  sampleCustomers
} from "@fahimc/react-web-component-bridge-test-components";

registerComplexComponents();

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <rwcb-customer-picker
      #picker
      ngDefaultControl
      [attr.selected-id]="control.value"
      (customer-select)="selectCustomer($event)"
    ></rwcb-customer-picker>
    <button type="button" (click)="focus()">Focus</button>
  `
})
class AppComponent {
  @ViewChild("picker", { static: true }) picker!: ElementRef<
    HTMLElement & { customers: unknown[]; focusSearch(): void }
  >;
  control = new FormControl("c1", { nonNullable: true });

  ngAfterViewInit(): void {
    this.picker.nativeElement.customers = sampleCustomers().slice(0, 20);
  }

  selectCustomer(event: Event): void {
    const customer = (event as CustomEvent<{ id?: string }>).detail;
    this.control.setValue(customer?.id ?? "");
  }

  focus(): void {
    this.picker.nativeElement.focusSearch();
  }
}

bootstrapApplication(AppComponent);
