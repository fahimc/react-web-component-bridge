import type { ComponentType } from "react";
import { registerDefinition } from "../configuration/registry";
import type { ReactElementDefinition, ReactElementOptions } from "../types/public";
import { assertBrowserApi } from "../utilities/errors";
import { createReactElement } from "./create-react-element";

export function defineReactElement<Props extends object, Ref = unknown>(
  tagName: string,
  component: ComponentType<Props>,
  options: ReactElementOptions<Props, Ref> = {}
): ReactElementDefinition<Props, Ref> {
  assertBrowserApi(
    "customElements",
    typeof customElements === "undefined" ? undefined : customElements
  );
  const definition = createReactElement(tagName, component, options);
  if (!customElements.get(definition.tagName)) {
    customElements.define(definition.tagName, definition.elementClass);
  }
  registerDefinition(definition as unknown as ReactElementDefinition);
  return definition;
}

export function defineReactElements(
  definitions: readonly ReactElementDefinition[]
): ReactElementDefinition[] {
  assertBrowserApi(
    "customElements",
    typeof customElements === "undefined" ? undefined : customElements
  );
  for (const definition of definitions) {
    if (!customElements.get(definition.tagName)) {
      customElements.define(definition.tagName, definition.elementClass);
    }
    registerDefinition(definition);
  }
  return [...definitions];
}
