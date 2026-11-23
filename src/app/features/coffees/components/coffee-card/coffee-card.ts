import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Coffee } from '../../coffee.model';

@Component({
  selector: 'app-coffee-card',
  imports: [RouterLink],
  template: `
    <article class="rounded border border-stone-300 bg-white p-4">
      <h2 class="text-lg font-semibold">
        <a class="underline" [routerLink]="['/coffees', coffee().id]">{{ coffee().name }}</a>
      </h2>
      @if (roasterName()) {
        <p class="text-sm text-stone-700">{{ roasterName() }}</p>
      }
      <p class="text-sm text-stone-700">
        Rate: {{ coffee().rate }}
        @if (coffee().roastLevel) {
          · {{ coffee().roastLevel }} roast
        }
        @if (coffee().recommend) {
          · Recommended
        }
      </p>
    </article>
  `,
})
export class CoffeeCard {
  readonly coffee = input.required<Coffee>();
  readonly roasterName = input<string>();
}
