import { expect, test } from "@playwright/test";

test.describe("Admin Discount Detail Page", () => {
  const mockDiscount = {
    id: "disc-1",
    name: "10% de descuento",
    type: "percentage",
    value: 10,
    state: "active",
    code: "DESCUENTO10",
    branches: [{ id: "branch-1", name: "Sucursal Central" }],
  };

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/discounts/disc-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockDiscount),
      });
    });

    await page.goto("/admin/discounts/disc-1");
  });

  test("displays discount details correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "10% de descuento" }),
    ).toBeVisible();
    await expect(page.getByText("10%")).toBeVisible();
  });

  test("shows discount status badge", async ({ page }) => {
    await expect(page.getByText("Activo")).toBeVisible();
  });

  test("displays discount code", async ({ page }) => {
    await expect(page.getByText("DESCUENTO10")).toBeVisible();
  });

  test("allows editing discount", async ({ page }) => {
    await page.getByRole("button", { name: "Editar" }).click();
    await expect(page.getByLabel("Nombre")).toBeVisible();
  });

  test("allows deleting discount", async ({ page }) => {
    await page.route("**/v1/discounts/disc-1", async (route) => {
      await route.fulfill({
        status: 204,
        contentType: "application/json",
      });
    });

    await page.getByRole("button", { name: /Eliminar/i }).click();
    await expect(page.getByText("Descuento eliminado")).toBeVisible();
  });
});
