import { test, expect } from "@playwright/test";

const MOCK_USERS = {
  users: [
    {
      id: "user-1",
      firstName: "Alice",
      lastName: "Smith",
      phone: "111222333",
      email: "alice@example.com",
      createdAt: new Date().toISOString(),
      totalConsumed: 10000,
      totalVisits: 5,
    },
    {
      id: "user-2",
      firstName: "Bob",
      lastName: "Johnson",
      phone: "444555666",
      email: "bob@example.com",
      createdAt: new Date().toISOString(),
      totalConsumed: 20000,
      totalVisits: 10,
    },
  ],
  total: 2,
};

test.describe("Admin Users Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/users?page=1&limit=5", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USERS),
      });
    });
    await page.goto("/admin/users");
  });

  test("displays all users", async ({ page }) => {
    await expect(page.getByText("Alice Smith")).toBeVisible();
    await expect(page.getByText("Bob Johnson")).toBeVisible();
  });

  test("opens the QR scanner modal", async ({ page }) => {
    await page.getByRole("button", { name: "Escanear QR" }).click();
    await expect(page.getByRole("heading", { name: "Escanear QR de Usuario" })).toBeVisible();
  });

  test("navigates to user details on row click", async ({ page }) => {
    await page.getByText("Alice Smith").click();
    await expect(page).toHaveURL(`/admin/users/${MOCK_USERS.users[0].id}`);
  });
});

test.describe("Admin User Details Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.route(`**/v1/users/${MOCK_USERS.users[0].id}`, (route) => {
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(MOCK_USERS.users[0]),
            });
        });
        await page.route('**/v1/rewards', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        });
        await page.route(`**/v1/rewards/user/${MOCK_USERS.users[0].id}/history`, (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        });
        await page.route('**/v1/branches', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        });
        await page.goto(`/admin/users/${MOCK_USERS.users[0].id}`);
    });

    test("displays user details", async ({ page }) => {
        await expect(page.getByRole("heading", { name: "Alice Smith" })).toBeVisible();
        await expect(page.getByText("111222333")).toBeVisible();
        await expect(page.getByText("$100.00")).toBeVisible();
        await expect(page.getByText("5 visitas")).toBeVisible();
    });

    test("opens add visits modal", async ({ page }) => {
        await page.getByRole("button", { name: "Añadir" }).click();
        await expect(page.getByRole("heading", { name: "Añadir Visitas" })).toBeVisible();
    });

    test("can add a visit", async ({ page }) => {
        await page.route('**/v1/rewards/visit', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ newBalance: 6 }),
            });
        });
        await page.getByRole("button", { name: "Añadir" }).click();
        await page.getByLabel("Número de Visitas").fill("1");
        await page.getByRole("button", { name: "Añadir Visitas" }).click();
        await expect(page.getByText("6 visitas")).toBeVisible();
    });
});

