# Yandre Quest

Yanique Andre's career as a playable pixel-art RPG. Walk from home in
Brampton to Guelph, Toronto and the BMO tower, enter seven buildings to
collect badges, and open the menu for skills, projects and a trainer card.
A plain résumé sits below the game for anyone who wants to skip it.

Stack: Vite + TypeScript and a 2D canvas, no framework and no image assets
(all pixel art is drawn in code). The build inlines everything into one
`dist/index.html`.

```sh
npm install
npm run dev     # local dev server
npm run build   # dist/index.html (standalone) and dist/artifact.html (claude.ai artifact)
```

## Where things live

- `src/profile.ts`: every fact and line of copy, from Yanique's LinkedIn.
- `src/world.ts`: the map, buildings, signs, NPCs and their dialogue.
- `src/render.ts`: pixel art for tiles, buildings and characters.
- `src/main.ts`: game loop, controls, menu and the résumé section.

Controls: arrows or WASD to walk, Z/Space to talk, X to go back, Enter for
the menu. On phones, use the on-screen pad.
