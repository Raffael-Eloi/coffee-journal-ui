import { TestBed } from '@angular/core/testing';
import { ImagesService } from '../../images/images.service';
import { ImageUploader } from './image-uploader';

describe('ImageUploader', () => {
  const upload = vi.fn<(file: File) => Promise<string>>();

  async function setup(value: string[] = []) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ImagesService,
          useValue: {
            upload,
            validate: (file: File) => (file.type === 'image/png' ? null : 'invalidType'),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(ImageUploader);
    fixture.componentInstance.value.set(value);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const choose = async (...files: File[]) => {
      const input = el.querySelector<HTMLInputElement>('input[type="file"]')!;
      Object.defineProperty(input, 'files', { value: files, configurable: true });
      input.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    return { fixture, el, choose };
  }

  beforeEach(() => upload.mockReset());

  it('uploads each file with its own request and keeps the returned urls', async () => {
    upload.mockResolvedValueOnce('https://cdn/a.png').mockResolvedValueOnce('https://cdn/b.png');
    const { fixture, choose } = await setup();

    await choose(
      new File(['x'], 'a.png', { type: 'image/png' }),
      new File(['x'], 'b.png', { type: 'image/png' }),
    );

    expect(upload).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.value()).toEqual(['https://cdn/a.png', 'https://cdn/b.png']);
  });

  it('rejects an invalid file without calling the API', async () => {
    const { fixture, el, choose } = await setup();

    await choose(new File(['x'], 'a.gif', { type: 'image/gif' }));

    expect(upload).not.toHaveBeenCalled();
    expect(fixture.componentInstance.value()).toEqual([]);
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('a.gif');
  });

  it('removes a photo', async () => {
    const { fixture, el } = await setup(['https://cdn/a.png', 'https://cdn/b.png']);

    el.querySelector<HTMLButtonElement>('[aria-label="Remove photo 1"]')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toEqual(['https://cdn/b.png']);
  });
});
