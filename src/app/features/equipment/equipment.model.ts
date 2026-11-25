/** 1 Daily, 2 Weekly, 3 EveryTwoWeeks, 4 Monthly, 5 Rarely, 6 NotUsedAnymore, 7 Never. */
export type UseFrequency = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const USE_FREQUENCIES: readonly UseFrequency[] = [1, 2, 3, 4, 5, 6, 7];

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
}

/** Payload sent to the API when creating or replacing a piece of equipment. */
export interface EquipmentInput {
  name: string;
  brand: string;
  model: string | null;
  review: string;
  rating: number;
  recommend: boolean;
  equipmentCategoryId: string;
  price: number | null;
  /** ISO 4217 code; filled together with `price`. */
  currency: string | null;
  link: string | null;
  frequencyOfUse: UseFrequency;
  imageUrl: string | null;
  /** `YYYY-MM-DD`. */
  purchaseDate: string | null;
}

export interface Equipment extends EquipmentInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}
