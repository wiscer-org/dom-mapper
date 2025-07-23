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
        devtools: "src/devtools.ts",
        "devtools-panel": "src/devtools-panel.ts",
        "text-mapper-ui": "src/text-mapper-ui.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
