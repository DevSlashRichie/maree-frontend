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
    await page.fill('input[id="discountValue"]', "20");

    const button = page.getByTestId("submit-button");

    await expect(button).toBeEnabled();

    await button.click({
      delay: 10,
      button: "left",
      force: true,
    });

    await page.waitForTimeout(2000);
    await expect(button).toBeHidden();

    await expect(page.getByText("Recompensa creada")).toBeVisible();
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
      has: page.locator('[data-test="delete-button"]'),
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
      await expect(page.getByTestId("delete-confirm")).toBeHidden();
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

  test("shows alert when discount value is empty", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe(
        "Por favor completa el valor del descuento",
      );
      await dialog.accept();
    });

    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");
    await page.fill('input[id="title"]', "Test Reward");
    await page.fill('textarea[id="description"]', "Test Description");
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid="submit-button"]',
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });
  });

  test("creates reward with fixed discount type", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");

    await page.fill('input[id="title"]', "Fixed Reward");
    await page.fill('textarea[id="description"]', "Fixed discount");
    await page.getByTestId("discount-fixed").click({ force: true });
    await page.fill('input[id="points"]', "2");
    await page.fill('input[id="discountValue"]', "50");

    const button = page.getByTestId("submit-button");

    await expect(button).toBeEnabled();

    await button.click({
      delay: 10,
      button: "left",
      force: true,
    });

    await page.waitForTimeout(2000);
    await expect(button).toBeHidden();
  });

  test.skip("creates reward with product restriction", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");

    await page.fill('input[id="title"]', "Product Reward");
    await page.fill('textarea[id="description"]', "Specific product");
    await page.fill('input[id="discountValue"]', "20");

    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const sw = document.querySelector(
        '[data-testid="product-restriction-switch"]',
      ) as HTMLButtonElement;
      if (sw) sw.click();
    });

    await page.waitForTimeout(500);
    await page.getByTestId("product-search-input").click({ force: true });
    await page.waitForTimeout(300);
    await page.click("text=Cappuccino");
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const btn = document.querySelector(
        '[data-testid="submit-button"]',
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await expect(page.getByText("Recompensa creada")).toBeVisible({
      timeout: 10000,
    });
  });

  test("edit modal pre-fills all fields correctly", async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.reload();

    const editButtons = page.locator("button").filter({
      has: page.locator("svg.lucide-pencil"),
    });
    const count = await editButtons.count();

    if (count > 0) {
      await editButtons.first().click();

      await expect(page.getByLabel("Título")).not.toBeEmpty();
      await expect(page.getByLabel("Descripción")).not.toBeEmpty();
    }
  });

  test("can update only the title", async ({ page }) => {
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

      await page.fill('input[id="title"]', "Updated Title");
      await page.waitForTimeout(100);
      await page.getByTestId("submit-button").click({ force: true });
      await expect(page.getByText("Recompensa actualizada")).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("can update discount value", async ({ page }) => {
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

      await page.fill('input[id="discountValue"]', "30");
      await page.waitForTimeout(100);
      await page.getByTestId("submit-button").click({ force: true });
    }
  });

  test("cancel button closes modal without saving", async ({ page }) => {
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

      await page.fill('input[id="title"]', "Changed Title");
      await page.waitForTimeout(100);
      await page.getByTestId("cancel-button").click({ force: true });
      await expect(
        page.getByRole("heading", { name: "Editar Recompensa" }),
      ).toBeHidden();
    }
  });

  test("form resets when reopening after close", async ({ page }) => {
    await page.waitForSelector("h1", { state: "visible" });

    await page.click("button:has-text('Nueva Recompensa')");
    await expect(
      page.getByRole("heading", { name: "Nueva Recompensa" }),
    ).toBeVisible();

    await page.fill('input[id="title"]', "Test");
    await page.waitForTimeout(100);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await expect(
      page.getByRole("heading", { name: "Nueva Recompensa" }),
    ).toBeHidden();

    await page.click("button:has-text('Nueva Recompensa')");
    await expect(page.getByLabel("Título")).toBeEmpty();
  });

  test("submit button is disabled while submitting", async ({ page }) => {
    // Intercept and delay the request to guarantee loading state
    await page.route("**/v1/rewards", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });

    await page.waitForSelector("h1");

    await page.click("button:has-text('Nueva Recompensa')");

    await page.fill("#title", "Test");
    await page.fill("#description", "Test");
    await page.fill("#discountValue", "20");
    await page.fill('input[id="points"]', "2");

    const submitButton = page.getByTestId("submit-button");

    // Initial state
    await expect(submitButton).toBeEnabled();

    // Trigger submit
    await submitButton.click();

    // Assert loading state
    await expect(submitButton).toBeDisabled();

    await page.waitForTimeout(2000);
    // Assert completion (real user outcome)
    await expect(submitButton).toBeHidden();

    await expect(page.getByText("Recompensa creada")).toBeVisible({
      timeout: 5000,
    });
  });

  test("rejects letters in visits/points field and keeps modal open", async ({
    page,
  }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");

    await page.fill('input[id="title"]', "Test Reward");
    await page.fill('textarea[id="description"]', "Test Description");
    await page.evaluate(() => {
      const input = document.querySelector("#points");
      if (input) {
        input.nodeValue = "abc";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.fill('input[id="discountValue"]', "20");

    await page.getByTestId("submit-button").click({ force: true });

    await expect(
      page.getByRole("heading", { name: "Nueva Recompensa" }),
    ).toBeVisible();
    await expect(page.getByText("Recompensa creada")).not.toBeVisible();
  });

  test("rejects letters in discount value field and keeps modal open", async ({
    page,
  }) => {
    await page.waitForSelector("h1", { state: "visible" });
    await page.click("button:has-text('Nueva Recompensa')");

    await page.fill('input[id="title"]', "Test Reward");
    await page.fill('textarea[id="description"]', "Test Description");
    await page.fill('input[id="points"]', "20");
    await page.evaluate(() => {
      const input = document.querySelector("#discountValue");
      if (input) {
        input.nodeValue = "abc";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    await page.getByTestId("submit-button").click({ force: true });

    await expect(
      page.getByRole("heading", { name: "Nueva Recompensa" }),
    ).toBeVisible();
    await expect(page.getByText("Recompensa creada")).not.toBeVisible();
  });
});
