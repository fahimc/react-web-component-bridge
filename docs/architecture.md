# Architecture

React Web Component Bridge is now compiler-first. React-shaped TSX is the authoring format, but the production Web Component bundle must not import `react`, `react-dom`, or create a React root.

The legacy runtime facade can still exist for tests and migration, but the intended Angular/plain HTML distribution path is:

```text
React-shaped TSX source
  import React, { defineComponentTag, useState } from
  "@fahimc/react-web-component-bridge/react"
        |
        v
No-React compiler
  - removes React facade imports
  - lowers TSX to h(...) calls
  - replaces supported hooks with a tiny DOM runtime
  - turns defineComponentTag(...) metadata into CustomElement classes
        |
        v
Vanilla custom-element module
  - no react import
  - no react-dom import
  - no createRoot
  - no JSX runtime import
        |
        v
Angular / HTML / Vue / CMS host
  import "./components.custom-elements.js"
  <acme-customer-picker></acme-customer-picker>
```

## Ownership Diagram

```text
Host HTMLElement
+-- attribute/property API owned by the browser
+-- optional ShadowRoot
|   +-- compiled mount node
|   +-- generated slot elements
|   +-- generated style element
|   +-- DOM produced by compiled TSX
+-- internal hook cells owned by the compiled element instance
+-- custom events dispatched by the browser
```

There is no React root in this path. Each custom element instance owns a small hook array and rerenders its compiled virtual tree into real DOM. The first implementation uses replace-rendering for correctness and simplicity; later versions can add keyed DOM reconciliation without changing the public tag contract.

## Compiler Pipeline

```text
Source scan
  find .tsx/.jsx files
        |
        v
Import stripping
  remove react / react-dom / bridge facade imports
        |
        v
TypeScript TSX lowering
  JSX -> h("tag", props, children)
  types removed
        |
        v
Runtime injection
  h, Fragment, useState, useMemo, useRef, defineComponentTag
        |
        v
Custom element generation
  observedAttributes, property accessors, slots, events, methods, styles
        |
        v
Production bundle
  browser-native JavaScript with no React runtime dependency
```

CLI commands:

```bash
react-web-component-bridge compile --input src/customer-picker.tsx --out-file dist/customer-picker.js
react-web-component-bridge compile-folder --dir src/components --out-dir dist/components
```

The existing import migration command is still useful before compilation:

```bash
react-web-component-bridge replace-react-imports --dir src/components --dry-run
react-web-component-bridge replace-react-imports --dir src/components
```

## React API Translation

| React-shaped API                                  | Compiler behavior                                                                          | Production result                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `React` default import                            | Removed when it is only needed for TSX/types.                                              | No React object in the bundle.                               |
| TSX elements                                      | Lowered to `h(type, props, ...children)` and rendered by the generated DOM runtime.        | Real DOM nodes inside the custom element.                    |
| `Fragment` / `<>...</>`                           | Lowered to a compiler fragment token.                                                      | `DocumentFragment` content.                                  |
| `useState`                                        | Replaced by per-element hook cells and a queued custom-element rerender.                   | State lives on the element instance, not in React.           |
| `useMemo`                                         | Replaced by dependency-array memo cells.                                                   | Memoized values live on the element instance.                |
| `useRef`                                          | Replaced by `{ current }` cells; JSX `ref` assigns DOM elements.                           | DOM refs without React.                                      |
| `useCallback`, `memo`                             | Currently identity helpers.                                                                | No React memo scheduler.                                     |
| `useEffect`, `useLayoutEffect`                    | Currently no-ops in the compiler runtime.                                                  | Side effects should move to DOM events or element lifecycle. |
| Component props                                   | `defineComponentTag` metadata creates DOM property accessors and observed attributes.      | Angular assigns properties; attributes stay primitive.       |
| Callback props such as `onCustomerSelect`         | Compiler injects functions from `events` metadata.                                         | Calling the prop dispatches `CustomEvent`.                   |
| `children` and named content                      | `slots` metadata creates `<slot>` nodes passed as props.                                   | Host-owned light DOM is projected through slots.             |
| Public methods                                    | `methods` metadata defines methods on the custom element prototype.                        | Angular/HTML calls methods on the element instance.          |
| Styles                                            | `styles` metadata injects style text into the shadow/light root.                           | No CSS-in-JS runtime required.                               |
| `createContext`, `useContext`, `forwardRef`, etc. | Reported as unsupported by the no-React compiler until native equivalents are implemented. | Build-time diagnostic, not hidden React bundling.            |
| `createPortal`, `Suspense`, `lazy`                | Reported as unsupported.                                                                   | Build-time diagnostic, not hidden React bundling.            |

## Runtime Shape

The generated runtime is deliberately small and browser-native:

```text
defineComponentTag
+-- creates custom element class
+-- maps attributes to props
+-- maps property setters to queued rerenders
+-- creates event callback props
+-- creates slot vnode props
+-- injects styles
+-- renders compiled h(...) trees to DOM
```

The runtime does not attempt to be React. It supports the subset needed to keep common component source readable while making the production artifact independent of React.

## Angular Bundle Contract

Angular consumers should import only the compiled output:

```ts
import "./generated/react-components.custom-elements.js";
```

They should not install `react` or `react-dom` for this path. The Angular example build currently produces a production `main.js` of about 157 KB raw and 45 KB brotli after moving to compiled custom elements, and a scan of that bundle finds no `react-dom`, `createRoot`, `ReactDOM`, or direct React import markers.

## Unsupported Boundaries

The compiler intentionally does not promise full React compatibility yet. Unsupported APIs should produce diagnostics or documented failures instead of pulling React into production.

- React context is not yet compiled. Use explicit props or host attributes for now.
- Effects are no-ops in the first compiler runtime. Side effects should move to custom-element lifecycle or host events.
- Portals are not compiled yet.
- Suspense, lazy loading, concurrent rendering, transitions, and React error boundaries are not compiled.
- SyntheticEvent objects do not cross the boundary. Extract stable event data.
- Render props and function-as-children need explicit adapters.
- CSS-in-JS runtimes are not compiled. Use `styles` metadata or static CSS.

## Why This Is Different From The Old Runtime Bridge

The old runtime bridge kept React intact by mounting a React root inside every custom element. That was useful for compatibility, but it still shipped React to Angular users.

The compiler path keeps the authoring style, not the React runtime. The final artifact is a browser Custom Element module with a small generated DOM runtime.
