import { expect, test } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("displays login form correctly", async ({ page }) => {
    await expect(page.getByText("Bienvenido")).toBeVisible();
    await expect(page.getByLabel("Teléfono")).toBeVisible();
  });

  test("validates phone input", async ({ page }) => {
    await page.getByRole("button", { name: /Continuar/i }).click();
    await expect(page.getByText("El teléfono es requerido")).toBeVisible();
  });

  test("accepts valid phone number", async ({ page }) => {
    await page.getByLabel("Teléfono").fill("4421234567");
    await page.getByRole("button", { name: /Continuar/i }).click();
    await expect(page.getByLabel("Código")).toBeVisible();
  });

  test("validates verification code", async ({ page }) => {
    await page.getByLabel("Teléfono").fill("4421234567");
    await page.getByRole("button", { name: /Continuar/i }).click();
    await page.getByLabel("Código").fill("");
    await page.getByRole("button", { name: /Verificar/i }).click();
    await expect(page.getByText("El código es requerido")).toBeVisible();
  });

  test("shows error with invalid code", async ({ page }) => {
    await page.route("**/auth/login/verify", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid code" }),
      });
    });

    await page.getByLabel("Teléfono").fill("4421234567");
    await page.getByRole("button", { name: /Continuar/i }).click();
    await page.getByLabel("Código").fill("000000");
    await page.getByRole("button", { name: /Verificar/i }).click();
    await expect(page.getByText("Código inválido")).toBeVisible();
  });
});
