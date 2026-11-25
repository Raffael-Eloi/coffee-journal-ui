import {
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';

let nextComboboxId = 0;

const MAX_SHOWN = 50;

/** Lower-case text without accents, so "sao" finds "São Paulo". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * A text box that filters a long list of options while you type (ARIA combobox with a listbox popup).
 * Bound with `[formField]` to a string; only a listed option, or an empty text, becomes the value.
 * Put it inside `app-labeled-field` and give `inputId` the same value as the field's `controlId`.
 */
@Component({
  selector: 'app-combobox',
  imports: [TranslocoPipe],
  host: { class: 'relative block w-full' },
  template: `
    <input
      type="text"
      role="combobox"
      autocomplete="off"
      class="field-input"
      aria-autocomplete="list"
      [id]="inputId()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listboxId"
      [attr.aria-activedescendant]="activeId()"
      [placeholder]="placeholder() | transloco"
      [value]="query()"
      [disabled]="disabled() || readonly()"
      (focus)="openList()"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    />
    @if (open()) {
      <ul
        role="listbox"
        class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-outline bg-surface py-1 shadow-lg"
        [id]="listboxId"
        [attr.aria-label]="placeholder() | transloco"
      >
        @for (option of shown(); track option; let i = $index) {
          <!-- Mouse selection only: keyboard users select through the input (arrows and Enter). -->
          <li
            role="option"
            class="cursor-pointer px-3 py-2 text-ink"
            [id]="optionId(i)"
            [attr.aria-selected]="i === active()"
            [class.bg-container]="i === active()"
            (mousedown)="$event.preventDefault()"
            (click)="select(option)"
          >
            {{ option }}
          </li>
        } @empty {
          <li role="presentation" class="px-3 py-2 text-husk">
            {{ 'ui.combobox.noResults' | transloco }}
          </li>
        }
        @if (hiddenCount() > 0) {
          <li role="presentation" class="px-3 py-2 text-xs text-husk">
            {{ 'ui.combobox.more' | transloco: { count: hiddenCount() } }}
          </li>
        }
      </ul>
    }
  `,
})
export class Combobox implements FormValueControl<string> {
  readonly value = model('');
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly options = input.required<readonly string[]>();
  /** Id of the text box; match the surrounding `app-labeled-field` `controlId`. */
  readonly inputId = input.required<string>();
  /** Translation key of the placeholder. */
  readonly placeholder = input('');
  /** Emits the chosen value when the user picks an option or clears the text (not on programmatic changes). */
  readonly picked = output<string>();

  private readonly id = nextComboboxId++;
  protected readonly listboxId = `combobox-list-${this.id}`;

  protected readonly open = signal(false);
  protected readonly active = signal(0);
  /** The text in the box. It follows the value until the user types. */
  protected readonly query = linkedSignal(() => this.value());
  /** True after the user types, so a plain focus shows the whole list instead of only the current value. */
  private readonly typed = signal(false);

  private readonly matches = computed(() => {
    const options = this.options();
    if (!this.typed()) return options;
    const needle = normalize(this.query().trim());
    if (needle === '') return options;
    const starts: string[] = [];
    const contains: string[] = [];
    for (const option of options) {
      const text = normalize(option);
      if (text.startsWith(needle)) starts.push(option);
      else if (text.includes(needle)) contains.push(option);
    }
    return [...starts, ...contains];
  });
  protected readonly shown = computed(() => this.matches().slice(0, MAX_SHOWN));
  protected readonly hiddenCount = computed(() => Math.max(0, this.matches().length - MAX_SHOWN));
  protected readonly activeId = computed(() =>
    this.open() && this.shown().length > 0 ? this.optionId(this.active()) : null,
  );

  constructor() {
    // Keep the highlighted option visible while moving with the arrow keys.
    effect(() => {
      const id = this.activeId();
      if (id) document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  protected optionId(index: number): string {
    return `combobox-${this.id}-option-${index}`;
  }

  protected openList(): void {
    if (this.disabled() || this.readonly()) return;
    this.open.set(true);
    const current = this.shown().indexOf(this.value());
    this.active.set(current >= 0 ? current : 0);
  }

  protected onInput(event: Event): void {
    this.typed.set(true);
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
    this.open.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const last = this.shown().length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) this.openList();
        else this.active.update((i) => Math.min(i + 1, last));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.active.update((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (this.open()) {
          event.preventDefault();
          this.active.set(0);
        }
        break;
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.active.set(Math.max(last, 0));
        }
        break;
      case 'Enter':
        if (this.open() && this.shown().length > 0) {
          event.preventDefault();
          this.select(this.shown()[this.active()]);
        }
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  protected onBlur(): void {
    // Typing alone never sets the value: an exact match or an empty text is committed, anything else is dropped.
    const text = this.query().trim();
    const exact = this.options().find((option) => normalize(option) === normalize(text));
    if (text === '' && this.value() !== '') this.commit('');
    else if (exact !== undefined && exact !== this.value()) this.commit(exact);
    this.close();
    this.touch.emit();
  }

  protected select(option: string): void {
    this.commit(option);
    this.close();
  }

  private commit(next: string): void {
    this.value.set(next);
    this.query.set(next);
    this.picked.emit(next);
  }

  private close(): void {
    this.open.set(false);
    this.typed.set(false);
    this.query.set(this.value());
  }
}
