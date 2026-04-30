import { expect, test } from "@playwright/test";

test.describe("Client Customize Product Page", () => {
  const mockVariant = {
    id: "var-1",
    name: "Crepa de Nutella",
    price: 4500,
    description: "Deliciosa crepa con Nutella",
    image: "https://example.com/crepa.jpg",
    categoryId: "cat-dulce",
    status: "active",
    type: "complete",
    path: ["Dulce", "Crepas"],
    components: [
      {
        id: "comp-1",
        productId: "ing-nutella",
        productName: "Nutella",
        quantity: 1,
        isRemovable: true,
      },
    ],
  };

  const mockAllowedIngredients = [
    {
      id: "ing-fresa",
      name: "Fresa",
      price: 500,
      status: "active",
    },
    {
      id: "ing-platano",
      name: "Plátano",
      price: 500,
      status: "active",
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/products/variant/var-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockVariant),
      });
    });

    await page.route("**/v1/products/variants/allowed", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAllowedIngredients),
      });
    });

    await page.goto("/customize-product?variantId=var-1");
  });

  test("displays product details correctly", async ({ page }) => {
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
    await expect(page.getByText("$45.00")).toBeVisible();
  });

  test("displays base ingredients", async ({ page }) => {
    await expect(page.getByText("Ingredientes base")).toBeVisible();
    await expect(page.getByText("Nutella")).toBeVisible();
  });

  test("allows removing removable ingredients", async ({ page }) => {
    await page.getByRole("button", { name: /Quitar/i }).click();
    await expect(
      page.getByRole("button", { name: /Reactivar/i }),
    ).toBeVisible();
  });

  test("allows adding extra ingredients", async ({ page }) => {
    await page.locator('input[placeholder*="Buscar"]').fill("Fresa");
    await page.getByRole("button", { name: /Fresa/i }).click();
    await expect(page.getByText("+$5.00")).toBeVisible();
  });

  test("calculates total price correctly", async ({ page }) => {
    await page.locator('input[placeholder*="Buscar"]').fill("Fresa");
    await page.getByRole("button", { name: /Fresa/i }).click();
    await expect(page.getByText("$50.00")).toBeVisible();
  });

  test("adds product to cart", async ({ page }) => {
    await page.route("**/v1/orders/items", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ itemId: "item-1" }),
      });
    });

    await page.getByRole("button", { name: /Añadir a mi orden/i }).click();
    await expect(page.getByText("Agregado")).toBeVisible();
  });
});
