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
          if (id.includes('/node_modules/')) {
            /* Three.js é PESADO e só usado no Núcleo (app-only, #238): chunk
             * próprio pra ficar fora do `vendor` (que é eager no boot). Assim
             * o site leve nunca baixa o Three — só o app, ao abrir o cockpit. */
            if (id.includes('/node_modules/three/')) return 'three';
            /* MapLibre pela mesma razão, e a lição custou uma medição: ao sair
             * do CDN para o npm ele caiu no `vendor` sem regra própria e somou
             * ~780 kB à carga INICIAL de quem nunca abre um mapa. Só duas
             * telas o usam (/mapa e /vanguard), e as duas o pedem por import
             * dinâmico — chunk próprio mantém isso verdadeiro. */
            if (id.includes('/node_modules/maplibre-gl/')) return 'maplibre';
            return 'vendor';
          }
          return undefined;
        }
      }
    }
  }
});
