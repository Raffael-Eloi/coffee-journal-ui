import { ReviewsSection } from '../../../../shared/reviews/reviews-section/reviews-section';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContributorNote } from '../../../profile/contributor-note/contributor-note';
import { CurrentUserService } from '../../../profile/current-user.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { Icon } from '../../../../shared/ui/icon/icon';
import { PhotoGallery } from '../../../../shared/ui/photo-gallery/photo-gallery';
import { RoastersService } from '../../../roasters/roasters.service';
import { SymbolIcon } from '../../../../shared/ui/symbol/symbol';
import {
  AMENITY_ICONS,
  BREWING_METHOD_ICONS,
  CoffeeShop,
  DayOfWeek,
  OpeningHours,
} from '../../coffee-shop.model';
import { CoffeeShopsService } from '../../coffee-shops.service';

/** Monday first: the week as people read it. */
const WEEK: readonly DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

@Component({
  selector: 'app-coffee-shop-detail-page',
  imports: [
    TranslocoPipe,
    OptionLabelPipe,
    RouterLink,
    Icon,
    PhotoGallery,
    ReviewsSection,
    SymbolIcon,
    ContributorNote,
  ],
  template: `
    @if (coffeeShop.isLoading()) {
      <p class="text-husk" role="status">{{ 'common.loading' | transloco }}</p>
    } @else if (coffeeShop.error()) {
      <p class="text-error" role="alert">{{ 'coffeeShops.detail.loadError' | transloco }}</p>
    } @else if (coffeeShop.value(); as shop) {
      <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-4">
          <nav
            [attr.aria-label]="'common.breadcrumb' | transloco"
            class="flex flex-wrap items-center gap-2 text-xs text-husk"
          >
            <a class="link" routerLink="/coffee-shops">{{ 'nav.coffeeShops' | transloco }}</a>
            @if (shop.city) {
              <span aria-hidden="true">›</span>
              <span>{{ shop.city }}</span>
            }
            <span aria-hidden="true">›</span>
            <span aria-current="page" class="font-semibold text-terracotta">{{ shop.name }}</span>
          </nav>

          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex max-w-3xl flex-col gap-3">
              <h1 class="text-4xl md:text-5xl">{{ shop.name }}</h1>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
                <span class="flex items-center gap-1">
                  <app-icon name="pin" [size]="16" />
                  {{ address(shop) }}
                </span>
                @if (shop.website) {
                  <a
                    class="link inline-flex items-center gap-1"
                    [href]="shop.website"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <app-icon name="link" [size]="16" />
                    {{ 'common.websiteLink' | transloco }}
                    <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
                  </a>
                }
                @if (shop.instagramUrl) {
                  <a
                    class="link inline-flex items-center gap-1"
                    [href]="shop.instagramUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <app-icon name="link" [size]="16" />
                    {{ 'common.instagram' | transloco }}
                    <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
                  </a>
                }
                @if (shop.phoneNumber) {
                  <a class="link" [href]="'tel:' + shop.phoneNumber">{{ shop.phoneNumber }}</a>
                }
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <app-contributor-note />
              @if (currentUser.canContribute()) {
                <a class="btn btn-primary" [routerLink]="['/coffee-shops', shop.id, 'edit']">{{
                  'common.edit' | transloco
                }}</a>
              }
              @if (currentUser.isAdmin() && confirmingDelete()) {
                <span>{{ 'coffeeShops.detail.confirmDelete' | transloco }}</span>
                <button type="button" class="btn btn-danger" (click)="remove()">
                  {{ 'common.confirmDelete' | transloco }}
                </button>
                <button type="button" class="link" (click)="confirmingDelete.set(false)">
                  {{ 'common.cancel' | transloco }}
                </button>
              } @else if (currentUser.isAdmin()) {
                <button type="button" class="btn btn-ghost" (click)="confirmingDelete.set(true)">
                  {{ 'common.delete' | transloco }}
                </button>
              }
            </div>
          </div>

          @if (deleteError()) {
            <p class="text-error" role="alert">
              {{ 'coffeeShops.detail.deleteError' | transloco }}
            </p>
          }
        </header>

        <app-photo-gallery [urls]="shop.imageUrls" [name]="shop.name" />

        <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div class="flex flex-col gap-6 lg:col-span-8">
            <section class="card flex flex-col gap-4">
              <h2 class="field-label-sm">{{ 'common.about' | transloco }}</h2>
              @if (shop.description) {
                <p class="text-lg leading-relaxed whitespace-pre-line text-espresso">
                  {{ shop.description }}
                </p>
              } @else {
                <p class="text-husk">{{ 'common.noDescription' | transloco }}</p>
              }
            </section>

            <section class="card flex flex-col gap-2">
              <h2 class="field-label-sm">{{ 'coffeeShops.detail.hours' | transloco }}</h2>
              @if (shop.openingHours.length === 0) {
                <p class="text-husk">{{ 'coffeeShops.detail.noHours' | transloco }}</p>
              } @else {
                <dl class="spec-list">
                  @for (row of week(); track row.day) {
                    <div>
                      <dt class="spec-label">{{ row.day + '' | optionLabel: 'dayOfWeek' }}</dt>
                      <dd class="spec-value">
                        @if (row.windows.length === 0) {
                          <span class="font-normal text-husk">{{
                            'coffeeShops.detail.closed' | transloco
                          }}</span>
                        } @else {
                          @for (window of row.windows; track window) {
                            <span class="mr-4 inline-block">{{ window }}</span>
                          }
                        }
                      </dd>
                    </div>
                  }
                </dl>
              }
            </section>
          </div>

          <aside class="card flex flex-col gap-6 lg:col-span-4">
            <h2 class="text-xl">{{ 'coffeeShops.detail.venue' | transloco }}</h2>

            @if (shopRoasters().length > 0) {
              <div class="flex flex-col gap-2">
                <h3 class="field-label-sm">{{ 'coffeeShops.detail.roasters' | transloco }}</h3>
                <ul class="flex flex-col gap-1">
                  @for (roaster of shopRoasters(); track roaster.id) {
                    <li>
                      <a class="link" [routerLink]="['/roasters', roaster.id]">{{
                        roaster.name
                      }}</a>
                    </li>
                  }
                </ul>
              </div>
            }

            @if (shop.brewingMethods.length > 0) {
              <div class="flex flex-col gap-2">
                <h3 class="field-label-sm">
                  {{ 'coffeeShops.detail.brewingMethods' | transloco }}
                </h3>
                <ul class="flex flex-wrap gap-2">
                  @for (method of shop.brewingMethods; track method) {
                    <li class="badge badge-medium gap-1.5">
                      <app-symbol [name]="brewingMethodIcons[method]" [size]="16" />
                      {{ method + '' | optionLabel: 'brewingMethod' }}
                    </li>
                  }
                </ul>
              </div>
            }

            @if (shop.amenities.length > 0) {
              <div class="flex flex-col gap-2">
                <h3 class="field-label-sm">{{ 'coffeeShops.detail.amenities' | transloco }}</h3>
                <ul class="flex flex-wrap gap-2">
                  @for (amenity of shop.amenities; track amenity) {
                    <li class="badge badge-light gap-1.5">
                      <app-symbol [name]="amenityIcons[amenity]" [size]="16" />
                      {{ amenity + '' | optionLabel: 'amenity' }}
                    </li>
                  }
                </ul>
              </div>
            }

            <dl class="spec-list">
              <div>
                <dt class="spec-label">{{ 'coffeeShops.detail.timeZone' | transloco }}</dt>
                <dd class="spec-value text-base">{{ shop.timeZone }}</dd>
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
                {{ 'common.getDirections' | transloco }}
                <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
              </a>
            }
          </aside>
        </div>

        <app-reviews-section path="coffee-shops" [itemId]="shop.id" />
      </div>
    }
  `,
})
export class CoffeeShopDetailPage {
  private readonly service = inject(CoffeeShopsService);
  private readonly roastersService = inject(RoastersService);
  private readonly router = inject(Router);
  protected readonly currentUser = inject(CurrentUserService);

  protected readonly brewingMethodIcons = BREWING_METHOD_ICONS;
  protected readonly amenityIcons = AMENITY_ICONS;

  readonly id = input.required<string>();

  protected readonly coffeeShop = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  private readonly allRoasters = resource({ loader: () => this.roastersService.list() });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  /** The roasters the shop serves, by name. */
  protected readonly shopRoasters = computed(() => {
    const ids = this.coffeeShop.value()?.roasterIds ?? [];
    return (this.allRoasters.value() ?? []).filter((roaster) => ids.includes(roaster.id));
  });

  /** The opening windows of each day, Monday first. */
  protected readonly week = computed(() => {
    const hours = this.coffeeShop.value()?.openingHours ?? [];
    return WEEK.map((day) => ({
      day,
      windows: hours
        .filter((item) => item.dayOfWeek === day)
        .sort((a, b) => a.opensAt.localeCompare(b.opensAt))
        .map((item) => this.window(item)),
    }));
  });

  /** Short address for the header: the street address with the city and state. */
  protected address(shop: CoffeeShop): string {
    return [shop.address, shop.city, shop.state].filter(Boolean).join(', ');
  }

  protected directionsUrl(shop: CoffeeShop): string {
    const query = [shop.address, shop.city, shop.state, shop.country].filter(Boolean).join(', ');
    return query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : '';
  }

  private window(hours: OpeningHours): string {
    return `${hours.opensAt.slice(0, 5)} – ${hours.closesAt.slice(0, 5)}`;
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
