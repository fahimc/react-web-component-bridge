import { describe, expect, it } from "vitest";
import { createReactElement } from "../src";

describe("ssr import safety", () => {
  it("exports the creation API without touching browser globals at module import time", () => {
    expect(typeof createReactElement).toBe("function");
  });
});
