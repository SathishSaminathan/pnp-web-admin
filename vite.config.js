import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["antd", "@ant-design/icons"],
          charts: ["apexcharts", "react-apexcharts", "recharts"],
          state: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
  server: {
    proxy: {
      // In dev, all /api/* requests are proxied to the backend.
      // From the browser's perspective every request is localhost:5173 (same-origin),
      // so the browser stores and sends HttpOnly session cookies freely —
      // exactly how the merchant app works: dev.meralot.com → devapi.meralot.com
      // are same-site (*.meralot.com), cookies flow without restrictions.
      // In production (devadmin.meralot.com → devadminapi.meralot.com) the same
      // same-site relationship applies and no proxy is needed.
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
