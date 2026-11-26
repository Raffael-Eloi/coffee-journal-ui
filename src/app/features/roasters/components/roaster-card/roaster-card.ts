import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { Roaster } from '../../roaster.model';

@Component({
  selector: 'app-roaster-card',
  imports: [TranslocoPipe, OptionLabelPipe, RouterLink],
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
          <span class="badge badge-light">
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
}
