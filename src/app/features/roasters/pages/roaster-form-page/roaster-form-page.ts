import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormPageHeader } from '../../../../shared/ui/form-page-header/form-page-header';
import { RoasterForm } from '../../components/roaster-form/roaster-form';
import { Roaster, RoasterFormValue, RoasterInput } from '../../roaster.model';
import { RoastersService } from '../../roasters.service';
import { TranslocoPipe } from '@jsverse/transloco';

function toFormValue({
  id,
  createdAt,
  updatedAt,
  website,
  logoUrl,
  ...rest
}: Roaster): RoasterFormValue {
  return { ...rest, website: website ?? '', logoUrl: logoUrl ?? '' };
}

function toInput({ website, logoUrl, ...rest }: RoasterFormValue): RoasterInput {
  return { ...rest, website: website || null, logoUrl: logoUrl || null };
}

@Component({
  selector: 'app-roaster-form-page',
  imports: [TranslocoPipe, RouterLink, FormPageHeader, RoasterForm],
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-8">
      <a class="link self-start" routerLink="/roasters">{{ 'roasters.form.back' | transloco }}</a>
      <app-form-page-header
        eyebrow="roasters.form.eyebrow"
        [title]="id() === undefined ? 'roasters.form.addTitle' : 'roasters.form.editTitle'"
        description="roasters.form.description"
      />

      @if (roaster.error()) {
        <p class="text-error" role="alert">{{ 'roasters.form.loadError' | transloco }}</p>
      } @else if (id() === undefined || initialValue()) {
        <app-roaster-form
          [initialValue]="initialValue()"
          [saving]="saving()"
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
  protected readonly initialValue = computed(() => {
    const roaster = this.roaster.value();
    return roaster ? toFormValue(roaster) : undefined;
  });
  protected readonly saving = signal(false);
  protected readonly saveError = signal(false);

  protected async save(value: RoasterFormValue): Promise<void> {
    this.saving.set(true);
    this.saveError.set(false);
    try {
      const id = this.id();
      if (id === undefined) {
        const created = await this.service.create(toInput(value));
        await this.router.navigate(['/roasters', created.id]);
      } else {
        await this.service.update(id, toInput(value));
        await this.router.navigate(['/roasters', id]);
      }
    } catch {
      this.saveError.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
