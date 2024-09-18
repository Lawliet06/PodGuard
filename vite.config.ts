import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    checker({
      typescript: true,
      // Removed ESLint configuration
    }),
  ],
  preview: {
    port: 5000,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  base: '/podguard',
  optimizeDeps: {
    // Include Firebase modules to ensure proper ESM handling by Vite
    include: ['firebase/app', 'firebase/auth'],
  },
});
