const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const base = process.env.BASE_URL || "http://127.0.0.1:3000/resources";
const mode = process.env.MODE || "after";
const routes = {
  docs: "/user-guide/compute-clusters/overview",
  blog: "/blog/self-hosted-data-platform-private-cloud-architecture",
};
const output = "/tmp/diagram-proof";
fs.mkdirSync(output, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const errors = [];
  for (const [surface, route] of Object.entries(routes)) {
    for (const theme of ["light", "dark"]) {
      for (const width of [1280, 390]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 } });
        // Keep screenshots deterministic and avoid third-party analytics calls.
        await context.route("**/*", (request) =>
          new URL(request.request().url()).hostname === new URL(base).hostname
            ? request.continue()
            : request.abort()
        );
        await context.addInitScript((value) => {
          localStorage.setItem("theme", value);
          localStorage.setItem("iomete-cookie-consent", "true");
        }, theme);
        const page = await context.newPage();
        page.setDefaultTimeout(20000);
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + route, { waitUntil: "domcontentloaded" });
        await page.locator("article").first().waitFor();
        await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
        await page.evaluate(() => Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 10000)),
        ]));
        const diagram = page.locator("[data-shared-storage-diagram]");
        if (mode === "after") {
          await diagram.waitFor();
          await diagram.getByRole("button", { name: "Add ETL", exact: true }).click();
          await diagram.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 180));
          assert.equal(await diagram.getAttribute("data-step"), "1");
          assert.equal(await diagram.locator("button[aria-pressed=true]").count(), 1);
          await diagram.getByRole("button", { name: "Stop ETL", exact: true }).click();
          assert.equal(await diagram.getAttribute("data-step"), "2");
          assert.match(await diagram.innerText(), /Stopped/);
          assert.match(await diagram.innerText(), /tables stay in object storage/);
          await diagram.getByRole("button", { name: "BI queries", exact: true }).click();
          assert.equal(await diagram.getAttribute("data-step"), "0");
          assert.match(await diagram.innerText(), /Not started/);
          await diagram.getByRole("button", { name: "Add ETL", exact: true }).focus();
          await page.keyboard.press("Enter");
          assert.equal(await diagram.getAttribute("data-step"), "1");
          assert.equal(await diagram.getAttribute("data-running"), "false");
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "No page overflow");
          assert(await diagram.evaluate((el) => el.scrollWidth <= el.clientWidth), "No diagram overflow");
          for (const el of await diagram.locator("button").all()) {
            assert((await el.boundingBox()).height >= 44, "44px touch target");
          }
          await page.evaluate(() => document.activeElement.blur());
          await page.mouse.move(0, 0);
        } else {
          const anchor = surface === "docs"
            ? page.getByText("Since storage and compute are decoupled", { exact: false })
            : page.getByRole("heading", { name: /the compute engines/i });
          await anchor.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 180));
        }
        await page.screenshot({ path: `${output}/${mode}-${surface}-${theme}-${width}.png` });
        await context.close();
      }
    }
  }
  if (mode === "after") {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(base + routes.docs);
    const diagram = page.locator("[data-shared-storage-diagram]");
    await diagram.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector("[data-shared-storage-diagram]")?.dataset.running === "true");
    const start = Number(await diagram.getAttribute("data-step"));
    await page.clock.fastForward(5100);
    assert.equal(Number(await diagram.getAttribute("data-step")), (start + 1) % 3, "Autoplay advances");
    await diagram.getByRole("button", { name: "Pause diagram animation" }).click();
    const paused = await diagram.getAttribute("data-step");
    await page.clock.fastForward(15000);
    assert.equal(await diagram.getAttribute("data-step"), paused, "Pause holds step");
    await diagram.getByRole("button", { name: "Play diagram animation" }).click();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForFunction(() => document.querySelector("[data-shared-storage-diagram]").dataset.running === "false");
    const offscreen = await diagram.getAttribute("data-step");
    await page.clock.fastForward(15000);
    assert.equal(await diagram.getAttribute("data-step"), offscreen, "Offscreen pauses timer");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => !document.querySelector('[aria-label="Pause diagram animation"]'));
    await diagram.getByRole("button", { name: "Add ETL", exact: true }).click();
    await page.clock.fastForward(15000);
    assert.equal(await diagram.getAttribute("data-step"), "1", "Runtime reduced motion disables autoplay");
    await context.close();

    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(base + routes.docs);
    await reducedPage.locator("[data-shared-storage-diagram] button").first().waitFor();
    assert.equal(await reducedPage.locator("[data-shared-storage-diagram]").getAttribute("data-step"), "1");
    assert.equal(await reducedPage.locator("[data-shared-storage-diagram]").getAttribute("data-running"), "false");
    assert.equal(await reducedPage.getByRole("button", { name: /diagram animation/ }).count(), 0);
    await reduced.close();

    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJs.newPage();
    await staticPage.goto(base + routes.docs);
    const fallback = staticPage.locator("[data-shared-storage-diagram]");
    assert.equal(await fallback.getAttribute("data-step"), "1");
    assert.match(await fallback.innerText(), /Apache Iceberg tables/);
    assert.equal(await fallback.getByRole("button").count(), 0);
    await noJs.close();
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  await browser.close();
  console.log(`PASS ${mode}: 8 screenshots; ${mode === "after" ? "steps, keyboard, playback, offscreen pause, reduced motion, no-JS, touch targets, overflow, runtime" : "base pages captured"}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
