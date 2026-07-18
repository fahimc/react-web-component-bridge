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
  await page.waitForSelector("lab-realworld-banner");
  await page.waitForSelector("lab-bulletproof-dashboard");
  await page.waitForSelector("lab-jira-board");
  await page.waitForSelector("lab-shadcn-button");
  await page
    .locator("lab-shadcn-button")
    .first()
    .evaluate((element) => {
      const button = element.shadowRoot?.querySelector("button");
      if (!button) throw new Error("shadcn button not rendered");
      button.click();
    });
  await page.waitForFunction(() =>
    document.querySelector(".button-log")?.textContent?.includes("Primary action")
  );
  await page.locator("lab-jira-board").evaluate((element) => {
    const issue = element.shadowRoot?.querySelector("button.issue");
    if (!issue) throw new Error("Issue button not rendered");
    issue.click();
  });
  await page.waitForFunction(() =>
    document.querySelector(".event-log")?.textContent?.includes("RWCB-101")
  );
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    realworldText: document.querySelector("lab-realworld-banner")?.shadowRoot?.textContent ?? "",
    bulletproofText:
      document.querySelector("lab-bulletproof-dashboard")?.shadowRoot?.textContent ?? "",
    jiraText: document.querySelector("lab-jira-board")?.shadowRoot?.textContent ?? "",
    shadcnText: document.querySelector("lab-shadcn-button")?.shadowRoot?.textContent ?? "",
    eventText: document.querySelector(".event-log")?.textContent ?? "",
    buttonText: document.querySelector(".button-log")?.textContent ?? ""
  }));
  console.log(JSON.stringify({ metrics, errors }, null, 2));
  if (metrics.scrollWidth !== metrics.clientWidth) throw new Error("Mobile horizontal overflow");
  if (!metrics.realworldText.includes("conduit")) throw new Error("RealWorld banner missing");
  if (!metrics.bulletproofText.includes("Katherine Johnson"))
    throw new Error("Bulletproof dashboard missing");
  if (!metrics.jiraText.includes("Kanban board")) throw new Error("Jira board missing");
  if (!metrics.shadcnText.includes("Primary action")) throw new Error("shadcn button missing");
  if (!metrics.eventText.includes("RWCB-101")) throw new Error("Jira event not dispatched");
  if (!metrics.buttonText.includes("Primary action"))
    throw new Error("shadcn button event not dispatched");
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
