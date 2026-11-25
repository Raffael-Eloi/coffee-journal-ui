import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ImagesService } from './images.service';

const URL = `${environment.apiUrl}/v1.0/images`;

describe('ImagesService', () => {
  let service: ImagesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ImagesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the file as multipart "file" and returns the url', async () => {
    const file = new File(['x'], 'cup.png', { type: 'image/png' });

    const result = service.upload(file);
    const req = http.expectOne({ method: 'POST', url: URL });
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ url: 'https://cdn.example.com/cup.png' });

    expect(await result).toBe('https://cdn.example.com/cup.png');
  });

  it('accepts JPEG, PNG and WebP up to 5 MB', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(service.validate(new File(['x'], 'a', { type }))).toBeNull();
    }
  });

  it('rejects other types and files over 5 MB', () => {
    expect(service.validate(new File(['x'], 'a.gif', { type: 'image/gif' }))).toBe('invalidType');
    const big = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    expect(service.validate(big)).toBe('tooLarge');
  });
});
