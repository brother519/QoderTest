/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/shared/components'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/shared': resolve(__dirname, 'src/shared'),
      '@/infrastructure': resolve(__dirname, 'src/infrastructure')
    }
  }
})