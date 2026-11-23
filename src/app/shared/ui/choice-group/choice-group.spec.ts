import { TestBed } from '@angular/core/testing';
import { ChoiceGroup } from './choice-group';

describe('ChoiceGroup', () => {
  async function setup(value = '') {
    const fixture = TestBed.createComponent(ChoiceGroup);
    fixture.componentRef.setInput('label', 'Roast level');
    fixture.componentRef.setInput('options', ['Light', 'Medium', 'Dark']);
    fixture.componentInstance.value.set(value);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const radios = () => Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    return { fixture, el, radios };
  }

  it('renders the options plus "Other", with the legend as the group name', async () => {
    const { el, radios } = await setup();

    expect(radios().length).toBe(4);
    expect(el.querySelector('legend')?.textContent).toContain('Roast level');
    expect(el.textContent).toContain('Other');
  });

  it('sets the value when an option is chosen', async () => {
    const { fixture, radios } = await setup();

    radios()[1].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('Medium');
    expect(radios()[1].checked).toBe(true);
  });

  it('selects an option that matches the current value', async () => {
    const { radios } = await setup('Dark');

    expect(radios()[2].checked).toBe(true);
    expect(radios()[3].checked).toBe(false);
  });

  it('shows a text input for "Other" and keeps what is typed', async () => {
    const { fixture, el, radios } = await setup('Light');
    expect(el.querySelector('input[type="text"]')).toBeNull();

    radios()[3].click();
    await fixture.whenStable();
    const text = el.querySelector<HTMLInputElement>('input[type="text"]')!;
    expect(text).not.toBeNull();
    expect(fixture.componentInstance.value()).toBe('');

    text.value = 'Cinnamon';
    text.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('Cinnamon');
    expect(radios()[3].checked).toBe(true);
  });

  it('starts in "Other" mode when the value is not one of the options', async () => {
    const { el, radios } = await setup('Cinnamon');

    expect(radios()[3].checked).toBe(true);
    expect(el.querySelector<HTMLInputElement>('input[type="text"]')?.value).toBe('Cinnamon');
  });
});
