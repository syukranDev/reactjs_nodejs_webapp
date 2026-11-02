import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_TARGET = process.env.VITE_API_PROXY_TARGET || "http://localhost:3333";

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/a": { target: API_TARGET, changeOrigin: true, timeout: 0, proxyTimeout: 0 },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    viteReact(),
  ],
});
