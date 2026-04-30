import { expect, test } from "@playwright/test";

test.describe("Admin Users Page", () => {
  const mockUsers = [
    {
      id: "user-1",
      name: "John Doe",
      phone: "4421234567",
      role: "user",
    },
    {
      id: "user-2",
      name: "Jane Smith",
      phone: "4427654321",
      role: "admin",
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/users", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
      });
    });

    await page.goto("/admin/users");
  });

  test("displays users list correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Usuarios", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Jane Smith")).toBeVisible();
  });

  test("shows empty state when no users", async ({ page }) => {
    await page.route("**/v1/users", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: [], total: 0 }),
      });
    });

    await page.goto("/admin/users");
    await expect(page.getByText("No hay usuarios")).toBeVisible();
  });

  test("navigates to user detail page", async ({ page }) => {
    await page.getByText("John Doe").click();
    await expect(page).toHaveURL(/\/admin\/users\/user-1/);
  });

  test("filters users by search", async ({ page }) => {
    await page.getByPlaceholder("Buscar usuario").fill("Jane");
    await expect(page.getByText("Jane Smith")).toBeVisible();
    await expect(page.getByText("John Doe")).not.toBeVisible();
  });
});
