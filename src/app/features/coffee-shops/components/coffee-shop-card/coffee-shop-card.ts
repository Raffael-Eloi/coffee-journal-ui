import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoffeeShop } from '../../coffee-shop.model';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-coffee-shop-card',
  imports: [TranslocoPipe, RouterLink],
  template: `
    <article class="card flex h-full flex-col gap-2">
      <h2>
        <a class="hover:text-terracotta" [routerLink]="['/coffee-shops', shop().id]">
          {{ shop().name }}
        </a>
      </h2>
      <p class="text-husk">{{ shop().city }}, {{ shop().country }}</p>
      <p class="mt-auto flex flex-wrap items-center gap-2">
        <span class="badge badge-rating">
          <span class="star" aria-hidden="true">★</span>
          <span class="sr-only">{{ 'common.rateLabel' | transloco }}</span>
          {{ shop().rate }}
        </span>
        @if (shop().recommend) {
          <span class="badge badge-light">{{ 'common.recommended' | transloco }}</span>
        }
      </p>
    </article>
  `,
})
export class CoffeeShopCard {
  readonly shop = input.required<CoffeeShop>();
}
