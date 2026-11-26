import { Component, computed, inject, input } from '@angular/core';
import { GeoService } from '../../geo/geo.service';
import { Icon } from '../icon/icon';

/** A small decorative flag for a stored country name. A country without a drawn flag shows a globe. */
@Component({
  selector: 'app-flag',
  imports: [Icon],
  host: { class: 'inline-flex shrink-0' },
  template: `
    @switch (code()) {
      @case ('BR') {
        <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true" focusable="false">
          <rect width="28" height="20" rx="3" fill="#009c3b" />
          <polygon points="14,2.5 25,10 14,17.5 3,10" fill="#ffdf00" />
          <circle cx="14" cy="10" r="4.2" fill="#002776" />
        </svg>
      }
      @case ('US') {
        <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true" focusable="false">
          <clipPath id="flag-us-clip"><rect width="28" height="20" rx="3" /></clipPath>
          <g clip-path="url(#flag-us-clip)">
            <rect width="28" height="20" fill="#b22234" />
            @for (stripe of stripes; track stripe) {
              <rect
                width="28"
                [attr.y]="stripe * stripeHeight"
                [attr.height]="stripeHeight"
                fill="#fff"
              />
            }
            <rect width="12" [attr.height]="7 * stripeHeight" fill="#3c3b6e" />
          </g>
        </svg>
      }
      @default {
        <app-icon name="globe" [size]="20" />
      }
    }
  `,
})
export class Flag {
  private readonly geo = inject(GeoService);

  /** Stored country name, such as `Brazil`. */
  readonly country = input.required<string>();

  protected readonly code = computed(() => this.geo.codeFor(this.country()));
  protected readonly stripeHeight = 20 / 13;
  /** The white stripes of the 13: the 2nd, 4th, and so on. */
  protected readonly stripes = [1, 3, 5, 7, 9, 11];
}
