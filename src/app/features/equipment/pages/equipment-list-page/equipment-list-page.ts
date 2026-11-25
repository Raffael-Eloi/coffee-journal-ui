import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { EquipmentCard } from '../../components/equipment-card/equipment-card';
import { EquipmentService } from '../../equipment.service';

@Component({
  selector: 'app-equipment-list-page',
  imports: [TranslocoPipe, RouterLink, EquipmentCard],
  template: `
    <div class="flex flex-col gap-8">
      <header class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex max-w-3xl flex-col gap-1">
          <p class="text-[0.6875rem] font-semibold tracking-wider text-terracotta uppercase">
            {{ 'equipment.list.eyebrow' | transloco }}
          </p>
          <h1 class="tracking-tight">{{ 'equipment.list.title' | transloco }}</h1>
          <p class="text-on-surface-variant">
            {{ 'equipment.list.subtitle' | transloco }}
          </p>
        </div>
        <a class="btn btn-action self-start lg:self-end" routerLink="/equipment/new">
          {{ 'equipment.list.add' | transloco }}
        </a>
      </header>

      <section class="flex flex-col gap-4 rounded-xl border border-hairline bg-surface p-6 ">
        <div
          class="flex flex-wrap items-center gap-2"
          role="group"
          [attr.aria-label]="'equipment.list.categoriesLabel' | transloco"
        >
          <button
            type="button"
            [class]="pillClass(selectedCategory() === '')"
            [attr.aria-pressed]="selectedCategory() === ''"
            (click)="selectedCategory.set('')"
          >
            {{ 'equipment.list.all' | transloco }}
          </button>
          @for (category of categories.value() ?? []; track category.id) {
            <button
              type="button"
              [class]="pillClass(selectedCategory() === category.id)"
              [attr.aria-pressed]="selectedCategory() === category.id"
              (click)="selectedCategory.set(category.id)"
            >
              {{ category.name }}
            </button>
          }
        </div>
      </section>

      @if (equipment.isLoading()) {
        <p class="text-husk" role="status">{{ 'common.loading' | transloco }}</p>
      } @else if (equipment.error()) {
        <div>
          <p class="text-error" role="alert">{{ 'equipment.list.loadError' | transloco }}</p>
          <button type="button" class="link mt-2" (click)="equipment.reload()">
            {{ 'common.tryAgain' | transloco }}
          </button>
        </div>
      } @else if (pieceCount() === 0) {
        <p class="text-husk">{{ 'equipment.list.empty' | transloco }}</p>
      } @else if (filtered().length === 0) {
        <p class="text-husk" role="status">{{ 'equipment.list.noMatches' | transloco }}</p>
      } @else {
        <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (item of filtered(); track item.id) {
            <li>
              <app-equipment-card
                [equipment]="item"
                [categoryName]="categoryNames().get(item.equipmentCategoryId) ?? ''"
              />
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class EquipmentListPage {
  private readonly service = inject(EquipmentService);

  protected readonly equipment = resource({ loader: () => this.service.list() });
  protected readonly categories = resource({ loader: () => this.service.listCategories() });

  /** Id of the category to show; empty shows all. */
  protected readonly selectedCategory = signal('');

  protected readonly categoryNames = computed(
    () => new Map((this.categories.value() ?? []).map((category) => [category.id, category.name])),
  );
  protected readonly pieceCount = computed(() => this.equipment.value()?.length ?? 0);

  protected readonly filtered = computed(() => {
    const category = this.selectedCategory();
    return (this.equipment.value() ?? []).filter(
      (item) => category === '' || item.equipmentCategoryId === category,
    );
  });

  protected pillClass(active: boolean): string {
    return (
      'cursor-pointer rounded-full px-4 py-1 text-xs font-semibold transition-colors ' +
      (active ? 'bg-espresso text-white' : 'text-on-surface-variant hover:bg-container-high')
    );
  }
}
