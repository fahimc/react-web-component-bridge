import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const serverCommand = process.platform === "win32" ? "cmd.exe" : "pnpm";
const serverArgs = process.platform === "win32" ? ["/d", "/s", "/c", "pnpm preview"] : ["preview"];
const server = spawn(serverCommand, serverArgs, {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  stdio: "pipe"
});

const closeServer = () => {
  if (server.killed) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  server.kill("SIGTERM");
};

try {
  await waitForServer("http://127.0.0.1:4188");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4188", { waitUntil: "networkidle" });
  await page.waitForSelector(".demo-card[data-demo='realworld']");
  const landingMetrics = await page.evaluate(() => ({
    demoCards: document.querySelectorAll(".demo-card").length,
    renderedDemos: document.querySelectorAll(
      "lab-realworld-app,lab-bulletproof-app,lab-jira-app,lab-shadcn-kit"
    ).length
  }));
  if (landingMetrics.demoCards !== 4) throw new Error("Landing page demo links missing");
  if (landingMetrics.renderedDemos !== 0) throw new Error("Landing page should link to demos only");

  await page.goto("http://127.0.0.1:4188/#/realworld", { waitUntil: "networkidle" });
  await page.waitForSelector("lab-realworld-app");
  await page.waitForFunction(() =>
    document.querySelector("lab-realworld-app")?.shadowRoot?.textContent?.includes("Global Feed")
  );
  await page.goto("http://127.0.0.1:4188/#/bulletproof", { waitUntil: "networkidle" });
  await page.waitForSelector("lab-bulletproof-app");
  await page.waitForFunction(() =>
    document
      .querySelector("lab-bulletproof-app")
      ?.shadowRoot?.textContent?.includes("Katherine Johnson")
  );
  await page.goto("http://127.0.0.1:4188/#/shadcn", { waitUntil: "networkidle" });
  await page.waitForSelector("lab-shadcn-kit");
  await page.waitForFunction(() =>
    document
      .querySelector("lab-shadcn-kit")
      ?.shadowRoot?.textContent?.includes("Design system workbench")
  );
  await page.locator("lab-shadcn-kit").evaluate((element) => {
    const button = element.shadowRoot?.querySelector("button");
    if (!button) throw new Error("shadcn kit action not rendered");
    button.click();
  });
  await page.waitForFunction(() =>
    document.querySelector(".button-log")?.textContent?.includes("Publish theme")
  );
  await page.goto("http://127.0.0.1:4188/#/jira", { waitUntil: "networkidle" });
  await page.waitForSelector("lab-jira-app");
  await page.locator("lab-jira-app").evaluate((element) => {
    const issue = element.shadowRoot?.querySelector("button.jira-card");
    if (!issue) throw new Error("Issue button not rendered");
    issue.click();
  });
  await page.waitForFunction(() =>
    document.querySelector(".event-log")?.textContent?.includes("RWCB-101")
  );
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    jiraText: document.querySelector("lab-jira-app")?.shadowRoot?.textContent ?? "",
    eventText: document.querySelector(".event-log")?.textContent ?? ""
  }));
  console.log(JSON.stringify({ metrics, errors }, null, 2));
  if (metrics.scrollWidth !== metrics.clientWidth) throw new Error("Mobile horizontal overflow");
  if (!metrics.jiraText.includes("Kanban board")) throw new Error("Jira board missing");
  if (!metrics.eventText.includes("RWCB-")) throw new Error("Jira event not dispatched");
  if (errors.length > 0) throw new Error(errors.join("\n"));
  await browser.close();
} finally {
  closeServer();
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}
