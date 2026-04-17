import { expect, test } from "@playwright/test";

test.describe("Admin Branch Detail Page", () => {
  const mockBranch = {
    id: "branch-1",
    name: "Sucursal Central",
    state: "active",
    createdAt: "2024-01-01T10:00:00Z",
    schedulesTable: [
      {
        id: "sched-1",
        weekday: 1, // Lunes
        fromTime: "09:00",
        toTime: "18:00",
        timezone: "America/Mexico_City",
      },
      {
        id: "sched-2",
        weekday: 2, // Martes
        fromTime: "09:00",
        toTime: "18:00",
        timezone: "America/Mexico_City",
      },
    ],
  };

  test.beforeEach(async ({ page }) => {
    // Mock branches (for layout/sidebar if needed)
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockBranch]),
      });
    });

    // Mock branch detail
    await page.route("**/v1/branches/branch-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBranch),
      });
    });

    await page.goto("/admin/branches/branch-1");
  });

  test("displays branch details and schedules", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sucursal Central", level: 1 })).toBeVisible();
    await expect(page.getByText("active", { exact: true })).toBeVisible();
    
    // Verify schedules
    await expect(page.getByText("Lunes")).toBeVisible();
    await expect(page.getByText("09:00 – 18:00")).first().toBeVisible();
  });

  test("opens edit modal and interacts with schedules", async ({ page }) => {
    await page.getByRole("button", { name: "Editar" }).click();

    await expect(page.getByRole("heading", { name: "Editar sucursal" })).toBeVisible();
    
    // Verify pre-filled name
    await expect(page.getByLabel("Nombre")).toHaveValue("Sucursal Central");

    // Add a new schedule row
    await page.getByRole("button", { name: "+ Agregar" }).click();
    
    // Check if a new schedule row appeared (there were 2, now 3)
    const scheduleRows = page.locator("select[id^='weekday-']");
    await expect(scheduleRows).toHaveCount(3);

    // Fill the new schedule (the last one)
    const lastSelect = scheduleRows.last();
    await lastSelect.selectOption("3"); // Miércoles

    // Remove a schedule
    await page.getByRole("button", { name: "✕" }).first().click();
    await expect(scheduleRows).toHaveCount(2);
  });

  test("navigates back to list", async ({ page }) => {
    await page.getByRole("button", { name: "Volver a sucursales" }).click();
    await expect(page).toHaveURL(/\/admin\/branches/);
  });
});
