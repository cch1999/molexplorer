import { defineConfig } from 'vite';

// https://vitejs.dev/config/
const base = process.env.BASE_PATH || '/molexplorer/';

export default defineConfig({
    base,
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
