import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: true,
    open: false,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true
  }
});
