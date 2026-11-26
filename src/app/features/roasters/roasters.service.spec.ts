import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RoasterInput } from './roaster.model';
import { RoastersService } from './roasters.service';

const BASE_URL = `${environment.apiUrl}/v1.0/coffee-roasters`;

const input: RoasterInput = {
  name: 'Origin Roasters',
  description: null,
  website: null,
  instagramUrl: null,
  phoneNumber: null,
  hasMembershipOption: false,
  logoUrl: null,
  city: 'Campinas',
  state: 'São Paulo',
  country: 'Brazil',
  address: null,
  classifications: [3, 4],
  imageUrls: [],
};

describe('RoastersService', () => {
  let service: RoastersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoastersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists roasters', async () => {
    const result = service.list();
    http.expectOne({ method: 'GET', url: BASE_URL }).flush([]);
    expect(await result).toEqual([]);
  });

  it('gets a roaster by id', async () => {
    const result = service.get('abc');
    http.expectOne({ method: 'GET', url: `${BASE_URL}/abc` }).flush({ id: 'abc' });
    expect(await result).toEqual({ id: 'abc' });
  });

  it('creates a roaster', async () => {
    const result = service.create(input);
    const req = http.expectOne({ method: 'POST', url: BASE_URL });
    expect(req.request.body).toEqual(input);
    req.flush({ id: 'new' });
    expect(await result).toEqual({ id: 'new' });
  });

  it('updates a roaster', async () => {
    const result = service.update('abc', input);
    const req = http.expectOne({ method: 'PUT', url: `${BASE_URL}/abc` });
    expect(req.request.body).toEqual(input);
    req.flush(null);
    await result;
  });

  it('removes a roaster', async () => {
    const result = service.remove('abc');
    http.expectOne({ method: 'DELETE', url: `${BASE_URL}/abc` }).flush(null);
    await result;
  });
});
