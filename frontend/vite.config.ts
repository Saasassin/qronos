import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    //    open: "/index.html",
    port: 3000,
  },
  envPrefix: "QRONOS_",
});
