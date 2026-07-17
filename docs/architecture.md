# Architecture

React Web Component Bridge is a runtime adapter, not a React-to-Angular compiler. React remains the renderer. The bridge creates a browser-native Custom Element shell around a React component and translates the component contract into platform behavior.

## System Diagram

```text
React source file
  import React, { useState, defineComponentTag } from
  "@fahimc/react-web-component-bridge/react"
        |
        v
Facade export layer
  - React default and named API pass-through
  - defineComponentTag / createComponentTag helpers
        |
        v
Custom Element definition
  tag name + props + events + slots + methods + styles + form + portal config
        |
        v
Generated CustomElement class
  connectedCallback / disconnectedCallback / attributeChangedCallback
        |
        v
Controller stack
  property -> event -> slot -> style -> portal -> form -> method -> render
        |
        v
React root
  createRoot(mount).render(<Component {...translatedProps} />)
        |
        v
Browser Custom Element
  <acme-customer-card> usable from Angular, HTML, Vue, CMS pages, or React
```

## Runtime Ownership

```text
Host HTMLElement
├─ Attribute/property surface owned by the browser
├─ Optional ShadowRoot
│  ├─ React mount part
│  ├─ Generated <slot> wrappers
│  ├─ Optional portal container
│  └─ AdoptedStyleSheets or <style> fallback
├─ Optional ElementInternals for forms
└─ React root owned by the bridge
   └─ User React component
```

Each element instance normally owns one React root. This keeps lifecycle isolation simple: removing the element unmounts the root, clears queued updates, disconnects controllers, and releases portal/style/form state.

## React API Translation

| React-facing API                                                    | What the facade does                                                                                      | What crosses the Web Component boundary                                                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `React` default export                                              | Re-exports the installed peer React package.                                                              | Nothing special; React still renders internally.                                                                               |
| `createElement`, `Fragment`, `StrictMode`, `Suspense`               | Pass-through exports so component code can keep normal React imports.                                     | Rendered React output becomes DOM inside the element mount.                                                                    |
| Hooks such as `useState`, `useEffect`, `useMemo`, `useRef`, `useId` | Pass-through exports. Hook semantics are unchanged because React is still the renderer.                   | Hook state never crosses the boundary directly. Only rendered DOM, configured props, events, refs, and methods do.             |
| `memo`, `forwardRef`, `lazy`                                        | Pass-through exports.                                                                                     | `forwardRef` can back public methods when configured. `lazy` still needs the consumer bundle to resolve the lazy module.       |
| React callback props such as `onSelect`                             | The event controller supplies a callback prop to React.                                                   | Calling that callback dispatches a native `CustomEvent` with configured name/detail/bubbles/composed/cancelable behavior.      |
| React `children`                                                    | Slot controller maps default and named slots to React props.                                              | Consumers own slotted DOM. React receives stable `<slot>` wrappers, not cloned DOM nodes.                                      |
| Context providers                                                   | Global `configureReactApi({ wrap })` and per-definition `wrap` functions surround the rendered component. | Context stays inside React. Hosts configure attributes/properties that wrappers can read from the element.                     |
| Refs and imperative APIs                                            | Method controller calls methods exposed by a forwarded React ref.                                         | Consumers call methods on the custom element instance. Calls can throw before mount or queue when configured.                  |
| Portals                                                             | Portal controller creates/provides a target element.                                                      | Overlays can render in shadow DOM, host, body, a supplied element, or a function target.                                       |
| Form values                                                         | Form controller syncs a configured prop into `ElementInternals`.                                          | Native form submission, `input`, and `change` behavior are exposed where the browser supports form-associated custom elements. |

## Controller Stack

```text
attributeChangedCallback / property setter
        |
        v
PropertyController
  parse -> validate -> transform -> reflect -> schedule render
        |
        v
RenderController
  microtask batch -> wrapper chain -> React root render
        |
        +--> SlotController supplies children / named slot props
        +--> StyleController installs scoped styles
        +--> PortalController supplies overlay target prop
        +--> FormController updates ElementInternals
        +--> MethodController forwards host methods to React ref
        +--> EventController turns React callbacks into CustomEvents
```

The controllers are split because browser lifecycle, React lifecycle, form internals, event conversion, and style adoption fail in different ways. Keeping them separate makes tests and integration bugs more targeted.

## Import Replacement Workflow

The generator package includes a codemod-style command for moving a folder of existing React components onto the facade import:

```bash
react-web-component-bridge replace-react-imports --dir src/components --dry-run
react-web-component-bridge replace-react-imports --dir src/components
```

It rewrites exact `react` module specifiers:

```diff
- import React, { useState } from "react";
+ import React, { useState } from "@fahimc/react-web-component-bridge/react";

- export type { ReactNode } from "react";
+ export type { ReactNode } from "@fahimc/react-web-component-bridge/react";
```

It intentionally does not rewrite `react-dom`, `react-dom/client`, `react/jsx-runtime`, or framework imports. Those packages still have their normal jobs: ReactDOM creates roots inside the bridge, and JSX runtime imports are emitted by the compiler/bundler.

## Translation Boundaries

The bridge translates runtime contracts, not arbitrary source code. That means:

- Props and attributes are explicit. Primitive props can reflect to attributes; objects, arrays, functions, and React nodes should stay property-only.
- Events are explicit. React SyntheticEvents should not be sent through `CustomEvent.detail`; extract stable data first.
- Styles are explicit. Shadow DOM styles do not automatically style body-level portals.
- SSR import is safe, but custom-element registration must run in a browser with `customElements`.
- Angular/Vue/HTML consumers receive browser elements, not React components.
