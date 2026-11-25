import { TestBed } from '@angular/core/testing';
import { EquipmentCategory, EquipmentInput } from '../../equipment.model';
import { EquipmentForm } from './equipment-form';

const categories: EquipmentCategory[] = [{ id: 'c1', name: 'Grinder', description: '' }];

describe('EquipmentForm', () => {
  async function setup(initial?: EquipmentInput) {
    const fixture = TestBed.createComponent(EquipmentForm);
    fixture.componentRef.setInput('categories', categories);
    if (initial) fixture.componentRef.setInput('initialValue', initial);
    const submitted: EquipmentInput[] = [];
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
    control.dispatchEvent(new Event('input'));
    control.dispatchEvent(new Event('change'));
  }

  it('does not emit and shows errors when required fields are empty', async () => {
    const { fixture, submitted, el } = await setup();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([]);
    const text = Array.from(el.querySelectorAll('[role="alert"]'))
      .map((a) => a.textContent)
      .join(' ');
    expect(text).toContain('Name is required');
    expect(text).toContain('Brand is required');
    expect(text).toContain('Category is required');
    expect(text).toContain('Choose how often you use it');
    expect(text).toContain('Review is required');
  });

  it('emits null for the optional fields left empty', async () => {
    const { fixture, submitted, el } = await setup();

    fill(el, '#name', 'Ode Gen 2');
    fill(el, '#brand', 'Fellow');
    fill(el, '#equipmentCategoryId', 'c1');
    fill(el, '#frequencyOfUse', '2');
    fill(el, '#review', 'Great grinder');
    el.querySelectorAll<HTMLInputElement>('app-star-rating input[type="radio"]')[4].click();
    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([
      {
        name: 'Ode Gen 2',
        brand: 'Fellow',
        model: null,
        review: 'Great grinder',
        rating: 5,
        recommend: false,
        equipmentCategoryId: 'c1',
        price: null,
        currency: null,
        link: null,
        frequencyOfUse: 2,
        imageUrl: null,
        purchaseDate: null,
      },
    ]);
  });

  it('sends price and currency together', async () => {
    const { fixture, submitted, el } = await setup();

    fill(el, '#name', 'Ode Gen 2');
    fill(el, '#brand', 'Fellow');
    fill(el, '#equipmentCategoryId', 'c1');
    fill(el, '#frequencyOfUse', '1');
    fill(el, '#review', 'Great grinder');
    fill(el, '#price', '345.5');
    fill(el, 'select[aria-label="Currency"]', 'BRL');
    el.querySelectorAll<HTMLInputElement>('app-star-rating input[type="radio"]')[4].click();
    submit(el);
    await fixture.whenStable();

    expect(submitted[0]).toEqual(expect.objectContaining({ price: 345.5, currency: 'BRL' }));
  });

  it('shows the messages the API returned next to their field', async () => {
    const { fixture, el } = await setup();
    fixture.componentRef.setInput('serverErrors', { equipmentCategoryId: ['Unknown category'] });
    await fixture.whenStable();

    const field = el.querySelector('#equipmentCategoryId')!.closest('app-labeled-field')!;
    expect(field.textContent).toContain('Unknown category');
  });
});
