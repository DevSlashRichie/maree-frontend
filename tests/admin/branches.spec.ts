import { test, expect } from "@playwright/test";

const MOCK_BRANCHES = [
  {
    id: "branch-1",
    name: "Main Branch",
    state: "active",
    schedulesTable: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "branch-2",
    name: "Second Branch",
    state: "inactive",
    schedulesTable: [],
    createdAt: new Date().toISOString(),
  },
];

test.describe("Admin Branches Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/branches", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_BRANCHES),
      });
    });
    await page.goto("/admin/branches");
  });

  test("displays all branches", async ({ page }) => {
    await expect(page.getByText("Main Branch")).toBeVisible();
    await expect(page.getByText("Second Branch")).toBeVisible();
  });

  test("opens the new branch modal", async ({ page }) => {
    await page.getByRole("button", { name: "Nueva sucursal" }).click();
    await expect(page.getByRole("heading", { name: "Nueva Sucursal" })).toBeVisible();
  });

  test("creates a new branch", async ({ page }) => {
    await page.route("**/v1/branches", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "new-branch" }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([...MOCK_BRANCHES, {
            id: "new-branch",
            name: "New Branch from Test",
            state: "active",
            schedulesTable: [],
            createdAt: new Date().toISOString(),
          }]),
        });
      }
    });

    await page.getByRole("button", { name: "Nueva sucursal" }).click();
    await page.getByLabel("Nombre").fill("New Branch from Test");
    await page.getByLabel("Estado").selectOption({ label: 'Open' });
    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(page.getByText("New Branch from Test")).toBeVisible();
  });
});

test.describe("Admin Branch Details Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/v1/branches/${MOCK_BRANCHES[0].id}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_BRANCHES[0]),
      });
    });
    await page.goto(`/admin/branches/${MOCK_BRANCHES[0].id}`);
  });

  test("displays branch details", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Main Branch" })).toBeVisible();
  });

  test("opens the edit branch modal", async ({ page }) => {
    await page.getByRole("button", { name: "Editar" }).click();
    await expect(page.getByRole("heading", { name: "Editar sucursal" })).toBeVisible();
  });

  test("updates a branch", async ({ page }) => {
    await page.route(`**/v1/branches/${MOCK_BRANCHES[0].id}`, (route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...MOCK_BRANCHES[0], name: "Updated Branch Name" }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...MOCK_BRANCHES[0], name: "Updated Branch Name" }),
        });
      }
    });

    await page.getByRole("button", { name: "Editar" }).click();
    await page.getByLabel("Nombre").fill("Updated Branch Name");
    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(page.getByRole("heading", { name: "Updated Branch Name" })).toBeVisible();
  });
});

