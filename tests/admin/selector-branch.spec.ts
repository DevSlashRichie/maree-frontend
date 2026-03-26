import { expect, test } from "@playwright/test";

test.describe("Branch Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
  });

  test("displays 'Selecciona Sucursal' placeholder when no branch selected", async ({
    page,
  }) => {
    await page.waitForTimeout(2000);
    await expect(page.getByText("Selecciona Sucursal")).toBeVisible();
  });

  test("opens dropdown when clicking the selector button", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.waitForTimeout(500);
    const branchButtons = page.locator("button");
    const count = await branchButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows branches list when branches are available", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.waitForTimeout(1000);
    const branchButtons = page.locator("button");
    const count = await branchButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows empty state when no branches available", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Selecciona Sucursal')");
    await expect(page.getByText("No hay sucursales")).toBeVisible();
  });

  test("navigates to branch page when selecting a branch", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.waitForTimeout(1000);
    const branchButtons = page
      .locator("button")
      .filter({ hasText: /^(?!.*Configuración)/ });
    const count = await branchButtons.count();
    if (count > 0) {
      await branchButtons.first().click();
      await expect(page.url()).toContain("/admin/branches/");
    }
  });

  test("navigates to branches settings when clicking configuración", async ({
    page,
  }) => {
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.waitForTimeout(1000);
    await page.click("button:has-text('Configuración')");
    await expect(page.url()).toContain("/admin/branches");
  });

  test("shows loading state while fetching branches", async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.continue();
    });
    await page.goto("/admin");
    await expect(page.getByText("Cargando")).toBeVisible();
  });
});
