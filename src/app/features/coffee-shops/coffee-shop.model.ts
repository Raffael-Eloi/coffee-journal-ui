/** 1 V60, 2 Espresso, 3 AeroPress, 4 FrenchPress, 5 Chemex, 6 MokaPot, 7 ColdBrew, 8 Siphon. */
export type CoffeeBrewingMethod = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const BREWING_METHODS: readonly CoffeeBrewingMethod[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** 1 WiFi, 2 AirConditioning, 3 PetFriendly, 4 OutdoorSeating, 5 PowerOutlets, 6 VeganOptions, 7 WheelchairAccessible. */
/** Material Symbols icon of each brewing method (see `app-symbol`). */
export const BREWING_METHOD_ICONS: Record<CoffeeBrewingMethod, string> = {
  1: 'filter_alt',
  2: 'coffee_maker',
  3: 'compress',
  4: 'hourglass_bottom',
  5: 'science',
  6: 'local_fire_department',
  7: 'ac_unit',
  8: 'experiment',
};

export type Amenity = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const AMENITIES: readonly Amenity[] = [1, 2, 3, 4, 5, 6, 7];

/** 0 Sunday to 6 Saturday. */
/** Material Symbols icon of each amenity (see `app-symbol`). */
export const AMENITY_ICONS: Record<Amenity, string> = {
  1: 'wifi',
  2: 'mode_fan',
  3: 'pets',
  4: 'deck',
  5: 'power',
  6: 'psychiatry',
  7: 'accessible',
};

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DAYS_OF_WEEK: readonly DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

/** One window in which the shop is open. A `closesAt` earlier than `opensAt` means it closes after midnight. */
export interface OpeningHours {
  dayOfWeek: DayOfWeek;
  /** `HH:mm:ss`. */
  opensAt: string;
  /** `HH:mm:ss`. */
  closesAt: string;
}

export interface CoffeeShop {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  instagramUrl: string | null;
  phoneNumber: string | null;
  city: string;
  state: string;
  country: string;
  address: string;
  /** IANA time zone, for example `America/Sao_Paulo`. */
  timeZone: string;
  roasterIds: string[];
  brewingMethods: CoffeeBrewingMethod[];
  amenities: Amenity[];
  openingHours: OpeningHours[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

/** Payload sent to the API when creating or replacing a coffee shop. */
export type CoffeeShopInput = Omit<CoffeeShop, 'id' | 'createdAt' | 'updatedAt'>;
