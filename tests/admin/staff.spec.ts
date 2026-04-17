import { test, expect } from "@playwright/test";

const MOCK_STAFF = [
  {
    id: "staff-1",
    firstName: "John",
    lastName: "Doe",
    phone: "123456789",
    role: "administrator",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-2",
    firstName: "Jane",
    lastName: "Doe",
    phone: "987654321",
    role: "waiter",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_BRANCH_ID = "branch-for-staff";

test.describe("Admin Staff Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/v1/branches/${MOCK_BRANCH_ID}/staff`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STAFF),
      });
    });
    await page.evaluate((branchId) => {
      localStorage.setItem('branch-storage', `{"state":{"selectedBranch":{"id":"${branchId}"}},"version":0}`);
    }, MOCK_BRANCH_ID);
    await page.goto("/admin/staff");
  });

  test("displays all staff for a selected branch", async ({ page }) => {
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();
  });

  test("opens the new staff modal", async ({ page }) => {
    await page.getByRole("button", { name: "Nuevo Staff" }).click();
    await expect(page.getByRole("heading", { name: "Nuevo Staff" })).toBeVisible();
  });

  test("creates a new staff member", async ({ page }) => {
    await page.route("**/auth/register", (route) => {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "new-staff" }),
      });
    });

    await page.getByRole("button", { name: "Nuevo Staff" }).click();
    await page.getByLabel("Nombre").fill("New");
    await page.getByLabel("Apellido").fill("Staff");
    await page.getByLabel("Teléfono").fill("1122334455");
    await page.getByLabel("Rol").selectOption({ label: "Cajero" });
    await page.getByRole("button", { name: "Crear Staff" }).click();

    await expect(page.getByText("Staff creado correctamente")).toBeVisible();
  });

  test("deletes a staff member", async ({ page }) => {
    await page.route(`**/v1/users/staff/${MOCK_STAFF[0].id}`, (route) => {
      route.fulfill({
        status: 200,
      });
    });

    page.on("dialog", (dialog) => dialog.accept());
    await page.locator(`tr:has-text("John Doe")`).getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Staff eliminado correctamente")).toBeVisible();
  });
});

test.describe("Admin Staff Details Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/v1/users/staff/${MOCK_STAFF[0].id}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STAFF[0]),
      });
    });
    await page.goto(`/admin/staff/${MOCK_STAFF[0].id}`);
  });

  test("displays staff details", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "John Doe" })).toBeVisible();
  });

  test("opens the edit staff modal", async ({ page }) => {
    await page.getByRole("button", { name: "Editar información" }).click();
    await expect(page.getByRole("heading", { name: "Editar Staff" })).toBeVisible();
  });
});

