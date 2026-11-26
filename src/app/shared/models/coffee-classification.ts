/** 1 Traditional, 2 Superior, 3 Gourmet, 4 Specialty. Sent and received as the number. */
export type CoffeeClassification = 1 | 2 | 3 | 4;

/** Material Symbols icon of each classification (see `app-symbol`). */
export const COFFEE_CLASSIFICATION_ICONS: Record<CoffeeClassification, string> = {
  1: 'local_cafe',
  2: 'local_cafe',
  3: 'auto_awesome',
  4: 'star',
};

export const COFFEE_CLASSIFICATIONS: readonly CoffeeClassification[] = [1, 2, 3, 4];
