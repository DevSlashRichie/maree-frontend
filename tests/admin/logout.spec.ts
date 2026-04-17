import { expect, test } from "@playwright/test";

test.describe("Admin Logout", () => {
  test.beforeEach(async ({ page }) => {
    // Mock branches (required for layout)
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock initial admin dashboard visit
    await page.goto("/admin");
  });

  test("successfully logs out the user", async ({ page }) => {
    // 2. Open the user profile popover
    // Using a more specific locator to avoid strict mode violation with BranchSelector
    const userButton = page.getByRole("button").filter({ has: page.locator(".lucide-chevron-down") }).filter({ hasNotText: /Selecciona Sucursal/i });
    await userButton.click();

    // 3. Click the "Cerrar sesión" button
    const logoutButton = page.getByRole("button", { name: /Cerrar sesión/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // 4. Verify redirection to home
    await expect(page).toHaveURL("/menu");
  });
});
