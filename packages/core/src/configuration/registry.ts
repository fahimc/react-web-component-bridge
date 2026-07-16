import type { ReactElementDefinition } from "../types/public";

const definitions = new Map<string, ReactElementDefinition>();

export function registerDefinition(definition: ReactElementDefinition): void {
  definitions.set(definition.tagName, definition);
}

export function getReactElementDefinition(tagName: string): ReactElementDefinition | undefined {
  return definitions.get(tagName.toLowerCase());
}

export function isReactElementDefined(tagName: string): boolean {
  const normalized = tagName.toLowerCase();
  if (typeof customElements !== "undefined" && customElements.get(normalized)) {
    return true;
  }
  return definitions.has(normalized);
}

export function listReactElementDefinitions(): ReactElementDefinition[] {
  return [...definitions.values()];
}
