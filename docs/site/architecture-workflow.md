# Architecture And Translation Workflow

The architecture is compile-time adaptation plus a small browser runtime. It is not a hidden React root.

```text
React-shaped TSX
      |
      v
Import stripping and TSX lowering
      |
      v
React API translation
      |
      v
Custom Element class generation
      |
      v
Angular, HTML, Vue, or CMS tag usage
```

## Runtime Pipeline

```text
React-shaped TSX
  -> compiler removes React imports
  -> JSX becomes h(...) virtual nodes
  -> hooks become per-element hook cells
  -> props and attributes become host accessors
  -> callback props become CustomEvent dispatchers
  -> slots become projected browser content
  -> DOM renderer updates the element shadow or light DOM
```

## Controller Stack

- Import stripper: removes `react`, `react-dom`, JSX runtime, and optional facade imports.
- TSX lowering: converts JSX into `h(...)` calls.
- Hook cells: stores hook state on the custom-element instance.
- Property mapper: maps attributes and DOM properties into compiled props.
- Event mapper: injects callback props that dispatch native `CustomEvent` objects.
- Slot mapper: creates default and named slot virtual nodes.
- Method mapper: installs public methods on the custom-element prototype.
- DOM renderer: creates browser nodes from compiled virtual nodes.

## React API Translation Matrix

| React-shaped API                              | Compiler behavior                                                              | Browser boundary                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| React default import and TSX                  | Import is stripped and TSX lowers to `h(...)` calls.                           | No React object or JSX runtime import in production.     |
| `useState`, `useReducer`, `useMemo`, `useRef` | Hook calls map to per-element hook cells.                                      | State lives on the custom element instance.              |
| Context                                       | Providers use compiled provider stacks.                                        | Context lookup is internal to the compiled element tree. |
| Callback props                                | Compiler injects callbacks from event metadata.                                | Callback invocation dispatches `CustomEvent`.            |
| Children and named content                    | Slot metadata creates default and named slot nodes.                            | Consumer DOM is projected through browser slots.         |
| Refs and imperative handles                   | DOM refs and handle objects are tracked by the runtime.                        | Consumers call methods on the custom element instance.   |
| Portals, lazy, Suspense, transitions          | Compiled to DOM portal containers, async rerenders, fallbacks, and sync shims. | No ReactDOM portal or scheduler is bundled.              |
