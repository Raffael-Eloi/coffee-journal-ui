import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/v1.0/images`;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Uploads one image file and returns the URL the API stores it at. */
@Service()
export class ImagesService {
  private readonly http = inject(HttpClient);

  /** Returns the reason (a key under `images.` in the translations) when the file breaks the API limits, otherwise `null`. */
  validate(file: File): 'invalidType' | 'tooLarge' | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'invalidType';
    if (file.size > MAX_IMAGE_BYTES) return 'tooLarge';
    return null;
  }

  async upload(file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);
    const response = await firstValueFrom(this.http.post<{ url: string }>(API_URL, body));
    return response.url;
  }
}
