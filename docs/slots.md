# Slots

In the no-React compiler path, slots are generated from `defineComponentTag` metadata and passed to the compiled component as vnode props.

```tsx
defineComponentTag("acme-card", Card, {
  slots: {
    header: "header",
    actions: "actions",
    children: true
  }
});
```

The compiler creates `<slot name="header">`, `<slot name="actions">`, and default `<slot>` vnodes. The browser owns the slotted light DOM; the compiled runtime only places the slot elements inside the custom element root.

Angular and HTML consumers use normal slot markup:

```html
<acme-card>
  <span slot="header">Customer</span>
  <button slot="actions">Open</button>
  <p>Projected body content</p>
</acme-card>
```
