# Troubleshooting

## Registration throws on the server

Move `defineReactElement()` behind a browser-only guard or client entry point.

## Object props are strings

Use `attribute: false` and assign the value as a DOM property.

## Events are not heard outside Shadow DOM

Use `composed: true`, which is the default.

## React is bundled twice

Check that React and ReactDOM are peer dependencies in component packages and app bundlers resolve one copy.
