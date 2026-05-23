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
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        /* Code-splitting: separa os datasets e as páginas do núcleo,
         * para chunks menores, download paralelo e cache mais granular. */
        manualChunks(id) {
          if (id.includes('/src/data/')) return 'data';
          if (id.includes('/src/pages/')) return 'pages';
          return undefined;
        }
      }
    }
  }
});
