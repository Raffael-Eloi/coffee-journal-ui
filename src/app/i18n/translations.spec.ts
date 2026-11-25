import en from '../../../public/i18n/en.json';
import pt from '../../../public/i18n/pt.json';

function keysOf(value: unknown, prefix = ''): string[] {
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keysOf(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('translations', () => {
  it('has the same keys in English and Portuguese', () => {
    expect(keysOf(pt).sort()).toEqual(keysOf(en).sort());
  });

  it('has no empty texts', () => {
    const values = (tree: unknown): string[] =>
      Object.values(tree as Record<string, unknown>).flatMap((v) =>
        typeof v === 'object' && v !== null ? values(v) : [String(v)],
      );
    expect(values(en).filter((text) => text.trim() === '')).toEqual([]);
    expect(values(pt).filter((text) => text.trim() === '')).toEqual([]);
  });
});
