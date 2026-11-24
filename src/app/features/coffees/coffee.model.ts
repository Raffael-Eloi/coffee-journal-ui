/** ISO 4217 codes the API stores. */
export type Currency = 'BRL' | 'USD';

export interface CoffeePrice {
  id: string;
  grams: number;
  price: number;
  currency: Currency;
}

export interface Coffee {
  id: string;
  name: string;
  description: string;
  roasterId: string;
  rate: number;
  review: string;
  recommend: boolean;
  origin: string;
  process: string;
  roastLevel: string;
  variety: string;
  tastingNotes: string;
  prices: CoffeePrice[];
  imageUrls: string[];
}

export type CoffeePriceInput = Omit<CoffeePrice, 'id'>;

/** Payload sent to the API when creating or updating a coffee. */
export type CoffeeInput = Omit<Coffee, 'id' | 'prices'> & {
  prices: CoffeePriceInput[];
};

/** Values edited in the form. */
export type CoffeeFormValue = CoffeeInput;
