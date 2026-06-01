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
        /* Code-splitting por rota: cada página é importada dinamicamente em
         * main.js, então o Rollup gera um chunk próprio por página
         * automaticamente. NÃO agrupamos as páginas num único chunk (isso
         * anularia o lazy-load). Mantemos só libs de terceiros juntas. */
        manualChunks(id) {
          if (id.includes('/node_modules/')) return 'vendor';
          return undefined;
        }
      }
    }
  }
});
