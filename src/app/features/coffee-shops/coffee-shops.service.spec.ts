import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CoffeeShopInput } from './coffee-shop.model';
import { CoffeeShopsService } from './coffee-shops.service';

const input: CoffeeShopInput = {
  name: 'Blue Door',
  website: 'https://example.com',
  roasterId: null,
  rate: 4,
  review: 'Great',
  recommend: true,
  city: 'Lisbon',
  state: 'Lisboa',
  country: 'Portugal',
  location: 'Rua 1',
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
    http.expectOne({ method: 'GET', url: '/api/coffee-shops' }).flush([]);
    expect(await result).toEqual([]);
  });

  it('gets a coffee shop by id', async () => {
    const result = service.get('abc');
    http.expectOne({ method: 'GET', url: '/api/coffee-shops/abc' }).flush({ id: 'abc' });
    expect(await result).toEqual({ id: 'abc' });
  });

  it('creates a coffee shop', async () => {
    const result = service.create(input);
    const req = http.expectOne({ method: 'POST', url: '/api/coffee-shops' });
    expect(req.request.body).toEqual(input);
    req.flush({ id: 'new' });
    expect(await result).toEqual({ id: 'new' });
  });

  it('updates a coffee shop', async () => {
    const result = service.update('abc', input);
    const req = http.expectOne({ method: 'PUT', url: '/api/coffee-shops/abc' });
    expect(req.request.body).toEqual(input);
    req.flush(null);
    await result;
  });

  it('removes a coffee shop', async () => {
    const result = service.remove('abc');
    http.expectOne({ method: 'DELETE', url: '/api/coffee-shops/abc' }).flush(null);
    await result;
  });
});
