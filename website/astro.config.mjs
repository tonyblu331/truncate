import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://tonyblu331.github.io",
  base: "/truncate",
  integrations: [
    starlight({
      title: "truncate",
      disable404Route: true,
      pagefind: false,
      customCss: ["./src/assets/app.css"],
      social: {
        github: "https://github.com/tonyblu331/truncate",
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
