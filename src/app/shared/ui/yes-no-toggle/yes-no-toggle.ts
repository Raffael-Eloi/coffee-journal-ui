import { Component, input, model, output } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';

let nextToggleId = 0;

/** Two-option switch for a boolean (labels are translation keys), bound with `[formField]`. */
@Component({
  selector: 'app-yes-no-toggle',
  imports: [TranslocoPipe],
  template: `
    <fieldset class="flex flex-col gap-1" [class]="align() === 'end' ? 'md:items-end' : ''">
      <legend class="field-label">{{ label() | transloco }}</legend>
      <div class="segment" (focusout)="touch.emit()">
        <label class="segment-option">
          <input
            type="radio"
            class="sr-only"
            [name]="groupName"
            [checked]="checked()"
            [disabled]="disabled() || readonly()"
            (change)="checked.set(true)"
          />
          {{ yesLabel() | transloco }}
        </label>
        <label class="segment-option">
          <input
            type="radio"
            class="sr-only"
            [name]="groupName"
            [checked]="!checked()"
            [disabled]="disabled() || readonly()"
            (change)="checked.set(false)"
          />
          {{ noLabel() | transloco }}
        </label>
      </div>
    </fieldset>
  `,
})
export class YesNoToggle implements FormCheckboxControl {
  readonly checked = model(false);
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly label = input.required<string>();
  readonly yesLabel = input('ui.yesNo.yes');
  readonly noLabel = input('ui.yesNo.no');
  /** Where the switch sits on wide screens: `start` (default) or `end`, e.g. beside a rating. */
  readonly align = input<'start' | 'end'>('start');

  protected readonly groupName = `yes-no-toggle-${nextToggleId++}`;
}
