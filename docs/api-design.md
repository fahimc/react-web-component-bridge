# API Design

The compiler path is designed so existing React component source can keep normal React imports:

```tsx
import React, { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

The Web Component tag contract can be supplied outside the component source:

```bash
react-web-component-bridge compile --input src/Counter.tsx --tag acme-counter --component Counter
```

For richer contracts, use a JSON definition:

```json
{
  "tagName": "acme-counter",
  "component": "Counter",
  "options": {
    "props": {
      "label": { "type": "string", "default": "Count" }
    },
    "events": {
      "onChange": { "name": "change" }
    }
  }
}
```

Inline registration is still available when authors own the source and want the tag definition colocated:

```tsx
import React, { defineComponentTag, useState } from "@codedia/react-web-component-bridge/react";
```

Both paths compile to browser-native Custom Elements with no React runtime in the emitted bundle.
