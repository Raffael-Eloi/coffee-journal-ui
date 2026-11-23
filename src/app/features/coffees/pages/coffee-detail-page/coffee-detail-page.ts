import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeesService } from '../../coffees.service';

@Component({
  selector: 'app-coffee-detail-page',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <a class="underline" routerLink="/coffees">← Coffees</a>

    @if (coffee.isLoading()) {
      <p class="mt-4" role="status">Loading…</p>
    } @else if (coffee.error()) {
      <p class="mt-4 text-red-700" role="alert">Could not load this coffee.</p>
    } @else if (coffee.value(); as c) {
      <h1 class="mt-4 text-2xl font-semibold">{{ c.name }}</h1>
      @if (roaster.value(); as r) {
        <p class="text-stone-700">
          by <a class="underline" [routerLink]="['/roasters', r.id]">{{ r.name }}</a>
        </p>
      }
      <p class="mt-2">{{ c.description }}</p>

      <dl class="mt-4 grid max-w-xl grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
        <dt class="font-semibold">Rate</dt>
        <dd>{{ c.rate }}</dd>
        <dt class="font-semibold">Recommended</dt>
        <dd>{{ c.recommend ? 'Yes' : 'No' }}</dd>
        <dt class="font-semibold">Origin</dt>
        <dd>{{ c.origin }}</dd>
        <dt class="font-semibold">Process</dt>
        <dd>{{ c.process }}</dd>
        <dt class="font-semibold">Roast level</dt>
        <dd>{{ c.roastLevel }}</dd>
        <dt class="font-semibold">Variety</dt>
        <dd>{{ c.variety }}</dd>
        <dt class="font-semibold">Tasting notes</dt>
        <dd>{{ c.tastingNotes }}</dd>
        <dt class="font-semibold">Review</dt>
        <dd>{{ c.review }}</dd>
      </dl>

      @if (c.prices.length > 0) {
        <h2 class="mt-4 text-lg font-semibold">Prices</h2>
        <ul>
          @for (price of c.prices; track price.id) {
            <li>{{ price.grams }} g — {{ price.price }}</li>
          }
        </ul>
      }

      @if (c.images.length > 0) {
        <ul class="mt-4 flex flex-wrap gap-4">
          @for (image of c.images; track image.id) {
            <li>
              <img [ngSrc]="image.url" width="240" height="180" [alt]="'Photo of ' + c.name" />
            </li>
          }
        </ul>
      }

      <div class="mt-6 flex items-center gap-4">
        <a class="rounded bg-stone-900 px-4 py-2 text-white" [routerLink]="['/coffees', c.id, 'edit']">
          Edit
        </a>

        @if (confirmingDelete()) {
          <span>Delete this coffee?</span>
          <button type="button" class="rounded bg-red-800 px-4 py-2 text-white" (click)="remove()">
            Confirm delete
          </button>
          <button type="button" class="underline" (click)="confirmingDelete.set(false)">Cancel</button>
        } @else {
          <button type="button" class="underline" (click)="confirmingDelete.set(true)">Delete</button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-red-700" role="alert">Could not delete this coffee.</p>
      }
    }
  `,
})
export class CoffeeDetailPage {
  private readonly coffeesService = inject(CoffeesService);
  private readonly roastersService = inject(RoastersService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly coffee = resource({
    params: () => this.id(),
    loader: ({ params }) => this.coffeesService.get(params),
  });
  protected readonly roaster = resource({
    params: () => this.coffee.value()?.roasterId,
    loader: ({ params }) => this.roastersService.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  protected async remove(): Promise<void> {
    this.deleteError.set(false);
    try {
      await this.coffeesService.remove(this.id());
      await this.router.navigate(['/coffees']);
    } catch {
      this.deleteError.set(true);
    }
  }
}
