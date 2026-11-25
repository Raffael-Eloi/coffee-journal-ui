import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

let nextSectionId = 0;

/** Numbered white card (`title` and `caption` are translation keys) that groups related fields in a form (Stitch "Log Visit" layout). */
@Component({
  selector: 'app-form-section',
  imports: [TranslocoPipe],
  template: `
    <section
      class="flex flex-col gap-6 rounded-xl border border-hairline bg-surface p-6 shadow-sm md:p-10"
      [attr.aria-labelledby]="headingId"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span
            class="flex size-6 items-center justify-center rounded-full bg-container text-[0.6875rem] font-semibold text-terracotta"
            aria-hidden="true"
          >
            {{ number() }}
          </span>
          <h2 [id]="headingId">{{ title() | transloco }}</h2>
        </div>
        <span class="text-[0.6875rem] font-semibold tracking-wider text-husk uppercase">
          {{ caption() ?? '' | transloco }}
        </span>
      </div>
      <ng-content />
    </section>
  `,
})
export class FormSection {
  readonly number = input.required<string>();
  readonly title = input.required<string>();
  readonly caption = input<string>();

  protected readonly headingId = `form-section-${nextSectionId++}`;
}
