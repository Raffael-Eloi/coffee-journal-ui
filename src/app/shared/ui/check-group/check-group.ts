import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';
import { SymbolIcon } from '../symbol/symbol';

export interface CheckOption<T extends string | number> {
  value: T;
  /** Text shown as is, for example a name that comes from the API. */
  label?: string;
  /** Translation key shown instead of `label`. */
  labelKey?: string;
  /** Material Symbols icon name shown before the text. */
  icon?: string;
}

/**
 * A row of button-style checkboxes: the user picks any number of options.
 * Bound with `[formField]` to an array of the option values (`label` is a translation key).
 */
@Component({
  selector: 'app-check-group',
  imports: [TranslocoPipe, SymbolIcon],
  template: `
    <fieldset class="flex flex-col gap-2">
      <legend class="field-label">{{ label() | transloco }}</legend>
      <div class="flex flex-wrap gap-2" (focusout)="touch.emit()">
        @for (option of options(); track option.value) {
          <label class="choice flex-none">
            <input
              type="checkbox"
              class="sr-only"
              [checked]="value().includes(option.value)"
              [disabled]="disabled() || readonly()"
              (change)="toggle(option.value, $any($event.target).checked)"
            />
            @if (option.icon) {
              <app-symbol [name]="option.icon" [size]="18" />
            }
            {{ option.labelKey ? (option.labelKey | transloco) : option.label }}
          </label>
        } @empty {
          <p class="text-husk">{{ emptyText() | transloco }}</p>
        }
      </div>
    </fieldset>
  `,
})
export class CheckGroup<T extends string | number> implements FormValueControl<T[]> {
  readonly value = model<T[]>([]);
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly label = input.required<string>();
  readonly options = input.required<readonly CheckOption<T>[]>();
  /** Translation key shown when there are no options. */
  readonly emptyText = input('ui.checkGroup.empty');

  protected toggle(option: T, checked: boolean): void {
    this.value.update((current) =>
      checked
        ? current.includes(option)
          ? current
          : [...current, option]
        : current.filter((item) => item !== option),
    );
  }
}
