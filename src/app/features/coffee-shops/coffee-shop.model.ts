export interface CoffeeShop {
  id: string;
  name: string;
  website: string;
  roasterId: string | null;
  rate: number;
  review: string;
  recommend: boolean;
  city: string;
  state: string;
  country: string;
  location: string;
  imageUrls: string[];
}

/** Payload sent to the API when creating or updating a coffee shop. */
export type CoffeeShopInput = Omit<CoffeeShop, 'id'>;

/** Fields edited in the form. `roasterId` is not edited here. */
export type CoffeeShopFormValue = Omit<CoffeeShopInput, 'roasterId'>;
