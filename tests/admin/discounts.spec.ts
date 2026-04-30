import { expect, test } from "@playwright/test";

test.describe("Admin Discounts Page", () => {
  const mockDiscounts = [
    {
      id: "disc-1",
      name: "10% de descuento",
      type: "percentage",
      value: 10,
      state: "active",
      code: "DESCUENTO10",
    },
    {
      id: "disc-2",
      name: "$50 MXN",
      type: "fixed",
      value: 5000,
      state: "inactive",
      code: "FIJO50",
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/discounts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockDiscounts),
      });
    });

    await page.goto("/admin/discounts");
  });

  test("displays discounts list correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Descuentos", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("10% de descuento")).toBeVisible();
    await expect(page.getByText("$50 MXN")).toBeVisible();
  });

  test("shows empty state when no discounts", async ({ page }) => {
    await page.route("**/v1/discounts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/admin/discounts");
    await expect(page.getByText("No hay descuentos")).toBeVisible();
  });

  test("opens create discount modal", async ({ page }) => {
    await page.getByRole("button", { name: "Nuevo Descuento" }).click();
    await expect(
      page.getByRole("heading", { name: "Nuevo Descuento" }),
    ).toBeVisible();
  });

  test("navigates to discount detail page", async ({ page }) => {
    await page.getByText("10% de descuento").click();
    await expect(page).toHaveURL(/\/admin\/discounts\/disc-1/);
  });
});
