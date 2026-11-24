import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Roaster } from '../../roaster.model';
import { RoastersService } from '../../roasters.service';

const STARS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-roaster-detail-page',
  imports: [RouterLink, NgOptimizedImage, Icon],
  template: `
    @if (roaster.isLoading()) {
      <p class="text-husk" role="status">Loading…</p>
    } @else if (roaster.error()) {
      <p class="text-error" role="alert">Could not load this roaster.</p>
    } @else if (roaster.value(); as r) {
      <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-xs text-husk">
            <a class="link" routerLink="/roasters">Roasters</a>
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
                  [alt]="r.name + ' logo'"
                />
              }
              <div class="flex flex-col gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="badge badge-rating">
                    <span class="star" aria-hidden="true">★</span>
                    <span class="sr-only">Rate:</span>
                    {{ r.rate }} / 5
                  </span>
                  @if (r.recommend) {
                    <span class="badge badge-light">Recommended</span>
                  }
                  @if (r.hasMembershipOption) {
                    <span class="badge badge-medium">Membership</span>
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
                    Visit website
                    <span class="sr-only">(opens in a new tab)</span>
                  </a>
                }
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <a class="btn btn-primary" [routerLink]="['/roasters', r.id, 'edit']">Edit</a>
              @if (confirmingDelete()) {
                <span>Delete this roaster?</span>
                <button type="button" class="btn btn-danger" (click)="remove()">Confirm delete</button>
                <button type="button" class="link" (click)="confirmingDelete.set(false)">Cancel</button>
              } @else {
                <button type="button" class="btn btn-ghost" (click)="confirmingDelete.set(true)">Delete</button>
              }
            </div>
          </div>

          @if (deleteError()) {
            <p class="text-error" role="alert">Could not delete this roaster.</p>
          }
        </header>

        <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
          <section class="card flex flex-col gap-6 lg:col-span-8">
            <div class="flex items-center justify-between">
              <h2 class="field-label-sm">Field notes</h2>
              <p class="flex items-center gap-1 text-terracotta">
                <span aria-hidden="true">{{ stars(r) }}</span>
                <span class="sr-only">Rated {{ r.rate }} out of 5</span>
              </p>
            </div>
            @if (r.review) {
              <blockquote class="font-display text-xl leading-relaxed text-espresso italic md:text-2xl">
                “{{ r.review }}”
              </blockquote>
            } @else {
              <p class="text-husk">No review yet.</p>
            }
          </section>

          <aside class="card flex flex-col gap-4 lg:col-span-4">
            <h2 class="text-xl">Roaster</h2>
            <dl class="spec-list">
              <div>
                <dt class="spec-label">Recommended</dt>
                <dd class="spec-value">{{ r.recommend ? 'Yes' : 'No' }}</dd>
              </div>
              <div>
                <dt class="spec-label">Membership</dt>
                <dd class="spec-value">{{ r.hasMembershipOption ? 'Available' : 'Not available' }}</dd>
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
