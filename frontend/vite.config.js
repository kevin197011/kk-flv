var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        // Avoid 403 when opening page with ?url=https://... (query can be mistaken for path in Docker)
        fs: {
            allow: ['.', '..', '/app'],
            strict: false,
        },
        proxy: {
            '/api': {
                target: (_a = process.env.API_PROXY_TARGET) !== null && _a !== void 0 ? _a : 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
});
