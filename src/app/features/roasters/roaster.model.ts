import { CoffeeClassification } from '../../shared/models/coffee-classification';

export interface Roaster {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  instagramUrl: string | null;
  phoneNumber: string | null;
  hasMembershipOption: boolean;
  logoUrl: string | null;
  city: string;
  state: string;
  country: string;
  address: string | null;
  classifications: CoffeeClassification[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

/** Payload sent to the API when creating or replacing a roaster. */
export type RoasterInput = Omit<Roaster, 'id' | 'createdAt' | 'updatedAt'>;
