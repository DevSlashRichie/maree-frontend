import { expect, test } from "@playwright/test";

test.describe("Client Order Detail Page", () => {
  const mockOrder = {
    id: "order-1",
    status: "ready",
    createdAt: "2024-01-15T10:00:00Z",
    total: 9500,
    branch: { name: "Sucursal Central" },
    items: [
      {
        displayName: "Crepa de Nutella",
        quantity: 1,
        unitPriceCents: 4500,
        modifiers: [],
      },
    ],
  };

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/orders/order-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockOrder),
      });
    });

    await page.goto("/order/order-1");
  });

  test("displays order details correctly", async ({ page }) => {
    await expect(page.getByText("Pedido #order-1")).toBeVisible();
  });

  test("shows order status", async ({ page }) => {
    await expect(page.getByText("Listo")).toBeVisible();
  });

  test("displays order items", async ({ page }) => {
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
  });

  test("displays order total", async ({ page }) => {
    await expect(page.getByText("$95.00")).toBeVisible();
  });

  test("shows order date", async ({ page }) => {
    await expect(page.getByText("15 de enero")).toBeVisible();
  });

  test("shows branch name", async ({ page }) => {
    await expect(page.getByText("Sucursal Central")).toBeVisible();
  });

  test("allows reordering", async ({ page }) => {
    await page.getByRole("button", { name: /Volver a ordenar/i }).click();
    await expect(page).toHaveURL(/\/customize-product/);
  });

  test("allows leaving a review", async ({ page }) => {
    await page.getByRole("button", { name: /Calificar/i }).click();
    await expect(page).toHaveURL(/\/review/);
  });
});
