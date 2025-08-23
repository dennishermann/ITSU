import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['src/tests/**/*.spec.ts'],
		globals: true,
	},
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});


