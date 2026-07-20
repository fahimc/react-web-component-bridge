# Angular Integration

Angular consumes the generated Web Component bundle, not the React source. Import the bundle once, enable `CUSTOM_ELEMENTS_SCHEMA`, and place the custom-element tags in Angular templates.

```ts
import "@codedia/react-web-component-bridge-test-components/web-components";
```

```html
<rwcb-customer-picker selected-id="cust-1002"></rwcb-customer-picker>
```

Primitive values can be expressed as attributes or Angular property bindings. Object and array values should be assigned as DOM properties with `ViewChild` because HTML attributes cannot carry rich JavaScript values.

```ts
@ViewChild("grid", { static: true }) grid!: ElementRef<HTMLElement & { customers: Customer[] }>;

ngAfterViewInit() {
  this.grid.nativeElement.customers = this.customers;
}
```

Custom events are browser `CustomEvent`s, so Angular handlers receive the native event and should read `event.detail`. Angular forms can use `ngDefaultControl` for simple custom elements; object-valued controls may need a custom value accessor.
