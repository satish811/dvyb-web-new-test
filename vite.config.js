// vite.config.js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // checker({
    //   eslint: {
    //     lintCommand: 'eslint "./src/**/*.{js,jsx}"',
    //   },
    // }),
  ],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3004",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Tell Vite which file types are static assets
  assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.webp"],

  // -----------------------------------------------------------------
  //  ALIASES – this is the part that fixes the Vercel build error
  // -----------------------------------------------------------------
  resolve: {
    alias: {
      // @ → src (optional but handy)
      "@": path.resolve(__dirname, "./src"),

      // @assets → src/assets (the one you need)
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
});
