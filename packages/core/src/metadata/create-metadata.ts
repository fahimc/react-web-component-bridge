import { camelToKebab } from "../utilities/casing";
import type {
  ReactElementEventDefinition,
  ReactElementMetadata,
  ReactElementOptions,
  ReactElementPropDefinition
} from "../types/public";

export function createMetadata(
  tagName: string,
  options: ReactElementOptions
): ReactElementMetadata {
  const props = options.props ?? {};
  const events = options.events ?? {};
  const slots = options.slots ?? {};
  const methods = options.methods ?? {};
  return {
    tagName,
    properties: Object.entries(props).map(
      ([name, rawDefinition]): ReactElementMetadata["properties"][number] => {
        const definition = rawDefinition as ReactElementPropDefinition | undefined;
        const property: ReactElementMetadata["properties"][number] = { name };
        if (definition?.attribute !== false)
          property.attribute = definition?.attribute ?? camelToKebab(name);
        if (definition?.type) property.type = definition.type;
        if (definition?.required !== undefined) property.required = definition.required;
        return property;
      }
    ),
    attributes: Object.entries(props)
      .filter(
        ([, definition]) =>
          (definition as ReactElementPropDefinition | undefined)?.attribute !== false
      )
      .map(([name, rawDefinition]): ReactElementMetadata["attributes"][number] => {
        const definition = rawDefinition as ReactElementPropDefinition | undefined;
        const attribute: ReactElementMetadata["attributes"][number] = {
          name: (definition?.attribute as string | undefined) ?? camelToKebab(name),
          property: name
        };
        if (definition?.reflect !== undefined) attribute.reflect = definition.reflect;
        return attribute;
      }),
    events: Object.entries(events).map(([prop, rawDefinition]) => {
      const definition = rawDefinition as ReactElementEventDefinition | undefined;
      return {
        name: definition?.name ?? camelToKebab(prop.replace(/^on/, "")),
        prop,
        bubbles: definition?.bubbles ?? true,
        composed: definition?.composed ?? true
      };
    }),
    slots: Object.entries(slots).map(([prop, definition]) => ({
      prop,
      name:
        definition === true
          ? null
          : typeof definition === "string"
            ? definition
            : (definition?.name ?? null)
    })),
    methods: Object.keys(methods).map((name) => ({ name })),
    formAssociated: Boolean(options.form),
    shadow: options.shadow !== false
  };
}
