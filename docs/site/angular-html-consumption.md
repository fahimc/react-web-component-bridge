# Angular And HTML Consumption

The compiled output is a browser module. Consumers import that module once and use Custom Element tags.

## Angular

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

Use attributes for strings, numbers, and booleans when the contract marks them as reflected. Use DOM properties for arrays, objects, functions, and nodes.

## Plain HTML

```html
<script type="module" src="/customer-picker.web-components.js"></script>

<acme-customer-picker selected-id="cust-1002"></acme-customer-picker>

<script type="module">
  const picker = document.querySelector("acme-customer-picker");
  picker.customers = customers;
  picker.addEventListener("customer-select", (event) => {
    console.log(event.detail);
  });
</script>
```

## Bundle Expectations

For the no-React compiler path, scan the consumer production bundle for `react`, `react-dom`, JSX runtime imports, and `createRoot`. Those markers should not appear in the emitted compiled path.
