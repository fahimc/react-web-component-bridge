# Forms

Form-associated custom elements use `ElementInternals` where available. The configured `valueProp` controls `setFormValue()`. Standard `input` and `change` events are emitted when that value changes. Fallback behavior is documented because some runtimes do not implement form-associated custom elements.
