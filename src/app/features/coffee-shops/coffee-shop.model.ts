export interface CoffeeShopImage {
  id: string;
  url: string;
}

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
  images: CoffeeShopImage[];
}

/** Payload sent to the API when creating or updating a coffee shop. */
export type CoffeeShopInput = Omit<CoffeeShop, 'id' | 'images'>;

/** Fields edited in the form. `roasterId` is not editable until the roasters feature exists. */
export type CoffeeShopFormValue = Omit<CoffeeShopInput, 'roasterId'>;
