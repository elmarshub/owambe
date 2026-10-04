// The whole shopping flow in demo mode (no keys set): rail → fitting room → bag → sign in → deliver → pay.
import { expect, test, type Page } from "@playwright/test";

/** Waits for the rail to come alive and the pieces to finish sliding in. */
async function openRail(page: Page) {
  await page.locator(".stage[data-ready]").waitFor();
  await page.waitForTimeout(1500);
}

test("a shopper can try on a piece and check out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Ready for the/ })).toBeVisible();

  await openRail(page);
  await page.locator(".hit").first().click({ force: true });
  await expect(page.getByRole("heading", { name: "Royal Agbada" })).toBeVisible();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "On dummy" }).click();
  await page.getByRole("button", { name: "Broad" }).click();
  await expect(page.locator(".fitmsg")).toContainText("we suggest XL");
  await page.getByRole("button", { name: "XL, suggested" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(page.locator(".bagcount")).toHaveText("1");

  await page.getByRole("button", { name: "Open bag" }).click();
  await page.getByRole("button", { name: "Check out" }).click();
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Send code" }).click();
  await page.getByLabel("Digit 1").fill("482913");

  await expect(page.getByRole("heading", { name: "Where should it go?" })).toBeVisible();
  await page.getByLabel("Full name").fill("Ada Okafor");
  await page.locator('input[autocomplete="tel-national"]').fill("08030000000");
  await page.getByLabel("Address").fill("12 Admiralty Way");
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await page.getByRole("button", { name: /with Paystack/ }).click();
  await expect(page.getByRole("heading", { name: "It's yours." })).toBeVisible();
  await expect(page.locator(".bagcount")).toHaveText("0");
});

test("a wrong code is rejected", async ({ page }) => {
  await page.goto("/");
  await openRail(page);
  await page.locator(".hit").nth(3).click({ force: true });
  await page.getByRole("button", { name: "L, suggested" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.getByRole("button", { name: "Open bag" }).click();
  await page.getByRole("button", { name: "Check out" }).click();
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Send code" }).click();
  await page.getByLabel("Digit 1").fill("000000");
  await expect(page.locator(".err[role=alert]").filter({ hasText: "doesn't match" })).toBeVisible();
});

test("an old saved bag can't break the page, and the fila is charged", async ({ page }) => {
  await page.addInitScript(() => {
    const items = [{ id: "retired-piece", size: "L", qty: 1, acc: false }, { id: "royal", size: "L", qty: 1, acc: true }];
    localStorage.setItem("owambe-bag", JSON.stringify({ state: { items }, version: 0 }));
  });
  await page.goto("/");
  await openRail(page);
  await expect(page.locator(".bagcount")).toHaveText("1");
  await page.getByRole("button", { name: "Open bag" }).click();
  await expect(page.locator(".bi .meta")).toContainText("with fila");
  await expect(page.locator(".drawer .totals")).toContainText("₦193,000");
});
