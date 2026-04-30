import { expect, test } from "@playwright/test";

test.describe("Admin Inventory Categories Page", () => {
  const mockCategories = [
    {
      id: "cat-dulce",
      name: "Dulce",
      public: true,
      parentId: null,
    },
    {
      id: "cat-salado",
      name: "Salado",
      public: true,
      parentId: null,
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/products/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCategories),
      });
    });

    await page.goto("/admin/inventory/categories");
  });

  test("displays categories list correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Categorías", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Dulce")).toBeVisible();
    await expect(page.getByText("Salado")).toBeVisible();
  });

  test("shows empty state when no categories", async ({ page }) => {
    await page.route("**/v1/products/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/admin/inventory/categories");
    await expect(page.getByText("No hay categorías")).toBeVisible();
  });

  test("opens create category modal", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva Categoría" }).click();
    await expect(
      page.getByRole("heading", { name: "Nueva Categoría" }),
    ).toBeVisible();
  });
});
