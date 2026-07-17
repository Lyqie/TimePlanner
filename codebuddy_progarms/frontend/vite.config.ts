import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app/shared': path.resolve(__dirname, '../shared/types/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@app/shared'],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
