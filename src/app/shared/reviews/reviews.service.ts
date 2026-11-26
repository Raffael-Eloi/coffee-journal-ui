import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewedPath, ReviewInput, ReviewList } from './review.model';

/** Reviews of a roaster, coffee or coffee shop: `/v1.0/<path>/<itemId>/reviews`. */
@Service()
export class ReviewsService {
  private readonly http = inject(HttpClient);

  private url(path: ReviewedPath, itemId: string): string {
    return `${environment.apiUrl}/v1.0/${path}/${itemId}/reviews`;
  }

  list(path: ReviewedPath, itemId: string): Promise<ReviewList> {
    return firstValueFrom(this.http.get<ReviewList>(this.url(path, itemId)));
  }

  create(path: ReviewedPath, itemId: string, input: ReviewInput): Promise<{ id: string }> {
    return firstValueFrom(this.http.post<{ id: string }>(this.url(path, itemId), input));
  }

  async update(
    path: ReviewedPath,
    itemId: string,
    reviewId: string,
    input: ReviewInput,
  ): Promise<void> {
    await firstValueFrom(this.http.put<unknown>(`${this.url(path, itemId)}/${reviewId}`, input));
  }

  async remove(path: ReviewedPath, itemId: string, reviewId: string): Promise<void> {
    await firstValueFrom(this.http.delete<unknown>(`${this.url(path, itemId)}/${reviewId}`));
  }
}
