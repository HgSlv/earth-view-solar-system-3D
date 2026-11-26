import { defineConfig } from "vite";

// base "./" keeps asset URLs relative so the site works under the GitHub Pages subpath.
export default defineConfig({
  root: "src",
  publicDir: "../static",
  base: "./",
  build: { outDir: "../dist", emptyOutDir: true },
});
