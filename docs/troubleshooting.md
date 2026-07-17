# Troubleshooting

## The compiled bundle still contains React

Run a direct scan on the built artifact:

```bash
rg -n 'react-dom|createRoot|ReactDOM|from "react"|from '\''react'\''' dist
```

If it matches, check that Angular imports the compiler output, not the legacy React-backed runtime package.

## The compiler reports an unsupported React API

The no-React compiler does not silently include React to preserve unsupported behavior. Replace the API with an explicit custom-element contract or keep that component on the legacy runtime path.

Common replacements:

- context -> explicit props or host attributes,
- `forwardRef` / `useImperativeHandle` -> `methods` metadata,
- portals -> host-managed overlay outlet,
- effects -> custom-element lifecycle or host events.

## Object props are strings

Use `attribute: false` and assign the value as a DOM property.

```ts
picker.customers = customers;
```

## Events are not heard outside Shadow DOM

Compiled event metadata dispatches `CustomEvent` with `bubbles: true` and `composed: true` by default. Check that the callback prop is listed in `events`.

## Registration throws on the server

Custom-element registration needs a browser `customElements` registry. Import compiled element bundles only in browser/client entry points.
