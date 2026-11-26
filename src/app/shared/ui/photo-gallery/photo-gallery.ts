import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/** A row of photos: one fills the row, two split it, three or more get a wide first photo. */
@Component({
  selector: 'app-photo-gallery',
  imports: [NgOptimizedImage, TranslocoPipe],
  template: `
    @if (urls().length > 0) {
      <ul class="grid grid-cols-1 gap-6 md:grid-cols-12">
        @for (url of urls(); track $index; let i = $index) {
          <li [class]="span(i)">
            <img
              class="h-64 w-full rounded-xl border border-hairline object-cover md:h-[420px]"
              [ngSrc]="url"
              width="800"
              height="600"
              [alt]="'common.photoAlt' | transloco: { n: i + 1, name: name() }"
            />
          </li>
        }
      </ul>
    }
  `,
})
export class PhotoGallery {
  readonly urls = input.required<readonly string[]>();
  /** Name of the place or thing in the photos, for the alt text. */
  readonly name = input.required<string>();

  protected span(index: number): string {
    const count = this.urls().length;
    if (count === 1) return 'md:col-span-12';
    if (count === 2 || index === 0) return 'md:col-span-6';
    return 'md:col-span-3';
  }
}
