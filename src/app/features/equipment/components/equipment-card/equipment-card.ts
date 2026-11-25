import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Equipment } from '../../equipment.model';

@Component({
  selector: 'app-equipment-card',
  imports: [CurrencyPipe, NgOptimizedImage, OptionLabelPipe, RouterLink, TranslocoPipe, Icon],
  template: `
    <article class="card group flex h-full flex-col gap-4 overflow-hidden p-0!">
      <div class="relative h-64 w-full overflow-hidden bg-container">
        @if (equipment().imageUrl; as url) {
          <img
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt=""
            [ngSrc]="url"
            width="640"
            height="256"
          />
        } @else {
          <div class="flex h-full items-center justify-center text-husk">
            <app-icon name="coffee" [size]="40" />
          </div>
        }
        @if (categoryName()) {
          <div class="absolute top-4 left-4">
            <span class="badge bg-surface/90 text-terracotta">{{ categoryName() }}</span>
          </div>
        }
        <div class="absolute top-4 right-4">
          <span class="badge badge-rating">
            <span class="star" aria-hidden="true">★</span>
            <span class="sr-only">{{ 'common.rateLabel' | transloco }}</span>
            {{ equipment().rating }}
          </span>
        </div>
        <div class="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span class="badge bg-surface/95 text-ink">
            {{ equipment().frequencyOfUse + '' | optionLabel: 'frequency' }}
          </span>
          @if (equipment().recommend) {
            <span class="badge bg-surface/95 text-terracotta">
              {{ 'common.recommended' | transloco }}
            </span>
          }
        </div>
      </div>

      <div class="flex flex-1 flex-col justify-between gap-4 px-6 pb-6">
        <div class="flex flex-col gap-1">
          <p class="field-label-sm">{{ equipment().brand }}</p>
          <h2>
            <a class="hover:text-terracotta" [routerLink]="['/equipment', equipment().id]">
              {{ equipment().name }}
            </a>
          </h2>
        </div>
        @if (equipment().price !== null && equipment().currency) {
          <p class="border-t border-hairline pt-4 text-lg font-semibold text-espresso">
            {{ equipment().price | currency: equipment().currency! }}
          </p>
        }
      </div>
    </article>
  `,
})
export class EquipmentCard {
  readonly equipment = input.required<Equipment>();
  readonly categoryName = input('');
}
