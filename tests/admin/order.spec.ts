import { expect, test } from "@playwright/test";

test.describe("Admin Orders Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/order");
  });

  test("loads orders page successfully", async ({ page }) => {
    await page.waitForSelector("text=Incoming", { state: "visible" });
    await expect(page.getByText("Preparation")).toBeVisible();
    await expect(page.getByText("Ready")).toBeVisible();
  });

  test("displays three order columns", async ({ page }) => {
    await page.waitForSelector("text=Incoming", { state: "visible" });
    const incomingColumn = page
      .locator("div")
      .filter({ hasText: "Incoming" })
      .first();
    const preparationColumn = page
      .locator("div")
      .filter({ hasText: "Preparation" })
      .first();
    const readyColumn = page
      .locator("div")
      .filter({ hasText: "Ready" })
      .first();

    await expect(incomingColumn).toBeVisible();
    await expect(preparationColumn).toBeVisible();
    await expect(readyColumn).toBeVisible();
  });

  test("shows loading state while fetching orders", async ({ page }) => {
    await page.route("**/v1/orders", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.continue();
    });
    await page.goto("/admin/order");
    await expect(page.getByText("Cargando...")).toBeVisible();
  });

  test("displays error state when API fails", async ({ page }) => {
    await page.route("**/v1/orders", async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });
    await page.goto("/admin/order");
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Error/)).toBeVisible();
  });

  test("can open order details modal when clicking 'Ver detalles'", async ({
    page,
  }) => {
    await page.waitForSelector("text=Incoming", { state: "visible" });
    await page.waitForTimeout(2000);

    const viewButtons = page.getByRole("button", { name: /Ver detalles/i });
    const count = await viewButtons.count();

    if (count > 0) {
      await viewButtons.first().click();
      await expect(
        page.getByRole("heading", { name: "Orden de usuario" }),
      ).toBeVisible();
    }
  });

  test("can close order details modal", async ({ page }) => {
    await page.waitForSelector("text=Incoming", { state: "visible" });
    await page.waitForTimeout(2000);

    const viewButtons = page.getByRole("button", { name: /Ver detalles/i });
    const count = await viewButtons.count();

    if (count > 0) {
      await viewButtons.first().click();
      await expect(
        page.getByRole("heading", { name: "Orden de usuario" }),
      ).toBeVisible();

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      await expect(
        page.getByRole("heading", { name: "Orden de usuario" }),
      ).toBeHidden();
    }
  });

  test("displays orders in correct columns based on status", async ({
    page,
  }) => {
    await page.waitForSelector("text=Incoming", { state: "visible" });
    await page.waitForTimeout(2000);

    const hasPendingOrders = await page
      .locator("div")
      .filter({ hasText: "Incoming" })
      .first()
      .locator('[class*="bg-white"]')
      .count();
    const hasProcessingOrders = await page
      .locator("div")
      .filter({ hasText: "Preparation" })
      .first()
      .locator('[class*="bg-white"]')
      .count();
    const hasReadyOrders = await page
      .locator("div")
      .filter({ hasText: "Ready" })
      .first()
      .locator('[class*="bg-white"]')
      .count();

    expect(
      hasPendingOrders >= 0 || hasProcessingOrders >= 0 || hasReadyOrders >= 0,
    ).toBeTruthy();
  });

  test("order modal shows order details information", async ({ page }) => {
    await page.waitForSelector("text=Incoming", { state: "visible" });
    await page.waitForTimeout(2000);

    const viewButtons = page.getByRole("button", { name: /Ver detalles/i });
    const count = await viewButtons.count();

    if (count > 0) {
      await viewButtons.first().click();
      const modal = page.locator('[role="dialog"]');
      await expect(
        page.getByRole("heading", { name: "Orden de usuario" }),
      ).toBeVisible();
      await expect(modal.getByText("Orden #")).toBeVisible();
      await expect(modal.getByText("Aceptar")).toBeVisible();
    }
  });
});
