import { test as setup } from "@playwright/test";
import fs from "fs";

const adminAuthFile = ".auth/admin.json";

setup("authenticate as admin", async ({ page, context }) => {
  await page.goto("/login");

  await page.fill('input[name="phone"]', "4427536211");
  await page.click('button[type="submit"]');

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  await page.goto("/admin");
  await page.waitForLoadState("networkidle");

  const state = await context.storageState();
  fs.mkdirSync(".auth", { recursive: true });
  fs.writeFileSync(adminAuthFile, JSON.stringify(state));
});
