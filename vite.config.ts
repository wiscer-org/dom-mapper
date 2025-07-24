import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import hotReloadExtension from "hot-reload-extension-vite";

export default defineConfig({
  plugins: [
    react(),
    hotReloadExtension({
      log: true,
      backgroundPath: "src/background.ts",
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "src/main.ts",
        content: "src/content.ts",
        background: "src/background.ts",
        devtools: "src/devtools.ts",
        "devtools-panel": "src/devtools-panel.tsx",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
