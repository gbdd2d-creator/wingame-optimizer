import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    target: 'chrome110',
    minify: 'esbuild',
    outDir: 'dist',
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
})