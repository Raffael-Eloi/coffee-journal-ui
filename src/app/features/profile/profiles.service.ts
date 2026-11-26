import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile, ProfileCreateInput } from './profile.model';

const API_URL = `${environment.apiUrl}/v1.0/profiles`;

@Service()
export class ProfilesService {
  private readonly http = inject(HttpClient);

  /** The signed-in user's profile. Rejects with a 404 `HttpErrorResponse` when there is none yet. */
  me(): Promise<Profile> {
    return firstValueFrom(this.http.get<Profile>(`${API_URL}/me`));
  }

  create(input: ProfileCreateInput): Promise<{ id: string }> {
    return firstValueFrom(this.http.post<{ id: string }>(`${API_URL}/me`, input));
  }
}
