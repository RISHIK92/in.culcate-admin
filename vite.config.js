import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/", // Ensure this is correct
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets", // Ensure assets are correctly placed
  },
  server: {
    historyApiFallback: true, // Ensures React Router works
  },
});
