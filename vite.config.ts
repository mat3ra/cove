import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite config for the standalone component gallery (`npm run dev:standalone`),
 * deployed to GitHub Pages by the `deploy-bundle` CI job. The library build
 * (`npm run transpile`) is unaffected — it uses tsc/tsconfig.json, which
 * excludes `src/standalone`.
 */
export default defineConfig({
    // Matches the repo name so assets resolve under the GitHub Pages
    // subpath (mat3ra.github.io/cove.js/). Harmless for local dev.
    base: "/cove.js/",
    plugins: [react()],
    build: {
        outDir: "build",
    },
});
