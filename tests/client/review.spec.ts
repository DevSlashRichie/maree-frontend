import { expect, test } from "@playwright/test";

test.describe("Client Review Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/review");
  });

  test("loads review page successfully", async ({ page }) => {
    await expect(page.getByLabel("Seleccionar calificación")).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar reseña" })).toBeHidden();
  });

  test("shows comment area only when rating is between 1 and 4", async ({ page }) => {
    await page.getByLabel("5 estrellas").click();
    await expect(page.locator("textarea#review-comment")).toBeHidden();

    await page.getByLabel("3 estrellas").click();
    await expect(page.locator("textarea#review-comment")).toBeVisible();
  });

  test("submit button is disabled if comment is required but empty", async ({ page }) => {
    await page.getByLabel("2 estrellas").click();
    const submitBtn = page.getByRole("button", { name: "Publicar reseña" });
    await expect(submitBtn).toBeDisabled();

    await page.fill("#review-comment", "Servicio mejorable");
    await expect(submitBtn).toBeEnabled();
  });

  test("submit button is enabled immediately for 5 stars", async ({ page }) => {
    await page.getByLabel("5 estrellas").click();
    const submitBtn = page.getByRole("button", { name: "Publicar reseña" });
    await expect(submitBtn).toBeEnabled();
  });

  test("successfully submits a review and resets form", async ({ page }) => {
    await page.route("**/v1/review", async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ success: true }) 
      });
    });

    await page.getByLabel("5 estrellas").click();
    await page.getByRole("button", { name: "Publicar reseña" }).click();
    
    await expect(page.getByLabel("Seleccionar calificación")).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar reseña" })).toBeHidden();
  });

  test("shows loading state during submission", async ({ page }) => {
    await page.route("**/v1/review", async (route) => {
      await new Promise(r => setTimeout(r, 2000));
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ success: true }) 
      });
    });

    await page.getByLabel("5 estrellas").click();
    await page.getByRole("button", { name: "Publicar reseña" }).click();
    
    await expect(page.getByText("Enviando...")).toBeVisible();
  });
});