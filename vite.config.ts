import { defineConfig } from "vite";
import hotReloadExtension from "hot-reload-extension-vite";

export default defineConfig({
  plugins: [
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
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
