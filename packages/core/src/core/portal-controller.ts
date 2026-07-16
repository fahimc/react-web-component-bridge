import type { ReactElementOptions } from "../types/public";

export class PortalController {
  private container: HTMLElement | undefined;

  constructor(
    private readonly host: HTMLElement,
    private readonly renderRoot: ShadowRoot | HTMLElement,
    private readonly options: ReactElementOptions
  ) {}

  getPortalProps(): Record<string, HTMLElement> {
    const portal = this.options.portal;
    if (!portal?.enabled || !portal.prop) {
      return {};
    }
    return { [portal.prop]: this.getContainer() };
  }

  cleanup(): void {
    this.container?.remove();
    this.container = undefined;
  }

  private getContainer(): HTMLElement {
    if (this.container) {
      return this.container;
    }
    const portal = this.options.portal;
    const target = portal?.target;
    if (target instanceof HTMLElement) {
      this.container = target;
      return target;
    }
    if (typeof target === "function") {
      this.container = target(this.host);
      return this.container;
    }
    const container = document.createElement("div");
    container.setAttribute("part", portal?.part ?? "overlay-root");
    container.setAttribute("data-rwcb-portal", "");
    if (target === "body") {
      document.body.append(container);
    } else if (target === "host") {
      this.host.append(container);
    } else {
      this.renderRoot.append(container);
    }
    this.container = container;
    return container;
  }
}
