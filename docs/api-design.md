# API Design

The primary API is a React-compatible facade:

```tsx
import React, {
  defineComponentTag,
  useEffect,
  useState
} from "@fahimc/react-web-component-bridge/react";
```

This keeps component source close to ordinary React code while adding tag registration beside the component export. Under the hood, `defineComponentTag` delegates to the lower-level `defineReactElement` runtime and supplies the same definition model for props, attributes, events, slots, methods, form behavior, styles, wrappers, and portals.

The lower-level runtime APIs remain public for teams that prefer explicit bridge calls or generated metadata. The facade is the recommended authoring path because it makes the package behave like a drop-in React import plus a Web Component tag definition API.
