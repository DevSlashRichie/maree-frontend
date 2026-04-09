import { expect, test } from "@playwright/test";

test.describe("Admin Create Product Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/v1/products/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "cat-dulce",
            name: "Dulce",
            children: [
              {
                id: "cat-crepas",
                name: "Crepas",
              },
              {
                id: "cat-ingrediente",
                name: "Ingrediente",
              },
            ],
          },
          {
            id: "cat-salado",
            name: "Salado",
            children: [
              {
                id: "cat-sandwich",
                name: "Sandwich",
              },
            ],
          },
        ]),
      });
    });

    await page.route("**/v1/products/ingredients", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            path: ["Dulce", "Salsas"],
            items: [
              {
                id: "ing-nutella",
                name: "Nutella",
                status: "active",
                categoryId: "cat-salsas",
              },
            ],
          },
          {
            path: ["Salado", "Quesos"],
            items: [
              {
                id: "ing-queso",
                name: "Queso Manchego",
                status: "active",
                categoryId: "cat-quesos",
              },
            ],
          },
        ]),
      });
    });

    await page.goto("/admin/create-product");
  });

  test("creates product variant after interacting with multiple categories", async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await page.route("**/v1/products/image", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://cdn.test.local/products/crepa.png",
        }),
      });
    });

    await page.route("**/v1/products/product-variant", async (route) => {
      capturedPayload = route.request().postDataJSON() as Record<string, unknown>;

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "variant-123" }),
      });
    });

    await expect(page.getByRole("heading", { name: "Nuevo Producto" })).toBeVisible();

    await page.getByLabel("Nombre").fill("Crepa de Prueba");

    // Navigate through different category branches before choosing the final leaf.
    await page.getByRole("button", { name: "Salado", exact: true }).click();
    await page.getByRole("button", { name: "Todas", exact: true }).click();
    await page.getByRole("button", { name: "Dulce" }).click();
    await page.getByRole("button", { name: "Crepas" }).click();

    await page.locator("#variant-price").fill("120.50");

    await page.locator("#variant-image").setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-content"),
    });

    await page.locator("#ingredient-search").fill("Nutella");
    await page.getByRole("button", { name: /Nutella/ }).click();

    await page.getByRole("button", { name: "Crear Producto" }).click();

    await expect(page.getByText("Producto creado")).toBeVisible();
    await expect(page.getByText("Crepa de Prueba")).toBeVisible();

    expect(capturedPayload).toBeTruthy();
    expect(capturedPayload).toMatchObject({
      name: "Crepa de Prueba",
      status: "active",
      categoryId: "cat-crepas",
      price: 120.5,
      imageUrl: "https://cdn.test.local/products/crepa.png",
      ingredients: [
        {
          id: "ing-nutella",
          quantity: 1,
          isRemovable: true,
        },
      ],
    });
  });

  test("updates ingredient options when switching category branch", async ({ page }) => {
    await page.getByRole("button", { name: "Dulce", exact: true }).click();
    await page.getByRole("button", { name: "Crepas", exact: true }).click();

    await page.locator("#ingredient-search").fill("Nutella");
    await expect(page.getByRole("button", { name: /Nutella/ })).toBeVisible();
    await page.getByRole("button", { name: /Nutella/ }).click();

    await expect(page.getByText("Nutella")).toBeVisible();

    await page.getByRole("button", { name: "Todas", exact: true }).click();
    await page.getByRole("button", { name: "Salado", exact: true }).click();
    await page.getByRole("button", { name: "Sandwich", exact: true }).click();

    await expect(page.getByText("Nutella")).toBeHidden();

    await page.locator("#ingredient-search").fill("Queso");
    await expect(page.getByRole("button", { name: /Queso Manchego/ })).toBeVisible();
  });

  test("shows validation error when category is not selected", async ({ page }) => {
    await page.getByLabel("Nombre").fill("Producto sin categoria");
    await page.locator("#variant-price").fill("100");
    await page.locator("#variant-image").setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-content"),
    });

    const submitButton = page.getByRole("button", { name: "Crear Producto" });
    await expect(submitButton).toBeDisabled();
  });

  test("shows validation error when price is invalid", async ({ page }) => {
    await page.getByLabel("Nombre").fill("Producto precio invalido");
    await page.getByRole("button", { name: "Dulce", exact: true }).click();
    await page.getByRole("button", { name: "Crepas", exact: true }).click();
    await page.locator("#variant-price").fill("0");
    await page.locator("#variant-image").setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-content"),
    });

    await page.getByRole("button", { name: "Crear Producto" }).click();
    await expect(
      page.getByText(/Ingresa un precio v[aá]lido mayor que 0\./i),
    ).toBeVisible();
  });

  test("shows error when image upload fails", async ({ page }) => {
    let variantCalled = false;

    await page.route("**/v1/products/image", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "upload failed" }),
      });
    });

    await page.route("**/v1/products/product-variant", async (route) => {
      variantCalled = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "variant-should-not-be-created" }),
      });
    });

    await page.getByLabel("Nombre").fill("Producto con imagen fallida");
    await page.getByRole("button", { name: "Dulce", exact: true }).click();
    await page.getByRole("button", { name: "Crepas", exact: true }).click();
    await page.locator("#variant-price").fill("100");
    await page.locator("#variant-image").setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-content"),
    });

    await page.getByRole("button", { name: "Crear Producto" }).click();

    await expect(
      page.getByText("No se pudo subir la imagen. Intenta nuevamente."),
    ).toBeVisible();
    expect(variantCalled).toBeFalsy();
  });

  test("shows error when product variant creation returns 409", async ({ page }) => {
    await page.route("**/v1/products/image", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://cdn.test.local/products/duplicate.png",
        }),
      });
    });

    await page.route("**/v1/products/product-variant", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ message: "Product already exists" }),
      });
    });

    await page.getByLabel("Nombre").fill("Producto duplicado");
    await page.getByRole("button", { name: "Dulce", exact: true }).click();
    await page.getByRole("button", { name: "Crepas", exact: true }).click();
    await page.locator("#variant-price").fill("100");
    await page.locator("#variant-image").setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-content"),
    });

    await page.getByRole("button", { name: "Crear Producto" }).click();

    await expect(
      page.getByText("No se pudo guardar el producto. Intenta nuevamente."),
    ).toBeVisible();
    await expect(page.getByText("Producto creado")).toBeHidden();
  });
});

