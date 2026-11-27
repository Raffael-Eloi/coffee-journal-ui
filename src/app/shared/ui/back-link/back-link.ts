import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SymbolIcon } from '../symbol/symbol';

/** Link back to a list, with a left arrow. Only the words are underlined, not the arrow. */
@Component({
  selector: 'app-back-link',
  imports: [RouterLink, TranslocoPipe, SymbolIcon],
  host: { class: 'inline-flex self-start' },
  template: `
    <a class="link inline-flex items-center gap-1 no-underline" [routerLink]="to()">
      <app-symbol name="arrow_back" [size]="16" />
      <span class="underline underline-offset-4">{{ label() | transloco }}</span>
    </a>
  `,
})
export class BackLink {
  /** Route to go back to. */
  readonly to = input.required<string>();
  /** Translation key of the text, without an arrow. */
  readonly label = input.required<string>();
}
