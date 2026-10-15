const EARTH_RADIUS_M = 6371008.8;

/** Great-circle distance in metres between two {lat, lng} points. */
export function distanceMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s));
}

// Countries that still sign their roads in miles.
export const USE_MILES = /-(US|GB|LR|MM)$/i.test(navigator.language || '');

export function formatDistance(m) {
  if (!Number.isFinite(m)) return '';
  if (USE_MILES) {
    const mi = m / 1609.344;
    if (mi < 0.1) return `${Math.round(m * 3.28084)} ft`;
    return `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
  }
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** A search radius that roughly covers the visible map, within the Places API limits. */
export function radiusForViewport(map) {
  const bounds = map.getBounds();
  if (!bounds) return 1500;
  const c = map.getCenter();
  const ne = bounds.getNorthEast();
  const r = distanceMeters({ lat: c.lat(), lng: c.lng() }, { lat: ne.lat(), lng: ne.lng() });
  return Math.min(50000, Math.max(150, Math.round(r * 0.8)));
}
