import { expect, test } from "@playwright/test";

test.describe("Admin Inventory Products Page", () => {
  const mockProducts = [
    {
      id: "prod-1",
      name: "Crepa Dulce",
      price: "4500",
      status: "active",
      type: "complete",
      categoryId: "cat-1",
      image: "https://example.com/crepa.jpg",
    },
    {
      id: "prod-2",
      name: "Crepa Salada",
      price: "5000",
      status: "inactive",
      type: "complete",
      categoryId: "cat-2",
      image: null,
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/products", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ products: mockProducts }),
      });
    });

    await page.goto("/admin/inventory/products");
  });

  test("displays products list correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Inventario", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Crepa Dulce")).toBeVisible();
    await expect(page.getByText("Crepa Salada")).toBeVisible();
  });

  test("shows active and inactive status badges", async ({ page }) => {
    await expect(page.getByText("Activo")).toBeVisible();
  });

  test("navigates to product detail page", async ({ page }) => {
    await page.getByText("Crepa Dulce").click();
    await expect(page).toHaveURL(/\/admin\/inventory\/prod-1/);
  });

  test("opens create product page", async ({ page }) => {
    await page.getByRole("button", { name: "Nuevo Producto" }).click();
    await expect(page).toHaveURL("/admin/create-product");
  });
});
