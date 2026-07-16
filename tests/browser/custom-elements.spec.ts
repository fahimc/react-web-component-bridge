import { expect, test } from "@playwright/test";

test("plain custom element registration renders in a real browser", async ({ page }) => {
  await page.goto("data:text/html,<main></main>");
  await page.addScriptTag({
    content: `
      class XSmoke extends HTMLElement {
        connectedCallback() {
          const root = this.attachShadow({ mode: "open" });
          root.innerHTML = "<button part='button'>ready</button>";
        }
      }
      customElements.define("x-smoke-element", XSmoke);
      document.querySelector("main").innerHTML = "<x-smoke-element></x-smoke-element>";
    `
  });
  await expect(page.locator("x-smoke-element").locator("button")).toHaveText("ready");
});
