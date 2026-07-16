# Performance

## Methodology

Benchmarks should measure many registration definitions, mounting 100 simple elements, updating 100 elements, batched property changes, 1,000-row grids, and cleanup after disconnection.

## Current results

Local benchmark execution is pending after dependency installation and full validation. The runtime batches synchronous updates in a microtask and avoids rerendering when property values are unchanged.
