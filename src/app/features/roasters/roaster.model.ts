export interface Roaster {
  id: string;
  name: string;
  website: string | null;
  rate: number;
  review: string;
  recommend: boolean;
  hasMembershipOption: boolean;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload sent to the API when creating or updating a roaster. */
export type RoasterInput = Omit<Roaster, 'id' | 'createdAt' | 'updatedAt'>;

/** Values edited in the form. Text inputs hold `''` where the API uses `null`. */
export type RoasterFormValue = Omit<RoasterInput, 'website' | 'logoUrl'> & {
  website: string;
  logoUrl: string;
};
