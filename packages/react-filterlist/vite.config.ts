import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    minify: false,

    lib: {
      entry: new URL('src/index.ts', import.meta.url).pathname,
      name: 'ReactFilterlist',
      fileName: 'react-filterlist',
    },

    rollupOptions: {
      external: ['react', '@vtaits/filterlist'],
      output: {
        globals: {
          react: 'React',
          '@vtaits/filterlist': 'Filterlist',
        },
      },
    },
  },
});
