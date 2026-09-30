# YANDRE Magazine (engineering manager portfolio)

Yanique Andre's portfolio told as a magazine issue: cover, contents, cover
story, chronology, numbers, playbook, kit, questions and a back page.

Stack: Vite + TypeScript, no framework. The build inlines everything into a
single `dist/index.html`, so it can be hosted anywhere.

```sh
npm install
npm run dev     # local dev server
npm run build   # dist/index.html (standalone) and dist/artifact.html (claude.ai artifact)
```

## Editing content

All copy lives in `src/profile.ts`. Text wrapped in `{{double braces}}` is an
unconfirmed placeholder and renders with a yellow "TBC" highlight. Replace it
with real details from LinkedIn and drop the braces.
