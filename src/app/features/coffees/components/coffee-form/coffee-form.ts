import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Roaster } from '../../../roasters/roaster.model';
import { CoffeeFormValue } from '../../coffee.model';

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
};

@Component({
  selector: 'app-coffee-form',
  imports: [FormField, FormRoot],
  template: `
    <form class="flex max-w-xl flex-col gap-4" [formRoot]="coffeeForm">
      <div class="flex flex-col gap-1">
        <label for="name">Name</label>
        <input id="name" type="text" [class]="inputClass" [formField]="coffeeForm.name" />
        @if (coffeeForm.name().touched()) {
          @for (error of coffeeForm.name().errors(); track error.kind) {
            <p class="text-sm text-red-700" role="alert">{{ error.message }}</p>
          }
        }
      </div>

      <div class="flex flex-col gap-1">
        <label for="roasterId">Roaster</label>
        <select id="roasterId" [class]="inputClass" [formField]="coffeeForm.roasterId">
          <option value="">Select a roaster</option>
          @for (roaster of roasters(); track roaster.id) {
            <option [value]="roaster.id">{{ roaster.name }}</option>
          }
        </select>
        @if (coffeeForm.roasterId().touched()) {
          @for (error of coffeeForm.roasterId().errors(); track error.kind) {
            <p class="text-sm text-red-700" role="alert">{{ error.message }}</p>
          }
        }
      </div>

      <div class="flex flex-col gap-1">
        <label for="description">Description</label>
        <textarea
          id="description"
          rows="3"
          [class]="inputClass"
          [formField]="coffeeForm.description"
        ></textarea>
      </div>

      <div class="flex flex-col gap-1">
        <label for="origin">Origin</label>
        <input id="origin" type="text" [class]="inputClass" [formField]="coffeeForm.origin" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="process">Process</label>
        <input id="process" type="text" [class]="inputClass" [formField]="coffeeForm.process" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="roastLevel">Roast level</label>
        <input
          id="roastLevel"
          type="text"
          [class]="inputClass"
          [formField]="coffeeForm.roastLevel"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="variety">Variety</label>
        <input id="variety" type="text" [class]="inputClass" [formField]="coffeeForm.variety" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="tastingNotes">Tasting notes</label>
        <textarea
          id="tastingNotes"
          rows="3"
          [class]="inputClass"
          [formField]="coffeeForm.tastingNotes"
        ></textarea>
      </div>

      <div class="flex flex-col gap-1">
        <label for="rate">Rate</label>
        <input id="rate" type="number" [class]="inputClass" [formField]="coffeeForm.rate" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="review">Review</label>
        <textarea id="review" rows="4" [class]="inputClass" [formField]="coffeeForm.review"></textarea>
      </div>

      <div class="flex items-center gap-2">
        <input id="recommend" type="checkbox" [formField]="coffeeForm.recommend" />
        <label for="recommend">Recommend</label>
      </div>

      <fieldset class="flex flex-col gap-2">
        <legend class="font-semibold">Prices</legend>
        @for (price of coffeeForm.prices; track $index) {
          <div class="flex items-end gap-2">
            <div class="flex flex-col gap-1">
              <label [for]="'grams-' + $index">Grams</label>
              <input
                [id]="'grams-' + $index"
                type="number"
                [class]="inputClass"
                [formField]="price.grams"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label [for]="'price-' + $index">Price</label>
              <input
                [id]="'price-' + $index"
                type="number"
                [class]="inputClass"
                [formField]="price.price"
              />
            </div>
            <button
              type="button"
              class="px-2 py-2 underline"
              [attr.aria-label]="'Remove price ' + ($index + 1)"
              (click)="removePrice($index)"
            >
              Remove
            </button>
          </div>
        }
        <button type="button" class="self-start underline" (click)="addPrice()">Add price</button>
      </fieldset>

      <button
        type="submit"
        class="self-start rounded bg-stone-900 px-4 py-2 text-white disabled:opacity-60"
        [disabled]="saving()"
      >
        {{ saving() ? 'Saving…' : 'Save' }}
      </button>
    </form>
  `,
})
export class CoffeeForm {
  readonly roasters = input.required<Roaster[]>();
  readonly initialValue = input<CoffeeFormValue>();
  readonly saving = input(false);
  readonly submitted = output<CoffeeFormValue>();

  protected readonly inputClass = 'rounded border border-stone-500 bg-white px-3 py-2';

  private readonly data = linkedSignal<CoffeeFormValue>(() => this.initialValue() ?? EMPTY_VALUE);

  protected readonly coffeeForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'Name is required' });
      required(path.roasterId, { message: 'Roaster is required' });
    },
    {
      submission: {
        action: async (field) => {
          const value = field().value();
          // Copy price rows to plain objects: Signal Forms tags array items with a tracking symbol.
          this.submitted.emit({
            ...value,
            prices: value.prices.map(({ grams, price }) => ({ grams, price })),
          });
        },
      },
    },
  );

  protected addPrice(): void {
    this.data.update((value) => ({ ...value, prices: [...value.prices, { grams: 0, price: 0 }] }));
  }

  protected removePrice(index: number): void {
    this.data.update((value) => ({
      ...value,
      prices: value.prices.filter((_, i) => i !== index),
    }));
  }
}
