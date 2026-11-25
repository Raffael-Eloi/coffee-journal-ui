import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
import { ChoiceGroup } from '../../../../shared/ui/choice-group/choice-group';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ImageUploader } from '../../../../shared/ui/image-uploader/image-uploader';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { StarRating } from '../../../../shared/ui/star-rating/star-rating';
import { YesNoToggle } from '../../../../shared/ui/yes-no-toggle/yes-no-toggle';
import { Roaster } from '../../../roasters/roaster.model';
import { CoffeeFormValue, Currency } from '../../coffee.model';
import { TranslocoPipe } from '@jsverse/transloco';

const PRESET_SIZES = [
  { grams: 150, label: '150 g' },
  { grams: 250, label: '250 g' },
  { grams: 500, label: '500 g' },
  { grams: 1000, label: '1 kg' },
];

const EMPTY_VALUE: CoffeeFormValue = {
  name: '',
  description: '',
  roasterId: '',
  rate: 0,
  review: '',
  recommend: false,
  origin: '',
  process: '',
  roastLevel: '',
  variety: '',
  tastingNotes: '',
  prices: [],
  imageUrls: [],
};

@Component({
  selector: 'app-coffee-form',
  imports: [
    TranslocoPipe,
    FormField,
    FormRoot,
    ChoiceGroup,
    FormSection,
    Icon,
    ImageUploader,
    LabeledField,
    StarRating,
    YesNoToggle,
  ],
  template: `
    <form class="flex flex-col gap-8" [formRoot]="coffeeForm">
      <app-form-section
        number="01"
        title="coffees.form.coffeeTitle"
        caption="coffees.form.coffeeCaption"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <app-labeled-field
            class="md:col-span-2"
            label="coffees.form.name"
            controlId="name"
            icon="coffee"
            [errors]="coffeeForm.name().touched() ? coffeeForm.name().errors() : []"
          >
            <input id="name" type="text" class="field-input" [formField]="coffeeForm.name" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffees.form.roaster"
            controlId="roasterId"
            icon="flame"
            [errors]="coffeeForm.roasterId().touched() ? coffeeForm.roasterId().errors() : []"
          >
            <select id="roasterId" class="field-input" [formField]="coffeeForm.roasterId">
              <option value="">{{ 'coffees.form.selectRoaster' | transloco }}</option>
              @for (roaster of roasters(); track roaster.id) {
                <option [value]="roaster.id">{{ roaster.name }}</option>
              }
            </select>
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffees.form.descriptionLabel"
            controlId="description"
          >
            <textarea
              id="description"
              rows="3"
              class="field-input"
              [formField]="coffeeForm.description"
            ></textarea>
          </app-labeled-field>

          <app-labeled-field label="coffees.form.origin" controlId="origin" icon="globe">
            <input id="origin" type="text" class="field-input" [formField]="coffeeForm.origin" />
          </app-labeled-field>

          <app-labeled-field label="coffees.form.variety" controlId="variety" icon="note">
            <input id="variety" type="text" class="field-input" [formField]="coffeeForm.variety" />
          </app-labeled-field>

          <app-choice-group
            class="md:col-span-2"
            label="coffees.form.process"
            optionGroup="process"
            [options]="processes"
            [formField]="coffeeForm.process"
          />

          <app-choice-group
            class="md:col-span-2"
            label="coffees.form.roastLevel"
            optionGroup="roastLevel"
            [options]="roastLevels"
            [formField]="coffeeForm.roastLevel"
          />
        </div>
      </app-form-section>

      <app-form-section
        number="02"
        title="common.experienceTitle"
        caption="coffees.form.verdictCaption"
      >
        <div class="grid items-center gap-6 rounded-xl bg-container-low p-4 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <app-star-rating [formField]="coffeeForm.rate" />
            @if (coffeeForm.rate().touched()) {
              @for (error of coffeeForm.rate().errors(); track error.kind) {
                <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
              }
            }
          </div>
          <app-yes-no-toggle
            label="common.recommendQuestion"
            align="end"
            [formField]="coffeeForm.recommend"
          />
        </div>

        <app-labeled-field label="coffees.form.tastingNotes" controlId="tastingNotes">
          <textarea
            id="tastingNotes"
            rows="3"
            class="field-input"
            [formField]="coffeeForm.tastingNotes"
          ></textarea>
        </app-labeled-field>

        <app-labeled-field label="common.review" controlId="review">
          <textarea
            id="review"
            rows="4"
            class="field-input"
            [formField]="coffeeForm.review"
          ></textarea>
        </app-labeled-field>
      </app-form-section>

      <app-form-section
        number="03"
        title="coffees.form.pricesTitle"
        caption="coffees.form.pricesCaption"
      >
        @for (price of coffeeForm.prices; track $index; let row = $index) {
          <div class="flex flex-col gap-4 rounded-xl bg-canvas p-4">
            <div class="flex items-center justify-between border-b border-container pb-2">
              <span
                class="flex items-center gap-1 text-xs font-semibold tracking-wide text-espresso uppercase"
              >
                <app-icon name="coffee" [size]="16" />
                {{ 'coffees.form.bag' | transloco: { n: $index + 1 } }}
              </span>
              <button
                type="button"
                class="rounded p-1 text-husk hover:bg-container hover:text-error"
                [attr.aria-label]="'coffees.form.removePrice' | transloco: { n: $index + 1 }"
                (click)="removePrice($index)"
              >
                <app-icon name="close" [size]="16" />
              </button>
            </div>
            <fieldset class="flex flex-col gap-2">
              <legend class="field-label">{{ 'coffees.form.bagSize' | transloco }}</legend>
              <div class="flex flex-wrap gap-2">
                @for (option of sizeOptions(price.grams().value()); track option.grams) {
                  <label class="choice">
                    <input
                      type="radio"
                      class="sr-only"
                      [attr.name]="'size-' + row"
                      [checked]="price.grams().value() === option.grams"
                      (change)="price.grams().value.set(option.grams)"
                    />
                    {{ option.label }}
                  </label>
                }
              </div>
            </fieldset>
            <app-labeled-field
              class="md:max-w-xs"
              label="coffees.form.price"
              [controlId]="'price-' + row"
            >
              <div
                class="flex overflow-hidden rounded-lg border border-outline bg-container-low shadow-sm focus-within:bg-surface"
              >
                <select
                  class="border-r border-outline bg-transparent py-2 pr-2 pl-3 font-semibold text-espresso"
                  [attr.aria-label]="'coffees.form.currencyFor' | transloco: { n: row + 1 }"
                  [formField]="price.currency"
                >
                  @for (currency of currencies; track currency.code) {
                    <option [value]="currency.code">{{ currency.symbol }}</option>
                  }
                </select>
                <input
                  [id]="'price-' + row"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="min-w-0 flex-1 bg-transparent px-3 py-2 text-ink"
                  [formField]="price.price"
                />
              </div>
            </app-labeled-field>
          </div>
        }
        <button type="button" class="btn btn-ghost gap-2 self-start" (click)="addPrice()">
          <app-icon name="plus" [size]="16" />
          {{ 'coffees.form.addPrice' | transloco }}
        </button>
      </app-form-section>

      <app-form-section
        number="04"
        title="coffees.form.photosTitle"
        caption="coffees.form.photosCaption"
      >
        <app-image-uploader [formField]="coffeeForm.imageUrls" />
      </app-form-section>

      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
          <app-icon name="check" [size]="16" />
          {{ (saving() ? 'common.saving' : 'common.save') | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class CoffeeForm {
  readonly roasters = input.required<Roaster[]>();
  readonly initialValue = input<CoffeeFormValue>();
  readonly saving = input(false);
  readonly submitted = output<CoffeeFormValue>();

  protected readonly processes = ['Washed', 'Natural', 'Honey'];
  protected readonly roastLevels = ['Light', 'Medium', 'Dark'];
  protected readonly currencies: readonly { code: Currency; symbol: string }[] = [
    { code: 'BRL', symbol: 'R$' },
    { code: 'USD', symbol: '$' },
  ];

  /** Preset bag sizes, plus the current size when a saved price uses another one. */
  protected sizeOptions(current: number): { grams: number; label: string }[] {
    return current > 0 && !PRESET_SIZES.some((size) => size.grams === current)
      ? [...PRESET_SIZES, { grams: current, label: `${current} g` }]
      : PRESET_SIZES;
  }

  private readonly data = linkedSignal<CoffeeFormValue>(() => this.initialValue() ?? EMPTY_VALUE);

  protected readonly coffeeForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      required(path.roasterId, { message: 'errors.roasterRequired' });
      min(path.rate, 1, { message: 'errors.rateRange' });
      max(path.rate, 5, { message: 'errors.rateRange' });
    },
    {
      submission: {
        action: async (field) => {
          const value = field().value();
          // Copy price rows to plain objects: Signal Forms tags array items with a tracking symbol.
          this.submitted.emit({
            ...value,
            prices: value.prices.map(({ grams, price, currency }) => ({ grams, price, currency })),
          });
        },
      },
    },
  );

  protected addPrice(): void {
    this.data.update((value) => ({
      ...value,
      prices: [...value.prices, { grams: 250, price: 0, currency: 'BRL' }],
    }));
  }

  protected removePrice(index: number): void {
    this.data.update((value) => ({
      ...value,
      prices: value.prices.filter((_, i) => i !== index),
    }));
  }
}
