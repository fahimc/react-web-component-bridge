import { describe, expect, it } from "vitest";
import React, {
  configureReactApi,
  createComponentTag,
  defineComponentTag,
  defineWebComponent,
  useState
} from "../src/react";

describe("React-compatible facade", () => {
  it("re-exports React and creates deferred component tags", () => {
    function Counter() {
      const [count] = useState(1);
      return <span>{count}</span>;
    }

    const definition = createComponentTag("x-facade-counter", Counter, {
      props: {
        label: { type: "string" }
      }
    });

    expect(React.createElement).toBeTypeOf("function");
    expect(definition.tagName).toBe("x-facade-counter");
    expect(customElements.get("x-facade-counter")).toBeUndefined();
  });

  it("defines web component tags through facade aliases", () => {
    const tag = `x-facade-defined-${Math.random().toString(36).slice(2)}`;
    const definition = defineComponentTag(tag, () => <span>ready</span>, {});
    const alias = defineWebComponent(`${tag}-alias`, () => <span>alias</span>, {});

    expect(customElements.get(tag)).toBe(definition.elementClass);
    expect(customElements.get(`${tag}-alias`)).toBe(alias.elementClass);
    expect(configureReactApi({ strictMode: false }).strictMode).toBe(false);
  });
});
