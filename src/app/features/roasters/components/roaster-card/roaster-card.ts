import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Roaster } from '../../roaster.model';

@Component({
  selector: 'app-roaster-card',
  imports: [RouterLink],
  template: `
    <article class="card flex h-full flex-col gap-2">
      <h2>
        <a class="hover:text-terracotta" [routerLink]="['/roasters', roaster().id]">
          {{ roaster().name }}
        </a>
      </h2>
      <p class="mt-auto flex flex-wrap items-center gap-2">
        <span class="badge badge-rating">
          <span class="star" aria-hidden="true">★</span>
          <span class="sr-only">Rate:</span>
          {{ roaster().rate }}
        </span>
        @if (roaster().recommend) {
          <span class="badge badge-light">Recommended</span>
        }
        @if (roaster().hasMembershipOption) {
          <span class="badge">Membership</span>
        }
      </p>
    </article>
  `,
})
export class RoasterCard {
  readonly roaster = input.required<Roaster>();
}
