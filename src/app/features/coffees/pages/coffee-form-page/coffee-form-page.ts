import { Component, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { FieldErrors, validationErrors } from '../../../../shared/api/validation-errors';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { RoastersService } from '../../../roasters/roasters.service';
import { CoffeeForm } from '../../components/coffee-form/coffee-form';
import { CoffeeInput } from '../../coffee.model';
import { CoffeesService } from '../../coffees.service';

@Component({
  selector: 'app-coffee-form-page',
  imports: [TranslocoPipe, RouterLink, FormPageHeader, CoffeeForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <a class="link self-start" routerLink="/coffees">{{ 'coffees.form.back' | transloco }}</a>
      <app-form-page-header
        eyebrow="coffees.form.eyebrow"
        [title]="id() === undefined ? 'coffees.form.addTitle' : 'coffees.form.editTitle'"
        description="coffees.form.description"
      />

      @if (coffee.error() || roasters.error()) {
        <p class="text-error" role="alert">{{ 'coffees.form.loadError' | transloco }}</p>
      } @else if (roasters.value(); as roasterList) {
        @if (id() === undefined || coffee.value()) {
          <app-coffee-form
            [roasters]="roasterList"
            [initialValue]="coffee.value()"
            [saving]="saving()"
            [serverErrors]="fieldErrors()"
            (submitted)="save($event)"
          />
          @if (saveError()) {
            <p class="mt-2 text-error" role="alert">{{ 'coffees.form.saveError' | transloco }}</p>
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
export class CoffeeFormPage {
  private readonly coffeesService = inject(CoffeesService);
  private readonly roastersService = inject(RoastersService);
  private readonly router = inject(Router);

  /** Present on `/coffees/:id/edit`, absent on `/coffees/new`. */
  readonly id = input<string>();

  protected readonly coffee = resource({
    params: () => this.id(),
    loader: ({ params }) => this.coffeesService.get(params),
  });
  protected readonly roasters = resource({ loader: () => this.roastersService.list() });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);
  protected readonly fieldErrors = signal<FieldErrors>({});

  protected async save(value: CoffeeInput): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    this.fieldErrors.set({});
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.coffeesService.create(value);
        await this.router.navigate(['/coffees', created.id]);
      } else {
        await this.coffeesService.update(id, value);
        await this.router.navigate(['/coffees', id]);
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
