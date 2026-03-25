import { expect, test } from "@playwright/test";

test.describe("Admin Rewards Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/rewards");
  });

  test("loads rewards page successfully", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Recompensas");
    await expect(
      page.getByText("Gestiona las recompensas del programa de lealtad"),
    ).toBeVisible();
  });

  test("shows loading state initially", async ({ page }) => {
    await page.route("**/v1/rewards", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });
    await expect(page.getByText("Cargando recompensas...")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Recompensas", {
      timeout: 10000,
    });
  });

  test("opens create reward modal when clicking button", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");
    await expect(
      page.getByRole("heading", { name: "Nueva Recompensa" }),
    ).toBeVisible();
    await expect(page.getByLabel("Título")).toBeVisible();
    await expect(page.getByLabel("Descripción")).toBeVisible();
  });

  test("creates a new reward with all fields", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");

    await page.fill('input[id="title"]', "Test Reward");
    await page.fill('textarea[id="description"]', "Test Description");
    await page.fill('input[id="points"]', "50");
    await page.click('button:has-text("%")');
    await page.fill('input[id="discountValue"]', "20");

    await page.click("button:has-text('Crear Recompensa')");

    await expect(page.getByText("Recompensa creada")).toBeVisible({
      timeout: 10000,
    });
  });

  test("can edit an existing reward", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForSelector("button:has-text('Nueva Recompensa')", {
      timeout: 10000,
    });

    const editButtons = page.locator("button").filter({
      has: page.locator("svg.lucide-pencil"),
    });
    const count = await editButtons.count();

    if (count > 0) {
      await editButtons.first().click();
      await expect(
        page.getByRole("heading", { name: "Editar Recompensa" }),
      ).toBeVisible();
      await expect(page.getByLabel("Título")).not.toBeEmpty();
    }
  });

  test("can toggle reward availability", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForSelector("button:has-text('Nueva Recompensa')", {
      timeout: 10000,
    });

    const availableButtons = page.locator("button", {
      hasText: /^(Disponible|No disponible)$/,
    });
    const count = await availableButtons.count();

    if (count > 0) {
      await availableButtons.first().click();
      await expect(
        page.getByText(/^(Recompensa activada|Recompensa desactivada)$/),
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("can delete a reward with confirmation", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForSelector("button:has-text('Nueva Recompensa')", {
      timeout: 10000,
    });

    const deleteButtons = page.locator("button").filter({
      has: page.locator("svg.lucide-trash-2"),
    });
    const count = await deleteButtons.count();

    if (count > 0) {
      await deleteButtons.first().click();
      await expect(page.locator("button:has(svg.lucide-check)")).toBeVisible();
      await expect(page.locator("button:has(svg.lucide-x)")).toBeVisible();
    }
  });

  test("can cancel delete action", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForSelector("button:has-text('Nueva Recompensa')", {
      timeout: 10000,
    });

    const deleteButtons = page.locator("button").filter({
      has: page.locator("svg.lucide-trash-2"),
    });
    const count = await deleteButtons.count();

    if (count > 0) {
      await deleteButtons.first().click();
      const cancelButton = page.locator("button").filter({
        has: page.locator("svg.lucide-x"),
      });
      await cancelButton.first().click();
      await expect(page.locator("button:has(svg.lucide-check)")).toBeHidden();
    }
  });

  test("shows empty state when no rewards", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.waitForTimeout(2000);

    const rewardCards = page.locator('[class*="bg-white rounded-3xl"]');
    const count = await rewardCards.count();

    if (count === 0) {
      await expect(
        page.getByText("No hay recompensas disponibles"),
      ).toBeVisible();
      await expect(page.getByText("Crear primera recompensa")).toBeVisible();
    }
  });
});
