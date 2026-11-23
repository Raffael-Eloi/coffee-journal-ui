import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

/** Centered page header for form pages: eyebrow label, title and a short description. */
@Component({
  selector: 'app-form-page-header',
  imports: [Icon],
  template: `
    <header class="flex flex-col items-center gap-1 text-center">
      <p
        class="flex items-center gap-1 text-[0.6875rem] font-semibold tracking-widest text-terracotta uppercase"
      >
        <app-icon name="note" [size]="14" />
        {{ eyebrow() }}
      </p>
      <h1 class="tracking-tight">{{ title() }}</h1>
      @if (description()) {
        <p class="max-w-md text-on-surface-variant">{{ description() }}</p>
      }
    </header>
  `,
})
export class FormPageHeader {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
}
