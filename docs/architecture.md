# Architecture

The package is a runtime wrapper around React components. A Custom Element owns a host lifecycle, a Shadow or light DOM mount point, one React root, property/attribute controllers, event adapters, slot wrappers, style injection, optional portal containers, optional form association, and optional public method forwarding.

The implementation is intentionally split by controller because browser lifecycle, React lifecycle, form internals, and event conversion fail in different ways and need focused tests.
