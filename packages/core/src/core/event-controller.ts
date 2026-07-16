import { camelToKebab } from "../utilities/casing";
import type { ReactElementEventDefinition, ReactElementOptions } from "../types/public";

export class EventController {
  constructor(
    private readonly host: HTMLElement,
    private readonly options: ReactElementOptions
  ) {}

  createEventProps(): Record<string, (...args: readonly unknown[]) => unknown> {
    const eventProps: Record<string, (...args: readonly unknown[]) => unknown> = {};
    for (const [propName, definition] of Object.entries(this.options.events ?? {})) {
      eventProps[propName] = (...args: readonly unknown[]) =>
        this.dispatch(propName, definition as ReactElementEventDefinition | undefined, args);
    }
    return eventProps;
  }

  private dispatch(
    propName: string,
    definition: ReactElementEventDefinition | undefined,
    args: readonly unknown[]
  ): unknown {
    const eventName = definition?.name ?? camelToKebab(propName.replace(/^on/, ""));
    const detail = definition?.detail
      ? definition.detail(...args)
      : args.length <= 1
        ? args[0]
        : [...args];
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: definition?.bubbles ?? true,
      composed: definition?.composed ?? true,
      cancelable: definition?.cancelable ?? false
    });
    const accepted = this.host.dispatchEvent(event);
    return definition?.cancelable ? accepted : undefined;
  }
}
