import { describe, expect, it } from "vitest";
import { createMetadata } from "../src/metadata/create-metadata";

describe("metadata", () => {
  it("creates serializable custom element metadata", () => {
    const metadata = createMetadata("acme-picker", {
      props: {
        selectedId: { type: "string", reflect: true },
        rows: { attribute: false }
      },
      events: {
        onRowSelect: { name: "row-select" }
      },
      slots: {
        children: true,
        footer: "footer"
      },
      methods: {
        clearSelection: { call: () => undefined }
      },
      form: {
        valueProp: "selectedId"
      },
      shadow: { mode: "open" }
    });
    expect(metadata.attributes).toEqual([
      { name: "selected-id", property: "selectedId", reflect: true }
    ]);
    expect(metadata.events[0]?.name).toBe("row-select");
    expect(metadata.slots).toContainEqual({ prop: "footer", name: "footer" });
    expect(metadata.formAssociated).toBe(true);
  });
});
