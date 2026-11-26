import { Component, input } from '@angular/core';

/**
 * A Material Symbols icon by name. The font in `index.html` only contains the icons the app uses
 * (its `icon_names` list), so add a new name there before using it here. Decorative: hidden from
 * screen readers, so the text next to it must carry the meaning.
 */
@Component({
  selector: 'app-symbol',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `<span class="material-symbols-outlined" [style.font-size.px]="size()">{{
    name()
  }}</span>`,
})
export class SymbolIcon {
  readonly name = input.required<string>();
  readonly size = input(20);
}
