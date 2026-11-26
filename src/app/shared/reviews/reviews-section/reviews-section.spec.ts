import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../auth/auth.service';
import { CurrentUserService } from '../../../features/profile/current-user.service';
import { ReviewList } from '../review.model';
import { ReviewsSection } from './reviews-section';

const URL = `${environment.apiUrl}/v1.0/coffee-shops/s1/reviews`;
const noContent = { status: 204, statusText: 'No Content' };

const list: ReviewList = {
  averageRating: 4.5,
  reviewCount: 2,
  recommendedCount: 1,
  reviews: [
    {
      id: 'r1',
      rating: 5,
      review: 'Wonderful',
      recommend: true,
      author: { id: 'p1', handle: 'ana', nickname: 'Ana', photoUrl: null },
      createdAt: '2026-01-02T10:00:00Z',
      updatedAt: '2026-01-02T10:00:00Z',
    },
    {
      id: 'r2',
      rating: 4,
      review: 'Good',
      recommend: false,
      author: { id: 'p2', handle: 'bob', nickname: null, photoUrl: null },
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
    },
  ],
};

describe('ReviewsSection', () => {
  const signedIn = signal(true);
  const status = signal('ready');
  const profile = signal<{ id: string } | null>({ id: 'p9' });
  const isAdmin = signal(false);
  const signIn = vi.fn();

  async function setup(value: ReviewList = list) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { isSignedIn: signedIn, signIn } },
        {
          provide: CurrentUserService,
          useValue: { status, profile, isAdmin, hasProfile: () => profile() !== null },
        },
      ],
    });
    const fixture = TestBed.createComponent(ReviewsSection);
    fixture.componentRef.setInput('path', 'coffee-shops');
    fixture.componentRef.setInput('itemId', 's1');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(URL).flush(value);
    await fixture.whenStable();
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  function submit(el: HTMLElement) {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  async function writeReview(
    fixture: { whenStable(): Promise<unknown> },
    el: HTMLElement,
    star: number,
    text: string,
  ) {
    el.querySelectorAll<HTMLInputElement>('app-star-rating input[type="radio"]')[star - 1].click();
    const area = el.querySelector<HTMLTextAreaElement>('#review-text')!;
    area.value = text;
    area.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    submit(el);
    await fixture.whenStable();
  }

  beforeEach(() => {
    signedIn.set(true);
    status.set('ready');
    profile.set({ id: 'p9' });
    isAdmin.set(false);
    signIn.mockClear();
  });

  it('shows the average, the counts and every review, using the handle without a nickname', async () => {
    const { el } = await setup();

    expect(el.textContent).toContain('4.5');
    expect(el.textContent).toContain('2 reviews');
    expect(el.textContent).toContain('1 recommend it');
    expect(el.textContent).toContain('Wonderful');
    expect(el.textContent).toContain('Ana');
    expect(el.textContent).toContain('bob');
  });

  it('invites the first review when there are none', async () => {
    const { el } = await setup({
      averageRating: null,
      reviewCount: 0,
      recommendedCount: 0,
      reviews: [],
    });

    expect(el.textContent).toContain('No reviews yet');
  });

  it('asks a signed-out visitor to sign in instead of showing the form', async () => {
    signedIn.set(false);
    const { el } = await setup();

    expect(el.querySelector('form')).toBeNull();
    const button = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sign in'),
    )!;
    button.click();
    expect(signIn).toHaveBeenCalled();
  });

  it('points a user without a profile to the profile page', async () => {
    status.set('needs-profile');
    profile.set(null);
    const { el } = await setup();

    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('a[href="/profile/setup"]')).not.toBeNull();
  });

  it('posts a new review and reloads the list', async () => {
    const { fixture, http, el } = await setup();

    await writeReview(fixture, el, 4, 'Lovely place');

    const post = http.expectOne({ method: 'POST', url: URL });
    expect(post.request.body).toEqual({ rating: 4, review: 'Lovely place', recommend: false });
    post.flush({ id: 'r3' });
    await fixture.whenStable();
    (await vi.waitFor(() => http.expectOne({ method: 'GET', url: URL }))).flush(list);
  });

  it('shows a 400 message from the API next to the review field', async () => {
    const { fixture, http, el } = await setup();

    await writeReview(fixture, el, 1, 'Again');

    http
      .expectOne({ method: 'POST', url: URL })
      .flush(
        { errors: { review: ['You already reviewed this item'] } },
        { status: 400, statusText: 'Bad Request' },
      );
    await fixture.whenStable();

    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(el.textContent).toContain('You already reviewed this item');
    });
  });

  it('lets the author edit their review, and hides the new review form', async () => {
    profile.set({ id: 'p1' });
    const { fixture, http, el } = await setup();

    expect(el.querySelector('#review-text')).toBeNull();
    Array.from(el.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Edit'))!
      .click();
    await fixture.whenStable();
    expect(el.querySelector<HTMLTextAreaElement>('#review-text')!.value).toBe('Wonderful');

    submit(el);
    await fixture.whenStable();
    const put = http.expectOne({ method: 'PUT', url: `${URL}/r1` });
    expect(put.request.body).toEqual({ rating: 5, review: 'Wonderful', recommend: true });
    put.flush(null, noContent);
    await fixture.whenStable();
    (await vi.waitFor(() => http.expectOne({ method: 'GET', url: URL }))).flush(list);
  });

  it('lets an admin delete any review but not edit it', async () => {
    isAdmin.set(true);
    const { fixture, http, el } = await setup();

    const labels = Array.from(el.querySelectorAll('button')).map((b) => b.textContent?.trim());
    expect(labels).not.toContain('Edit');

    el.querySelector<HTMLButtonElement>('li button')!.click();
    await fixture.whenStable();
    Array.from(el.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Confirm delete'))!
      .click();
    await fixture.whenStable();

    http.expectOne({ method: 'DELETE', url: `${URL}/r1` }).flush(null, noContent);
    await fixture.whenStable();
    (await vi.waitFor(() => http.expectOne({ method: 'GET', url: URL }))).flush(list);
  });
});
