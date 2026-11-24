import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CoffeeInput } from './coffee.model';
import { CoffeesService } from './coffees.service';

const BASE_URL = `${environment.apiUrl}/v1.0/coffees`;

const input: CoffeeInput = {
  name: 'Ethiopia Guji',
  description: 'Fruity',
  roasterId: 'r1',
  rate: 5,
  review: 'Great',
  recommend: true,
  origin: 'Ethiopia',
  process: 'Washed',
  roastLevel: 'Light',
  variety: 'Heirloom',
  tastingNotes: 'Berry',
  prices: [{ grams: 250, price: 15, currency: 'BRL' }],
  imageUrls: ['https://cdn.example.com/a.png'],
};

describe('CoffeesService', () => {
  let service: CoffeesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoffeesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists coffees', async () => {
    const result = service.list();
    http.expectOne({ method: 'GET', url: BASE_URL }).flush([]);
    expect(await result).toEqual([]);
  });

  it('gets a coffee by id', async () => {
    const result = service.get('abc');
    http.expectOne({ method: 'GET', url: `${BASE_URL}/abc` }).flush({ id: 'abc' });
    expect(await result).toEqual({ id: 'abc' });
  });

  it('creates a coffee', async () => {
    const result = service.create(input);
    const req = http.expectOne({ method: 'POST', url: BASE_URL });
    expect(req.request.body).toEqual(input);
    req.flush({ id: 'new' });
    expect(await result).toEqual({ id: 'new' });
  });

  it('updates a coffee', async () => {
    const result = service.update('abc', input);
    const req = http.expectOne({ method: 'PUT', url: `${BASE_URL}/abc` });
    expect(req.request.body).toEqual(input);
    req.flush(null);
    await result;
  });

  it('removes a coffee', async () => {
    const result = service.remove('abc');
    http.expectOne({ method: 'DELETE', url: `${BASE_URL}/abc` }).flush(null);
    await result;
  });
});
