import { describe, expect, it } from "vitest";
import { generateArtifacts } from "../src";

describe("generator", () => {
  it("generates metadata artifacts", () => {
    const output = generateArtifacts([
      {
        tagName: "acme-picker",
        properties: [{ name: "value", type: "string" }],
        attributes: [{ name: "value", property: "value" }],
        events: [{ name: "value-change", prop: "onValueChange", bubbles: true, composed: true }],
        slots: [{ prop: "children", name: null }],
        methods: [{ name: "focus" }],
        formAssociated: true,
        shadow: true
      }
    ]);
    expect(output.customElementsJson).toContain("acme-picker");
    expect(output.declarations).toContain("HTMLElementTagNameMap");
    expect(output.markdown).toContain("| event | value-change |");
  });
});
