import { expect, test } from "@playwright/test";

test.describe("Admin Staff List Page", () => {
  const mockBranches = [
    { id: "branch-1", name: "Sucursal Central" },
    { id: "branch-2", name: "Sucursal Norte" },
  ];

  const mockStaff = [
    {
      id: "staff-1",
      firstName: "Juan",
      lastName: "Pérez",
      phone: "+56911111111",
      role: "administrator",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "staff-2",
      firstName: "María",
      lastName: "García",
      phone: "+56922222222",
      role: "waiter",
      createdAt: "2024-02-15T14:30:00Z",
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock branches
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBranches),
      });
    });

    // Mock staff for a specific branch
    await page.route("**/v1/branches/branch-1/staff", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStaff),
      });
    });

    await page.goto("/admin/staff");
  });

  test("shows branch selector placeholder initially", async ({ page }) => {
    await expect(page.getByText("Selecciona una sucursal para ver el staff")).toBeVisible();
  });

  test("displays staff list when branch is selected", async ({ page }) => {
    // Open branch selector
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.getByRole("button", { name: "Sucursal Central" }).click();

    await expect(page.getByText("Mostrando staff de Sucursal Central")).toBeVisible();
    await expect(page.getByText("Juan Pérez")).toBeVisible();
    await expect(page.getByText("María García")).toBeVisible();
    await expect(page.getByText("+56911111111")).toBeVisible();
    await expect(page.getByText("Administrador")).toBeVisible();
    await expect(page.getByText("Mesero")).toBeVisible();
  });

  test("opens creation modal and fills fields", async ({ page }) => {
    // Select branch first
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.getByRole("button", { name: "Sucursal Central" }).click();

    await page.getByRole("button", { name: "Nuevo Staff" }).click();

    // Target the modal heading specifically (level 3)
    await expect(page.getByRole("heading", { name: "Nuevo Staff", level: 3 })).toBeVisible();

    // Fill form
    await page.getByLabel("Nombre").fill("Carlos");
    await page.getByLabel("Apellido").fill("Rodríguez");
    await page.getByLabel("Email").fill("carlos@test.com");
    await page.getByLabel("Teléfono").fill("+56933333333");
    await page.getByLabel("Rol").selectOption("waiter");

    // Verify fields are filled
    await expect(page.getByLabel("Nombre")).toHaveValue("Carlos");
    await expect(page.getByLabel("Rol")).toHaveValue("waiter");
  });

  test.fixme("deletes staff after confirmation", async ({ page }) => {
    // Select branch
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.getByRole("button", { name: "Sucursal Central" }).click();

    // Mock delete request
    await page.route("**/v1/users/staff/staff-1", async (route) => {
      expect(route.request().method()).toBe("DELETE");
      await route.fulfill({ status: 200 });
    });

    // Handle dialog
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("¿Estás seguro?");
      await dialog.accept();
    });

    // Click delete button for Juan Pérez (staff-1)
    await page.locator("tr").filter({ hasText: "Juan Pérez" }).locator("button.text-red-500").click();

    await expect(page.getByText("Staff eliminado correctamente")).toBeVisible();
  });

  test("navigates to staff detail page when clicking a row", async ({ page }) => {
    // Select branch
    await page.click("button:has-text('Selecciona Sucursal')");
    await page.getByRole("button", { name: "Sucursal Central" }).click();

    await page.getByRole("button", { name: "Juan Pérez" }).click();
    await expect(page).toHaveURL(/\/admin\/staff\/staff-1/);
  });
});
