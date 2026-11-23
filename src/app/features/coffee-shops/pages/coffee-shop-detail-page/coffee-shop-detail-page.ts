import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CoffeeShopsService } from '../../coffee-shops.service';

@Component({
  selector: 'app-coffee-shop-detail-page',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <a class="underline" routerLink="/coffee-shops">← Coffee shops</a>

    @if (shop.isLoading()) {
      <p class="mt-4" role="status">Loading…</p>
    } @else if (shop.error()) {
      <p class="mt-4 text-red-700" role="alert">Could not load this coffee shop.</p>
    } @else if (shop.value(); as s) {
      <h1 class="mt-4 text-2xl font-semibold">{{ s.name }}</h1>
      <p class="text-stone-700">{{ s.city }}, {{ s.state }}, {{ s.country }}</p>

      <dl class="mt-4 grid max-w-xl grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
        <dt class="font-semibold">Rate</dt>
        <dd>{{ s.rate }}</dd>
        <dt class="font-semibold">Recommended</dt>
        <dd>{{ s.recommend ? 'Yes' : 'No' }}</dd>
        <dt class="font-semibold">Website</dt>
        <dd>{{ s.website }}</dd>
        <dt class="font-semibold">Location</dt>
        <dd>{{ s.location }}</dd>
        <dt class="font-semibold">Review</dt>
        <dd>{{ s.review }}</dd>
      </dl>

      @if (s.images.length > 0) {
        <ul class="mt-4 flex flex-wrap gap-4">
          @for (image of s.images; track image.id) {
            <li>
              <img
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
        <a class="rounded bg-stone-900 px-4 py-2 text-white" [routerLink]="['/coffee-shops', s.id, 'edit']">
          Edit
        </a>

        @if (confirmingDelete()) {
          <span>Delete this coffee shop?</span>
          <button type="button" class="rounded bg-red-800 px-4 py-2 text-white" (click)="remove()">
            Confirm delete
          </button>
          <button type="button" class="underline" (click)="confirmingDelete.set(false)">Cancel</button>
        } @else {
          <button type="button" class="underline" (click)="confirmingDelete.set(true)">Delete</button>
        }
      </div>

      @if (deleteError()) {
        <p class="mt-2 text-red-700" role="alert">Could not delete this coffee shop.</p>
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
