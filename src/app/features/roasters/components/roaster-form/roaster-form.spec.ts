import { TestBed } from '@angular/core/testing';
import { RoasterFormValue } from '../../roaster.model';
import { RoasterForm } from './roaster-form';

describe('RoasterForm', () => {
  function setup() {
    const fixture = TestBed.createComponent(RoasterForm);
    const submitted: RoasterFormValue[] = [];
    fixture.componentInstance.submitted.subscribe((value) => submitted.push(value));
    return { fixture, submitted, el: fixture.nativeElement as HTMLElement };
  }

  function submit(el: HTMLElement) {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('does not emit and shows an error when the name is empty', async () => {
    const { fixture, submitted, el } = setup();
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted).toEqual([]);
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Name is required');
  });

  it('emits the value when the name is filled', async () => {
    const { fixture, submitted, el } = setup();
    await fixture.whenStable();

    const name = el.querySelector<HTMLInputElement>('#name')!;
    name.value = 'Origin Roasters';
    name.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    submit(el);
    await fixture.whenStable();

    expect(submitted.length).toBe(1);
    expect(submitted[0].name).toBe('Origin Roasters');
  });
});
