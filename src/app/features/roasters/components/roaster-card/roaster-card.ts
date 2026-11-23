import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Roaster } from '../../roaster.model';

@Component({
  selector: 'app-roaster-card',
  imports: [RouterLink],
  template: `
    <article class="rounded border border-stone-300 bg-white p-4">
      <h2 class="text-lg font-semibold">
        <a class="underline" [routerLink]="['/roasters', roaster().id]">{{ roaster().name }}</a>
      </h2>
      <p class="text-sm text-stone-700">
        Rate: {{ roaster().rate }}
        @if (roaster().recommend) {
          · Recommended
        }
        @if (roaster().hasMembershipOption) {
          · Membership available
        }
      </p>
    </article>
  `,
})
export class RoasterCard {
  readonly roaster = input.required<Roaster>();
}
