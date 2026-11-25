import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface GeoState {
  name: string;
  cities: string[];
}

export interface GeoCountryData {
  states: GeoState[];
}

/** Countries with bundled states and cities (`public/data/geo/<code>.json`). `name` is what the API stores. */
export const GEO_COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'Brazil', code: 'BR' },
] as const;

/** Loads the bundled states and cities of a country on demand and keeps them for the session. */
@Service()
export class GeoService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Promise<GeoCountryData>>();

  /** The data file code for a stored country name, or `undefined` when the country is not bundled. */
  codeFor(countryName: string): string | undefined {
    return GEO_COUNTRIES.find((country) => country.name === countryName)?.code;
  }

  load(code: string): Promise<GeoCountryData> {
    let data = this.cache.get(code);
    if (!data) {
      data = firstValueFrom(this.http.get<GeoCountryData>(`/data/geo/${code}.json`));
      // Do not keep a failed request, so the next attempt tries again.
      data.catch(() => this.cache.delete(code));
      this.cache.set(code, data);
    }
    return data;
  }
}
