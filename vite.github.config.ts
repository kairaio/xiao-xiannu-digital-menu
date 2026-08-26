import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import path from "node:path";

export default defineConfig({
  base: "/xiao-xiannu-digital-menu/",
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  build: { outDir: "gh-pages-dist", emptyOutDir: true },
});
