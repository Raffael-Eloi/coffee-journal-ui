import { ReviewsSection } from '../../../../shared/reviews/reviews-section/reviews-section';
import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { COFFEE_CLASSIFICATION_ICONS } from '../../../../shared/models/coffee-classification';
import { Icon } from '../../../../shared/ui/icon/icon';
import { SymbolIcon } from '../../../../shared/ui/symbol/symbol';
import { PhotoGallery } from '../../../../shared/ui/photo-gallery/photo-gallery';
import { Roaster } from '../../roaster.model';
import { RoastersService } from '../../roasters.service';

@Component({
  selector: 'app-roaster-detail-page',
  imports: [
    TranslocoPipe,
    OptionLabelPipe,
    RouterLink,
    NgOptimizedImage,
    Icon,
    PhotoGallery,
    ReviewsSection,
    SymbolIcon,
  ],
  template: `
    @if (roaster.isLoading()) {
      <p class="text-husk" role="status">{{ 'common.loading' | transloco }}</p>
    } @else if (roaster.error()) {
      <p class="text-error" role="alert">{{ 'roasters.detail.loadError' | transloco }}</p>
    } @else if (roaster.value(); as r) {
      <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-4">
          <nav
            [attr.aria-label]="'common.breadcrumb' | transloco"
            class="flex flex-wrap items-center gap-2 text-xs text-husk"
          >
            <a class="link" routerLink="/roasters">{{ 'nav.roasters' | transloco }}</a>
            <span aria-hidden="true">›</span>
            <span aria-current="page" class="font-semibold text-terracotta">{{ r.name }}</span>
          </nav>

          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex max-w-3xl items-start gap-5">
              @if (r.logoUrl) {
                <img
                  class="rounded-xl border border-hairline object-cover"
                  [ngSrc]="r.logoUrl"
                  width="96"
                  height="96"
                  [alt]="'roasters.detail.logoAlt' | transloco: { name: r.name }"
                />
              }
              <div class="flex flex-col gap-3">
                @if (r.classifications.length > 0 || r.hasMembershipOption) {
                  <div class="flex flex-wrap items-center gap-2">
                    @for (classification of r.classifications; track classification) {
                      <span class="badge badge-light gap-1.5">
                        <app-symbol [name]="classificationIcons[classification]" [size]="16" />
                        {{ classification + '' | optionLabel: 'classification' }}
                      </span>
                    }
                    @if (r.hasMembershipOption) {
                      <span class="badge badge-medium">{{
                        'roasters.detail.membership' | transloco
                      }}</span>
                    }
                  </div>
                }

                <h1 class="text-4xl md:text-5xl">{{ r.name }}</h1>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
                  <span class="flex items-center gap-1">
                    <app-icon name="pin" [size]="16" />
                    {{ place(r) }}
                  </span>
                  @if (r.website) {
                    <a
                      class="link inline-flex items-center gap-1"
                      [href]="r.website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <app-icon name="link" [size]="16" />
                      {{ 'common.websiteLink' | transloco }}
                      <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
                    </a>
                  }
                  @if (r.instagramUrl) {
                    <a
                      class="link inline-flex items-center gap-1"
                      [href]="r.instagramUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <app-icon name="link" [size]="16" />
                      {{ 'common.instagram' | transloco }}
                      <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
                    </a>
                  }
                  @if (r.phoneNumber) {
                    <a class="link" [href]="'tel:' + r.phoneNumber">{{ r.phoneNumber }}</a>
                  }
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <a class="btn btn-primary" [routerLink]="['/roasters', r.id, 'edit']">{{
                'common.edit' | transloco
              }}</a>
              @if (confirmingDelete()) {
                <span>{{ 'roasters.detail.confirmDelete' | transloco }}</span>
                <button type="button" class="btn btn-danger" (click)="remove()">
                  {{ 'common.confirmDelete' | transloco }}
                </button>
                <button type="button" class="link" (click)="confirmingDelete.set(false)">
                  {{ 'common.cancel' | transloco }}
                </button>
              } @else {
                <button type="button" class="btn btn-ghost" (click)="confirmingDelete.set(true)">
                  {{ 'common.delete' | transloco }}
                </button>
              }
            </div>
          </div>

          @if (deleteError()) {
            <p class="text-error" role="alert">{{ 'roasters.detail.deleteError' | transloco }}</p>
          }
        </header>

        <app-photo-gallery [urls]="r.imageUrls" [name]="r.name" />

        <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
          <section class="card flex flex-col gap-4 lg:col-span-8">
            <h2 class="field-label-sm">{{ 'common.about' | transloco }}</h2>
            @if (r.description) {
              <p class="text-lg leading-relaxed whitespace-pre-line text-espresso">
                {{ r.description }}
              </p>
            } @else {
              <p class="text-husk">{{ 'common.noDescription' | transloco }}</p>
            }
          </section>

          <aside class="card flex flex-col gap-4 lg:col-span-4">
            <h2 class="text-xl">{{ 'roasters.detail.title' | transloco }}</h2>
            <dl class="spec-list">
              <div>
                <dt class="spec-label">{{ 'roasters.detail.membership' | transloco }}</dt>
                <dd class="spec-value">
                  {{
                    (r.hasMembershipOption
                      ? 'roasters.detail.available'
                      : 'roasters.detail.notAvailable'
                    ) | transloco
                  }}
                </dd>
              </div>
              @if (r.address) {
                <div>
                  <dt class="spec-label">{{ 'place.address' | transloco }}</dt>
                  <dd class="spec-value">{{ r.address }}</dd>
                </div>
              }
            </dl>
          </aside>
        </div>

        <app-reviews-section path="coffee-roasters" [itemId]="r.id" />
      </div>
    }
  `,
})
export class RoasterDetailPage {
  private readonly service = inject(RoastersService);
  private readonly router = inject(Router);

  protected readonly classificationIcons = COFFEE_CLASSIFICATION_ICONS;

  readonly id = input.required<string>();

  protected readonly roaster = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  /** Short place line for the header: the address when there is one, otherwise city, state and country. */
  protected place(roaster: Roaster): string {
    return (
      roaster.address || [roaster.city, roaster.state, roaster.country].filter(Boolean).join(', ')
    );
  }

  protected async remove(): Promise<void> {
    this.deleteError.set(false);
    try {
      await this.service.remove(this.id());
      await this.router.navigate(['/roasters']);
    } catch {
      this.deleteError.set(true);
    }
  }
}
