export type Role = 'Contributor' | 'Admin';

/** The signed-in user's own profile (`GET /profiles/me`). */
export interface Profile {
  id: string;
  name: string;
  nickname: string | null;
  photoUrl: string | null;
  email: string;
  handle: string;
  bio: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedInUrl: string | null;
  xUrl: string | null;
  website: string | null;
  languagePref: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

/** Body of `POST /profiles/me`. `email` is only used when the sign-in token has none. */
export interface ProfileCreateInput {
  name: string;
  handle: string;
  languagePref: string;
  email?: string;
}

/** Body of `PUT /profiles/me`. It replaces the whole profile, so every field is sent; `null` clears an optional one. */
export interface ProfileUpdateInput {
  name: string;
  handle: string;
  languagePref: string;
  nickname: string | null;
  photoUrl: string | null;
  bio: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedInUrl: string | null;
  xUrl: string | null;
  website: string | null;
}
