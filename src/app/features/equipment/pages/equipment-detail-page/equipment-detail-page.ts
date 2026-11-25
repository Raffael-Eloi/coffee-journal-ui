import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { Icon } from '../../../../shared/ui/icon/icon';
import { EquipmentService } from '../../equipment.service';

const STARS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-equipment-detail-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgOptimizedImage,
    OptionLabelPipe,
    RouterLink,
    TranslocoPipe,
    Icon,
  ],
  template: `
    @if (equipment.isLoading()) {
      <p class="text-husk" role="status">{{ 'common.loading' | transloco }}</p>
    } @else if (equipment.error()) {
      <p class="text-error" role="alert">{{ 'equipment.detail.loadError' | transloco }}</p>
    } @else if (equipment.value(); as e) {
      <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-4">
          <nav
            [attr.aria-label]="'common.breadcrumb' | transloco"
            class="flex flex-wrap items-center gap-2 text-xs text-husk"
          >
            <a class="link" routerLink="/equipment">{{ 'nav.equipment' | transloco }}</a>
            @if (categoryName(); as category) {
              <span aria-hidden="true">›</span>
              <span>{{ category }}</span>
            }
            <span aria-hidden="true">›</span>
            <span aria-current="page" class="font-semibold text-terracotta">{{ e.name }}</span>
          </nav>

          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex max-w-3xl flex-col gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="badge badge-rating">
                  <span class="star" aria-hidden="true">★</span>
                  <span class="sr-only">{{ 'common.rateLabel' | transloco }}</span>
                  {{ 'common.ratingBadge' | transloco: { rate: e.rating } }}
                </span>
                <span class="badge badge-light">
                  {{ e.frequencyOfUse + '' | optionLabel: 'frequency' }}
                </span>
                @if (e.recommend) {
                  <span class="badge badge-light">{{ 'common.recommended' | transloco }}</span>
                }
              </div>

              <h1 class="text-4xl md:text-5xl">{{ e.name }}</h1>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
                <span
                  >{{ e.brand }}
                  @if (e.model) {
                    · {{ e.model }}
                  }
                </span>
                @if (e.link) {
                  <a
                    class="link inline-flex items-center gap-1"
                    [href]="e.link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <app-icon name="link" [size]="16" />
                    {{ 'equipment.detail.productLink' | transloco }}
                    <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
                  </a>
                }
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <a class="btn btn-primary" [routerLink]="['/equipment', e.id, 'edit']">{{
                'common.edit' | transloco
              }}</a>
              @if (confirmingDelete()) {
                <span>{{ 'equipment.detail.confirmDelete' | transloco }}</span>
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
            <p class="text-error" role="alert">{{ 'equipment.detail.deleteError' | transloco }}</p>
          }
        </header>

        <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div class="flex flex-col gap-6 lg:col-span-8">
            @if (e.imageUrl) {
              <img
                class="aspect-[4/3] w-full rounded-xl border border-hairline object-cover"
                [ngSrc]="e.imageUrl"
                width="800"
                height="600"
                priority
                [alt]="'equipment.detail.photoAlt' | transloco: { name: e.name }"
              />
            }

            <section class="card flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <h2 class="field-label-sm">{{ 'common.fieldNotes' | transloco }}</h2>
                <p class="flex items-center gap-1 text-terracotta">
                  <span aria-hidden="true">{{ stars() }}</span>
                  <span class="sr-only">
                    {{ 'common.ratedOutOf' | transloco: { rate: e.rating } }}
                  </span>
                </p>
              </div>
              <blockquote
                class="font-display text-xl leading-relaxed text-espresso italic md:text-2xl"
              >
                “{{ e.review }}”
              </blockquote>
            </section>
          </div>

          <aside class="card flex flex-col gap-4 lg:col-span-4">
            <h2 class="text-xl">{{ 'equipment.detail.details' | transloco }}</h2>
            <dl class="spec-list">
              @if (categoryName(); as category) {
                <div>
                  <dt class="spec-label">{{ 'equipment.detail.category' | transloco }}</dt>
                  <dd class="spec-value">{{ category }}</dd>
                </div>
              }
              <div>
                <dt class="spec-label">{{ 'equipment.detail.brand' | transloco }}</dt>
                <dd class="spec-value">{{ e.brand }}</dd>
              </div>
              @if (e.model) {
                <div>
                  <dt class="spec-label">{{ 'equipment.detail.model' | transloco }}</dt>
                  <dd class="spec-value">{{ e.model }}</dd>
                </div>
              }
              <div>
                <dt class="spec-label">{{ 'common.recommended' | transloco }}</dt>
                <dd class="spec-value">
                  {{ (e.recommend ? 'common.yes' : 'common.no') | transloco }}
                </dd>
              </div>
              <div>
                <dt class="spec-label">{{ 'equipment.detail.frequency' | transloco }}</dt>
                <dd class="spec-value">
                  {{ e.frequencyOfUse + '' | optionLabel: 'frequency' }}
                </dd>
              </div>
              @if (e.price !== null && e.currency) {
                <div>
                  <dt class="spec-label">{{ 'equipment.detail.price' | transloco }}</dt>
                  <dd class="spec-value">{{ e.price | currency: e.currency }}</dd>
                </div>
              }
              @if (e.purchaseDate) {
                <div>
                  <dt class="spec-label">{{ 'equipment.detail.purchased' | transloco }}</dt>
                  <dd class="spec-value">{{ e.purchaseDate | date: 'mediumDate' }}</dd>
                </div>
              }
            </dl>
          </aside>
        </div>
      </div>
    }
  `,
})
export class EquipmentDetailPage {
  private readonly service = inject(EquipmentService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly equipment = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  private readonly categories = resource({ loader: () => this.service.listCategories() });

  protected readonly categoryName = computed(() => {
    const categoryId = this.equipment.value()?.equipmentCategoryId;
    return this.categories.value()?.find((category) => category.id === categoryId)?.name;
  });
  protected readonly stars = computed(() => {
    const rating = this.equipment.value()?.rating ?? 0;
    return STARS.map((n) => (n <= rating ? '★' : '☆')).join('');
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  protected async remove(): Promise<void> {
    this.deleteError.set(false);
    try {
      await this.service.remove(this.id());
      await this.router.navigate(['/equipment']);
    } catch {
      this.deleteError.set(true);
    }
  }
}
