import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Shows the translated label of a stored option value, e.g. `'Washed' | optionLabel: 'process'`.
 * The API keeps English values, so values typed under "Other" have no translation and are shown as typed.
 * Impure so the label follows the active language.
 */
@Pipe({ name: 'optionLabel', pure: false })
export class OptionLabelPipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);

  transform(value: string, group: string): string {
    const key = `options.${group}.${value}`;
    const label = this.transloco.translate(key);
    return label === key ? value : label;
  }
}
