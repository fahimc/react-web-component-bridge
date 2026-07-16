import type { ReactElementPropDefinition } from "../types/public";

export function parseAttributeValue(
  value: string | null,
  definition: ReactElementPropDefinition,
  host: HTMLElement
): unknown {
  if (definition.parseAttribute) {
    return definition.parseAttribute(value, host);
  }
  switch (definition.type ?? "string") {
    case "boolean":
      return value !== null;
    case "number": {
      if (value === null || value.trim() === "") return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    case "json": {
      if (value === null || value.trim() === "") return undefined;
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    case "date": {
      if (value === null || value.trim() === "") return undefined;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    case "string":
      return value;
    default:
      return value;
  }
}
