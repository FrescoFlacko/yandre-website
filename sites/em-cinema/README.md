# Yanique Andre, in Three Acts

A cinematic portfolio: a title card, a pinned prologue, three acts (Origin, The Rise, Leadership) told as screenplay scenes, side projects as short films, and rolling end credits. Scroll drives the motion (CSS scroll-driven animations where supported, with content fully visible without them), and a HUD tracks the current act and date.

All content lives in [`src/data.js`](src/data.js), taken from Yan's LinkedIn profile.

## Build

No dependencies. Node 18+.

```sh
npm run build   # writes dist/index.html (full page) and dist/artifact.html (claude.ai Artifact body)
```
