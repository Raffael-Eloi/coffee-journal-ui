export interface CoffeePrice {
  id: string;
  grams: number;
  price: number;
}

export interface CoffeeImage {
  id: string;
  url: string;
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
  images: CoffeeImage[];
}

export type CoffeePriceInput = Omit<CoffeePrice, 'id'>;

/** Payload sent to the API when creating or updating a coffee. Images are not edited yet. */
export type CoffeeInput = Omit<Coffee, 'id' | 'prices' | 'images'> & {
  prices: CoffeePriceInput[];
};

export type Currency = '$' | 'R$';

/** A price row in the form. The currency is only a UI choice: the API does not store it yet. */
export type CoffeeFormPrice = CoffeePriceInput & { currency: Currency };

/** Values edited in the form. */
export type CoffeeFormValue = Omit<CoffeeInput, 'prices'> & { prices: CoffeeFormPrice[] };
