import react from '@vitejs/plugin-react';

import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@/app': path.resolve(__dirname, 'src/app'),
			'@/pages': path.resolve(__dirname, 'src/pages'),
			'@/widgets': path.resolve(__dirname, 'src/widgets'),
			'@/features': path.resolve(__dirname, 'src/features'),
			'@/entities': path.resolve(__dirname, 'src/entities'),
			'@/shared': path.resolve(__dirname, 'src/shared')
		}
	},
	plugins: [react()],
	esbuild: {
		supported: {
			'top-level-await': true //browsers can handle top-level-await features
		}
	}
});
