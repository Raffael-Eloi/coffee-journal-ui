import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { CoffeeShop } from '../../coffee-shop.model';

@Component({
  selector: 'app-coffee-shop-card',
  imports: [OptionLabelPipe, RouterLink],
  template: `
    <article class="card flex h-full flex-col gap-2">
      <h2>
        <a class="hover:text-terracotta" [routerLink]="['/coffee-shops', shop().id]">
          {{ shop().name }}
        </a>
      </h2>
      <p class="text-husk">{{ shop().city }}, {{ shop().country | optionLabel: 'country' }}</p>
      @if (shop().amenities.length > 0) {
        <p class="mt-auto flex flex-wrap items-center gap-2">
          @for (amenity of shop().amenities; track amenity) {
            <span class="badge badge-light">{{ amenity + '' | optionLabel: 'amenity' }}</span>
          }
        </p>
      }
    </article>
  `,
})
export class CoffeeShopCard {
  readonly shop = input.required<CoffeeShop>();
}
