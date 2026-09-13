import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("embedded widget quality contract", () => {
  test("works on a restrictive host page and passes axe checks", async ({ page }) => {
    await page.goto("/widget-test-host.html");

    const frame = page.frameLocator("#feedlyte-widget-frame");
    await expect(page.locator("#feedlyte-widget-frame")).toBeVisible();
    await expect(frame.getByRole("button", { name: /toggle feedback form/i })).toBeVisible();

    const hostFont = await page.locator("h1").evaluate((element) => getComputedStyle(element).fontFamily);
    const widgetFont = await frame.locator("div[dir]").evaluate((element) => getComputedStyle(element).fontFamily);
    expect(hostFont).toContain("Impact");
    expect(widgetFont).not.toContain("Impact");

    const hostResults = await new AxeBuilder({ page }).exclude("#feedlyte-widget-frame").analyze();
    expect(hostResults.violations).toEqual([]);

    const launcher = frame.getByRole("button", { name: /toggle feedback form/i });
    await launcher.click();
    await expect.poll(async () => page.locator("#feedlyte-widget-frame").evaluate((element) => element.style.height)).not.toBe("68px");
    await expect(frame.getByRole("dialog", { name: /feedback form/i })).toBeVisible();
    await expect(frame.getByRole("textbox", { name: /feedback message/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(launcher).toBeFocused();

    await page.screenshot({ path: "test-results/playwright/host-desktop.png", fullPage: true });
  });

  test("keeps the iframe within mobile viewport bounds", async ({ page }) => {
    await page.goto("/widget-test-host.html");
    const frame = page.locator("#feedlyte-widget-frame");
    const box = await frame.boundingBox();
    const viewport = page.viewportSize();

    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);

    await page.screenshot({ path: "test-results/playwright/host-mobile.png", fullPage: true });
  });
});