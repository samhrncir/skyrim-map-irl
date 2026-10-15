// Nearby-search categories, named the way a Nord would name them.
// `types` are Google Places (New) "Table A" types, usable as includedPrimaryTypes.
// Order matters: the first category whose types match a place wins when inferring.

export const CATEGORIES = [
  { key: 'tavern', label: 'Taverns', icon: 'tankard',
    types: ['restaurant', 'bar', 'cafe', 'coffee_shop', 'pub', 'bar_and_grill', 'wine_bar', 'bakery', 'diner', 'fast_food_restaurant', 'pizza_restaurant', 'tea_house'] },
  { key: 'inn', label: 'Inns', icon: 'house',
    types: ['lodging', 'hotel', 'motel', 'inn', 'bed_and_breakfast', 'hostel', 'guest_house', 'extended_stay_hotel', 'resort_hotel', 'cottage'] },
  { key: 'merchant', label: 'Merchants', icon: 'stall',
    types: ['store', 'shopping_mall', 'supermarket', 'grocery_store', 'convenience_store', 'clothing_store', 'department_store', 'market', 'gift_shop', 'book_store', 'electronics_store', 'liquor_store', 'home_goods_store', 'jewelry_store', 'sporting_goods_store', 'butcher_shop', 'food_store'] },
  { key: 'apothecary', label: 'Apothecaries', icon: 'flask',
    types: ['pharmacy', 'drugstore'] },
  { key: 'healer', label: 'Healers', icon: 'sun',
    types: ['hospital', 'doctor', 'dental_clinic', 'dentist', 'medical_lab', 'physiotherapist', 'wellness_center', 'chiropractor', 'spa'] },
  { key: 'temple', label: 'Temples', icon: 'temple',
    types: ['church', 'hindu_temple', 'mosque', 'synagogue'] },
  { key: 'stable', label: 'Stables', icon: 'horseshoe',
    types: ['gas_station', 'electric_vehicle_charging_station', 'parking', 'car_rental', 'rest_stop', 'park_and_ride'] },
  { key: 'smith', label: 'Blacksmiths', icon: 'anvil',
    types: ['car_repair', 'hardware_store', 'auto_parts_store', 'car_wash', 'car_dealer', 'home_improvement_store'] },
  { key: 'grove', label: 'Groves', icon: 'tree',
    types: ['park', 'national_park', 'state_park', 'garden', 'botanical_garden', 'hiking_area', 'dog_park', 'playground', 'picnic_ground', 'wildlife_refuge', 'plaza'] },
  { key: 'college', label: 'Halls of Learning', icon: 'book',
    types: ['library', 'school', 'university', 'primary_school', 'secondary_school', 'preschool'] },
  { key: 'arena', label: 'Training Grounds', icon: 'sword',
    types: ['gym', 'fitness_center', 'sports_complex', 'stadium', 'swimming_pool', 'ice_skating_rink', 'golf_course', 'ski_resort', 'arena', 'athletic_field', 'sports_club'] },
  { key: 'vault', label: 'Vaults', icon: 'chest',
    types: ['bank', 'atm'] },
  { key: 'stone', label: 'Standing Stones', icon: 'stone',
    types: ['tourist_attraction', 'historical_landmark', 'monument', 'museum', 'art_gallery', 'historical_place', 'sculpture', 'observation_deck', 'cultural_landmark', 'visitor_center'] },
  { key: 'dock', label: 'Docks', icon: 'anchor',
    types: ['marina', 'ferry_terminal', 'beach'] },
  { key: 'camp', label: 'Camps', icon: 'tent',
    types: ['campground', 'rv_park', 'camping_cabin', 'farmstay'] },
  { key: 'carriage', label: 'Carriages', icon: 'wagon',
    types: ['bus_station', 'train_station', 'transit_station', 'subway_station', 'light_rail_station', 'airport', 'international_airport', 'bus_stop', 'taxi_stand'] },
  { key: 'fort', label: 'Forts', icon: 'fort',
    types: ['police', 'courthouse', 'city_hall', 'fire_station', 'local_government_office', 'government_office', 'post_office', 'embassy'] },
];

export const LANDMARK = { key: 'landmark', label: 'Landmark', icon: 'banner', types: [] };

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));
const BY_TYPE = new Map();
for (const c of CATEGORIES) for (const t of c.types) if (!BY_TYPE.has(t)) BY_TYPE.set(t, c);

// Types Google returns but won't accept as search filters; still useful for inference.
BY_TYPE.set('place_of_worship', BY_KEY.get('temple'));
BY_TYPE.set('food', BY_KEY.get('tavern'));
BY_TYPE.set('health', BY_KEY.get('healer'));
BY_TYPE.set('finance', BY_KEY.get('vault'));

export function categoryByKey(key) {
  return BY_KEY.get(key) ?? LANDMARK;
}

/** Best category for a place: its primary type first, then any of its types. */
export function categoryForPlace(primaryType, types = []) {
  if (primaryType && BY_TYPE.has(primaryType)) return BY_TYPE.get(primaryType);
  for (const t of types) if (BY_TYPE.has(t)) return BY_TYPE.get(t);
  return LANDMARK;
}
