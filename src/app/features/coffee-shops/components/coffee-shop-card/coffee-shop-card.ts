import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoffeeShop } from '../../coffee-shop.model';

@Component({
  selector: 'app-coffee-shop-card',
  imports: [RouterLink],
  template: `
    <article class="rounded border border-stone-300 bg-white p-4">
      <h2 class="text-lg font-semibold">
        <a class="underline" [routerLink]="['/coffee-shops', shop().id]">{{ shop().name }}</a>
      </h2>
      <p class="text-sm text-stone-700">{{ shop().city }}, {{ shop().country }}</p>
      <p class="text-sm text-stone-700">
        Rate: {{ shop().rate }}
        @if (shop().recommend) {
          · Recommended
        }
      </p>
    </article>
  `,
})
export class CoffeeShopCard {
  readonly shop = input.required<CoffeeShop>();
}
