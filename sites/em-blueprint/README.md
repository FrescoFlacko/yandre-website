# Systems Blueprint

Yanique Andre's engineering leadership portfolio, drawn as a system blueprint:

- **Title block** with name, current role and the Franklin quote from the LinkedIn About section.
- **Architecture**: the career as a to-scale architecture diagram (one column per year). Each box is a role or project; the solid bar beneath it is its true duration. Click a box to read its spec sheet.
- **Ops console**: a working terminal (`help`, `ls`, `describe lead`, `metrics`, `uptime`, `sudo hire yan`, Tab completion, ↑/↓ history).
- **Telemetry**: impact figures, each traced back to the role it came from.
- **Revision log**: every change to the system, oldest first.

Blueprint (dark) and whiteprint (light) themes follow the viewer's color scheme.

## Content

All profile content lives in [`src/data.js`](src/data.js). Set `pending: true` on any entry to render it as a red redline placeholder.

## Build

No dependencies. Node 18+.

```sh
npm run build   # writes dist/index.html (full page) and dist/artifact.html (claude.ai Artifact body)
```

Open `dist/index.html` directly in a browser, or host it on any static host.
