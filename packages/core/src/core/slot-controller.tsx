import React, { createElement, type ReactNode } from "react";
import type { ReactElementOptions, ReactElementSlotDefinition } from "../types/public";

export class SlotController {
  constructor(private readonly options: ReactElementOptions) {}

  createSlotProps(): Record<string, ReactNode> {
    const props: Record<string, ReactNode> = {};
    for (const [propName, definition] of Object.entries(this.options.slots ?? {})) {
      props[propName] = this.createSlot(definition);
    }
    return props;
  }

  private createSlot(definition: ReactElementSlotDefinition | undefined): ReactNode {
    if (definition === true || definition === undefined) {
      return createElement("slot");
    }
    if (typeof definition === "string") {
      return createElement("slot", { name: definition });
    }
    const children = definition.fallback ? React.Children.toArray(definition.fallback) : undefined;
    return createElement("slot", definition.name ? { name: definition.name } : undefined, children);
  }
}
