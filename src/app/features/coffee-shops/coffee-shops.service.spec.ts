import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CoffeeShopInput } from './coffee-shop.model';
import { CoffeeShopsService } from './coffee-shops.service';

const BASE_URL = `${environment.apiUrl}/v1.0/coffee-shops`;

const input: CoffeeShopInput = {
  name: 'Blue Door',
  description: null,
  website: 'https://example.com',
  instagramUrl: null,
  phoneNumber: null,
  city: 'Lisbon',
  state: 'Lisboa',
  country: 'Portugal',
  address: 'Rua 1',
  timeZone: 'Europe/Lisbon',
  roasterIds: ['r1'],
  brewingMethods: [1, 2],
  amenities: [1],
  openingHours: [{ dayOfWeek: 1, opensAt: '08:00:00', closesAt: '18:00:00' }],
  imageUrls: ['https://cdn.example.com/a.png'],
};

describe('CoffeeShopsService', () => {
  let service: CoffeeShopsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoffeeShopsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists coffee shops', async () => {
    const result = service.list();
    http.expectOne({ method: 'GET', url: BASE_URL }).flush([]);
    expect(await result).toEqual([]);
  });

  it('gets a coffee shop by id', async () => {
    const result = service.get('abc');
    http.expectOne({ method: 'GET', url: `${BASE_URL}/abc` }).flush({ id: 'abc' });
    expect(await result).toEqual({ id: 'abc' });
  });

  it('creates a coffee shop', async () => {
    const result = service.create(input);
    const req = http.expectOne({ method: 'POST', url: BASE_URL });
    expect(req.request.body).toEqual(input);
    req.flush({ id: 'new' });
    expect(await result).toEqual({ id: 'new' });
  });

  it('updates a coffee shop', async () => {
    const result = service.update('abc', input);
    const req = http.expectOne({ method: 'PUT', url: `${BASE_URL}/abc` });
    expect(req.request.body).toEqual(input);
    req.flush(null);
    await result;
  });

  it('removes a coffee shop', async () => {
    const result = service.remove('abc');
    http.expectOne({ method: 'DELETE', url: `${BASE_URL}/abc` }).flush(null);
    await result;
  });
});
