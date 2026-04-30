import { expect, test } from "@playwright/test";

test.describe("Admin Order Detail Page", () => {
  const mockOrder = {
    id: "order-1",
    status: "ready",
    createdAt: "2024-01-15T10:00:00Z",
    total: 9500,
    branch: { id: "branch-1", name: "Sucursal Central" },
    customer: { name: "John Doe", phone: "4421234567" },
    items: [
      {
        displayName: "Crepa de Nutella",
        quantity: 1,
        unitPriceCents: 4500,
        modifiers: [],
      },
      {
        displayName: "Fresa",
        quantity: 1,
        unitPriceCents: 500,
        modifiers: [{ id: "m1", name: "Extra fresa" }],
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

    await page.goto("/admin/orders/order-1");
  });

  test("displays order details correctly", async ({ page }) => {
    await expect(page.getByText("Pedido #order-1")).toBeVisible();
  });

  test("displays order status badge", async ({ page }) => {
    await expect(page.getByText("Listo")).toBeVisible();
  });

  test("displays customer info", async ({ page }) => {
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("4421234567")).toBeVisible();
  });

  test("displays order items", async ({ page }) => {
    await expect(page.getByText("Crepa de Nutella")).toBeVisible();
    await expect(page.getByText("1 x $45.00")).toBeVisible();
  });

  test("displays order total", async ({ page }) => {
    await expect(page.getByText("$95.00")).toBeVisible();
  });

  test("allows changing order status", async ({ page }) => {
    await page.route("**/v1/orders/order-1/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "completed" }),
      });
    });

    await page.getByRole("button", { name: "Marcar como entregado" }).click();
    await expect(page.getByText("Entregado")).toBeVisible();
  });

  test("allows cancelling order", async ({ page }) => {
    await page.route("**/v1/orders/order-1", async (route) => {
      await route.fulfill({
        status: 204,
        contentType: "application/json",
      });
    });

    await page.getByRole("button", { name: "Cancelar pedido" }).click();
    await expect(page.getByText("Pedido cancelado")).toBeVisible();
  });
});
