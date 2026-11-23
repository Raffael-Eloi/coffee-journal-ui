import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CoffeeShopsService } from '../../coffee-shops.service';

@Component({
  selector: 'app-coffee-shop-detail-page',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <a class="link" routerLink="/coffee-shops">← Coffee shops</a>

    @if (shop.isLoading()) {
      <p class="mt-4 text-husk" role="status">Loading…</p>
    } @else if (shop.error()) {
      <p class="mt-4 text-error" role="alert">Could not load this coffee shop.</p>
    } @else if (shop.value(); as s) {
      <h1 class="mt-4">{{ s.name }}</h1>
      <p class="text-husk">{{ s.city }}, {{ s.state }}, {{ s.country }}</p>

      <dl class="spec-list mt-6 max-w-3xl">
        <div>
          <dt class="spec-label">Rate</dt>
          <dd class="spec-value">{{ s.rate }}</dd>
        </div>
        <div>
          <dt class="spec-label">Recommended</dt>
          <dd class="spec-value">{{ s.recommend ? 'Yes' : 'No' }}</dd>
        </div>
        <div>
          <dt class="spec-label">Website</dt>
          <dd class="spec-value">{{ s.website }}</dd>
        </div>
        <div>
          <dt class="spec-label">Location</dt>
          <dd class="spec-value">{{ s.location }}</dd>
        </div>
        <div>
          <dt class="spec-label">Review</dt>
          <dd class="spec-value font-normal">{{ s.review }}</dd>
        </div>
      </dl>

      @if (s.images.length > 0) {
        <ul class="mt-6 flex flex-wrap gap-4">
          @for (image of s.images; track image.id) {
            <li>
              <img
                class="rounded-lg border border-hairline"
                [ngSrc]="image.url"
                width="240"
                height="180"
                [alt]="'Photo of ' + s.name"
              />
            </li>
          }
        </ul>
      }

      <div class="mt-6 flex items-center gap-4">
        <a class="btn btn-primary" [routerLink]="['/coffee-shops', s.id, 'edit']">
          Edit
        </a>

        @if (confirmingDelete()) {
          <span>Delete this coffee shop?</span>
          <button type="button" class="btn btn-danger" (click)="remove()">
            Confirm delete
          </button>
          <button type="button" class="link" (click)="confirmingDelete.set(false)">Cancel</button>
        } @else {
          <button type="button" class="link" (click)="confirmingDelete.set(true)">Delete</button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-error" role="alert">Could not delete this coffee shop.</p>
      }
    }
  `,
})
export class CoffeeShopDetailPage {
  private readonly service = inject(CoffeeShopsService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly shop = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  protected async remove(): Promise<void> {
    this.deleteError.set(false);
    try {
      await this.service.remove(this.id());
      await this.router.navigate(['/coffee-shops']);
    } catch {
      this.deleteError.set(true);
    }
  }
}
