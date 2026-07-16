import { camelToKebab } from "../utilities/casing";
import { warnDevelopment } from "../utilities/errors";
import { parseAttributeValue } from "../utilities/parsing";
import { serializeAttributeValue } from "../utilities/serialization";
import type { ReactElementOptions, ReactElementPropDefinition } from "../types/public";

export type PropertyControllerContext = {
  host: HTMLElement;
  options: ReactElementOptions;
  development: boolean;
  requestRender: () => void;
  formValueChanged: (name: string, value: unknown) => void;
};

export class PropertyController {
  readonly values = new Map<string, unknown>();
  readonly reflectingAttributes = new Set<string>();
  readonly attributeToProp = new Map<string, string>();

  constructor(private readonly context: PropertyControllerContext) {
    for (const [prop, definition] of Object.entries(this.context.options.props ?? {})) {
      const attribute = this.attributeName(prop, definition);
      if (attribute) {
        this.attributeToProp.set(attribute, prop);
      }
      if (definition?.default !== undefined) {
        this.values.set(prop, definition.default);
      }
    }
  }

  static observedAttributes(options: ReactElementOptions): string[] {
    return Object.entries(options.props ?? {})
      .map(([prop, definition]) =>
        definition?.attribute === false ? undefined : (definition?.attribute ?? camelToKebab(prop))
      )
      .filter((value): value is string => Boolean(value));
  }

  initializePreUpgradeProperties(): void {
    for (const prop of Object.keys(this.context.options.props ?? {})) {
      if (Object.prototype.hasOwnProperty.call(this.context.host, prop)) {
        const value = (this.context.host as unknown as Record<string, unknown>)[prop];
        delete (this.context.host as unknown as Record<string, unknown>)[prop];
        this.setProperty(prop, value);
      }
    }
  }

  getProperty(name: string): unknown {
    return this.values.get(name);
  }

  getProps(): Record<string, unknown> {
    return Object.fromEntries(this.values);
  }

  setProperty(name: string, rawValue: unknown): void {
    const definition = this.context.options.props?.[name];
    const nextValue = this.normalizeValue(name, rawValue, definition);
    if (Object.is(this.values.get(name), nextValue)) {
      return;
    }
    this.values.set(name, nextValue);
    this.reflectProperty(name, nextValue, definition);
    this.context.formValueChanged(name, nextValue);
    this.context.requestRender();
  }

  attributeChanged(attributeName: string, value: string | null): void {
    if (this.reflectingAttributes.has(attributeName)) {
      return;
    }
    const prop = this.attributeToProp.get(attributeName);
    if (!prop) {
      return;
    }
    const definition = this.context.options.props?.[prop];
    const parsed = parseAttributeValue(value, definition ?? {}, this.context.host);
    this.setProperty(prop, parsed);
  }

  private normalizeValue(
    name: string,
    rawValue: unknown,
    definition: ReactElementPropDefinition | undefined
  ): unknown {
    let value = definition?.transform
      ? definition.transform(rawValue, this.context.host)
      : rawValue;
    if (definition?.validate) {
      const result = definition.validate(value, this.context.host);
      if (result !== true) {
        warnDevelopment(
          this.context.development,
          typeof result === "string" ? result : `Invalid value for property "${name}".`
        );
      }
    }
    if (definition?.required && (value === undefined || value === null || value === "")) {
      warnDevelopment(this.context.development, `Required property "${name}" is missing.`);
    }
    return value;
  }

  private reflectProperty(
    name: string,
    value: unknown,
    definition: ReactElementPropDefinition | undefined
  ): void {
    if (!definition?.reflect) {
      return;
    }
    const attribute = this.attributeName(name, definition);
    if (!attribute) {
      return;
    }
    const serialized = serializeAttributeValue(value, definition, this.context.host);
    this.reflectingAttributes.add(attribute);
    try {
      if (serialized === null) {
        this.context.host.removeAttribute(attribute);
      } else {
        this.context.host.setAttribute(attribute, serialized);
      }
    } finally {
      this.reflectingAttributes.delete(attribute);
    }
  }

  private attributeName(
    name: string,
    definition: ReactElementPropDefinition | undefined
  ): string | null {
    if (definition?.attribute === false) {
      return null;
    }
    return definition?.attribute ?? camelToKebab(name);
  }
}
