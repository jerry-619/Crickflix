import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    removeConsole({
      exclude: ['error', 'warn'] // Optional: Keep error and warn logs
    })
  ],
})
