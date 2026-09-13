import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Os bundles com hash saem em /build/ pra não se misturarem com as imagens de public/assets.
    // Assim o vercel.json consegue dar cache imutável de 1 ano só pro que tem hash no nome.
    assetsDir: 'build',
  },
});
