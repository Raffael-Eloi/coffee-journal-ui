import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Coffee } from '../../coffee.model';
import { roastBadgeClass } from '../../roast-level';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';

@Component({
  selector: 'app-coffee-card',
  imports: [TranslocoPipe, OptionLabelPipe, RouterLink],
  template: `
    <article class="card flex h-full flex-col gap-2">
      <h2>
        <a class="hover:text-terracotta" [routerLink]="['/coffees', coffee().id]">
          {{ coffee().name }}
        </a>
      </h2>
      @if (roasterName()) {
        <p class="text-husk">{{ roasterName() }}</p>
      }
      <p class="mt-auto flex flex-wrap items-center gap-2">
        <span class="badge badge-rating">
          <span class="star" aria-hidden="true">★</span>
          <span class="sr-only">{{ 'common.rateLabel' | transloco }}</span>
          {{ coffee().rate }}
        </span>
        @if (coffee().roastLevel) {
          <span [class]="roastClass()">{{ coffee().roastLevel | optionLabel: 'roastLevel' }}</span>
        }
        @if (coffee().recommend) {
          <span class="badge badge-light">{{ 'common.recommended' | transloco }}</span>
        }
      </p>
    </article>
  `,
})
export class CoffeeCard {
  readonly coffee = input.required<Coffee>();
  readonly roasterName = input<string>();

  protected readonly roastClass = computed(() => roastBadgeClass(this.coffee().roastLevel));
}
