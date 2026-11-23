import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

let nextGroupId = 0;

/**
 * A row of button-style options plus an "Other" option that reveals a free-text input.
 * Bound with `[formField]` to a string, so values outside `options` still work.
 */
@Component({
  selector: 'app-choice-group',
  template: `
    <fieldset class="flex flex-col gap-2">
      <legend class="field-label">{{ label() }}</legend>
      <div class="flex flex-wrap gap-2" (focusout)="touch.emit()">
        @for (option of options(); track option) {
          <label class="choice">
            <input
              type="radio"
              class="sr-only"
              [name]="groupName"
              [checked]="!isOther() && value() === option"
              [disabled]="disabled() || readonly()"
              (change)="pick(option)"
            />
            {{ option }}
          </label>
        }
        <label class="choice">
          <input
            type="radio"
            class="sr-only"
            [name]="groupName"
            [checked]="isOther()"
            [disabled]="disabled() || readonly()"
            (change)="chooseOther()"
          />
          Other
        </label>
      </div>
      @if (isOther()) {
        <input
          type="text"
          class="field-input"
          [attr.aria-label]="label() + ' (other)'"
          [placeholder]="'Other ' + label().toLowerCase()"
          [value]="value()"
          [disabled]="disabled() || readonly()"
          (input)="onOtherInput($event)"
        />
      }
    </fieldset>
  `,
})
export class ChoiceGroup implements FormValueControl<string> {
  readonly value = model('');
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly label = input.required<string>();
  readonly options = input.required<readonly string[]>();

  protected readonly groupName = `choice-group-${nextGroupId++}`;
  private readonly otherChosen = signal(false);

  /** "Other" is active when chosen, or when the value is not one of the options. */
  protected readonly isOther = computed(
    () => this.otherChosen() || (this.value() !== '' && !this.options().includes(this.value())),
  );

  protected pick(option: string): void {
    this.otherChosen.set(false);
    this.value.set(option);
  }

  protected chooseOther(): void {
    this.otherChosen.set(true);
    if (this.options().includes(this.value())) {
      this.value.set('');
    }
  }

  protected onOtherInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
