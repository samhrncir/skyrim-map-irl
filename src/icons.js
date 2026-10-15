// Single-colour silhouette glyphs in the style of Skyrim's map markers (24×24 viewBox).

const path = (d, attrs = '') => `<path ${attrs} d="${d}"/>`;
const EVENODD = 'fill-rule="evenodd"';

export const ICONS = {
  tankard:
    path('M5 7h10v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z') +
    path('M15 9h2a3 3 0 0 1 0 6h-2v-2h2a1 1 0 0 0 0-2h-2z') +
    '<circle cx="7" cy="6" r="2"/><circle cx="10.5" cy="5" r="2.2"/><circle cx="14" cy="6" r="2"/>',
  house: path('M12 3 2 11h3v9h5v-6h4v6h5v-9h3z'),
  stall: path('M2 4h20l1.5 5H.5z') + path('M4 10h16v3H4z') + path('M5 13h3v7H5zM16 13h3v7h-3z'),
  flask: path('M9 2h6v2h-1v3.2l4.5 7.3A4 4 0 0 1 15.1 21H8.9a4 4 0 0 1-3.4-6.5L10 7.2V4H9z'),
  sun:
    '<circle cx="12" cy="12" r="4"/>' +
    path('M11 2h2v4h-2zM11 18h2v4h-2zM2 11h4v2H2zM18 11h4v2h-4zM4.9 6.3l1.4-1.4 2.9 2.9-1.4 1.4zM15.6 17l1.4-1.4 2.9 2.9-1.4 1.4zM4.9 17.7l2.9-2.9 1.4 1.4-2.9 2.9zM15.6 7l2.9-2.9 1.4 1.4-2.9 2.9z'),
  temple:
    path('M12 2 4 7v1h16V7z') + path('M5 9h14v2H5z') + path('M6 12h2v7H6zM11 12h2v7h-2zM16 12h2v7h-2z') + path('M4 20h16v2H4z'),
  horseshoe: path('M12 3a8 8 0 0 0-8 8v8h3v-8a5 5 0 0 1 10 0v8h3v-8a8 8 0 0 0-8-8z'),
  anvil: path('M4 6h17v3h-5v2c0 1.5 1.5 2.5 3 2.5V16H5v-2.5c1.5 0 3-1 3-2.5V9H6L2 7z') + path('M4 17h16v3H4z'),
  tree: path('M12 2 6 10h3l-4 6h5v4h4v-4h5l-4-6h3z'),
  book: path('M2 5c3-1.5 6-1.5 9 0v14c-3-1.5-6-1.5-9 0zM13 5c3-1.5 6-1.5 9 0v14c-3-1.5-6-1.5-9 0z'),
  sword: path('M12 1l2.5 2.5V13h1.5v2h-1.5v1l-1.5 1.5V22h-2v-4.5L9.5 16v-1H8v-2h1.5V3.5z'),
  chest:
    path('M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3H3z') +
    path('M3 11h18v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm8 2h2v3h-2z', EVENODD),
  stone: path('M8 2h8l2 20H6zm4 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', EVENODD),
  anchor: path(
    'M12 2a2.5 2.5 0 0 0-1 4.8V8H8v2h3v8.9A7 7 0 0 1 5.1 13H3a9 9 0 0 0 18 0h-2.1A7 7 0 0 1 13 18.9V10h3V8h-3V6.8A2.5 2.5 0 0 0 12 2zm0 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    EVENODD,
  ),
  tent: path('M12 3 1 20h22zm0 6 5 9H7z', EVENODD),
  wagon:
    path('M3 7h12l2 6h4v4h-1.5a2.5 2.5 0 0 0-5 0h-5a2.5 2.5 0 0 0-5 0H3z') +
    '<circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  fort: path('M3 4h3v3h3V4h6v3h3V4h3v16H3zm7 16v-5a2 2 0 0 1 4 0v5z', EVENODD),
  banner: path('M5 2h2v20H5zM7 3h12l-3 4 3 4H7z'),
  player: path('M12 2 20 20 12 16 4 20z'),
};

export function svgIcon(key) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key] ?? ICONS.banner}</svg>`;
}
