import { TestBed } from '@angular/core/testing';
import { Roaster } from '../../../roasters/roaster.model';
import { CoffeeFormValue } from '../../coffee.model';
import { CoffeeForm } from './coffee-form';

const roaster: Roaster = {
  id: 'r1',
  name: 'Origin Roasters',
  website: null,
  rate: 5,
  review: '',
  recommend: true,
  hasMembershipOption: false,
  logoUrl: null,
  createdAt: '',
  updatedAt: '',
};

describe('CoffeeForm', () => {
  async function setup() {
    const fixture = TestBed.createComponent(CoffeeForm);
    fixture.componentRef.setInput('roasters', [roaster]);
    const submitted: CoffeeFormValue[] = [];
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

  it('does not emit and shows errors when name and roaster are empty', async () => {
    const { fixture, submitted, el } = await setup();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([]);
    const alerts = Array.from(el.querySelectorAll('[role="alert"]')).map((a) => a.textContent);
    expect(alerts.join(' ')).toContain('Name is required');
    expect(alerts.join(' ')).toContain('Roaster is required');
  });

  it('emits the value including prices when the form is valid', async () => {
    const { fixture, submitted, el } = await setup();

    fill(el, '#name', 'Ethiopia Guji');
    fill(el, '#roasterId', 'r1');
    el.querySelectorAll('button').forEach((b) => {
      if (b.textContent?.includes('Add price')) b.click();
    });
    await fixture.whenStable();
    fill(el, '#grams-0', '250');
    fill(el, '#price-0', '15');
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted.length).toBe(1);
    expect(submitted[0].name).toBe('Ethiopia Guji');
    expect(submitted[0].roasterId).toBe('r1');
    expect(submitted[0].prices).toEqual([{ grams: 250, price: 15 }]);
  });

  it('removes a price row', async () => {
    const { fixture, el } = await setup();

    el.querySelectorAll('button').forEach((b) => {
      if (b.textContent?.includes('Add price')) b.click();
    });
    await fixture.whenStable();
    expect(el.querySelector('#grams-0')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('[aria-label="Remove price 1"]')!.click();
    await fixture.whenStable();

    expect(el.querySelector('#grams-0')).toBeNull();
  });
});
