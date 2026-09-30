import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Everything is inlined into one HTML file so the site can be hosted
// anywhere, including as a single private claude.ai artifact.
export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
});
