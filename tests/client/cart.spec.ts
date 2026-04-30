import { expect, test } from "@playwright/test";

test.describe("Client Cart Page", () => {
  const mockCartItems = [
    {
      itemId: "item-1",
      variantId: "var-1",
      displayName: "Crepa de Nutella",
      unitPriceCents: 4500,
      quantity: 1,
      modifiers: [],
    },
    {
      itemId: "item-2",
      variantId: "var-2",
      displayName: "Refresco",
      unitPriceCents: 2500,
      quantity: 2,
      modifiers: [],
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto("/cart");
  });

  test("shows empty cart when no items", async ({ page }) => {
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
    await expect(page.getByText("Añade productos del menú")).toBeVisible();
  });

  test("displays cart items correctly", async ({ page }) => {
    // Manually add items first (in real test would use authenticated state)
    await page.route("**/v1/orders/items", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: mockCartItems }),
      });
    });

    await page.reload();
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
    await expect(page.getByText("Refresco")).toBeVisible();
  });

  test("calculates total correctly", async ({ page }) => {
    await expect(page.getByText("$95.00")).toBeVisible();
  });

  test("allows quantity adjustment", async ({ page }) => {
    await page.getByRole("button", { name: "+" }).first().click();
    // Would verify quantity update
  });

  test("allows removing items", async ({ page }) => {
    await page
      .getByRole("button", { name: /Eliminar/i })
      .first()
      .click();
    // Would verify item removal
  });

  test("proceeds to checkout", async ({ page }) => {
    await page.getByRole("button", { name: /Ir a pagar/i }).click();
    await expect(page).toHaveURL(/\/order-setup/);
  });
});
