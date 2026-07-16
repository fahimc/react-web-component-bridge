import { createElement, StrictMode, Suspense, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ReactElementGlobalConfig, ReactElementOptions } from "../types/public";

export type RenderControllerContext = {
  host: HTMLElement;
  component: ComponentType<Record<string, unknown>>;
  options: ReactElementOptions;
  config: ReactElementGlobalConfig;
  mount: HTMLElement;
  getProps: () => Record<string, unknown>;
  getEventProps: () => Record<string, unknown>;
  getSlotProps: () => Record<string, unknown>;
  getPortalProps: () => Record<string, unknown>;
  refSetter: (value: unknown) => void;
};

export class RenderController {
  private root: Root | undefined;
  private unmounted = false;

  constructor(private readonly context: RenderControllerContext) {}

  render(): void {
    if (this.unmounted) {
      return;
    }
    this.root ??= createRoot(this.context.mount);
    try {
      this.root.render(this.createTree());
    } catch (error) {
      this.context.config.renderError?.(error, this.context.host);
      throw error;
    }
  }

  unmount(): void {
    this.unmounted = true;
    this.root?.unmount();
    this.root = undefined;
  }

  reconnect(): void {
    this.unmounted = false;
  }

  private createTree(): ReactNode {
    const Component = this.context.component;
    const props = {
      ...this.context.getProps(),
      ...this.context.getSlotProps(),
      ...this.context.getPortalProps(),
      ...this.context.getEventProps(),
      ref: this.context.refSetter
    };
    let element: ReactNode = createElement(Component, props);
    const Boundary = this.context.options.errorBoundary;
    if (Boundary) {
      element = createElement(Boundary, { error: undefined }, element);
    }
    if (this.context.options.fallback !== undefined) {
      element = createElement(Suspense, { fallback: this.context.options.fallback }, element);
    }
    if (this.context.options.wrap) {
      element = this.context.options.wrap(element, this.context.host);
    }
    if (this.context.config.wrap) {
      element = this.context.config.wrap(element, this.context.host);
    }
    if (this.context.options.strictMode ?? this.context.config.strictMode) {
      element = createElement(StrictMode, undefined, element);
    }
    return element;
  }
}
