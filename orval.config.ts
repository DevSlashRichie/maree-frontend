import { defineConfig } from "orval";

const env = process.env.ENVIRONMENT;

if (!env) throw new Error("Please define ENVIRONEMT env var");

console.log("You are executing orval from: ", env);

const BASE_URL_INDEXES = {
  DEVELOPMENT: 0,
  PRODUCTION: 1,
};

const choosenIndex = BASE_URL_INDEXES[env];

if (typeof choosenIndex !== "number")
  throw new Error("Invalid base url index.");

export default defineConfig({
  mareeSwr: {
    input: "http://localhost:8383/docs/openapi.json",
    output: {
      target: "./src/lib/api.ts",
      schemas: "./src/lib/schemas",
      client: "swr",
      biome: true,
      baseUrl: {
        getBaseUrlFromSpecification: true,
        index: choosenIndex,
      },
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
