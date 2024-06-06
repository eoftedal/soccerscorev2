import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import sharp from "sharp";

const image = sharp("./src/assets/soccer.webp");

const versions = [16, 120, 152, 180];
const favIconPlugin = () => {
  return {
    name: "favIconPlugin",
    async transformIndexHtml(html: string) {
      const links = [];
      for (const v of versions) {
        const resized = image.resize({ width: v, height: v });
        const base64 = (await resized.toBuffer()).toString("base64");
        links.push(
          `<link rel="${
            v == 16 ? "icon" : "apple-touch-icon"
          }" type="image/webp" sizes="${v}x${v}" href="data:image/webp;base64,${base64}">`,
        );
      }

      return html.replace('<link rel="icon" />', links.join("\n"));
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), favIconPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
