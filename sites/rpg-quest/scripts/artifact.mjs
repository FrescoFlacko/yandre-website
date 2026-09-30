// Turns the single-file build into an artifact page: the artifact host adds
// its own doctype/html/head/body skeleton, so strip ours and keep the rest.
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
const keptHead = head.replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/gi, "");
writeFileSync("dist/artifact.html", `${keptHead.trim()}\n${body.trim()}\n`);
console.log("wrote dist/artifact.html");
