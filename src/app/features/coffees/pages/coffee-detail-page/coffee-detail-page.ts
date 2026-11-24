import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeesService } from '../../coffees.service';

@Component({
  selector: 'app-coffee-detail-page',
  imports: [RouterLink, NgOptimizedImage, CurrencyPipe],
  template: `
    <a class="link" routerLink="/coffees">← Coffees</a>

    @if (coffee.isLoading()) {
      <p class="mt-4 text-husk" role="status">Loading…</p>
    } @else if (coffee.error()) {
      <p class="mt-4 text-error" role="alert">Could not load this coffee.</p>
    } @else if (coffee.value(); as c) {
      <h1 class="mt-4">{{ c.name }}</h1>
      @if (roaster.value(); as r) {
        <p class="text-husk">
          by <a class="link" [routerLink]="['/roasters', r.id]">{{ r.name }}</a>
        </p>
      }
      <p class="mt-2">{{ c.description }}</p>

      <dl class="spec-list mt-6 max-w-3xl">
        <div>
          <dt class="spec-label">Rate</dt>
          <dd class="spec-value">{{ c.rate }}</dd>
        </div>
        <div>
          <dt class="spec-label">Recommended</dt>
          <dd class="spec-value">{{ c.recommend ? 'Yes' : 'No' }}</dd>
        </div>
        <div>
          <dt class="spec-label">Origin</dt>
          <dd class="spec-value">{{ c.origin }}</dd>
        </div>
        <div>
          <dt class="spec-label">Process</dt>
          <dd class="spec-value">{{ c.process }}</dd>
        </div>
        <div>
          <dt class="spec-label">Roast level</dt>
          <dd class="spec-value">{{ c.roastLevel }}</dd>
        </div>
        <div>
          <dt class="spec-label">Variety</dt>
          <dd class="spec-value">{{ c.variety }}</dd>
        </div>
        <div>
          <dt class="spec-label">Tasting notes</dt>
          <dd class="spec-value font-normal">{{ c.tastingNotes }}</dd>
        </div>
        <div>
          <dt class="spec-label">Review</dt>
          <dd class="spec-value font-normal">{{ c.review }}</dd>
        </div>
      </dl>

      @if (c.prices.length > 0) {
        <h2 class="mt-8">Prices</h2>
        <ul>
          @for (price of c.prices; track price.id) {
            <li>{{ price.grams }} g — {{ price.price | currency: price.currency }}</li>
          }
        </ul>
      }

      @if (c.images.length > 0) {
        <ul class="mt-6 flex flex-wrap gap-4">
          @for (image of c.images; track image.id) {
            <li>
              <img
                class="rounded-lg border border-hairline"
                [ngSrc]="image.url"
                width="240"
                height="180"
                [alt]="'Photo of ' + c.name"
              />
            </li>
          }
        </ul>
      }

      <div class="mt-6 flex items-center gap-4">
        <a class="btn btn-primary" [routerLink]="['/coffees', c.id, 'edit']"> Edit </a>

        @if (confirmingDelete()) {
          <span>Delete this coffee?</span>
          <button type="button" class="btn btn-danger" (click)="remove()">Confirm delete</button>
          <button type="button" class="link" (click)="confirmingDelete.set(false)">Cancel</button>
        } @else {
          <button type="button" class="link" (click)="confirmingDelete.set(true)">Delete</button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-error" role="alert">Could not delete this coffee.</p>
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
