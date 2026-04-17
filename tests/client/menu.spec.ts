import { expect, test } from "@playwright/test";

test.describe("Client Menu Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/products/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          categories: [
            { id: "cat-1", name: "Crepas", public: true, children: [] },
            { id: "cat-2", name: "Bebidas", public: true, children: [] },
          ],
        }),
      });
    });

    await page.route("**/v1/products/variants", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          variants: [
            {
              id: "var-1",
              name: "Crepa de Nutella",
              price: 8500,
              description: "Deliciosa crepa con chocolate",
              product: { categoryId: "cat-1" },
            },
          ],
        }),
      });
    });

    await page.goto("http://localhost:5173/menu");
  });

  test("should display categories and products correctly", async ({ page }) => {
    const section = page.locator('section#cat-1');
    await section.waitFor({ state: 'visible' });

    await expect(page.getByRole('heading', { name: /Crepas/i })).toBeVisible();
    await expect(page.getByText(/Crepa de Nutella/i)).toBeVisible();
    await expect(section.getByText("85")).toBeVisible();
  });

  test("should navigate to customization page when clicking add", async ({ page }) => {
    await page.waitForSelector('section#cat-1');
    const addButton = page.locator('section#cat-1').getByRole("button").first();
    await addButton.click();

    await expect(page).toHaveURL(/\/customize-product/);
    await expect(page).toHaveURL(/variantId=var-1/);
  });

  test("should show error state when API fails", async ({ page }) => {
    await page.route("**/v1/products/categories", (route) => route.fulfill({ status: 500 }));
    await page.reload();
    await expect(page.getByText(/Algo salió mal/i)).toBeVisible();
  });

  test("should filter products by clicking on category filter", async ({ page }) => {
    const filterBebidas = page.getByRole("button", { name: /Bebidas/i }).first();
    await filterBebidas.click();
    await expect(page.locator("section#cat-2")).toBeVisible();
  });

  test("should show empty state for category without products", async ({ page }) => {
    await page.route("**/v1/products/variants", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ variants: [] }),
      });
    });
    await page.reload();
    await expect(page.getByText(/Próximamente/i).first()).toBeVisible();
  });
});