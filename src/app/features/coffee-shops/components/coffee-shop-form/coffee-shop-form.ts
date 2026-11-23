import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { CoffeeShopFormValue } from '../../coffee-shop.model';

const EMPTY_VALUE: CoffeeShopFormValue = {
  name: '',
  website: '',
  rate: 0,
  review: '',
  recommend: false,
  city: '',
  state: '',
  country: '',
  location: '',
};

@Component({
  selector: 'app-coffee-shop-form',
  imports: [FormField, FormRoot],
  template: `
    <form class="flex max-w-xl flex-col gap-4" [formRoot]="shopForm">
      <div class="flex flex-col gap-1">
        <label for="name">Name</label>
        <input id="name" type="text" [class]="inputClass" [formField]="shopForm.name" />
        @if (shopForm.name().touched()) {
          @for (error of shopForm.name().errors(); track error.kind) {
            <p class="text-sm text-red-700" role="alert">{{ error.message }}</p>
          }
        }
      </div>

      <div class="flex flex-col gap-1">
        <label for="website">Website</label>
        <input id="website" type="url" [class]="inputClass" [formField]="shopForm.website" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="rate">Rate</label>
        <input id="rate" type="number" [class]="inputClass" [formField]="shopForm.rate" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="review">Review</label>
        <textarea id="review" rows="4" [class]="inputClass" [formField]="shopForm.review"></textarea>
      </div>

      <div class="flex items-center gap-2">
        <input id="recommend" type="checkbox" [formField]="shopForm.recommend" />
        <label for="recommend">Recommend</label>
      </div>

      <div class="flex flex-col gap-1">
        <label for="city">City</label>
        <input id="city" type="text" [class]="inputClass" [formField]="shopForm.city" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="state">State</label>
        <input id="state" type="text" [class]="inputClass" [formField]="shopForm.state" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="country">Country</label>
        <input id="country" type="text" [class]="inputClass" [formField]="shopForm.country" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="location">Location</label>
        <input id="location" type="text" [class]="inputClass" [formField]="shopForm.location" />
      </div>

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
export class CoffeeShopForm {
  readonly initialValue = input<CoffeeShopFormValue>();
  readonly saving = input(false);
  readonly submitted = output<CoffeeShopFormValue>();

  protected readonly inputClass = 'rounded border border-stone-500 bg-white px-3 py-2';

  private readonly data = linkedSignal<CoffeeShopFormValue>(
    () => this.initialValue() ?? EMPTY_VALUE,
  );

  protected readonly shopForm = form(
    this.data,
    (path) => {
      required(path.name, { message: 'Name is required' });
    },
    {
      submission: {
        action: async (field) => {
          this.submitted.emit(field().value());
        },
      },
    },
  );
}
