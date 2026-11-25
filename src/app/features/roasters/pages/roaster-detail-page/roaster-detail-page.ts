import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Roaster } from '../../roaster.model';
import { RoastersService } from '../../roasters.service';
import { TranslocoPipe } from '@jsverse/transloco';

const STARS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-roaster-detail-page',
  imports: [TranslocoPipe, RouterLink, NgOptimizedImage, Icon],
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
                <div class="flex flex-wrap items-center gap-2">
                  <span class="badge badge-rating">
                    <span class="star" aria-hidden="true">★</span>
                    <span class="sr-only">{{ 'common.rateLabel' | transloco }}</span>
                    {{ 'common.ratingBadge' | transloco: { rate: r.rate } }}
                  </span>
                  @if (r.recommend) {
                    <span class="badge badge-light">{{ 'common.recommended' | transloco }}</span>
                  }
                  @if (r.hasMembershipOption) {
                    <span class="badge badge-medium">{{
                      'roasters.detail.membership' | transloco
                    }}</span>
                  }
                </div>

                <h1 class="text-4xl md:text-5xl">{{ r.name }}</h1>

                @if (r.website) {
                  <a
                    class="link inline-flex items-center gap-1 self-start"
                    [href]="r.website"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <app-icon name="link" [size]="16" />
                    {{ 'common.websiteLink' | transloco }}
                    <span class="sr-only">{{ 'common.opensInNewTab' | transloco }}</span>
                  </a>
                }
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

        <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
          <section class="card flex flex-col gap-6 lg:col-span-8">
            <div class="flex items-center justify-between">
              <h2 class="field-label-sm">{{ 'common.fieldNotes' | transloco }}</h2>
              <p class="flex items-center gap-1 text-terracotta">
                <span aria-hidden="true">{{ stars(r) }}</span>
                <span class="sr-only">{{ 'common.ratedOutOf' | transloco: { rate: r.rate } }}</span>
              </p>
            </div>
            @if (r.review) {
              <blockquote
                class="font-display text-xl leading-relaxed text-espresso italic md:text-2xl"
              >
                “{{ r.review }}”
              </blockquote>
            } @else {
              <p class="text-husk">{{ 'common.noReview' | transloco }}</p>
            }
          </section>

          <aside class="card flex flex-col gap-4 lg:col-span-4">
            <h2 class="text-xl">{{ 'roasters.detail.title' | transloco }}</h2>
            <dl class="spec-list">
              <div>
                <dt class="spec-label">{{ 'common.recommended' | transloco }}</dt>
                <dd class="spec-value">
                  {{ (r.recommend ? 'common.yes' : 'common.no') | transloco }}
                </dd>
              </div>
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
            </dl>
          </aside>
        </div>
      </div>
    }
  `,
})
export class RoasterDetailPage {
  private readonly service = inject(RoastersService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly roaster = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly confirmingDelete = signal(false);
  protected readonly deleteError = signal(false);

  protected stars(roaster: Roaster): string {
    return STARS.map((n) => (n <= roaster.rate ? '★' : '☆')).join('');
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
