import { Component, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { FieldErrors, validationErrors } from '../../../../shared/api/validation-errors';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { EquipmentForm } from '../../components/equipment-form/equipment-form';
import { EquipmentInput } from '../../equipment.model';
import { EquipmentService } from '../../equipment.service';
import { BackLink } from '../../../../shared/ui/back-link/back-link';

@Component({
  selector: 'app-equipment-form-page',
  imports: [BackLink, TranslocoPipe, FormPageHeader, EquipmentForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <app-back-link to="/equipment" label="equipment.form.back" />
      <app-form-page-header
        eyebrow="equipment.form.eyebrow"
        [title]="id() === undefined ? 'equipment.form.addTitle' : 'equipment.form.editTitle'"
        description="equipment.form.description"
      />

      @if (equipment.error() || categories.error()) {
        <p class="text-error" role="alert">{{ 'equipment.form.loadError' | transloco }}</p>
      } @else if (categories.value(); as categoryList) {
        @if (id() === undefined || equipment.value()) {
          <app-equipment-form
            [categories]="categoryList"
            [initialValue]="equipment.value()"
            [saving]="saving()"
            [serverErrors]="fieldErrors()"
            (submitted)="save($event)"
          />
          @if (saveError()) {
            <p class="mt-2 text-error" role="alert">{{ 'equipment.form.saveError' | transloco }}</p>
          }
        } @else {
          <p role="status">{{ 'common.loading' | transloco }}</p>
        }
      } @else {
        <p role="status">{{ 'common.loading' | transloco }}</p>
      }
    </div>
  `,
})
export class EquipmentFormPage {
  private readonly service = inject(EquipmentService);
  private readonly router = inject(Router);

  /** Present on `/equipment/:id/edit`, absent on `/equipment/new`. */
  readonly id = input<string>();

  protected readonly equipment = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly categories = resource({ loader: () => this.service.listCategories() });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly fieldErrors = signal<FieldErrors>({});

  protected async save(value: EquipmentInput): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.fieldErrors.set({});
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.service.create(value);
        await this.router.navigate(['/equipment', created.id]);
      } else {
        await this.service.update(id, value);
        await this.router.navigate(['/equipment', id]);
      }
    } catch (error) {
      const problems = validationErrors(error);
      if (problems) this.fieldErrors.set(problems);
      else this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
