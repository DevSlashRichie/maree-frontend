import { expect, test } from "@playwright/test";

test.describe("Loyalty Page", () => {
  const mockLoyalty = {
    firstName: "Ana López",
    phone: "4427536211",
    currentBalance: 10,
    lastRedemptions: [
      {
        name: "Crepa Salada",
        branch: "La Marée",
        date: "2024-01-01T10:00:00Z",
      },
      {
        name: "Bebida Refrescante",
        branch: "Sucursal Norte",
        date: "2024-02-15T15:30:00Z",
      },
      {
        name: "Regalo de Cumpleaños",
        branch: "La Marée",
        date: "2024-03-20T09:00:00Z",
      },
    ],
  };

  const mockRewards = [
    {
      id: "reward-1",
      name: "Crepa Dulce Gratis",
      cost: "5",
      description: "Deliciosa crepa",
    },
    {
      id: "reward-2",
      name: "Café de Especialidad",
      cost: "3",
      description: "Café recién molido",
    },
    {
      id: "reward-3",
      name: "Bebida de Temporada",
      cost: "15",
      description: "Solo por tiempo limitado",
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Intercept Loyalty API
    await page.route("**/v1/loyalty", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockLoyalty),
      });
    });

    // Intercept Rewards API
    await page.route("**/v1/rewards", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockRewards),
      });
    });

    await page.goto("/loyalty");
  });

  test("loads loyalty page successfully", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Recompensas" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Historial" }),
    ).toBeVisible();
  });

  test("displays loyalty card with user info from mock", async ({ page }) => {
    await expect(page.getByTestId("user-name")).toHaveText(
      mockLoyalty.firstName,
    );
    await expect(page.getByTestId("user-phone")).toContainText(
      mockLoyalty.phone,
    );
  });

  test("displays all rewards from mock", async ({ page }) => {
    for (const reward of mockRewards) {
      await expect(
        page.getByTestId("reward-title").filter({ hasText: reward.name }),
      ).toBeVisible();
    }
  });

  test("reward button states based on balance", async ({ page }) => {
    const balance = mockLoyalty.currentBalance;

    for (const reward of mockRewards) {
      const card = page
        .getByTestId("reward-card")
        .filter({ hasText: reward.name });
      const button = card.getByTestId("redeem-button");
      const cost = parseInt(reward.cost, 10);

      if (balance >= cost) {
        await expect(button).toBeEnabled();
        await expect(button).toHaveText(/Canjear/i);
      } else {
        await expect(button).toBeDisabled();
        await expect(button).toHaveText(/Faltan Puntos/i);
      }
    }
  });

  test("displays recent history items from mock", async ({ page }) => {
    const historyTitles = mockLoyalty.lastRedemptions
      .slice(0, 3)
      .map((h) => h.name);
    for (const title of historyTitles) {
      await expect(
        page.getByTestId("history-item-title").filter({ hasText: title }),
      ).toBeVisible();
    }
  });

  test("opens history modal when clicking view full history", async ({
    page,
  }) => {
    await page.click("text=Ver historial completo");
    await expect(
      page.getByRole("heading", { name: "Historial Completo" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Buscar...")).toBeVisible();
  });

  test("search filters history results in modal", async ({ page }) => {
    await page.click("text=Ver historial completo");

    const modal = page.getByRole("dialog", { name: "Historial Completo" });
    await page.fill('input[placeholder="Buscar..."]', "Crepa");

    await expect(
      modal
        .getByTestId("history-item-title")
        .filter({ hasText: "Crepa Salada" }),
    ).toBeVisible();
    await expect(
      modal
        .getByTestId("history-item-title")
        .filter({ hasText: "Bebida Refrescante" }),
    ).not.toBeVisible();
  });

  test("opens confirmation modal when clicking redeem", async ({ page }) => {
    const availableRewardTitle = mockRewards[0].name;
    const card = page
      .getByTestId("reward-card")
      .filter({ hasText: availableRewardTitle });
    await card.getByTestId("redeem-button").click();

    await expect(page.getByText("Confirmar Canje")).toBeVisible();

    // Use .last() to target the heading inside the modal, as the RewardCard title also uses <h4>
    await expect(
      page.getByRole("heading", { name: availableRewardTitle }).last(),
    ).toBeVisible();
  });
});
