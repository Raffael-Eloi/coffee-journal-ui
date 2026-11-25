import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ImagesService } from '../../images/images.service';
import { Icon } from '../icon/icon';

/** Uploads a single image and keeps its URL (`label` is a translation key). Bound with `[formField]` to a `string` (`''` when empty). */
@Component({
  selector: 'app-logo-uploader',
  imports: [NgOptimizedImage, Icon, TranslocoPipe],
  template: `
    <fieldset class="flex flex-col gap-3">
      <legend class="field-label">{{ label() | transloco }}</legend>

      @if (value()) {
        <div class="relative self-start">
          <img
            class="h-24 w-24 rounded-lg border border-hairline object-cover"
            [ngSrc]="value()"
            width="96"
            height="96"
            [alt]="'ui.logoUploader.current' | transloco"
          />
          <button
            type="button"
            class="absolute -top-2 -right-2 rounded-full border border-outline bg-surface p-1 text-husk hover:text-error"
            [attr.aria-label]="'ui.logoUploader.remove' | transloco"
            [disabled]="disabled() || readonly()"
            (click)="remove()"
          >
            <app-icon name="close" [size]="14" />
          </button>
        </div>
      }

      <label
        class="btn btn-ghost cursor-pointer gap-2 self-start has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel"
      >
        <app-icon name="plus" [size]="16" />
        {{
          (uploading()
            ? 'ui.imageUploader.uploading'
            : value()
              ? 'ui.logoUploader.replace'
              : 'ui.logoUploader.upload'
          ) | transloco
        }}
        <input
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp"
          [disabled]="disabled() || readonly() || uploading()"
          (change)="onFile($event)"
        />
      </label>
      <p class="text-xs text-husk">{{ 'ui.logoUploader.hint' | transloco }}</p>

      @if (uploading()) {
        <p class="text-husk" role="status">{{ 'ui.imageUploader.uploading' | transloco }}</p>
      }
      @if (error(); as message) {
        <p class="field-error" role="alert">{{ message }}</p>
      }
    </fieldset>
  `,
})
export class LogoUploader implements FormValueControl<string> {
  private readonly images = inject(ImagesService);
  private readonly transloco = inject(TranslocoService);

  readonly value = model('');
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly label = input('ui.logoUploader.label');

  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected remove(): void {
    this.value.set('');
    this.touch.emit();
  }

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.error.set(null);
    const problem = this.images.validate(file);
    if (problem) {
      this.error.set(this.transloco.translate(`images.${problem}`, { name: file.name }));
      return;
    }
    this.uploading.set(true);
    try {
      this.value.set(await this.images.upload(file));
    } catch {
      this.error.set(this.transloco.translate('images.failed', { name: file.name }));
    } finally {
      this.uploading.set(false);
      this.touch.emit();
    }
  }
}
