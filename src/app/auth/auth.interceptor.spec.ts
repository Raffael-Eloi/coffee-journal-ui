import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

const URL = `${environment.apiUrl}/v1.0/things`;

describe('authInterceptor', () => {
  const signedIn = signal(true);
  const getToken = vi.fn<() => Promise<string>>();
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    signedIn.set(true);
    getToken.mockReset().mockResolvedValue('tok');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isSignedIn: signedIn, getToken } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('adds the bearer token to API calls when signed in', async () => {
    void firstValueFrom(http.get(URL));
    const req = await vi.waitFor(() => controller.expectOne(URL));
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
  });

  it('sends no token when signed out', () => {
    signedIn.set(false);
    void firstValueFrom(http.get(URL));
    const req = controller.expectOne(URL);
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(getToken).not.toHaveBeenCalled();
  });

  it('does not add the token to other hosts', () => {
    void firstValueFrom(http.get('https://elsewhere.example/data.json'));
    const req = controller.expectOne('https://elsewhere.example/data.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('lets a public read go out without a token when none can be obtained', async () => {
    getToken.mockRejectedValue(new Error('no token'));
    void firstValueFrom(http.get(URL));
    const req = await vi.waitFor(() => controller.expectOne(URL));
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('fails a write when no token can be obtained', async () => {
    getToken.mockRejectedValue(new Error('no token'));
    await expect(firstValueFrom(http.post(URL, {}))).rejects.toThrow('no token');
  });
});
