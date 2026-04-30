import { expect, test } from "@playwright/test";

test.describe("Client Profile Page", () => {
  const mockUser = {
    id: "user-1",
    name: "John Doe",
    phone: "4421234567",
    loyaltyPoints: 1500,
    tier: "silver",
  };

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    await page.goto("/profile");
  });

  test("displays user profile correctly", async ({ page }) => {
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("4421234567")).toBeVisible();
  });

  test("displays loyalty points", async ({ page }) => {
    await expect(page.getByText("1,500")).toBeVisible();
  });

  test("displays loyalty tier", async ({ page }) => {
    await expect(page.getByText("Silver")).toBeVisible();
  });

  test("allows editing profile", async ({ page }) => {
    await page.getByRole("button", { name: /Editar/i }).click();
    await expect(page.getByLabel("Nombre")).toBeVisible();
  });

  test("shows logout option", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Cerrar sesión/i }),
    ).toBeVisible();
  });
});
