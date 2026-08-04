import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        menu: 'menu.html',
        breakfast: 'breakfast.html',
        breakfastCombos: 'breakfast-combos.html',
      },
    },
  },
});
