import type { ReactElementPropDefinition } from "../types/public";

export function serializeAttributeValue(
  value: unknown,
  definition: ReactElementPropDefinition,
  host: HTMLElement
): string | null {
  if (definition.serializeAttribute) {
    return definition.serializeAttribute(value, host);
  }
  if (value === undefined || value === null || value === false) {
    return null;
  }
  switch (definition.type ?? "string") {
    case "boolean":
      return value ? "" : null;
    case "json":
      try {
        return JSON.stringify(value);
      } catch {
        return null;
      }
    case "date":
      return value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : null;
    case "number":
      return typeof value === "number" && Number.isFinite(value) ? String(value) : null;
    case "string":
      return String(value);
    default:
      return String(value);
  }
}
