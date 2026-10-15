// A cold, desaturated look in the spirit of Skyrim's in-game world map:
// dark slate land, near-black water, pale roads, no Google POI clutter.

export const SKYRIM_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#2c363d' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c6d0d6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1114' }, { weight: 2.5 }] },

  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#5a6a74' }, { weight: 0.6 }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e4eaee' }] },

  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#34414a' }] },
  { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#4f5e68' }, { lightness: 8 }] },
  { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: '#3a4850' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#2f3a41' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#33443f' }] },

  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#5d6b74' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#aab7be' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#6c7b85' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#86959e' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#131c22' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b8290' }] },
];

/** Terrain tiles stop at this zoom; past it we fall back to the (identically styled) roadmap. */
export const TERRAIN_MAX_ZOOM = 15;

export function mapOptions({ center, zoom }) {
  return {
    center,
    zoom,
    mapTypeId: zoom >= TERRAIN_MAX_ZOOM ? 'roadmap' : 'terrain',
    styles: SKYRIM_MAP_STYLE,
    backgroundColor: '#1a2228',
    disableDefaultUI: true,
    keyboardShortcuts: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    minZoom: 3,
  };
}
