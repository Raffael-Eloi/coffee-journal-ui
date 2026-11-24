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
      <app-form-section number="01" title="The Coffee" caption="Origin & profile">
        <div class="grid gap-4 md:grid-cols-2">
          <app-labeled-field
            class="md:col-span-2"
            label="Coffee name / lot"
            controlId="name"
            icon="coffee"
            [errors]="coffeeForm.name().touched() ? coffeeForm.name().errors() : []"
          >
            <input id="name" type="text" class="field-input" [formField]="coffeeForm.name" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="Roaster"
            controlId="roasterId"
            icon="flame"
            [errors]="coffeeForm.roasterId().touched() ? coffeeForm.roasterId().errors() : []"
          >
            <select id="roasterId" class="field-input" [formField]="coffeeForm.roasterId">
              <option value="">Select a roaster</option>
              @for (roaster of roasters(); track roaster.id) {
                <option [value]="roaster.id">{{ roaster.name }}</option>
              }
            </select>
          </app-labeled-field>

          <app-labeled-field class="md:col-span-2" label="Description" controlId="description">
            <textarea
              id="description"
              rows="3"
              class="field-input"
              [formField]="coffeeForm.description"
            ></textarea>
          </app-labeled-field>

          <app-labeled-field label="Origin" controlId="origin" icon="globe">
            <input id="origin" type="text" class="field-input" [formField]="coffeeForm.origin" />
          </app-labeled-field>

          <app-labeled-field label="Variety" controlId="variety" icon="note">
            <input id="variety" type="text" class="field-input" [formField]="coffeeForm.variety" />
          </app-labeled-field>

          <app-choice-group
            class="md:col-span-2"
            label="Process"
            [options]="processes"
            [formField]="coffeeForm.process"
          />

          <app-choice-group
            class="md:col-span-2"
            label="Roast level"
            [options]="roastLevels"
            [formField]="coffeeForm.roastLevel"
          />
        </div>
      </app-form-section>

      <app-form-section number="02" title="Experience & Verdict" caption="Tasting">
        <div class="grid items-center gap-6 rounded-xl bg-container-low p-4 md:grid-cols-2">
          <div class="flex flex-col gap-1">
            <app-star-rating [formField]="coffeeForm.rate" />
            @if (coffeeForm.rate().touched()) {
              @for (error of coffeeForm.rate().errors(); track error.kind) {
                <p class="field-error" role="alert">{{ error.message }}</p>
              }
            }
          </div>
          <app-yes-no-toggle
            label="Recommend to others?"
            align="end"
            [formField]="coffeeForm.recommend"
          />
        </div>

        <app-labeled-field label="Tasting notes" controlId="tastingNotes">
          <textarea
            id="tastingNotes"
            rows="3"
            class="field-input"
            [formField]="coffeeForm.tastingNotes"
          ></textarea>
        </app-labeled-field>

        <app-labeled-field label="Personal impressions & notes" controlId="review">
          <textarea
            id="review"
            rows="4"
            class="field-input"
            [formField]="coffeeForm.review"
          ></textarea>
        </app-labeled-field>
      </app-form-section>

      <app-form-section number="03" title="Prices" caption="Retail bags">
        @for (price of coffeeForm.prices; track $index; let row = $index) {
          <div class="flex flex-col gap-4 rounded-xl bg-canvas p-4">
            <div class="flex items-center justify-between border-b border-container pb-2">
              <span
                class="flex items-center gap-1 text-xs font-semibold tracking-wide text-espresso uppercase"
              >
                <app-icon name="coffee" [size]="16" />
                Bag {{ $index + 1 }}
              </span>
              <button
                type="button"
                class="rounded p-1 text-husk hover:bg-container hover:text-error"
                [attr.aria-label]="'Remove price ' + ($index + 1)"
                (click)="removePrice($index)"
              >
                <app-icon name="close" [size]="16" />
              </button>
            </div>
            <fieldset class="flex flex-col gap-2">
              <legend class="field-label">Bag size</legend>
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
            <app-labeled-field class="md:max-w-xs" label="Price" [controlId]="'price-' + row">
              <div
                class="flex overflow-hidden rounded-lg border border-outline bg-container-low shadow-sm focus-within:bg-surface"
              >
                <select
                  class="border-r border-outline bg-transparent py-2 pr-2 pl-3 font-semibold text-espresso"
                  [attr.aria-label]="'Currency for bag ' + (row + 1)"
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
          Add price
        </button>
      </app-form-section>

      <app-form-section number="04" title="Photos" caption="The bag & the brew">
        <app-image-uploader label="Photos" [formField]="coffeeForm.imageUrls" />
      </app-form-section>

      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
          <app-icon name="check" [size]="16" />
          {{ saving() ? 'Saving…' : 'Save' }}
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
    { code: 'USD', symbol: '$' },
    { code: 'BRL', symbol: 'R$' },
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
      required(path.name, { message: 'Name is required' });
      required(path.roasterId, { message: 'Roaster is required' });
      min(path.rate, 1, { message: 'Rate must be between 1 and 5' });
      max(path.rate, 5, { message: 'Rate must be between 1 and 5' });
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
      prices: [...value.prices, { grams: 250, price: 0, currency: 'USD' }],
    }));
  }

  protected removePrice(index: number): void {
    this.data.update((value) => ({
      ...value,
      prices: value.prices.filter((_, i) => i !== index),
    }));
  }
}
