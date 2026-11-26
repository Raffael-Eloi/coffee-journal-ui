import { Component, input } from '@angular/core';

export type IconName =
  | 'store'
  | 'pin'
  | 'flame'
  | 'link'
  | 'globe'
  | 'note'
  | 'coffee'
  | 'check'
  | 'plus'
  | 'close'
  | 'bean';

/** Decorative inline SVG icon. It inherits the current text color and is hidden from screen readers. */
@Component({
  selector: 'app-icon',
  host: {
    class: 'inline-block shrink-0',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('store') {
          <path d="M3 9l1.5-5h15L21 9" />
          <path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
          <path d="M4.5 12v8h15v-8" />
          <path d="M10 20v-5h4v5" />
        }
        @case ('pin') {
          <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        }
        @case ('flame') {
          <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z" />
        }
        @case ('link') {
          <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c3 3 3 15 0 18-3-3-3-15 0-18z" />
        }
        @case ('note') {
          <path d="M4 6h11M4 11h7M4 16h4" />
          <path d="M13 19l1-3.5L19.5 10l2.5 2.5-5.5 5.5L13 19z" />
        }
        @case ('coffee') {
          <path d="M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5V9z" />
          <path d="M16 10h1.5a2.5 2.5 0 010 5H16" />
          <path d="M4 21.5h13" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('bean') {
          <ellipse cx="12" cy="12" rx="5.5" ry="8.5" transform="rotate(35 12 12)" />
          <path d="M8.3 16.2c3.4-1.6 3.4-4.6 4.4-6.2 .8-1.3 1.7-2 3-2.6" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
