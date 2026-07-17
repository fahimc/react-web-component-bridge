# Performance

## Production Bundle Shape

The no-React compiler path emits a vanilla custom-element module. It does not import `react`, `react-dom`, `react/jsx-runtime`, or call `createRoot`.

The Angular example now imports a compiled bundle generated from `examples/angular-consumer/src/react-components.tsx`.

Local production build on July 17, 2026 with Node v25.6.1:

| Build                                 | Raw JS |   Gzip | Brotli |
| ------------------------------------- | -----: | -----: | -----: |
| Previous React-backed Angular example | 360 KB | 113 KB |  99 KB |
| Compiled no-React Angular example     | 157 KB |  50 KB |  45 KB |

The compiled path removes React/ReactDOM from the Angular bundle and cuts the example transfer size by more than half.

## Runtime Behavior

The first compiler runtime prioritizes correctness and simple integration:

- one hook-cell array per custom element instance,
- queued microtask rerenders for property/state changes,
- CustomEvents for configured callback props,
- DOM property accessors for complex values,
- static style injection into the element root,
- replace-rendering instead of keyed reconciliation.

Replace-rendering is acceptable for small and medium widgets. Large lists should use pagination, virtualization at the component level, or wait for the planned keyed DOM reconciler.

## Benchmark Direction

Benchmarks should measure:

- compile time for folders of TSX components,
- generated bundle size,
- mount cost for 100 custom elements,
- update cost for state and property changes,
- large list rerender behavior,
- Angular production bundle scans for React markers.
