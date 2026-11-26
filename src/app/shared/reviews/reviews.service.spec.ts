import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ReviewInput, ReviewList } from './review.model';
import { ReviewsService } from './reviews.service';

const URL = `${environment.apiUrl}/v1.0/coffees/c1/reviews`;
const input: ReviewInput = { rating: 5, review: 'Great', recommend: true };
const noContent = { status: 204, statusText: 'No Content' };

describe('ReviewsService', () => {
  let service: ReviewsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReviewsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the reviews with their summary', async () => {
    const list: ReviewList = {
      averageRating: null,
      reviewCount: 0,
      recommendedCount: 0,
      reviews: [],
    };
    const result = service.list('coffees', 'c1');
    http.expectOne({ method: 'GET', url: URL }).flush(list);
    expect(await result).toEqual(list);
  });

  it('posts a review and returns its id', async () => {
    const result = service.create('coffees', 'c1', input);
    const req = http.expectOne({ method: 'POST', url: URL });
    expect(req.request.body).toEqual(input);
    req.flush({ id: 'r1' });
    expect(await result).toEqual({ id: 'r1' });
  });

  it('puts and deletes a review of the item', async () => {
    const updated = service.update('coffees', 'c1', 'r1', input);
    http.expectOne({ method: 'PUT', url: `${URL}/r1` }).flush(null, noContent);
    await updated;

    const removed = service.remove('coffees', 'c1', 'r1');
    http.expectOne({ method: 'DELETE', url: `${URL}/r1` }).flush(null, noContent);
    await removed;
  });
});
