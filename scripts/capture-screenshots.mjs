import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3002";
const outputDir = path.resolve(process.cwd(), "public/screenshots");

const pages = [
  { url: `${baseUrl}/`, file: "homepage.png" },
  { url: `${baseUrl}/workspace-play`, file: "workspace-play.png" },
  { url: `${baseUrl}/core-play`, file: "core-play.png" },
  { url: `${baseUrl}/audit-play`, file: "audit-play.png" },
  { url: `${baseUrl}/archive-play`, file: "archive-play.png" }
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true
});

try {
  const context = await browser.newContext({
    viewport: {
      width: 1600,
      height: 1200
    },
    deviceScaleFactor: 1
  });

  for (const pageConfig of pages) {
    const page = await context.newPage();
    await page.goto(pageConfig.url, {
      waitUntil: "networkidle",
      timeout: 60000
    });
    await page.screenshot({
      path: path.join(outputDir, pageConfig.file),
      fullPage: true
    });
    await page.close();
  }

  await context.close();
} finally {
  await browser.close();
}
