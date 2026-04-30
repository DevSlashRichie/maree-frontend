import { expect, test } from "@playwright/test";

test.describe("Admin User Detail Page", () => {
  const mockUser = {
    id: "user-1",
    name: "John Doe",
    phone: "4421234567",
    role: "user",
    loyaltyPoints: 1500,
    tier: "silver",
    visits: 10,
    createdAt: "2024-01-01T10:00:00Z",
  };

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/users/user-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    await page.goto("/admin/users/user-1");
  });

  test("displays user details correctly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "John Doe" })).toBeVisible();
    await expect(page.getByText("4421234567")).toBeVisible();
  });

  test("displays loyalty points", async ({ page }) => {
    await expect(page.getByText("1,500")).toBeVisible();
  });

  test("displays user tier", async ({ page }) => {
    await expect(page.getByText("Silver")).toBeVisible();
  });

  test("displays visit count", async ({ page }) => {
    await expect(page.getByText("10 visitas")).toBeVisible();
  });

  test("allows editing user role", async ({ page }) => {
    await page.getByRole("button", { name: "Cambiar Rolle" }).click();
    await expect(page.getByRole("combobox", { name: "Rol" })).toBeVisible();
  });
});
