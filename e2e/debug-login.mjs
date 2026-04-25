#!/usr/bin/env node
// Headless Playwright run that exercises the login flow and prints
// every console message + every network request so we can see why
// "Sign in" isn't reaching the API.
//
// Setup (one-time):
//   cd e2e && npm init -y && npm install playwright
//   npx playwright install chromium
// Run:
//   node e2e/debug-login.mjs

import { chromium } from "playwright";

const FRONT = "http://localhost:3001";
const USER = "alice";
const PASS = "SkSwap!2025";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

page.on("console", (msg) =>
  console.log(`[console:${msg.type()}]`, msg.text()),
);
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
page.on("request", (req) =>
  console.log(`[req] ${req.method()} ${req.url()}`),
);
page.on("response", (res) =>
  console.log(`[res] ${res.status()} ${res.url()}`),
);

console.log(`==> open ${FRONT}/login`);
await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
console.log("==> page loaded, title:", await page.title());

console.log("==> filling form");
await page.fill('input[autocomplete="username"]', USER);
await page.fill('input[autocomplete="current-password"]', PASS);

console.log("==> clicking Sign in");
await page.click('button[type="submit"]');

await page
  .waitForURL("**/dashboard", { timeout: 5000 })
  .then(() => console.log("==> redirected to /dashboard ✓"))
  .catch((e) => console.log("==> NO redirect:", e.message));

console.log("==> final URL:", page.url());
await page.screenshot({ path: "e2e/login-final.png", fullPage: true });
console.log("==> screenshot saved to e2e/login-final.png");

await browser.close();
