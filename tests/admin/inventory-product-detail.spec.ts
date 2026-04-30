import { expect, test } from "@playwright/test";

test.describe("Admin Inventory Product Detail Page", () => {
  const mockVariant = {
    id: "var-1",
    name: "Crepa de Nutella",
    price: 4500,
    description: "Deliciosa crepa con Nutella",
    image: "https://example.com/crepa.jpg",
    status: "active",
    categoryId: "cat-1",
    components: [
      {
        id: "comp-1",
        name: "Nutella",
        quantity: 1,
        isRemovable: true,
      },
    ],
  };

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/products/variant/var-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockVariant),
      });
    });

    await page.goto("/admin/inventory/var-1/detail");
  });

  test("displays product details correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Crepa de Nutella" }),
    ).toBeVisible();
    await expect(page.getByText("$45.00")).toBeVisible();
  });

  test("shows product status badge", async ({ page }) => {
    await expect(page.getByText("Activo")).toBeVisible();
  });

  test("displays product description", async ({ page }) => {
    await expect(page.getByText("Deliciosa crepa con Nutella")).toBeVisible();
  });

  test("displays components list", async ({ page }) => {
    await expect(page.getByText("Componentes")).toBeVisible();
    await expect(page.getByText("Nutella")).toBeVisible();
  });

  test("shows empty state when no components", async ({ page }) => {
    const variantWithoutComponents = { ...mockVariant, components: [] };
    await page.route("**/v1/products/variant/var-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(variantWithoutComponents),
      });
    });

    await page.goto("/admin/inventory/var-1/detail");
    await expect(
      page.getByText("Este producto no tiene componentes"),
    ).toBeVisible();
  });

  test("navigates to edit page", async ({ page }) => {
    await page.getByRole("link", { name: "Editar" }).click();
    await expect(page).toHaveURL(/\/admin\/inventory\/var-1/);
  });

  test("navigates back to products list", async ({ page }) => {
    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/admin\/inventory\/products/);
  });
});
