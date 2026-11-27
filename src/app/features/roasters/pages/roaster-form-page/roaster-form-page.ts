import { Component, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { FieldErrors, validationErrors } from '../../../../shared/api/validation-errors';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { RoasterForm } from '../../components/roaster-form/roaster-form';
import { RoasterInput } from '../../roaster.model';
import { RoastersService } from '../../roasters.service';
import { BackLink } from '../../../../shared/ui/back-link/back-link';

@Component({
  selector: 'app-roaster-form-page',
  imports: [BackLink, TranslocoPipe, FormPageHeader, RoasterForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <app-back-link to="/roasters" label="roasters.form.back" />
      <app-form-page-header
        eyebrow="roasters.form.eyebrow"
        [title]="id() === undefined ? 'roasters.form.addTitle' : 'roasters.form.editTitle'"
        description="roasters.form.description"
      />

      @if (roaster.error()) {
        <p class="text-error" role="alert">{{ 'roasters.form.loadError' | transloco }}</p>
      } @else if (id() === undefined || roaster.value()) {
        <app-roaster-form
          [initialValue]="roaster.value()"
          [saving]="saving()"
          [serverErrors]="fieldErrors()"
          (submitted)="save($event)"
        />
        @if (saveError()) {
          <p class="mt-2 text-error" role="alert">{{ 'roasters.form.saveError' | transloco }}</p>
        }
      } @else {
        <p role="status">{{ 'common.loading' | transloco }}</p>
      }
    </div>
  `,
})
export class RoasterFormPage {
  private readonly service = inject(RoastersService);
  private readonly router = inject(Router);

  /** Present on `/roasters/:id/edit`, absent on `/roasters/new`. */
  readonly id = input<string>();

  protected readonly roaster = resource({
    params: () => this.id(),
    loader: ({ params }) => this.service.get(params),
  });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly fieldErrors = signal<FieldErrors>({});

  protected async save(value: RoasterInput): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.fieldErrors.set({});
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.service.create(value);
        await this.router.navigate(['/roasters', created.id]);
      } else {
        await this.service.update(id, value);
        await this.router.navigate(['/roasters', id]);
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
