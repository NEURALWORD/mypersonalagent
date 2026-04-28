import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: false,
		environment: 'happy-dom',
		include: ['src/**/*.test.{ts,tsx}'],
		setupFiles: ['./src/__tests__/setup.ts'],
		passWithNoTests: false,
	},
	resolve: {
		alias: {
			'@': new URL('./src/', import.meta.url).pathname,
			'server-only': new URL('./src/__tests__/server-only-stub.ts', import.meta.url).pathname,
		},
	},
});
