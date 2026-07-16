import { describe, expect, it } from "vitest";
import { camelToKebab, kebabToCamel, normalizeCustomElementName } from "../src/utilities/casing";
import { parseAttributeValue } from "../src/utilities/parsing";
import { serializeAttributeValue } from "../src/utilities/serialization";

describe("utilities", () => {
  it("converts casing", () => {
    expect(camelToKebab("selectedCustomerId")).toBe("selected-customer-id");
    expect(kebabToCamel("selected-customer-id")).toBe("selectedCustomerId");
    expect(normalizeCustomElementName(" Acme-Card ")).toBe("acme-card");
    expect(() => normalizeCustomElementName("button")).toThrow("kebab-case");
  });

  it("parses built-in attribute types safely", () => {
    const host = document.createElement("div");
    expect(parseAttributeValue("", { type: "boolean" }, host)).toBe(true);
    expect(parseAttributeValue(null, { type: "boolean" }, host)).toBe(false);
    expect(parseAttributeValue("42", { type: "number" }, host)).toBe(42);
    expect(parseAttributeValue("wat", { type: "number" }, host)).toBeUndefined();
    expect(parseAttributeValue('{"ok":true}', { type: "json" }, host)).toEqual({ ok: true });
    expect(parseAttributeValue("{", { type: "json" }, host)).toBeUndefined();
    expect(parseAttributeValue("", { type: "json" }, host)).toBeUndefined();
    expect(parseAttributeValue("2026-07-16T00:00:00.000Z", { type: "date" }, host)).toBeInstanceOf(
      Date
    );
    expect(parseAttributeValue("not-a-date", { type: "date" }, host)).toBeUndefined();
    expect(parseAttributeValue("value", {}, host)).toBe("value");
    expect(
      parseAttributeValue("value", { parseAttribute: (input) => `custom:${input}` }, host)
    ).toBe("custom:value");
  });

  it("serializes built-in attribute types safely", () => {
    const host = document.createElement("div");
    expect(serializeAttributeValue(true, { type: "boolean" }, host)).toBe("");
    expect(serializeAttributeValue(false, { type: "boolean" }, host)).toBeNull();
    expect(serializeAttributeValue(undefined, { type: "string" }, host)).toBeNull();
    expect(serializeAttributeValue({ ok: true }, { type: "json" }, host)).toBe('{"ok":true}');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(serializeAttributeValue(circular, { type: "json" }, host)).toBeNull();
    expect(serializeAttributeValue(7, { type: "number" }, host)).toBe("7");
    expect(serializeAttributeValue(Number.NaN, { type: "number" }, host)).toBeNull();
    expect(
      serializeAttributeValue(new Date("2026-07-16T00:00:00.000Z"), { type: "date" }, host)
    ).toBe("2026-07-16T00:00:00.000Z");
    expect(serializeAttributeValue(new Date("bad"), { type: "date" }, host)).toBeNull();
    expect(serializeAttributeValue("value", {}, host)).toBe("value");
    expect(
      serializeAttributeValue("value", { serializeAttribute: (input) => `custom:${input}` }, host)
    ).toBe("custom:value");
  });
});
