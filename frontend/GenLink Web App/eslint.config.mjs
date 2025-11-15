import { defineConfig } from "eslint/config";

// Keep this minimal and valid so ESLint won't throw a parse error. We
// intentionally keep the canonical rules in `.eslintrc.cjs` because Next's
// plugin-detection is more reliable with a classic `cjs` config file.
export default defineConfig({
    // Keep a couple of common ignore patterns to avoid ESLint scanning build
    // artifacts — keep it small to avoid conflicting configs.
    ignores: [
        "**/.next/**",
        "**/node_modules/**",
        "**/dist/**",
    ],
});