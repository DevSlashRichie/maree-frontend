import { expect, test } from "@playwright/test";

test.describe("Client Review Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/review");
  });

  test("displays review form correctly", async ({ page }) => {
    await expect(page.getByText("Cuéntanos tu experiencia")).toBeVisible();
  });

  test("allows entering feedback", async ({ page }) => {
    await page.locator("textarea").fill("Excelente servicio!");
    await expect(page.locator("textarea")).toHaveValue("Excelente servicio!");
  });

  test("submits review successfully", async ({ page }) => {
    await page.route("**/v1/reviews", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "review-1" }),
      });
    });

    await page.locator("textarea").fill("Muy buen servicio");
    await page.getByRole("button", { name: /Enviar/i }).click();
    await expect(page.getByText("Gracias por tu opinión")).toBeVisible();
  });
});
