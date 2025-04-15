import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'src', 'tests'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'src', 'tests', 'setupTests.ts')],
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'], // Ensure test files are included
    testTransformMode: {
      web: ['tsx', 'ts'],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/unit/junit.xml',
    },
    css: true,
  },
  server: {
    host: '0.0.0.0', // Allow connections from outside the container
    proxy: {
      '/api': {
        // Use API service name when in Docker, localhost otherwise
        target: process.env.DOCKER
          ? 'http://api:8080'
          : 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: {
          '*': '',
        },
        headers: {
          Connection: 'keep-alive',
        },
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
