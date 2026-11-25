import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';

let nextGroupId = 0;

/**
 * Star rating from 1 to 5, bound with `[formField]`.
 * Built on native radio inputs, so arrow keys and screen readers work out of the box.
 * A value of 0 means "not rated yet".
 */
@Component({
  selector: 'app-star-rating',
  imports: [TranslocoPipe],
  template: `
    <fieldset class="flex flex-col gap-1">
      <legend class="field-label">{{ label() | transloco }}</legend>
      <div class="flex items-center" (focusout)="touch.emit()">
        @for (star of stars; track star) {
          <label class="star-label" [class.star-on]="star <= value()">
            <input
              type="radio"
              class="sr-only"
              [name]="groupName"
              [checked]="value() === star"
              [disabled]="disabled() || readonly()"
              (change)="value.set(star)"
            />
            <span aria-hidden="true">★</span>
            <span class="sr-only">{{
              (star === 1 ? 'ui.starRating.one' : 'ui.starRating.other')
                | transloco: { count: star }
            }}</span>
          </label>
        }
        @if (value() > 0) {
          <span class="ml-2 font-semibold text-espresso" aria-hidden="true">{{ value() }}</span>
          <span class="ml-1 text-xs text-husk" aria-hidden="true">/ 5</span>
        }
      </div>
    </fieldset>
  `,
})
export class StarRating implements FormValueControl<number> {
  readonly value = model(0);
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly label = input('ui.starRating.label');

  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly groupName = `star-rating-${nextGroupId++}`;
}
