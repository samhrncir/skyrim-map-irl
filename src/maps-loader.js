// Loads the Google Maps JavaScript API with Google's dynamic-library bootstrap.
// After `loadGoogleMaps()` resolves, `google.maps.importLibrary(...)` is available.

function bootstrap(key) {
  if (globalThis.google?.maps?.importLibrary) return;
  // Official loader snippet: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
  // prettier-ignore
  (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({ key, v: "weekly" });
}

/** Resolves with the `maps` and `places` libraries once the API is ready. */
export async function loadGoogleMaps(key) {
  bootstrap(key);
  const [maps, places] = await Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('places'),
  ]);
  return { maps, places };
}
