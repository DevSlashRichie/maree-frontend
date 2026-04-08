import { expect, test } from "@playwright/test";

test.describe("Admin Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/reports");
  });

  test("loads reports page successfully", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Reportes");
    await expect(
      page.getByText("Vista general del rendimiento de la cafetería"),
    ).toBeVisible();
  });

  test("displays weekly orders chart", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await expect(page.getByText("Ordenes Semanales")).toBeVisible();
    const chartSection = page
      .locator("div")
      .filter({ hasText: "Ordenes Semanales" })
      .first();
    await expect(chartSection.locator("img").first()).toBeVisible();
  });

  test("displays top products chart", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await expect(page.getByText("Productos Más Vendidos")).toBeVisible();
    const chartSection = page
      .locator("div")
      .filter({ hasText: "Productos Más Vendidos" })
      .first();
    await expect(chartSection.locator("img").first()).toBeVisible();
  });

  test("displays category consumption chart", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await expect(page.getByText("Consumo por Categoría")).toBeVisible();
    const chartSection = page
      .locator("div")
      .filter({ hasText: "Consumo por Categoría" })
      .first();
    await expect(chartSection.locator("img").first()).toBeVisible();
  });
});
