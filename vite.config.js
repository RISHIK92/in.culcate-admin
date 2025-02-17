import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Example base URL
  plugins: [react()],
  server: {
    historyApiFallback: true, // Enable history fallback
  },
})
