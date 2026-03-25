import { defineConfig } from "orval";
import "dotenv/config";

let env = process.env.ENVIRONMENT;

if (!env) throw new Error("Please define ENVIRONEMT env var");

env = env.toUpperCase();

console.log("You are executing orval from:", env);

const BASE_URL_INDEXES = {
  DEVELOPMENT: 0,
  PRODUCTION: 1,
};

const SOURCE_INPUT_URL = {
  DEVELOPMENT: "http://localhost:8383/docs/openapi.json",
  PRODUCTION:
    "https://maree.kindmeadow-92ce4777.centralus.azurecontainerapps.io/docs/openapi.json",
};

const choosenIndex = BASE_URL_INDEXES[env];

console.log("Using index:", choosenIndex);
if (typeof choosenIndex !== "number")
  throw new Error("Invalid base url index.");

let env = process.env.ENVIRONMENT;

if (!env) throw new Error("Please define ENVIRONEMT env var");

env = env.toUpperCase();

console.log("You are executing orval from:", env);

const BASE_URL_INDEXES = {
  DEVELOPMENT: 0,
  PRODUCTION: 1,
};

const SOURCE_INPUT_URL = {
  DEVELOPMENT: "http://localhost:8383/docs/openapi.json",
  PRODUCTION:
    "https://maree.kindmeadow-92ce4777.centralus.azurecontainerapps.io/docs/openapi.json",
};

const choosenIndex = BASE_URL_INDEXES[env];

console.log("Using index:", choosenIndex);
if (typeof choosenIndex !== "number")
  throw new Error("Invalid base url index.");

export default defineConfig({
  mareeSwr: {
    input: SOURCE_INPUT_URL[env],
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
    input: SOURCE_INPUT_URL[env],
    output: {
      target: "./src/lib/zods.ts",
      client: "zod",
      biome: true,
    },
  },
});
