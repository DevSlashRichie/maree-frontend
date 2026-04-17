import { expect, test } from "@playwright/test";

test.describe("Admin Staff Detail Page", () => {
  const mockStaff = {
    id: "staff-1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@example.cl",
    phone: "+56911111111",
    role: "administrator",
    createdAt: "2024-01-01T10:00:00Z",
  };

  test.beforeEach(async ({ page }) => {
    // Mock branches (needed for layout/branch selector)
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock staff detail
    await page.route("**/v1/users/staff/staff-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStaff),
      });
    });

    await page.goto("/admin/staff/staff-1");
  });

  test.fixme("displays staff information correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Juan Pérez" }),
    ).toBeVisible();
    await expect(page.getByText("JP")).toBeVisible(); // Initials
    await expect(
      page.getByText("Administrador", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("juan@example.cl")).toBeVisible();
    await expect(page.getByText("+56911111111")).toBeVisible();
  });

  test("opens edit modal with pre-filled data", async ({ page }) => {
    await page.getByRole("button", { name: "Editar información" }).click();

    await expect(
      page.getByRole("heading", { name: "Editar Staff" }),
    ).toBeVisible();

    await expect(page.getByLabel("Nombre")).toHaveValue("Juan");
    await expect(page.getByLabel("Apellido")).toHaveValue("Pérez");
    await expect(page.getByLabel("Email")).toHaveValue("juan@example.cl");
    await expect(page.getByLabel("Teléfono")).toHaveValue("+56911111111");
  });

  test("navigates back to list", async ({ page }) => {
    await page.getByRole("link", { name: "Volver al listado" }).click();
    await expect(page).toHaveURL(/\/admin\/staff/);
  });
});
