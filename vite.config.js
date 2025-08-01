import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/molexplorer/',
    server: {
        proxy: {
            '/rcsb': {
                target: 'https://files.rcsb.org',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/rcsb/, ''),
            },
        },
        fs: {
            allow: ['..']
        }
    },
}); 