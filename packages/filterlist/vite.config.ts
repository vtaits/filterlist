import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,

    lib: {
      entry: new URL('src/index.ts', import.meta.url).pathname,
      name: 'Filterlist',
      fileName: 'filterlist',
    },

    rollupOptions: {
      external: ['mitt'],
      output: {
        globals: {
          mitt: 'mitt',
        },
      },
    },
  },
});
