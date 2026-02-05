import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/rcsb': {
        target: 'https://files.rcsb.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rcsb/, ''),
      },
    },
    fs: {
      allow: ['..'],
    },
  },
}); 
