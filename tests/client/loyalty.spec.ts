import { expect, test } from "@playwright/test";

test.describe("Loyalty Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loyalty");
  });

  test("loads loyalty page successfully", async ({ page }) => {
    await expect(page.getByText("Recompensas Disponibles")).toBeVisible();
    await expect(page.getByText("Historial de Canjes")).toBeVisible();
  });

  test("displays loyalty card with user info", async ({ page }) => {
    await expect(page.getByText("Ana López")).toBeVisible();
    await expect(page.getByText("Teléfono: 4427536211")).toBeVisible();
    await expect(page.getByText("Premium Member")).toBeVisible();
  });

  test("displays all rewards", async ({ page }) => {
    await expect(page.getByText("Crepa Dulce Gratis")).toBeVisible();
    await expect(page.getByText("Café de Especialidad")).toBeVisible();
    await expect(page.getByText("Bebida de Temporada")).toBeVisible();
    await expect(page.getByText("Postre Especial")).toBeVisible();
    await expect(page.getByText("Combo Pareja")).toBeVisible();
  });

  test("scroll buttons are present", async ({ page }) => {
    await expect(page.getByLabel("Anterior")).toBeVisible();
    await expect(page.getByLabel("Siguiente")).toBeVisible();
  });

  test("displays recent history items", async ({ page }) => {
    await expect(page.getByText("Crepa Salada - La Marée")).toBeVisible();
    await expect(page.getByText("Bebida Refrescante")).toBeVisible();
    await expect(page.getByText("Regalo de Cumpleaños")).toBeVisible();
    await expect(page.getByText("Ver historial completo")).toBeVisible();
  });

  test("opens history modal when clicking view full history", async ({
    page,
  }) => {
    await page.click("text=Ver historial completo");
    await expect(
      page.getByRole("heading", { name: "Historial de Actividad" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Buscar por recompensa o sucursal..."),
    ).toBeVisible();
  });

  test("search filters history results", async ({ page }) => {
    await page.click("text=Ver historial completo");
    await expect(
      page.getByRole("heading", { name: "Historial de Actividad" }),
    ).toBeVisible();

    await page.fill('input[placeholder*="Buscar"]', "Café");
    await expect(page.getByText("Café Latte", { exact: true })).toBeVisible();
    await expect(
      page.getByText("No se encontraron resultados"),
    ).not.toBeVisible();
  });

  test("filter buttons work correctly", async ({ page }) => {
    await page.click("text=Ver historial completo");
    await expect(
      page.getByRole("heading", { name: "Historial de Actividad" }),
    ).toBeVisible();

    await page.click("text=Regalos");
    const modal = page
      .locator('[role="dialog"]')
      .filter({ hasText: "Historial de Actividad" });
    await expect(modal.getByText("Regalo de Cumpleaños")).toBeVisible();
    await expect(modal.getByText("Crepa Salada - La Marée")).not.toBeVisible();
  });

  test("shows empty state when no search results", async ({ page }) => {
    await page.click("text=Ver historial completo");
    await expect(
      page.getByRole("heading", { name: "Historial de Actividad" }),
    ).toBeVisible();

    await page.fill('input[placeholder*="Buscar"]', "xyznonexistent");
    await expect(page.getByText("No se encontraron resultados")).toBeVisible();
    await expect(page.getByText("Limpiar filtros")).toBeVisible();
  });

  test("clear filters button works", async ({ page }) => {
    await page.click("text=Ver historial completo");
    await page.fill('input[placeholder*="Buscar"]', "xyznonexistent");
    await expect(page.getByText("No se encontraron resultados")).toBeVisible();

    await page.click("text=Limpiar filtros");
    const modal = page
      .locator('[role="dialog"]')
      .filter({ hasText: "Historial de Actividad" });
    await expect(modal.getByText("Crepa Salada - La Marée")).toBeVisible();
  });

  test("close button closes history modal", async ({ page }) => {
    await page.click("text=Ver historial completo");
    await expect(
      page.getByRole("heading", { name: "Historial de Actividad" }),
    ).toBeVisible();

    await page.click("text=Cerrar");
    await expect(
      page.getByRole("heading", { name: "Historial de Actividad" }),
    ).not.toBeVisible();
  });

  test("opens confirmation modal when clicking redeem", async ({ page }) => {
    const availableReward = page.getByText("Canjear").first();
    await availableReward.click();

    await expect(
      page.getByRole("heading", { name: "Confirmar Canje" }),
    ).toBeVisible();
    await expect(
      page.getByText("¿Estás seguro de que deseas canjear esta recompensa?"),
    ).toBeVisible();
  });

  test("confirm redemption closes modal", async ({ page }) => {
    const availableReward = page.getByText("Canjear").first();
    await availableReward.click();

    await page.waitForTimeout(200);

    await expect(
      page.getByRole("heading", { name: "Confirmar Canje" }),
    ).toBeVisible();

    await page.locator('button:has-text("Confirmar Canje")').last().click();
    await page.waitForTimeout(500);
    await expect(
      page.getByRole("heading", { name: "Confirmar Canje" }),
    ).not.toBeVisible();
  });

  test("cancel button closes confirmation modal", async ({ page }) => {
    const availableReward = page.getByText("Canjear").first();
    await availableReward.click();

    await page.waitForTimeout(200);

    await expect(
      page.getByRole("heading", { name: "Confirmar Canje" }),
    ).toBeVisible();

    await page.click("text=Cancelar");
    await expect(
      page.getByRole("heading", { name: "Confirmar Canje" }),
    ).not.toBeVisible();
  });

  test("shows unavailable rewards with points", async ({ page }) => {
    await expect(page.getByText("50 Visitas", { exact: true })).toBeVisible();
    await expect(page.getByText("75 Visitas", { exact: true })).toBeVisible();
    await expect(page.getByText("150 Visitas", { exact: true })).toBeVisible();
  });

  test("displays total activities count", async ({ page }) => {
    await page.click("text=Ver historial completo");
    await expect(page.getByText(/Total de actividades:/)).toBeVisible();
  });
});
