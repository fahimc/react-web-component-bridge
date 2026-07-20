# Supported React API

The compiler supports a React-shaped subset intended for component authoring, not arbitrary React application runtimes.

## Supported In The No-React Compiler Path

- TSX elements and fragments
- Function components
- `useState` and `useReducer`
- `useMemo`, `useCallback`, and `memo`
- `useRef`, `createRef`, `forwardRef`, and `useImperativeHandle`
- `useEffect`, `useLayoutEffect`, and `useInsertionEffect`
- `createContext` and `useContext`
- `createPortal`
- `lazy` and `Suspense` fallback rendering
- `useTransition`, `startTransition`, and `useDeferredValue` as synchronous browser-runtime shims
- `useSyncExternalStore`
- `createElement`, `cloneElement`, `isValidElement`, and `Children` helpers
- `useId` and `useDebugValue`
- Primitive attributes and property-only object, array, function, and node props
- Default and named slots
- Callback props translated to `CustomEvent` dispatchers
- Public custom-element methods
- Static style metadata

## Compatibility Boundaries

- Effects run from the custom-element lifecycle, not React's scheduler.
- Transitions are synchronous browser-runtime shims.
- Lazy components resolve promises and rerender the owning custom element.
- The first renderer uses replace-rendering rather than React reconciliation.
- CustomEvents carry configured `detail` data instead of React SyntheticEvents.
- CSS-in-JS runtime extraction is outside the Web Component contract.
- React hydration is not used because the output is browser Custom Elements.

These boundaries must not pull `react`, `react-dom`, JSX runtime imports, or `createRoot` into the emitted production bundle.
