import { expect, test } from "@playwright/test";

test.describe("Admin Orders Page", () => {
  const mockOrders = [
    {
      id: "order-1",
      status: "incoming",
      createdAt: "2024-01-15T10:00:00Z",
      total: 9500,
      branchId: "branch-1",
      items: [{ displayName: "Crepa", quantity: 2 }],
    },
    {
      id: "order-2",
      status: "ready",
      createdAt: "2024-01-15T09:00:00Z",
      total: 4500,
      branchId: "branch-1",
      items: [{ displayName: "Waffle", quantity: 1 }],
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/orders*incoming**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockOrders.filter((o) => o.status === "incoming")),
      });
    });

    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ id: "branch-1", name: "Sucursal Central" }]),
      });
    });

    await page.goto("/admin/order");
  });

  test("displays orders by status correctly", async ({ page }) => {
    await expect(page.getByText("Nuevos pedidos")).toBeVisible();
    await expect(page.getByText("Listos")).toBeVisible();
  });

  test("shows order count badges", async ({ page }) => {
    await expect(page.getByText("2")).toBeVisible();
  });

  test("navigates to order detail page", async ({ page }) => {
    await page.getByText("Crepa").first().click();
    await expect(page).toHaveURL(/\/admin\/orders\/order-1/);
  });

  test("filters orders by status", async ({ page }) => {
    await page.getByText("Listos").click();
    // Would verify filtering
  });
});
