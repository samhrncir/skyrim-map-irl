import { categoryForPlace } from './categories.js';

// Fields requested on every search. `rating` and `userRatingCount` are Enterprise-SKU
// fields (1,000 free calls/month); remove them to bill searches at the cheaper Pro SKU.
export const PLACE_FIELDS = [
  'id', 'displayName', 'location', 'formattedAddress', 'primaryType', 'types',
  'rating', 'userRatingCount', 'googleMapsURI',
];

const MAX_RESULTS = 20; // the API's ceiling per request

/** Flattens a google.maps.places.Place into a plain record that can be stored as JSON. */
export function toRecord(place, categoryKey) {
  const types = place.types ?? [];
  return {
    id: place.id,
    name: place.displayName || 'Unknown place',
    lat: place.location.lat(),
    lng: place.location.lng(),
    address: place.formattedAddress || '',
    primaryType: place.primaryType ?? null,
    types,
    rating: place.rating ?? null,
    ratingCount: place.userRatingCount ?? null,
    mapsUri: place.googleMapsURI ?? null,
    category: categoryKey ?? categoryForPlace(place.primaryType, types).key,
  };
}

/** Places of one category around a point. `radius` in metres (≤ 50 km). */
export async function searchNearby({ center, radius, category }) {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places');
  const { places } = await Place.searchNearby({
    fields: PLACE_FIELDS,
    locationRestriction: { center, radius },
    includedPrimaryTypes: category.types,
    maxResultCount: MAX_RESULTS,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
  });
  return places.filter((p) => p.location).map((p) => toRecord(p, category.key));
}

/** Free-text search, biased toward the given map bounds. */
export async function searchText({ query, bounds }) {
  const { Place } = await google.maps.importLibrary('places');
  const { places } = await Place.searchByText({
    textQuery: query,
    fields: PLACE_FIELDS,
    locationBias: bounds ?? undefined,
    maxResultCount: MAX_RESULTS,
  });
  return places.filter((p) => p.location).map((p) => toRecord(p));
}

/** Google Maps directions to a record — the closest thing to fast travel. */
export function directionsUrl(record) {
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', `${record.lat},${record.lng}`);
  if (record.id) url.searchParams.set('destination_place_id', record.id);
  return url.toString();
}
