# Editor Preview

The website editor demonstrates the intended authoring and consumption loop.

## Inputs

- A React-shaped component using normal imports such as `import React, { useMemo } from "react"`.
- A tag name, for example `acme-metric-card`.
- A tag contract that describes props, attributes, events, slots, methods, and styles.

## Outputs

- A compiler command for producing a `.web-components.js` module.
- Plain HTML usage that imports the generated module and places the tag.
- Angular usage that imports the module, enables `CUSTOM_ELEMENTS_SCHEMA`, binds properties, and listens to CustomEvents.

## Example

```bash
react-to-web-component-compiler compile \
  --input src/metric-card.tsx \
  --out-file dist/metric-card.web-components.js \
  --tag acme-metric-card \
  --component MetricCard
```

```html
<script type="module" src="/metric-card.web-components.js"></script>
<acme-metric-card heading="Release health" accent="emerald" metric="98"></acme-metric-card>
```
