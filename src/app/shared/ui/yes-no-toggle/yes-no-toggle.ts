import { Component, input, model, output } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';

let nextToggleId = 0;

/** Two-option switch for a boolean ("Yes, definitely" / "Not quite" by default), bound with `[formField]`. */
@Component({
  selector: 'app-yes-no-toggle',
  template: `
    <fieldset class="flex flex-col gap-1" [class]="align() === 'end' ? 'md:items-end' : ''">
      <legend class="field-label">{{ label() }}</legend>
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
          {{ yesLabel() }}
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
          {{ noLabel() }}
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
  readonly yesLabel = input('Yes, definitely');
  readonly noLabel = input('Not quite');
  /** Where the switch sits on wide screens: `start` (default) or `end`, e.g. beside a rating. */
  readonly align = input<'start' | 'end'>('start');

  protected readonly groupName = `yes-no-toggle-${nextToggleId++}`;
}
