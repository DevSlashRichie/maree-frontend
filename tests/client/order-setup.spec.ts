import { expect, test } from "@playwright/test";

test.describe("Client Order Setup Page", () => {
  const mockBranches = [
    { id: "branch-1", name: "Sucursal Central", state: "active" },
    { id: "branch-2", name: "Sucursal Norte", state: "active" },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/branches*state=active**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBranches),
      });
    });

    await page.goto("/order-setup");
  });

  test("displays branch selection correctly", async ({ page }) => {
    await expect(page.getByText("Selecciona una sucursal")).toBeVisible();
  });

  test("shows list of active branches", async ({ page }) => {
    await expect(page.getByText("Sucursal Central")).toBeVisible();
    await expect(page.getByText("Sucursal Norte")).toBeVisible();
  });

  test("allows selecting a branch", async ({ page }) => {
    await page.getByText("Sucursal Central").click();
    await expect(page.getByText("Sucursal Central")).toBeVisible();
  });

  test("proceeds to menu after branch selection", async ({ page }) => {
    await page.getByText("Sucursal Central").click();
    await page.getByRole("button", { name: /Continuar/i }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test("shows delivery option", async ({ page }) => {
    await expect(page.getByText("Para llevar")).toBeVisible();
    await expect(page.getByText("Delivery")).toBeVisible();
  });

  test("validates branch selection before proceeding", async ({ page }) => {
    await page.getByRole("button", { name: /Continuar/i }).click();
    await expect(page.getByText("Selecciona una sucursal")).toBeVisible();
  });
});
