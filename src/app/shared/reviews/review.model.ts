/** The API collections that have reviews. */
export type ReviewedPath = 'coffee-roasters' | 'coffees' | 'coffee-shops';

export interface ReviewAuthor {
  id: string;
  handle: string;
  nickname: string | null;
  photoUrl: string | null;
}

export interface Review {
  id: string;
  rating: number;
  review: string;
  recommend: boolean;
  author: ReviewAuthor;
  createdAt: string;
  updatedAt: string;
}

/** Body of a POST or PUT. */
export interface ReviewInput {
  rating: number;
  review: string;
  recommend: boolean;
}

/** `GET …/reviews`: newest first; `averageRating` is `null` when there are no reviews. */
export interface ReviewList {
  averageRating: number | null;
  reviewCount: number;
  recommendedCount: number;
  reviews: Review[];
}
