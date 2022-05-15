import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		modules: {
			scopeBehaviour: 'local',
			generateScopedName: '[name]__[local]___[hash:base64:5]',
		},
	},
});
