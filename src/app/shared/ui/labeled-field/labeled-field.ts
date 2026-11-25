import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon, IconName } from '../icon/icon';

/**
 * Label (a translation key), optional leading icon and error messages around one projected control
 * (`input`, `select` or `textarea` with the `field-input` class).
 */
@Component({
  selector: 'app-labeled-field',
  imports: [Icon, TranslocoPipe],
  template: `
    <div class="flex flex-col gap-1">
      <label class="field-label" [for]="controlId()">{{ label() | transloco }}</label>
      <div class="relative flex items-center">
        @if (icon(); as iconName) {
          <app-icon class="field-glyph" [name]="iconName" />
        }
        <ng-content />
      </div>
      @for (error of errors(); track error.kind) {
        <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
      }
    </div>
  `,
})
export class LabeledField {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  readonly icon = input<IconName>();
  readonly errors = input<readonly { kind: string; message?: string }[]>([]);
}
