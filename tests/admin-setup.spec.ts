import { test as setup } from "@playwright/test";

const adminAuthFile = ".auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login?next=/admin");

  await page.fill('input[name="phone"]', "4427536211");

  // Wait for login request and response
  await Promise.all([
    page.waitForResponse(
      (res) => {
        return (
          res.url().includes("/auth/login") ||
          res.url().includes("localhost:8383/auth/login")
        );
      },
      {
        timeout: 15000,
      },
    ),
    (async () => {
      await page.getByLabel("Teléfono").fill("4427536211");
      await page.getByRole("button", { name: /Continuar/i }).click();
    })(),
  ]);

  // Wait for navigation after login
  await page.waitForFunction(() =>
    window.location.pathname.startsWith("/admin"),
  );

  await page.waitForLoadState("networkidle");

  // Log URL to see if redirected
  console.log("Current URL:", page.url());

  await page.context().storageState({ path: adminAuthFile });
});
