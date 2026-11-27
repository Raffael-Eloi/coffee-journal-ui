import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { COFFEE_CLASSIFICATION_ICONS } from '../../../../shared/models/coffee-classification';
import { SymbolIcon } from '../../../../shared/ui/symbol/symbol';
import { Coffee } from '../../coffee.model';
import { roastBadgeClass } from '../../roast-level';

@Component({
  selector: 'app-coffee-card',
  imports: [OptionLabelPipe, RouterLink, SymbolIcon],
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
        <span class="badge badge-light gap-1.5">
          <app-symbol [name]="classificationIcons[coffee().classification]" [size]="16" />
          {{ coffee().classification + '' | optionLabel: 'classification' }}
        </span>
        @if (coffee().roastLevel) {
          <span [class]="roastClass()">{{ coffee().roastLevel | optionLabel: 'roastLevel' }}</span>
        }
      </p>
    </article>
  `,
})
export class CoffeeCard {
  readonly coffee = input.required<Coffee>();
  readonly roasterName = input<string>();

  protected readonly classificationIcons = COFFEE_CLASSIFICATION_ICONS;
  protected readonly roastClass = computed(() => roastBadgeClass(this.coffee().roastLevel));
}
