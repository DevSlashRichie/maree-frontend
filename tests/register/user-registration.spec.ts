import { expect, test } from "@playwright/test";

test("register a new user with random phone number", async ({ page }) => {
  // Generate a random 10-digit phone number
  const randomPhone = Math.floor(
    1000000000 + Math.random() * 9000000000,
  ).toString();

  await page.goto("/login");

  // Step 1: Input random phone
  await page.getByLabel("Teléfono").fill(randomPhone);
  await page.getByRole("button", { name: /Continuar/i }).click();

  // Step 2: Fill registration details (Name and Last Name)
  // These fields appear when the phone number is not recognized
  await page.getByLabel(/Nombre/i).fill("TestName");
  await page.getByLabel(/Apellido/i).fill("TestLastName");
  await page.getByRole("button", { name: /Registrarse/i }).click();

  // Step 3: Input 2FA code (Always '123456' in test environment)
  await page.getByLabel(/Código/i).fill("123456");
  await page.getByRole("button", { name: /Verificar|Continuar/i }).click();

  // Step 4: Verify redirection after successful registration
  // We expect to move away from the login page
  await expect(page).not.toHaveURL(/\/login/);

  // Log URL for visibility during test runs
  console.log(`Registered with ${randomPhone}. Current URL: ${page.url()}`);
});
