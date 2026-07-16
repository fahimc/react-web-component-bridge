# Performance

## Methodology

Benchmarks should measure many registration definitions, mounting 100 simple elements, updating 100 elements, batched property changes, 1,000-row grids, and cleanup after disconnection.

## Current results

The benchmark script is `pnpm bench`. It covers definition creation and a representative 1,000-row grid payload serialization workload used by the complex example.

Local run on July 16, 2026 with Node v25.6.1:

| Benchmark                                | Iterations |  Duration |
| ---------------------------------------- | ---------: | --------: |
| create 1,000 metadata-backed definitions |      1,000 | 120.56 ms |
| serialize 1,000-row grid payloads        |        250 | 370.71 ms |

The runtime batches synchronous updates in a microtask and avoids rerendering when property values are unchanged.
