import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    core: "src/index.ts",
    datastore_string: "src/dataStores/string.ts",
  },
  sourcemap: true,
  format: ['esm'],
  dts: true,
});
