import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import dotenv from "dotenv";
import path from "path";
  
dotenv.config(); // Load environment variables from .env

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10), // Use PORT from .env if available
    open: true, // Automatically open the app in the default browser
    host: true, // Allow access from other devices in the same network
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
    },
  build: {
    sourcemap: mode === "development", // Enable sourcemaps only in development
  },
  define: {
    "process.env.NODE_ENV": `"${mode}"`, // Inject NODE_ENV for client-side access
  },
}));