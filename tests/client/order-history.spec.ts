import { expect, test } from "@playwright/test";

test.describe("Client Order History Page", () => {
  const mockOrders = [
    {
      id: "order-1",
      status: "ready",
      createdAt: "2024-01-15T10:00:00Z",
      total: 9500,
      items: [
        { displayName: "Crepa de Nutella", quantity: 1, unitPriceCents: 4500 },
      ],
    },
    {
      id: "order-2",
      status: "completed",
      createdAt: "2024-01-10T14:30:00Z",
      total: 4500,
      items: [{ displayName: "Waffle", quantity: 1, unitPriceCents: 4500 }],
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/orders", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockOrders),
      });
    });

    await page.goto("/order");
  });

  test("displays order history correctly", async ({ page }) => {
    await expect(page.getByText("Mis Pedidos")).toBeVisible();
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
  });

  test("shows order status badges", async ({ page }) => {
    await expect(page.getByText("Listo")).toBeVisible();
    await expect(page.getByText("Completado")).toBeVisible();
  });

  test("navigates to order detail", async ({ page }) => {
    await page.getByText("Crepa de Nutella").click();
    await expect(page).toHaveURL(/\/order\/order-1/);
  });

  test("shows empty state when no orders", async ({ page }) => {
    await page.route("**/v1/orders", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/order");
    await expect(page.getByText("No tienes pedidos")).toBeVisible();
  });
});
