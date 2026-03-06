import { defineConfig } from "orval";

export default defineConfig({
  mareeSwr: {
    input:
      "https://maree.kindmeadow-92ce4777.centralus.azurecontainerapps.io/docs/openapi.json",
    output: {
      target: "./src/lib/api.ts",
      schemas: "./src/lib/schemas",
      client: "swr",
      biome: true,
    },
  },
  mareeZod: {
    input:
      "https://maree.kindmeadow-92ce4777.centralus.azurecontainerapps.io/docs/openapi.json",
    output: {
      target: "./src/lib/zods.ts",
      client: "zod",
      biome: true,
    },
  },
});
