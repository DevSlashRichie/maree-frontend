import { expect, test } from "@playwright/test";

test.describe("Admin Staff Page", () => {
  const mockStaff = [
    {
      id: "staff-1",
      name: "Juan Pérez",
      phone: "4421112233",
      role: "cashier",
      branchId: "branch-1",
    },
    {
      id: "staff-2",
      name: "Maria García",
      phone: "4423334455",
      role: "manager",
      branchId: "branch-1",
    },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/actors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStaff),
      });
    });

    await page.goto("/admin/staff");
  });

  test("displays staff list correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Personal", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Juan Pérez")).toBeVisible();
    await expect(page.getByText("Maria García")).toBeVisible();
  });

  test("shows empty state when no staff", async ({ page }) => {
    await page.route("**/v1/actors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/admin/staff");
    await expect(page.getByText("No hay personal")).toBeVisible();
  });

  test("navigates to staff detail page", async ({ page }) => {
    await page.getByText("Juan Pérez").click();
    await expect(page).toHaveURL(/\/admin\/staff\/staff-1/);
  });

  test("opens create staff modal", async ({ page }) => {
    await page.getByRole("button", { name: "Nuevo Personal" }).click();
    await expect(
      page.getByRole("heading", { name: "Nuevo Personal" }),
    ).toBeVisible();
  });
});
