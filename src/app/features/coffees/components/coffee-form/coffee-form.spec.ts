import { TestBed } from '@angular/core/testing';
import { Roaster } from '../../../roasters/roaster.model';
import { CoffeeInput } from '../../coffee.model';
import { CoffeeForm } from './coffee-form';

const roaster: Roaster = {
  id: 'r1',
  name: 'Origin Roasters',
  description: null,
  website: null,
  instagramUrl: null,
  phoneNumber: null,
  hasMembershipOption: false,
  logoUrl: null,
  city: 'Campinas',
  state: 'São Paulo',
  country: 'Brazil',
  address: null,
  classifications: [],
  imageUrls: [],
  createdAt: '',
  updatedAt: '',
};

describe('CoffeeForm', () => {
  async function setup() {
    const fixture = TestBed.createComponent(CoffeeForm);
    fixture.componentRef.setInput('roasters', [roaster]);
    const submitted: CoffeeInput[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    await fixture.whenStable();
    return { fixture, submitted, el: fixture.nativeElement as HTMLElement };
  }

  function submit(el: HTMLElement) {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  function fill(el: HTMLElement, selector: string, value: string) {
    const control = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    control.value = value;
    // Browsers fire both events for inputs and selects.
    control.dispatchEvent(new Event('input'));
    control.dispatchEvent(new Event('change'));
  }

  function addPrice(el: HTMLElement) {
    el.querySelectorAll('button').forEach((b) => {
      if (b.textContent?.includes('Add price')) b.click();
    });
  }

  /** Fills every required field. Process: "Natural" (second option); roast level: "Light" (first). */
  function fillRequired(el: HTMLElement) {
    fill(el, '#name', 'Ethiopia Guji');
    fill(el, '#roasterId', 'r1');
    fill(el, '#description', 'Fruity and floral');
    fill(el, '#origin', 'Ethiopia');
    fill(el, '#variety', 'Heirloom');
    fill(el, '#tastingNotes', 'Berry');
    // Classification: Specialty (fourth option).
    el.querySelectorAll<HTMLInputElement>('input[name="classification"]')[3].click();
    const groups = el.querySelectorAll('app-choice-group');
    groups[0].querySelectorAll<HTMLInputElement>('input[type="radio"]')[1].click();
    groups[1].querySelectorAll<HTMLInputElement>('input[type="radio"]')[0].click();
  }

  it('does not emit and shows errors when the required fields are empty', async () => {
    const { fixture, submitted, el } = await setup();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([]);
    const alerts = Array.from(el.querySelectorAll('[role="alert"]'))
      .map((a) => a.textContent)
      .join(' ');
    expect(alerts).toContain('Name is required');
    expect(alerts).toContain('Roaster is required');
    expect(alerts).toContain('Description is required');
    expect(alerts).toContain('Choose a classification');
    expect(alerts).toContain('Origin is required');
    expect(alerts).toContain('Tasting notes are required');
  });

  it('emits the value including classification and prices when the form is valid', async () => {
    const { fixture, submitted, el } = await setup();

    fillRequired(el);
    addPrice(el);
    await fixture.whenStable();
    // Bag size: the default is 250 g, so pick 500 g (third option); currency: R$ (BRL).
    el.querySelectorAll<HTMLInputElement>('input[name="size-0"]')[2].click();
    fill(el, 'select[aria-label="Currency for bag 1"]', 'BRL');
    fill(el, '#price-0', '15');
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([
      {
        name: 'Ethiopia Guji',
        description: 'Fruity and floral',
        roasterId: 'r1',
        classification: 4,
        origin: 'Ethiopia',
        process: 'Natural',
        roastLevel: 'Light',
        variety: 'Heirloom',
        tastingNotes: 'Berry',
        productUrl: null,
        prices: [{ grams: 500, price: 15, currency: 'BRL' }],
        imageUrls: [],
      },
    ]);
  });

  it('keeps the USD option for a price', async () => {
    const { fixture, submitted, el } = await setup();

    fillRequired(el);
    addPrice(el);
    await fixture.whenStable();
    fill(el, 'select[aria-label="Currency for bag 1"]', 'USD');
    fill(el, '#price-0', '12');
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted[0].prices).toEqual([{ grams: 250, price: 12, currency: 'USD' }]);
  });

  it('removes a price row', async () => {
    const { fixture, el } = await setup();

    addPrice(el);
    await fixture.whenStable();
    expect(el.querySelector('#price-0')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('[aria-label="Remove price 1"]')!.click();
    await fixture.whenStable();

    expect(el.querySelector('#price-0')).toBeNull();
  });
});
