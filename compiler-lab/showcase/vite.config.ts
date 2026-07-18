import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: [".trycloudflare.com"],
    host: "127.0.0.1",
    port: 5188
  },
  preview: {
    allowedHosts: [".trycloudflare.com"],
    host: "127.0.0.1",
    port: 4188
  }
});
