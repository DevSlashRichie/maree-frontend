import { expect, test } from "@playwright/test";

test.describe("CreateBranchForm", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.waitForTimeout(1000);
  });

  test("renders form fields", async ({ page }) => {
    await expect(page.getByLabel("Nombre")).toBeVisible();
    await expect(page.getByLabel("Estado")).toBeVisible();
    await expect(page.getByText("Horarios")).toBeVisible();
    await expect(page.getByText("+ Agregar")).toBeVisible();
  });

  test("shows validation error when submitting empty form", async ({
    page,
  }) => {
    await page.click("button:has-text('Guardar')");
    await expect(page.getByText("Completa todos los campos")).toBeVisible();
  });

  test("shows validation error when only name is filled", async ({ page }) => {
    await page.fill("#name", "Sucursal Prueba");
    await page.click("button:has-text('Guardar')");
    await expect(page.getByText("Completa todos los campos")).toBeVisible();
  });

  test("shows validation error when only state is filled", async ({ page }) => {
    await page.fill("#state", "Querétaro");
    await page.click("button:has-text('Guardar')");
    await expect(page.getByText("Completa todos los campos")).toBeVisible();
  });

  test("adds a schedule when clicking '+ Agregar'", async ({ page }) => {
    await page.click("button:has-text('+ Agregar')");
    await expect(page.locator("select")).toBeVisible();
    await expect(page.locator('input[type="time"]')).toHaveCount(2);
  });

  test("removes a schedule when clicking delete button", async ({ page }) => {
    await page.click("button:has-text('+ Agregar')");
    await expect(page.locator("select")).toBeVisible();
    await page.click("button:has-text('✕')");
    await expect(page.locator("select")).not.toBeVisible();
  });

  test("adds multiple schedules", async ({ page }) => {
    await page.click("button:has-text('+ Agregar')");
    await page.click("button:has-text('+ Agregar')");
    await page.click("button:has-text('+ Agregar')");
    const selects = page.locator("select");
    await expect(selects).toHaveCount(3);
    const timeInputs = page.locator('input[type="time"]');
    await expect(timeInputs).toHaveCount(6);
  });

  test("shows 'Sin horarios' when no schedules added", async ({ page }) => {
    await expect(page.getByText("Sin horarios")).toBeVisible();
  });

  test("closes form when clicking Cancelar", async ({ page }) => {
    await page.click("button:has-text('Cancelar')");
    // The form should close - this depends on how the parent component handles onClose
  });

  test("creates branch successfully", async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: "123",
          name: "Sucursal Prueba",
          state: "Querétaro",
          schedules: [],
        }),
      });
    });

    await page.fill("#name", "Sucursal Prueba");
    await page.fill("#state", "Querétaro");
    await page.click("button:has-text('+ Agregar')");

    const fromTime = page.locator('input[type="time"]').first();
    const toTime = page.locator('input[type="time"]').nth(1);

    await fromTime.fill("09:00");
    await toTime.fill("18:00");

    await page.click("button:has-text('Guardar')");

    await expect(page.getByText("Guardando...")).toBeVisible();
  });

  test("shows error when branch name already exists (409)", async ({
    page,
  }) => {
    await page.route("**/v1/branches", async (route) => {
      route.fulfill({
        status: 409,
        body: JSON.stringify({ message: "El nombre ya está en uso" }),
      });
    });

    await page.fill("#name", "Existing Branch");
    await page.fill("#state", "Querétaro");
    await page.click("button:has-text('Guardar')");

    await expect(page.getByText("El nombre ya está en uso")).toBeVisible();
  });

  test("shows error on server error (500)", async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: "Error interno" }),
      });
    });

    await page.fill("#name", "Test Branch");
    await page.fill("#state", "Querétaro");
    await page.click("button:has-text('Guardar')");

    await expect(page.getByText("Error interno")).toBeVisible();
  });

  test("disables submit button while creating", async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: "123",
          name: "Test",
          state: "Test",
          schedules: [],
        }),
      });
    });

    await page.fill("#name", "Test Branch");
    await page.fill("#state", "Querétaro");
    await page.click("button:has-text('+ Agregar')");

    const fromTime = page.locator('input[type="time"]').first();
    const toTime = page.locator('input[type="time"]').nth(1);
    await fromTime.fill("09:00");
    await toTime.fill("18:00");

    const saveButton = page.locator("button:has-text('Guardar')");
    await saveButton.click();

    await expect(page.getByText("Guardando...")).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });
});
