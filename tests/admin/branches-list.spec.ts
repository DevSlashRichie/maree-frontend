import { expect, test } from "@playwright/test";

test.describe("Admin Branches List Page", () => {
  const mockBranches = [
    {
      id: "branch-1",
      name: "Sucursal Central",
      state: "active",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "branch-2",
      name: "Sucursal Norte",
      state: "inactive",
      createdAt: "2024-02-15T14:30:00Z",
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock branches API
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBranches),
      });
    });

    await page.goto("/admin/branches");
  });

  test("displays branch list correctly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sucursales", level: 1 })).toBeVisible();
    await expect(page.getByText("2 sucursales registradas")).toBeVisible();
    
    await expect(page.getByText("Sucursal Central")).toBeVisible();
    await expect(page.getByText("Sucursal Norte")).toBeVisible();
  });

  test("shows empty state when no branches exist", async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    
    await page.goto("/admin/branches");
    await expect(page.getByText("No hay sucursales registradas")).toBeVisible();
  });

  test("opens creation modal and fills fields", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva sucursal" }).click();

    // Target modal heading (level 2 or 3 usually)
    await expect(page.getByRole("heading", { name: "Nueva Sucursal" })).toBeVisible();

    // Fill form (based on CreateBranchForm structure)
    // Note: Adjusting labels based on standard form patterns if specific labels weren't in index.tsx
    await page.getByLabel(/Nombre/i).fill("Sucursal Oriente");
    
    await expect(page.getByLabel(/Nombre/i)).toHaveValue("Sucursal Oriente");
  });

  test("navigates to branch detail page", async ({ page }) => {
    // Click on the first branch card
    await page.getByText("Sucursal Central").click();
    await expect(page).toHaveURL(/\/admin\/branches\/branch-1/);
  });
});
