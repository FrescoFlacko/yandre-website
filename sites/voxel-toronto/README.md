# Voxel Toronto

Yanique Andre's journey told as a voxel city: Brampton, the University of Guelph, and downtown Toronto, connected by a gold path. A little voxel avatar walks the path while a subway-line nav steps through each chapter.

## Run it

```bash
cd sites/voxel-toronto
npm install
npm run dev      # local dev server
npm run build    # writes one self-contained dist/index.html
```

`dist/index.html` has everything inlined (Three.js included), so it can be opened from disk or dropped on any static host.

## Edit the content

All text lives in [`src/data/profile.js`](src/data/profile.js), taken from Yan's LinkedIn profile. Each chapter points at a `landmark` defined in [`src/world/city.js`](src/world/city.js) (`LANDMARKS` holds the camera framing, `TRAIL` the path the avatar walks).

## What's in the city

- **Brampton**: Flower City garden, fountain, clock tower, suburban grid, Codewater Tech office by the GO line
- **Guelph**: Johnston Hall and its clock tower, The Cannon (repainted, as tradition demands), the Basilica on its hill, farmland and the Speed River
- **Toronto**: Union Station, First Canadian Place (BMO's tower, with a window-washer gondola for the promotion chapters), TD, Scotia and Royal Bank plazas, City Hall and the TORONTO sign, CN Tower with colour-cycling night lights, Rogers Centre, the Distillery District, Sugar Beach, the Gardiner, the Islands and Billy Bishop
- **Moving parts**: TTC streetcars on King, a push-pull GO train, traffic on the 401 and Gardiner, the island ferry, sailboats, clouds and a plane over Pearson
- **Controls**: day / dusk / night, four seasons (defaults to the current one), snowfall, and a plain-text reading mode

The map is stylized and compressed, not to scale.

## Stack

Vite, Three.js, and a small hand-written voxel mesher (hidden-face culling plus per-vertex ambient occlusion) in `src/world/voxels.js`.
