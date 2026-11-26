import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../auth/auth.service';
import { CurrentUserService } from '../../../features/profile/current-user.service';
import { FieldErrors, validationErrors } from '../../api/validation-errors';
import { ReviewForm } from '../review-form/review-form';
import { Review, ReviewedPath, ReviewInput } from '../review.model';
import { ReviewsService } from '../reviews.service';

/** Summary, list and form of the reviews of one roaster, coffee or coffee shop. */
@Component({
  selector: 'app-reviews-section',
  imports: [TranslocoPipe, DatePipe, DecimalPipe, NgOptimizedImage, RouterLink, ReviewForm],
  template: `
    <section class="card flex flex-col gap-6" aria-labelledby="reviews-title">
      <header class="flex flex-col gap-3">
        <h2 id="reviews-title" class="text-2xl">{{ 'reviews.title' | transloco }}</h2>
        @if (list.value(); as data) {
          @if (data.reviewCount > 0) {
            <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
              <span class="flex items-center gap-2">
                <span class="text-3xl font-semibold text-espresso">
                  {{ data.averageRating | number: '1.1-1' }}
                </span>
                <span aria-hidden="true" class="text-caramel">★</span>
                <span class="sr-only">{{ 'reviews.averageLabel' | transloco }}</span>
              </span>
              <span>{{
                (data.reviewCount === 1 ? 'reviews.countOne' : 'reviews.countOther')
                  | transloco: { count: data.reviewCount }
              }}</span>
              <span>{{
                'reviews.recommendedCount' | transloco: { count: data.recommendedCount }
              }}</span>
            </p>
          } @else {
            <p class="text-husk">{{ 'reviews.none' | transloco }}</p>
          }
        }
      </header>

      @if (!auth.isSignedIn()) {
        <p class="flex flex-wrap items-center gap-3">
          <span>{{ 'reviews.signInPrompt' | transloco }}</span>
          <button type="button" class="btn btn-ghost" (click)="auth.signIn()">
            {{ 'auth.signIn' | transloco }}
          </button>
        </p>
      } @else if (currentUser.status() === 'needs-profile') {
        <p>
          {{ 'reviews.profilePrompt' | transloco }}
          <a class="link" routerLink="/profile/setup">{{ 'reviews.createProfile' | transloco }}</a>
        </p>
      } @else if (currentUser.hasProfile() && !mine()) {
        <div class="flex flex-col gap-3">
          <h3 class="field-label-sm">{{ 'reviews.writeTitle' | transloco }}</h3>
          <app-review-form
            [saving]="saving()"
            [serverErrors]="serverErrors()"
            (submitted)="create($event)"
          />
        </div>
      }

      @if (list.isLoading()) {
        <p class="text-husk" role="status">{{ 'common.loading' | transloco }}</p>
      } @else if (list.error()) {
        <p class="text-error" role="alert">{{ 'reviews.loadError' | transloco }}</p>
      }

      @if (list.value(); as data) {
        <ul class="flex flex-col gap-6">
          @for (item of data.reviews; track item.id) {
            <li class="flex flex-col gap-3 border-t border-hairline pt-6">
              @if (editingId() === item.id) {
                <app-review-form
                  [initialValue]="item"
                  [saving]="saving()"
                  [serverErrors]="serverErrors()"
                  [cancellable]="true"
                  (submitted)="update(item, $event)"
                  (cancelled)="stopEditing()"
                />
              } @else {
                <div class="flex flex-wrap items-center gap-3">
                  @if (item.author.photoUrl) {
                    <img
                      class="rounded-full object-cover"
                      [ngSrc]="item.author.photoUrl"
                      width="40"
                      height="40"
                      alt=""
                    />
                  }
                  <div class="flex flex-col">
                    <span class="font-semibold text-espresso">{{ authorName(item) }}</span>
                    <span class="text-xs text-husk">{{ item.createdAt | date: 'mediumDate' }}</span>
                  </div>
                  <span class="ml-auto flex items-center gap-2">
                    <span aria-hidden="true" class="text-xl text-caramel">{{
                      stars(item.rating)
                    }}</span>
                    <span class="sr-only">{{
                      'common.ratedOutOf' | transloco: { rate: item.rating }
                    }}</span>
                    @if (item.recommend) {
                      <span class="badge badge-medium">{{ 'common.recommended' | transloco }}</span>
                    }
                  </span>
                </div>

                <p class="leading-relaxed whitespace-pre-line text-espresso">{{ item.review }}</p>

                @if (isMine(item) || currentUser.isAdmin()) {
                  <div class="flex flex-wrap items-center gap-3">
                    @if (isMine(item)) {
                      <button type="button" class="link" (click)="startEditing(item)">
                        {{ 'common.edit' | transloco }}
                      </button>
                    }
                    @if (confirmingDeleteId() === item.id) {
                      <span>{{ 'reviews.confirmDelete' | transloco }}</span>
                      <button type="button" class="btn btn-danger" (click)="remove(item)">
                        {{ 'common.confirmDelete' | transloco }}
                      </button>
                      <button type="button" class="link" (click)="confirmingDeleteId.set(null)">
                        {{ 'common.cancel' | transloco }}
                      </button>
                    } @else {
                      <button type="button" class="link" (click)="confirmingDeleteId.set(item.id)">
                        {{ 'common.delete' | transloco }}
                      </button>
                    }
                  </div>
                }
              }
            </li>
          }
        </ul>
      }

      @if (actionError()) {
        <p class="text-error" role="alert">{{ actionError() | transloco }}</p>
      }
    </section>
  `,
})
export class ReviewsSection {
  protected readonly auth = inject(AuthService);
  protected readonly currentUser = inject(CurrentUserService);
  private readonly service = inject(ReviewsService);

  /** The API collection of the reviewed item. */
  readonly path = input.required<ReviewedPath>();
  readonly itemId = input.required<string>();

  protected readonly list = resource({
    params: () => ({ path: this.path(), itemId: this.itemId() }),
    loader: ({ params }) => this.service.list(params.path, params.itemId),
  });

  protected readonly editingId = signal<string | null>(null);
  protected readonly confirmingDeleteId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly serverErrors = signal<FieldErrors>({});
  /** Translation key of the last failure that has no field to show it next to. */
  protected readonly actionError = signal('');

  /** The signed-in user's own review of this item, if any. */
  protected readonly mine = computed(() => {
    const profile = this.currentUser.profile();
    return profile ? this.list.value()?.reviews.find((r) => r.author.id === profile.id) : undefined;
  });

  protected isMine(review: Review): boolean {
    return review.author.id === this.currentUser.profile()?.id;
  }

  protected authorName(review: Review): string {
    return review.author.nickname || review.author.handle;
  }

  protected stars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  protected startEditing(review: Review): void {
    this.serverErrors.set({});
    this.actionError.set('');
    this.editingId.set(review.id);
  }

  protected stopEditing(): void {
    this.serverErrors.set({});
    this.editingId.set(null);
  }

  protected create(input: ReviewInput): Promise<void> {
    return this.save(() => this.service.create(this.path(), this.itemId(), input));
  }

  protected update(review: Review, input: ReviewInput): Promise<void> {
    return this.save(() => this.service.update(this.path(), this.itemId(), review.id, input));
  }

  protected async remove(review: Review): Promise<void> {
    this.actionError.set('');
    try {
      await this.service.remove(this.path(), this.itemId(), review.id);
      this.confirmingDeleteId.set(null);
      this.list.reload();
    } catch {
      this.actionError.set('reviews.deleteError');
    }
  }

  private async save(request: () => Promise<unknown>): Promise<void> {
    this.saving.set(true);
    this.serverErrors.set({});
    this.actionError.set('');
    try {
      await request();
      this.editingId.set(null);
      this.list.reload();
    } catch (error) {
      const fieldErrors = validationErrors(error);
      if (fieldErrors) this.serverErrors.set(fieldErrors);
      else this.actionError.set('reviews.saveError');
    } finally {
      this.saving.set(false);
    }
  }
}
