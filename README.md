# Skyrim Map IRL

Google Maps dressed up as the Skyrim world map: cold slate terrain, drifting fog,
white glyph markers, a Futura-style menu, key hints along the bottom, and
"Location discovered" toasts. Search for nearby places by Nord-flavoured category
(Taverns, Apothecaries, Blacksmiths, Standing Stones…), favorite them, and
"fast travel" (open directions in Google Maps).

## Setup

1. In [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
   create an API key and enable **Maps JavaScript API** and **Places API (New)**.
   Restrict the key to HTTP referrers (e.g. `http://localhost:5190/*`).
2. Copy `.env.example` to `.env` and paste the key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your-key
   ```
3. Install and run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:5190 and allow location access so the player arrow finds you.
   Without it you wake up in Bergen, Norway.

## Controls

| Key | Action |
| --- | --- |
| `/` | Focus the search box (Enter searches the visible area) |
| `E` | Select the hovered marker or list item |
| `F` | Favorite / unfavorite the selected place |
| `T` | Fast travel — open directions in Google Maps |
| `R` | Re-run the last search where the map is now |
| `M` | Center on your position |
| `C` | Toggle the fog |
| `P` | Show/hide the list panel (small screens) |
| `Esc` | Deselect / leave the search box |

Click a category on the right to search around the center of the map. Search
results appear as dim "undiscovered" markers; favorites are bright "discovered"
markers with a diamond, and persist in `localStorage`.

## Cost notes

Each category click or text search is one Places API (New) request. The
request asks for `rating` and `userRatingCount`, which bills at the
*Enterprise* SKU (1,000 free requests/month at the time of writing). Remove
those two entries from `PLACE_FIELDS` in `src/places.js` to use the cheaper
*Pro* SKU (5,000 free/month) and lose the star ratings.

## Project layout

```
index.html          page shell: map, panels, hints, modals
src/main.js         app state, search flows, keyboard/click wiring, boot
src/map-style.js    JSON map style + map options (terrain → roadmap past zoom 15)
src/marker.js       OverlayView markers (place glyphs + player arrow)
src/places.js       Places API (New) wrappers, record shape, directions URL
src/categories.js   Skyrim-named categories → Google place types
src/icons.js        SVG glyphs
src/favorites.js    localStorage-backed favorites store
src/geo.js          distances, units, viewport radius
src/ui.js           toasts, modal, list/detail rendering
src/styles.css      the theme
```
