import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { COFFEE_CLASSIFICATION_ICONS } from '../../../../shared/models/coffee-classification';
import { SymbolIcon } from '../../../../shared/ui/symbol/symbol';
import { Roaster } from '../../roaster.model';

@Component({
  selector: 'app-roaster-card',
  imports: [TranslocoPipe, OptionLabelPipe, RouterLink, SymbolIcon],
  template: `
    <article class="card flex h-full flex-col gap-2">
      <h2>
        <a class="hover:text-terracotta" [routerLink]="['/roasters', roaster().id]">
          {{ roaster().name }}
        </a>
      </h2>
      <p class="text-husk">
        {{ roaster().city }}, {{ roaster().country | optionLabel: 'country' }}
      </p>
      <p class="mt-auto flex flex-wrap items-center gap-2">
        @for (classification of roaster().classifications; track classification) {
          <span class="badge badge-light gap-1.5">
            <app-symbol [name]="classificationIcons[classification]" [size]="16" />
            {{ classification + '' | optionLabel: 'classification' }}
          </span>
        }
        @if (roaster().hasMembershipOption) {
          <span class="badge">{{ 'roasters.card.membership' | transloco }}</span>
        }
      </p>
    </article>
  `,
})
export class RoasterCard {
  readonly roaster = input.required<Roaster>();

  protected readonly classificationIcons = COFFEE_CLASSIFICATION_ICONS;
}
