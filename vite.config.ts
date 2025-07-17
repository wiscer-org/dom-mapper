import { defineConfig } from 'vite';
import hotReloadExtension from 'hot-reload-extension-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [hotReloadExtension({
        log: true,
        backgroundPath: 'src/background.ts' // relative path to background script file
    }),
    react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'src/main.tsx',
                content: 'src/content.ts',
                background: 'src/background.ts'
            },
            output: {
                entryFileNames: '[name].js'
            }
        }
    }
});
