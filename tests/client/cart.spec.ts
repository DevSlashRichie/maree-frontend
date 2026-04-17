import { test, expect } from "@playwright/test";
import type { AddableItem } from "@/hooks/use-cart-store";

const MOCK_CART_ITEMS: AddableItem[] = [
  {
    variantId: "variant-1",
    itemNotes: "Extra cheese",
    modifiers: [{ id: "cheese", delta: 1 }],
    displayName: "Test Product 1",
    displayImage: "https://via.placeholder.com/150",
    unitPriceCents: 1000,
  },
  {
    variantId: "variant-2",
    itemNotes: "",
    modifiers: [],
    displayName: "Test Product 2",
    displayImage: "https://via.placeholder.com/150",
    unitPriceCents: 500,
  },
];

async function addToCart(page: any, item: AddableItem) {
  await page.evaluate(
    (itemToAdd) => {
      window.cartStore.getState().addItem(itemToAdd);
    },
    [item],
  );
}

test.describe("Cart Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cart");
  });

  test("shows empty cart message when no items are present", async ({
    page,
  }) => {
    await expect(page.getByText("Tu carrito esta vacio")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ir al menu" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirmar Pedido" }),
    ).toBeDisabled();
    await expect(page.getByText("$0.00")).toBeVisible();
  });

  test("displays items added to the cart", async ({ page }) => {
    for (const item of MOCK_CART_ITEMS) {
      await addToCart(page, item);
    }
    await page.reload();

    await expect(page.getByText("Test Product 1")).toBeVisible();
    await expect(page.getByText("Test Product 2")).toBeVisible();
    await expect(page.getByText("$15.00")).toBeVisible();
  });

  test("can increment and decrement item quantity", async ({ page }) => {
    await addToCart(page, MOCK_CART_ITEMS[0]);
    await page.reload();

    const itemCard = page.locator('[data-item-id^="variant-1"]');
    await expect(itemCard.getByText("1")).toBeVisible();
    await expect(page.getByText("$10.00")).toBeVisible();

    await itemCard.getByRole("button", { name: "Agregar uno" }).click();
    await expect(itemCard.getByText("2")).toBeVisible();
    await expect(page.getByText("$20.00")).toBeVisible();

    await itemCard.getByRole("button", { name: "Quitar uno" }).click();
    await expect(itemCard.getByText("1")).toBeVisible();
    await expect(page.getByText("$10.00")).toBeVisible();
  });

  test("can remove an item from the cart", async ({ page }) => {
    await addToCart(page, MOCK_CART_ITEMS[0]);
    await page.reload();

    await expect(page.getByText("Test Product 1")).toBeVisible();
    const itemCard = page.locator('[data-item-id^="variant-1"]');
    await itemCard.getByRole("button", { name: "Quitar" }).click();

    await expect(page.getByText("Test Product 1")).not.toBeVisible();
    await expect(page.getByText("Tu carrito esta vacio")).toBeVisible();
  });

  test("can confirm an order", async ({ page }) => {
    await page.route("**/v1/orders", (route) => {
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "order-123" }),
      });
    });

    await addToCart(page, MOCK_CART_ITEMS[0]);
    await page.reload();

    await page.getByRole("button", { name: "Confirmar Pedido" }).click();

    await expect(page.getByText("Pedido confirmado")).toBeVisible();
    await expect(page).toHaveURL(/.*menu/);
  });

  test("shows error on order confirmation failure", async ({ page }) => {
    await page.route("**/v1/orders", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await addToCart(page, MOCK_CART_ITEMS[0]);
    await page.reload();

    await page.getByRole("button", { name: "Confirmar Pedido" }).click();

    await expect(page.getByText("No se pudo confirmar el pedido")).toBeVisible();
  });
});

