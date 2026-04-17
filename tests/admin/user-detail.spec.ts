import { expect, test } from "@playwright/test";

test.describe("Admin User Detail Page", () => {
  const mockUser = {
    id: "user-1",
    firstName: "Ricardo",
    lastName: "Rodriguez",
    phone: "+56912345678",
    totalConsumed: 150000, // $1,500.00
    totalVisits: 5,
    createdAt: "2024-01-01T10:00:00Z",
  };

  const mockRewards = [
    {
      id: "reward-1",
      name: "Café Gratis",
      description: "Un café de especialidad",
      cost: "3",
      status: "active",
    },
    {
      id: "reward-2",
      name: "Muffin de Chocolate",
      description: "Muffin artesanal",
      cost: "10",
      status: "active",
    },
  ];

  const mockBranches = [{ id: "branch-1", name: "Sucursal Central" }];

  test.beforeEach(async ({ page }) => {
    // Mock user detail
    await page.route("**/v1/users/user-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    // Mock rewards
    await page.route("**/v1/rewards", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRewards),
      });
    });

    // Mock history (empty)
    await page.route("**/v1/rewards/user/user-1/history", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock branches
    await page.route("**/v1/branches", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBranches),
      });
    });

    await page.goto("/admin/users/user-1");
  });

  test("displays user information correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Ricardo Rodriguez" }),
    ).toBeVisible();
    await expect(page.getByText("+56912345678")).toBeVisible();
    await expect(page.getByText("$1,500.00")).toBeVisible();
    await expect(page.getByText("5 visitas")).toBeVisible();
  });

  test("opens add visits modal and fills input", async ({ page }) => {
    await page.getByRole("button", { name: "Añadir" }).click();

    await expect(
      page.getByRole("heading", { name: "Añadir Visitas" }),
    ).toBeVisible();

    const input = page.getByLabel("Número de Visitas");
    await input.fill("2");
    await expect(input).toHaveValue("2");
  });

  test("shows available rewards based on points", async ({ page }) => {
    const totalVisitsText = await page
      .getByTestId("user-total-visits")
      .innerText();
    const totalVisits = parseInt(totalVisitsText.split(" ")[0], 10);

    const rewardCards = page.getByTestId("reward-card");
    const count = await rewardCards.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = rewardCards.nth(i);
      const title = await card.getByTestId("reward-title").innerText();

      const rewardData = mockRewards.find((r) => r.name === title);
      if (!rewardData) {
        throw new Error(`Reward with title "${title}" not found in mock data`);
      }

      const requiredVisits = parseInt(rewardData.cost, 10);
      const redeemButton = card.getByTestId("redeem-button");

      if (totalVisits >= requiredVisits) {
        // Should be available
        await expect(redeemButton).toBeEnabled();
        await expect(redeemButton).toHaveText(/Canjear/i);
      } else {
        // Should NOT be available
        await expect(redeemButton).toBeDisabled();
        await expect(redeemButton).toHaveText(/Faltan Puntos/i);

        const costText = await card.getByTestId("reward-cost").innerText();
        expect(costText.toLowerCase()).toContain(
          `${requiredVisits} visitas`.toLowerCase(),
        );
      }
    }
  });

  test("opens redeem confirmation modal", async ({ page }) => {
    const cafeCard = page
      .locator("div")
      .filter({ hasText: "Café Gratis" })
      .last();
    await cafeCard.getByRole("button", { name: /Canjear/i }).click();

    await expect(
      page.getByRole("heading", { name: "Confirmar Canje" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /¿Estás seguro de que deseas canjear "Café Gratis" por 3 visitas/,
      ),
    ).toBeVisible();
  });

  test("navigates back to user list", async ({ page }) => {
    await page.getByRole("link", { name: "Volver al listado" }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
  });
});
