import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, maxLength, max, min, required } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';
import { FieldErrors, fieldErrors } from '../../api/validation-errors';
import { Icon } from '../../ui/icon/icon';
import { LabeledField } from '../../ui/labeled-field/labeled-field';
import { StarRating } from '../../ui/star-rating/star-rating';
import { YesNoToggle } from '../../ui/yes-no-toggle/yes-no-toggle';
import { ReviewInput } from '../review.model';

const EMPTY: ReviewInput = { rating: 0, review: '', recommend: false };

/** Only the three editable fields, so a whole `Review` can be passed as the initial value. */
function pick(value: ReviewInput): ReviewInput {
  return { rating: value.rating, review: value.review, recommend: value.recommend };
}

/** Rating, text and recommend toggle of one review, for a new review or an edit. */
@Component({
  selector: 'app-review-form',
  imports: [TranslocoPipe, FormField, FormRoot, Icon, LabeledField, StarRating, YesNoToggle],
  template: `
    <form class="flex flex-col gap-4" [formRoot]="reviewForm">
      <div class="grid gap-4 md:grid-cols-2 md:items-end">
        <div class="flex flex-col gap-1">
          <app-star-rating [formField]="reviewForm.rating" />
          @for (error of errorsFor(reviewForm.rating(), 'rating'); track error.kind) {
            <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
          }
        </div>
        <app-yes-no-toggle
          label="common.recommendQuestion"
          yesLabel="common.yes"
          noLabel="common.no"
          [formField]="reviewForm.recommend"
        />
      </div>

      <app-labeled-field
        label="reviews.form.text"
        controlId="review-text"
        [errors]="errorsFor(reviewForm.review(), 'review')"
      >
        <textarea
          id="review-text"
          rows="4"
          class="field-input"
          [formField]="reviewForm.review"
        ></textarea>
      </app-labeled-field>

      @for (error of generalErrors(); track error) {
        <p class="field-error" role="alert">{{ error }}</p>
      }

      <div class="flex flex-wrap items-center justify-end gap-3">
        @if (cancellable()) {
          <button type="button" class="btn btn-ghost" (click)="cancelled.emit()">
            {{ 'common.cancel' | transloco }}
          </button>
        }
        <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
          <app-icon name="check" [size]="16" />
          {{ (saving() ? 'common.saving' : 'common.save') | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class ReviewForm {
  readonly initialValue = input<ReviewInput>();
  readonly saving = input(false);
  readonly cancellable = input(false);
  /** Messages the API returned for the last save, by field name. */
  readonly serverErrors = input<FieldErrors>({});
  readonly submitted = output<ReviewInput>();
  readonly cancelled = output<void>();

  private readonly data = linkedSignal<ReviewInput>(() => pick(this.initialValue() ?? EMPTY));

  protected readonly reviewForm = form(
    this.data,
    (path) => {
      min(path.rating, 1, { message: 'errors.rateRange' });
      max(path.rating, 5, { message: 'errors.rateRange' });
      required(path.review, { message: 'errors.reviewRequired' });
      maxLength(path.review, 4000, { message: 'errors.tooLong' });
    },
    {
      submission: {
        action: async (field) => {
          const value = pick(field().value());
          this.submitted.emit({ ...value, review: value.review.trim() });
        },
      },
    },
  );

  /** Messages for fields that have no input here, such as `profile` or a second review. */
  protected generalErrors(): string[] {
    const server = this.serverErrors();
    return Object.entries(server)
      .filter(([field]) => !['rating', 'review', 'recommend'].includes(field))
      .flatMap(([, messages]) => messages);
  }

  protected errorsFor(
    state: Parameters<typeof fieldErrors>[0],
    name: string,
  ): ReturnType<typeof fieldErrors> {
    return fieldErrors(state, this.serverErrors(), name);
  }
}
