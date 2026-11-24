import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { ImagesService } from '../../images/images.service';
import { Icon } from '../icon/icon';

/**
 * Uploads image files one request at a time and keeps the returned URLs.
 * Bound with `[formField]` to a `string[]` of image URLs.
 */
@Component({
  selector: 'app-image-uploader',
  imports: [NgOptimizedImage, Icon],
  template: `
    <fieldset class="flex flex-col gap-3">
      <legend class="field-label">{{ label() }}</legend>

      @if (value().length > 0) {
        <ul class="flex flex-wrap gap-3">
          @for (url of value(); track url; let i = $index) {
            <li class="relative">
              <img
                class="h-24 w-24 rounded-lg border border-hairline object-cover"
                [ngSrc]="url"
                width="96"
                height="96"
                [alt]="'Photo ' + (i + 1)"
              />
              <button
                type="button"
                class="absolute -top-2 -right-2 rounded-full border border-outline bg-surface p-1 text-husk hover:text-error"
                [attr.aria-label]="'Remove photo ' + (i + 1)"
                [disabled]="disabled() || readonly()"
                (click)="remove(i)"
              >
                <app-icon name="close" [size]="14" />
              </button>
            </li>
          }
        </ul>
      }

      <label
        class="btn btn-ghost cursor-pointer gap-2 self-start has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel"
      >
        <app-icon name="plus" [size]="16" />
        {{ uploading() ? 'Uploading…' : 'Add photos' }}
        <input
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp"
          multiple
          [disabled]="disabled() || readonly() || uploading()"
          (change)="onFiles($event)"
        />
      </label>
      <p class="text-xs text-husk">JPEG, PNG or WebP, up to 5 MB each.</p>

      @if (uploading()) {
        <p class="text-husk" role="status">Uploading…</p>
      }
      @if (error(); as message) {
        <p class="field-error" role="alert">{{ message }}</p>
      }
    </fieldset>
  `,
})
export class ImageUploader implements FormValueControl<string[]> {
  private readonly images = inject(ImagesService);

  readonly value = model<string[]>([]);
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly label = input('Photos');

  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected remove(index: number): void {
    this.value.update((urls) => urls.filter((_, i) => i !== index));
    this.touch.emit();
  }

  protected async onFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    this.error.set(null);
    this.uploading.set(true);
    const failures: string[] = [];
    for (const file of files) {
      const problem = this.images.validate(file);
      if (problem) {
        failures.push(`${file.name} ${problem}`);
        continue;
      }
      try {
        const url = await this.images.upload(file);
        this.value.update((urls) => [...urls, url]);
      } catch {
        failures.push(`${file.name} could not be uploaded`);
      }
    }
    this.uploading.set(false);
    this.touch.emit();
    this.error.set(failures.length > 0 ? failures.join('. ') + '.' : null);
  }
}
