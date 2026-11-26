import { Component, computed, inject, input, model, resource } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../i18n/option-label.pipe';
import { GEO_COUNTRIES, GeoService } from '../../geo/geo.service';
import { Combobox } from '../combobox/combobox';
import { LabeledField } from '../labeled-field/labeled-field';

type FieldError = { kind: string; message?: string };

/** The options, plus the current value when it is not among them (for example a saved legacy value). */
function withCurrent(options: readonly string[], current: string): string[] {
  return current === '' || options.includes(current) ? [...options] : [...options, current];
}

/**
 * Country, state and city in that order: state and city are searchable lists of the bundled
 * data that depend on each other. A saved country that is not bundled falls back to free text.
 * Put it inside a `md:grid-cols-6` grid: it renders its fields as direct grid items.
 */
@Component({
  selector: 'app-place-fields',
  imports: [TranslocoPipe, OptionLabelPipe, Combobox, LabeledField],
  host: { class: 'contents' },
  template: `
    <app-labeled-field
      class="md:col-span-2"
      label="place.country"
      controlId="country"
      icon="globe"
      [errors]="countryErrors()"
    >
      <select id="country" class="field-input" (change)="onCountry($event)">
        <option value="" [selected]="country() === ''">
          {{ 'place.selectCountry' | transloco }}
        </option>
        @for (option of countryOptions(); track option) {
          <option [value]="option" [selected]="option === country()">
            {{ option | optionLabel: 'country' }}
          </option>
        }
      </select>
    </app-labeled-field>

    <app-labeled-field
      class="md:col-span-2"
      label="place.state"
      controlId="state"
      icon="pin"
      [errors]="stateErrors()"
    >
      @if (customPlace()) {
        <input
          id="state"
          type="text"
          class="field-input"
          [value]="state()"
          (input)="state.set($any($event.target).value)"
        />
      } @else {
        <app-combobox
          inputId="state"
          placeholder="place.selectState"
          [options]="stateOptions()"
          [disabled]="country() === ''"
          [(value)]="state"
          (picked)="city.set('')"
        />
      }
    </app-labeled-field>

    <app-labeled-field
      class="md:col-span-2"
      label="place.city"
      controlId="city"
      icon="pin"
      [errors]="cityErrors()"
    >
      @if (customPlace()) {
        <input
          id="city"
          type="text"
          class="field-input"
          [value]="city()"
          (input)="city.set($any($event.target).value)"
        />
      } @else {
        <app-combobox
          inputId="city"
          placeholder="place.selectCity"
          [options]="cityOptions()"
          [disabled]="state() === ''"
          [(value)]="city"
        />
      }
    </app-labeled-field>

    @if (geoData.error()) {
      <p class="field-error md:col-span-6" role="alert">{{ 'place.geoError' | transloco }}</p>
    }
  `,
})
export class PlaceFields {
  readonly country = model('');
  readonly state = model('');
  readonly city = model('');
  readonly countryErrors = input<readonly FieldError[]>([]);
  readonly stateErrors = input<readonly FieldError[]>([]);
  readonly cityErrors = input<readonly FieldError[]>([]);

  private readonly geo = inject(GeoService);

  /** States and cities of the chosen country; idle when the country has no bundled data. */
  protected readonly geoData = resource({
    params: () => this.geo.codeFor(this.country()),
    loader: ({ params }) => this.geo.load(params),
  });

  /** A saved country outside the bundled ones keeps free-text state and city. */
  protected readonly customPlace = computed(() => {
    const country = this.country();
    return country !== '' && this.geo.codeFor(country) === undefined;
  });

  protected readonly countryOptions = computed(() =>
    withCurrent(
      GEO_COUNTRIES.map((country) => country.name),
      this.country(),
    ),
  );

  protected readonly stateOptions = computed(() =>
    withCurrent(
      (this.geoData.value()?.states ?? []).map((state) => state.name),
      this.state(),
    ),
  );

  protected readonly cityOptions = computed(() => {
    const state = this.state();
    const cities = this.geoData.value()?.states.find((item) => item.name === state)?.cities ?? [];
    return withCurrent(cities, this.city());
  });

  protected onCountry(event: Event): void {
    this.country.set((event.target as HTMLSelectElement).value);
    this.state.set('');
    this.city.set('');
  }
}
