import { expect, test } from "@playwright/test";

test.describe("Client Menu Page", () => {
  const mockBranches = [
    { id: "branch-1", name: "Sucursal Central", state: "active" },
  ];

  const mockCategories = [{ id: "cat-dulce", name: "Dulce", public: true }];

  const mockVariants = [
    {
      id: "var-1",
      name: "Crepa de Nutella",
      price: "4500",
      description: "Deliciosa crepa con Nutella",
      image: "https://example.com/crepa.jpg",
      product: { id: "prod-1", categoryId: "cat-dulce" },
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBranches),
      });
    });

    await page.route("**/v1/products/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCategories),
      });
    });

    await page.route("**/v1/products/variants", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ variants: mockVariants }),
      });
    });

    await page.goto("/menu");
  });

  test("displays menu with products", async ({ page }) => {
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
  });

  test("displays product price correctly", async ({ page }) => {
    await expect(page.getByText("$45.00")).toBeVisible();
  });

  test("navigates to customize product on card click", async ({ page }) => {
    await page.getByText("Crepa de Nutella").click();
    await expect(page).toHaveURL(/\/customize-product/);
  });

  test("shows empty state when no products", async ({ page }) => {
    await page.route("**/v1/products/variants", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ variants: [] }),
      });
    });

    await page.goto("/menu");
    await expect(page.getByText("Próximamente")).toBeVisible();
  });

  test("filters products by category", async ({ page }) => {
    await page.getByText("Dulce").click();
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
  });
});
