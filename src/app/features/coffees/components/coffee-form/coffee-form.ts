import { Component, input, linkedSignal, output } from '@angular/core';
import {
  applyEach,
  form,
  FormField,
  FormRoot,
  maxLength,
  min,
  required,
} from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';
import { OptionLabelPipe } from '../../../../i18n/option-label.pipe';
import { FieldErrors, fieldErrors } from '../../../../shared/api/validation-errors';
import {
  COFFEE_CLASSIFICATIONS,
  CoffeeClassification,
} from '../../../../shared/models/coffee-classification';
import { ChoiceGroup } from '../../../../shared/ui/choice-group/choice-group';
import { FormSection } from '../../../../shared/ui/form-section/form-section';
import { Icon } from '../../../../shared/ui/icon/icon';
import { ImageUploader } from '../../../../shared/ui/image-uploader/image-uploader';
import { LabeledField } from '../../../../shared/ui/labeled-field/labeled-field';
import { Roaster } from '../../../roasters/roaster.model';
import { CoffeeInput, Currency } from '../../coffee.model';

const PRESET_SIZES = [
  { grams: 150, label: '150 g' },
  { grams: 250, label: '250 g' },
  { grams: 500, label: '500 g' },
  { grams: 1000, label: '1 kg' },
];

/** The values edited in the form: the optional link is an empty string and no classification is `0`. */
interface CoffeeDraft {
  name: string;
  description: string;
  roasterId: string;
  classification: number;
  origin: string;
  process: string;
  roastLevel: string;
  variety: string;
  tastingNotes: string;
  productUrl: string;
  prices: { grams: number; price: number; currency: Currency }[];
  imageUrls: string[];
}

const EMPTY_DRAFT: CoffeeDraft = {
  name: '',
  description: '',
  roasterId: '',
  classification: 0,
  origin: '',
  process: '',
  roastLevel: '',
  variety: '',
  tastingNotes: '',
  productUrl: '',
  prices: [],
  imageUrls: [],
};

function toDraft(input: CoffeeInput | undefined): CoffeeDraft {
  if (!input) return EMPTY_DRAFT;
  return {
    name: input.name,
    description: input.description,
    roasterId: input.roasterId,
    classification: input.classification,
    origin: input.origin,
    process: input.process,
    roastLevel: input.roastLevel,
    variety: input.variety,
    tastingNotes: input.tastingNotes,
    productUrl: input.productUrl ?? '',
    prices: input.prices.map(({ grams, price, currency }) => ({ grams, price, currency })),
    imageUrls: [...input.imageUrls],
  };
}

function toInput(draft: CoffeeDraft): CoffeeInput {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    roasterId: draft.roasterId,
    classification: draft.classification as CoffeeClassification,
    origin: draft.origin.trim(),
    process: draft.process.trim(),
    roastLevel: draft.roastLevel.trim(),
    variety: draft.variety.trim(),
    tastingNotes: draft.tastingNotes.trim(),
    productUrl: draft.productUrl.trim() || null,
    // Copy price rows to plain objects: Signal Forms tags array items with a tracking symbol.
    prices: draft.prices.map(({ grams, price, currency }) => ({ grams, price, currency })),
    imageUrls: [...draft.imageUrls],
  };
}

@Component({
  selector: 'app-coffee-form',
  imports: [
    TranslocoPipe,
    OptionLabelPipe,
    FormField,
    FormRoot,
    ChoiceGroup,
    FormSection,
    Icon,
    ImageUploader,
    LabeledField,
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
            [errors]="errorsFor(coffeeForm.name(), 'name')"
          >
            <input id="name" type="text" class="field-input" [formField]="coffeeForm.name" />
          </app-labeled-field>

          <app-labeled-field
            class="md:col-span-2"
            label="coffees.form.roaster"
            controlId="roasterId"
            icon="flame"
            [errors]="errorsFor(coffeeForm.roasterId(), 'roasterId')"
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
            [errors]="errorsFor(coffeeForm.description(), 'description')"
          >
            <textarea
              id="description"
              rows="3"
              class="field-input"
              [formField]="coffeeForm.description"
            ></textarea>
          </app-labeled-field>

          <fieldset class="flex flex-col gap-2 md:col-span-2">
            <legend class="field-label">{{ 'coffees.form.classification' | transloco }}</legend>
            <div class="flex flex-wrap gap-2">
              @for (option of classifications; track option) {
                <label class="choice">
                  <input
                    type="radio"
                    class="sr-only"
                    name="classification"
                    [checked]="coffeeForm.classification().value() === option"
                    (change)="coffeeForm.classification().value.set(option)"
                  />
                  {{ option + '' | optionLabel: 'classification' }}
                </label>
              }
            </div>
            @for (
              error of errorsFor(coffeeForm.classification(), 'classification');
              track error.kind
            ) {
              <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
            }
          </fieldset>

          <app-labeled-field
            label="coffees.form.origin"
            controlId="origin"
            icon="globe"
            [errors]="errorsFor(coffeeForm.origin(), 'origin')"
          >
            <input id="origin" type="text" class="field-input" [formField]="coffeeForm.origin" />
          </app-labeled-field>

          <app-labeled-field
            label="coffees.form.variety"
            controlId="variety"
            icon="note"
            [errors]="errorsFor(coffeeForm.variety(), 'variety')"
          >
            <input id="variety" type="text" class="field-input" [formField]="coffeeForm.variety" />
          </app-labeled-field>

          <div class="flex flex-col gap-1 md:col-span-2">
            <app-choice-group
              label="coffees.form.process"
              optionGroup="process"
              [options]="processes"
              [formField]="coffeeForm.process"
            />
            @for (error of errorsFor(coffeeForm.process(), 'process'); track error.kind) {
              <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
            }
          </div>

          <div class="flex flex-col gap-1 md:col-span-2">
            <app-choice-group
              label="coffees.form.roastLevel"
              optionGroup="roastLevel"
              [options]="roastLevels"
              [formField]="coffeeForm.roastLevel"
            />
            @for (error of errorsFor(coffeeForm.roastLevel(), 'roastLevel'); track error.kind) {
              <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
            }
          </div>

          <app-labeled-field
            class="md:col-span-2"
            label="coffees.form.productUrl"
            controlId="productUrl"
            icon="link"
            [errors]="errorsFor(coffeeForm.productUrl(), 'productUrl')"
          >
            <input
              id="productUrl"
              type="url"
              class="field-input"
              [formField]="coffeeForm.productUrl"
            />
          </app-labeled-field>
        </div>
      </app-form-section>

      <app-form-section
        number="02"
        title="coffees.form.tastingTitle"
        caption="coffees.form.tastingCaption"
      >
        <app-labeled-field
          label="coffees.form.tastingNotes"
          controlId="tastingNotes"
          [errors]="errorsFor(coffeeForm.tastingNotes(), 'tastingNotes')"
        >
          <textarea
            id="tastingNotes"
            rows="4"
            class="field-input"
            [formField]="coffeeForm.tastingNotes"
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
              [errors]="errorsFor(price.price(), 'prices[' + row + '].price')"
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
            @for (
              error of errorsFor(price.grams(), 'prices[' + row + '].grams');
              track error.kind
            ) {
              <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
            }
          </div>
        }
        @for (error of priceErrors(); track error) {
          <p class="field-error" role="alert">{{ error }}</p>
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
        @for (error of errorsFor(coffeeForm.imageUrls(), 'imageUrls'); track error.kind) {
          <p class="field-error" role="alert">{{ error.message ?? '' | transloco }}</p>
        }
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
  readonly initialValue = input<CoffeeInput>();
  readonly saving = input(false);
  /** Messages the API returned for the last save, by field name. */
  readonly serverErrors = input<FieldErrors>({});
  readonly submitted = output<CoffeeInput>();

  protected readonly processes = ['Washed', 'Natural', 'Honey'];
  protected readonly roastLevels = ['Light', 'Medium', 'Dark'];
  protected readonly classifications = COFFEE_CLASSIFICATIONS;
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

  private readonly data = linkedSignal<CoffeeDraft>(() => toDraft(this.initialValue()));

  protected readonly coffeeForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'errors.nameRequired' });
      maxLength(path.name, 250, { message: 'errors.tooLong' });
      required(path.roasterId, { message: 'errors.roasterRequired' });
      required(path.description, { message: 'errors.descriptionRequired' });
      maxLength(path.description, 4000, { message: 'errors.tooLong' });
      min(path.classification, 1, { message: 'errors.classificationRequired' });
      required(path.origin, { message: 'errors.originRequired' });
      required(path.variety, { message: 'errors.varietyRequired' });
      required(path.process, { message: 'errors.processRequired' });
      required(path.roastLevel, { message: 'errors.roastLevelRequired' });
      required(path.tastingNotes, { message: 'errors.tastingNotesRequired' });
      maxLength(path.tastingNotes, 1000, { message: 'errors.tooLong' });
      applyEach(path.prices, (row) => {
        min(row.price, 0.01, { message: 'errors.priceRange' });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitted.emit(toInput(field().value()));
        },
      },
    },
  );

  protected errorsFor(
    state: Parameters<typeof fieldErrors>[0],
    name: string,
  ): ReturnType<typeof fieldErrors> {
    return fieldErrors(state, this.serverErrors(), name);
  }

  /** Messages the API returned for the list as a whole, such as a repeated bag size. */
  protected priceErrors(): string[] {
    return this.serverErrors()['prices'] ?? [];
  }

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
