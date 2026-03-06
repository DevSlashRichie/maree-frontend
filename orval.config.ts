import { defineConfig } from "orval";

export default defineConfig({
  mareeSwr: {
    input: "http://localhost:8383/docs/openapi.json",
    output: {
      target: "./src/lib/api.ts",
      schemas: "./src/lib/schemas",
      client: "swr",
      biome: true,
    },
  },
  mareeZod: {
    input: "http://localhost:8383/docs/openapi.json",
    output: {
      target: "./src/lib/zods.ts",
      client: "zod",
      biome: true,
    },
  },
});
