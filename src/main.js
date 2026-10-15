import { loadGoogleMaps } from './maps-loader.js';
import { mapOptions, TERRAIN_MAX_ZOOM } from './map-style.js';
import { CATEGORIES, categoryByKey } from './categories.js';
import { createMarkerClasses } from './marker.js';
import { searchNearby, searchText, directionsUrl } from './places.js';
import { FavoritesStore } from './favorites.js';
import { distanceMeters, formatDistance, radiusForViewport } from './geo.js';
import {
  $, escapeHtml, toast, showBlocker, confirmModal,
  renderPlaceList, renderCategories, setCategoryState, renderDetail,
} from './ui.js';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const VIEW_KEY = 'skyrim-map:view';
const FOG_KEY = 'skyrim-map:fog';
// Where you wake up when your position is unknown: Bergen, Norway — close enough to Skyrim.
const DEFAULT_VIEW = { lat: 60.3913, lng: 5.3221, zoom: 13 };

const isSmallScreen = () => matchMedia('(max-width: 860px)').matches;
const latLng = (r) => ({ lat: r.lat, lng: r.lng });

const favorites = new FavoritesStore();

const state = {
  map: null,
  Marker: null,       // SkyrimMarker class, built once the API has loaded
  Player: null,       // PlayerMarker class
  markers: new Map(), // place id → SkyrimMarker
  player: null,       // PlayerMarker instance
  playerPos: null,    // { lat, lng }
  results: [],
  selectedId: null,
  hoveredId: null,
  activeCategory: null,
  lastSearch: null,   // { kind: 'category', key } | { kind: 'text', query }
};

const els = {
  results: $('#list-results'),
  favorites: $('#list-favorites'),
  categories: $('#list-categories'),
  detail: $('#detail'),
  searchForm: $('#search-form'),
  searchInput: $('#search-input'),
  fog: $('.fx-fog'),
  hintFav: $('[data-action="toggle-favorite"]'),
  hintFog: $('[data-action="toggle-fog"]'),
};

// ───────────────────────────── helpers ─────────────────────────────

function refPoint() {
  if (state.playerPos) return state.playerPos;
  const c = state.map.getCenter();
  return { lat: c.lat(), lng: c.lng() };
}

const distanceText = (record) => formatDistance(distanceMeters(refPoint(), record));
const subtitle = (record) => `${categoryByKey(record.category).label}  ·  ${distanceText(record)}`;
const findRecord = (id) => state.results.find((r) => r.id === id) ?? favorites.get(id) ?? null;

function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode etc. */ }
}

function saveView() {
  const c = state.map.getCenter();
  writeStorage(VIEW_KEY, JSON.stringify({ lat: c.lat(), lng: c.lng(), zoom: state.map.getZoom() }));
}

function loadView() {
  try {
    const v = JSON.parse(readStorage(VIEW_KEY));
    return Number.isFinite(v?.lat) && Number.isFinite(v?.lng) && Number.isFinite(v?.zoom) ? v : null;
  } catch { return null; }
}

// ───────────────────────────── rendering ─────────────────────────────

/** One marker per unique place across results and favorites; favorites render "discovered". */
function syncMarkers() {
  const wanted = new Map();
  for (const r of state.results) wanted.set(r.id, r);
  for (const r of favorites.all()) wanted.set(r.id, r);

  for (const [id, marker] of state.markers) {
    if (wanted.has(id)) continue;
    marker.setMap(null);
    state.markers.delete(id);
  }
  for (const [id, r] of wanted) {
    let marker = state.markers.get(id);
    if (!marker) {
      marker = new state.Marker({
        position: new google.maps.LatLng(r.lat, r.lng),
        icon: categoryByKey(r.category).icon,
        name: r.name,
        onClick: () => select(id),
        onHover: (_, on) => setHovered(id, on),
      });
      marker.setMap(state.map);
      state.markers.set(id, marker);
    }
    marker.setSub(subtitle(r));
    marker.setFav(favorites.has(id));
    marker.setSelected(id === state.selectedId);
  }
}

function renderLists() {
  const shared = {
    activeId: state.selectedId,
    subtitle,
    isFav: (r) => favorites.has(r.id),
    onClick: (r) => { select(r.id); panTo(r); },
    onHover: (r, on) => setHovered(r.id, on),
  };
  renderPlaceList(els.results, state.results, { ...shared, emptyText: 'No locations yet. Choose a category or search the land.' });
  renderPlaceList(els.favorites, favorites.all(), { ...shared, emptyText: 'Nothing discovered yet. Select a place and press F.' });
}

function renderSelection() {
  const record = findRecord(state.selectedId);
  const isFav = !!record && favorites.has(record.id);
  renderDetail(els.detail, record, { distanceText: record ? distanceText(record) : '', isFav });
  els.hintFav.innerHTML = `<kbd>F</kbd> ${isFav ? 'Unfavorite' : 'Favorite'}`;
  for (const [id, m] of state.markers) m.setSelected(id === state.selectedId);
  for (const li of document.querySelectorAll('.panel--left .list li[data-id]')) {
    li.classList.toggle('is-active', li.dataset.id === state.selectedId);
  }
}

function renderAll() {
  syncMarkers();
  renderLists();
  renderSelection();
}

// ───────────────────────────── actions ─────────────────────────────

function select(id) {
  state.selectedId = id;
  if (isSmallScreen()) document.body.classList.remove('show-panels'); // make room for the card
  renderSelection();
}

function deselect() {
  if (state.selectedId === null) return;
  state.selectedId = null;
  renderSelection();
}

function setHovered(id, on) {
  if (on) state.hoveredId = id;
  else if (state.hoveredId === id) state.hoveredId = null;
  state.markers.get(id)?.setHovered(on);
  for (const li of document.querySelectorAll(`.panel--left .list li[data-id="${CSS.escape(id)}"]`)) {
    li.classList.toggle('is-hovered', on);
  }
}

function panTo(record) {
  const pos = latLng(record);
  if (!state.map.getBounds()?.contains(pos)) state.map.panTo(pos);
  if (state.map.getZoom() < 13) state.map.setZoom(14);
}

function toggleFavorite() {
  const record = findRecord(state.selectedId);
  if (!record) return toast('Select a location first');
  const nowFav = favorites.toggle(record); // store emits 'change' → renderAll
  toast(nowFav ? 'Location discovered' : 'Location forgotten', record.name);
}

async function fastTravel() {
  const record = findRecord(state.selectedId);
  if (!record) return toast('Select a location first');
  if (await confirmModal(`Fast travel to ${record.name}?`)) {
    window.open(directionsUrl(record), '_blank', 'noopener');
  }
}

function locate() {
  if (!state.playerPos) return toast('Your position is unknown', 'Allow location access to find yourself');
  state.map.panTo(state.playerPos);
  if (state.map.getZoom() < 14) state.map.setZoom(15);
}

function setTab(tab) {
  for (const b of document.querySelectorAll('.tab')) b.classList.toggle('is-active', b.dataset.tab === tab);
  for (const p of document.querySelectorAll('[data-tab-panel]')) p.classList.toggle('is-hidden', p.dataset.tabPanel !== tab);
}

function setFog(on) {
  els.fog.classList.toggle('is-off', !on);
  els.hintFog.classList.toggle('is-on', on);
  writeStorage(FOG_KEY, on ? '1' : '0');
}

// ───────────────────────────── search ─────────────────────────────

let searchSeq = 0;

async function runSearch(search) {
  if (!state.map) return toast('The map is still loading');
  const seq = ++searchSeq;
  state.lastSearch = search;
  state.activeCategory = search.kind === 'category' ? search.key : null;
  setCategoryState(els.categories, { activeKey: state.activeCategory, loadingKey: state.activeCategory });
  const label = search.kind === 'category' ? categoryByKey(search.key).label : search.query;

  try {
    const results = search.kind === 'category'
      ? await searchNearby({ center: state.map.getCenter(), radius: radiusForViewport(state.map), category: categoryByKey(search.key) })
      : await searchText({ query: search.query, bounds: state.map.getBounds() });
    if (seq !== searchSeq) return; // a newer search has superseded this one

    state.results = results;
    if (state.selectedId && !findRecord(state.selectedId)) state.selectedId = null;
    setTab('results');
    if (isSmallScreen()) document.body.classList.toggle('show-panels', results.length > 0);
    renderAll();
    toast(results.length ? `${results.length} location${results.length === 1 ? '' : 's'} found` : 'Nothing found in these lands', label);
    if (results.length) showResults(results);
  } catch (err) {
    console.error('Search failed', err);
    if (seq === searchSeq) toast('The search failed', String(err?.message ?? err).slice(0, 90));
  } finally {
    if (seq === searchSeq) setCategoryState(els.categories, { activeKey: state.activeCategory, loadingKey: null });
  }
}

/** Brings results into view without jumping if they are already visible. */
function showResults(results) {
  const view = state.map.getBounds();
  if (view && results.every((r) => view.contains(latLng(r)))) return;
  if (results.length === 1) {
    state.map.panTo(latLng(results[0]));
    if (state.map.getZoom() < 14) state.map.setZoom(15);
    return;
  }
  const bounds = new google.maps.LatLngBounds();
  for (const r of results) bounds.extend(latLng(r));
  const side = isSmallScreen() ? 24 : 330;
  state.map.fitBounds(bounds, { top: 110, bottom: 150, left: side, right: side });
}

function research() {
  if (!state.lastSearch) return toast('Choose a category first');
  runSearch(state.lastSearch);
}

// ───────────────────────────── geolocation ─────────────────────────────

function watchPlayer(centerOnFirstFix) {
  if (!('geolocation' in navigator)) return toast('Your position is unknown', 'This browser has no geolocation');
  let first = true;
  navigator.geolocation.watchPosition(
    ({ coords }) => {
      state.playerPos = { lat: coords.latitude, lng: coords.longitude };
      const pos = new google.maps.LatLng(state.playerPos);
      if (state.player) {
        state.player.setPosition(pos);
      } else {
        state.player = new state.Player(pos);
        state.player.setMap(state.map);
      }
      state.player.setHeading(coords.heading);
      if (first && centerOnFirstFix) {
        state.map.setCenter(pos);
        state.map.setZoom(15);
      }
      first = false;
      syncMarkers(); // distances are measured from the player
      renderSelection();
    },
    (err) => {
      if (!first) return;
      first = false;
      toast('Your position is unknown', err.code === err.PERMISSION_DENIED ? 'Location access was denied' : 'Could not determine your location');
    },
    { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
  );
}

// ───────────────────────────── input ─────────────────────────────

const withMap = (fn) => () => (state.map ? fn() : toast('The map is still loading'));

const ACTIONS = {
  'focus-search': () => els.searchInput.focus(),
  'select-hovered': () => { if (state.hoveredId) select(state.hoveredId); },
  'toggle-favorite': toggleFavorite,
  'fast-travel': fastTravel,
  research: withMap(research),
  locate: withMap(locate),
  'toggle-fog': () => setFog(els.fog.classList.contains('is-off')),
  'toggle-panels': () => document.body.classList.toggle('show-panels'),
  deselect,
  'zoom-in': withMap(() => state.map.setZoom(state.map.getZoom() + 1)),
  'zoom-out': withMap(() => state.map.setZoom(state.map.getZoom() - 1)),
};

const KEYS = { '/': 'focus-search', e: 'select-hovered', f: 'toggle-favorite', t: 'fast-travel', r: 'research', m: 'locate', c: 'toggle-fog', p: 'toggle-panels' };

function wireInput() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !ACTIONS[btn.dataset.action]) return;
    ACTIONS[btn.dataset.action]();
    btn.blur(); // so the next key press is not swallowed by the focused button
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = e.target.matches('input, textarea');
    if (e.key === 'Escape') {
      if (typing) e.target.blur();
      else deselect();
      return;
    }
    if (typing) return;
    const action = KEYS[e.key.toLowerCase()];
    if (!action) return;
    e.preventDefault();
    ACTIONS[action]();
  });

  for (const b of document.querySelectorAll('.tab')) b.addEventListener('click', () => setTab(b.dataset.tab));

  els.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;
    els.searchInput.blur();
    runSearch({ kind: 'text', query });
  });

  renderCategories(els.categories, CATEGORIES, { onClick: (c) => runSearch({ kind: 'category', key: c.key }) });
  favorites.addEventListener('change', renderAll);
  setFog(readStorage(FOG_KEY) !== '0');
}

// ───────────────────────────── boot ─────────────────────────────

const KEY_HELP =
  'Put your Google Maps key in a <code>.env</code> file in the project root:<br>' +
  '<code>VITE_GOOGLE_MAPS_API_KEY=your-key</code><br>' +
  'then restart <code>npm run dev</code>. The key needs <b>Maps JavaScript API</b> and <b>Places API (New)</b> enabled.';

async function main() {
  wireInput();
  if (!API_KEY) return showBlocker('A key is required', KEY_HELP);

  window.gm_authFailure = () => showBlocker('The key was refused', 'Google rejected this API key. ' + KEY_HELP);
  try {
    await loadGoogleMaps(API_KEY);
  } catch (err) {
    return showBlocker('The map could not be summoned', escapeHtml(err.message));
  }

  const savedView = loadView();
  const view = savedView ?? DEFAULT_VIEW;
  state.map = new google.maps.Map($('#map'), mapOptions({ center: { lat: view.lat, lng: view.lng }, zoom: view.zoom }));
  ({ SkyrimMarker: state.Marker, PlayerMarker: state.Player } = createMarkerClasses());

  state.map.addListener('idle', saveView);
  state.map.addListener('click', deselect);
  state.map.addListener('zoom_changed', () => {
    const want = state.map.getZoom() >= TERRAIN_MAX_ZOOM ? 'roadmap' : 'terrain';
    if (state.map.getMapTypeId() !== want) state.map.setMapTypeId(want);
  });

  renderAll();
  watchPlayer(!savedView);
}

main().catch((err) => {
  console.error(err);
  showBlocker('Something went wrong', escapeHtml(err.message));
});
