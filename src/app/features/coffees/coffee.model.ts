import { CoffeeClassification } from '../../shared/models/coffee-classification';

/** ISO 4217 codes the app offers for a price. */
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
  classification: CoffeeClassification;
  origin: string;
  process: string;
  roastLevel: string;
  variety: string;
  tastingNotes: string;
  productUrl: string | null;
  prices: CoffeePrice[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export type CoffeePriceInput = Omit<CoffeePrice, 'id'>;

/** Payload sent to the API when creating or replacing a coffee. */
export type CoffeeInput = Omit<Coffee, 'id' | 'prices' | 'createdAt' | 'updatedAt'> & {
  prices: CoffeePriceInput[];
};
