import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/", // Ensure this is set correctly
  plugins: [react()],
  server: {
    historyApiFallback: true, // Ensures React Router can handle routes
  },
});
