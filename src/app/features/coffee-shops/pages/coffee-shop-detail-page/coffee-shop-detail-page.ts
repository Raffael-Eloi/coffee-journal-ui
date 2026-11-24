import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/ui/icon/icon';
import { CoffeeShop } from '../../coffee-shop.model';
import { CoffeeShopsService } from '../../coffee-shops.service';

const STARS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-coffee-shop-detail-page',
  imports: [RouterLink, NgOptimizedImage, Icon],
  template: `
    @if (coffeeShop.isLoading()) {
      <p class="text-husk" role="status">Loading…</p>
    } @else if (coffeeShop.error()) {
      <p class="text-error" role="alert">Could not load this coffee shop.</p>
    } @else if (coffeeShop.value(); as shop) {
      <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-xs text-husk">
            <a class="link" routerLink="/coffee-shops">Coffee Shops</a>
            @if (shop.city) {
              <span aria-hidden="true">›</span>
              <span>{{ shop.city }}</span>
            }
            <span aria-hidden="true">›</span>
            <span aria-current="page" class="font-semibold text-terracotta">{{ shop.name }}</span>
          </nav>

          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex max-w-3xl flex-col gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="badge badge-rating">
                  <span class="star" aria-hidden="true">★</span>
                  <span class="sr-only">Rate:</span>
                  {{ shop.rate }} / 5
                </span>
                @if (shop.recommend) {
                  <span class="badge badge-light">Recommended</span>
                }
              </div>

              <h1 class="text-4xl md:text-5xl">{{ shop.name }}</h1>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
                @if (address(shop); as text) {
                  <span class="flex items-center gap-1">
                    <app-icon name="pin" [size]="16" />
                    {{ text }}
                  </span>
                }
                @if (shop.website) {
                  <a
                    class="link inline-flex items-center gap-1"
                    [href]="shop.website"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <app-icon name="link" [size]="16" />
                    Visit website
                    <span class="sr-only">(opens in a new tab)</span>
                  </a>
                }
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <a class="btn btn-primary" [routerLink]="['/coffee-shops', shop.id, 'edit']">Edit</a>
              @if (confirmingDelete()) {
                <span>Delete this coffee shop?</span>
                <button type="button" class="btn btn-danger" (click)="remove()">
                  Confirm delete
                </button>
                <button type="button" class="link" (click)="confirmingDelete.set(false)">
                  Cancel
                </button>
              } @else {
                <button type="button" class="btn btn-ghost" (click)="confirmingDelete.set(true)">
                  Delete
                </button>
              }
            </div>
          </div>

          @if (deleteError()) {
            <p class="text-error" role="alert">Could not delete this coffee shop.</p>
          }
        </header>

        @if (shop.images?.length > 0) {
          <ul class="grid grid-cols-1 gap-6 md:grid-cols-12">
            @for (image of shop.images; track image.id; let i = $index) {
              <li [class]="imageSpan(i, shop.images.length)">
                <img
                  class="h-64 w-full rounded-xl border border-hairline object-cover md:h-[420px]"
                  [ngSrc]="image.url"
                  width="800"
                  height="600"
                  [alt]="'Photo ' + (i + 1) + ' of ' + shop.name"
                />
              </li>
            }
          </ul>
        }

        <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
          <section class="card flex flex-col gap-6 lg:col-span-8">
            <div class="flex items-center justify-between">
              <h2 class="field-label-sm">Field notes</h2>
              <p class="flex items-center gap-1 text-terracotta">
                <span aria-hidden="true">{{ stars(shop) }}</span>
                <span class="sr-only">Rated {{ shop.rate }} out of 5</span>
              </p>
            </div>
            @if (shop.review) {
              <blockquote
                class="font-display text-xl leading-relaxed text-espresso italic md:text-2xl"
              >
                “{{ shop.review }}”
              </blockquote>
            } @else {
              <p class="text-husk">No review yet.</p>
            }
          </section>

          <aside class="card flex flex-col gap-4 lg:col-span-4">
            <h2 class="text-xl">Venue</h2>
            <dl class="spec-list">
              <div>
                <dt class="spec-label">Recommended</dt>
                <dd class="spec-value">{{ shop.recommend ? 'Yes' : 'No' }}</dd>
              </div>
            </dl>
            @if (directionsUrl(shop); as url) {
              <a
                class="link inline-flex items-center gap-1"
                [href]="url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <app-icon name="pin" [size]="16" />
                Get directions
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            }
          </aside>
        </div>
      </div>
    }
  `,
})
export class CoffeeShopDetailPage {
  private readonly service = inject(CoffeeShopsService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly coffeeShop = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  /** Short address for the header: the full `location` already names city and country, so it is not repeated. */
  protected address(shop: CoffeeShop): string {
    return shop.location || [shop.city, shop.state, shop.country].filter(Boolean).join(', ');
  }

  protected directionsUrl(shop: CoffeeShop): string {
    const query = [shop.location, shop.city, shop.state, shop.country].filter(Boolean).join(', ');
    return query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : '';
  }

  protected stars(shop: CoffeeShop): string {
    return STARS.map((n) => (n <= shop.rate ? '★' : '☆')).join('');
  }

  /** One image fills the row, two split it, three or more get a wide first image. */
  protected imageSpan(index: number, count: number): string {
    if (count === 1) return 'md:col-span-12';
    if (count === 2 || index === 0) return 'md:col-span-6';
    return 'md:col-span-3';
  }

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
