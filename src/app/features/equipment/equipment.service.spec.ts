import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { EquipmentInput } from './equipment.model';
import { EquipmentService } from './equipment.service';

const BASE_URL = `${environment.apiUrl}/v1.0/coffee-equipments`;
const CATEGORIES_URL = `${environment.apiUrl}/v1.0/coffee-equipment-categories`;

const input: EquipmentInput = {
  name: 'Ode Gen 2',
  brand: 'Fellow',
  model: null,
  review: 'Great',
  rating: 5,
  recommend: true,
  equipmentCategoryId: 'c1',
  price: 345,
  currency: 'USD',
  link: null,
  frequencyOfUse: 1,
  imageUrl: null,
  purchaseDate: '2026-01-15',
};

describe('EquipmentService', () => {
  let service: EquipmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EquipmentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the categories', async () => {
    const result = service.listCategories();
    http.expectOne({ method: 'GET', url: CATEGORIES_URL }).flush([]);
    expect(await result).toEqual([]);
  });

  it('lists equipment', async () => {
    const result = service.list();
    http.expectOne({ method: 'GET', url: BASE_URL }).flush([]);
    expect(await result).toEqual([]);
  });

  it('gets equipment by id', async () => {
    const result = service.get('abc');
    http.expectOne({ method: 'GET', url: `${BASE_URL}/abc` }).flush({ id: 'abc' });
    expect(await result).toEqual(expect.objectContaining({ id: 'abc' }));
  });

  it('creates equipment and returns the new id', async () => {
    const result = service.create(input);
    const req = http.expectOne({ method: 'POST', url: BASE_URL });
    expect(req.request.body).toEqual(input);
    req.flush({ id: 'new' }, { status: 201, statusText: 'Created' });
    expect(await result).toEqual({ id: 'new' });
  });

  it('replaces equipment', async () => {
    const result = service.update('abc', input);
    const req = http.expectOne({ method: 'PUT', url: `${BASE_URL}/abc` });
    expect(req.request.body).toEqual(input);
    req.flush(null, { status: 204, statusText: 'No Content' });
    await result;
  });

  it('removes equipment', async () => {
    const result = service.remove('abc');
    http
      .expectOne({ method: 'DELETE', url: `${BASE_URL}/abc` })
      .flush(null, { status: 204, statusText: 'No Content' });
    await result;
  });
});
