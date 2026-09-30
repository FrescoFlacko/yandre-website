// Inlines src/ into two self-contained pages:
//   dist/index.html    full HTML document (open locally or host anywhere)
//   dist/artifact.html body fragment for publishing as a claude.ai Artifact
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = (f) => readFileSync(new URL(`./src/${f}`, import.meta.url), "utf8");
const page = src("index.html")
  .replace("/*@@CSS@@*/", () => src("styles.css"))
  .replace("/*@@DATA@@*/", () => src("data.js"))
  .replace("/*@@APP@@*/", () => src("app.js"));

const dist = new URL("./dist/", import.meta.url);
mkdirSync(dist, { recursive: true });
writeFileSync(new URL("artifact.html", dist), page);
writeFileSync(
  new URL("index.html", dist),
  `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${page}\n</body>\n</html>\n`
);
console.log(`built dist/index.html and dist/artifact.html (${(page.length / 1024).toFixed(1)} KB)`);
