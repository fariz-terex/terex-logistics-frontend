import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";

// RAILWAY_GIT_COMMIT_SHA is set automatically by Railway during the build —
// falls back to running `git` directly for local dev builds.
function commitHash() {
  if (process.env.RAILWAY_GIT_COMMIT_SHA) return process.env.RAILWAY_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_COMMIT__: JSON.stringify(commitHash()),
    __APP_BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      output: {
        // Third-party libraries change far less often than App.jsx. Keeping
        // them in their own chunks means a normal deploy only makes people
        // re-download the app chunk, not React + icons + CSV parser again.
        manualChunks: {
          react: ["react", "react-dom"],
          icons: ["lucide-react"],
          csv: ["papaparse"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    allowedHosts: true,
  },
});
