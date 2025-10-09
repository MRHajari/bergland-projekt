import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface RuntimeDto {
  id: string;
  registration_id: string;
  route_id: string;
  start_time?: string | null;  // ISO
  end_time?: string | null;    // ISO
  total_time?: string | null;  // z. B. "00:47:32"
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RuntimeService {
  private endpoint = 'runtimes';

  constructor(private api: ApiService) {}

  getAll(): Observable<RuntimeDto[]> {
    return this.api.get(this.endpoint);
  }

  getById(id: string): Observable<RuntimeDto> {
    return this.api.getById(this.endpoint, id);
  }

  // 🔹 NEU: Laufzeiten zu einer Anmeldung
  getByRegistration(registrationId: string): Observable<RuntimeDto[]> {
    return this.api.get(`${this.endpoint}/registration/${registrationId}`);
  }

  create(data: Partial<RuntimeDto>): Observable<RuntimeDto> {
    return this.api.post(this.endpoint, data);
  }

  update(id: string, data: Partial<RuntimeDto>): Observable<RuntimeDto> {
    return this.api.put(this.endpoint, id, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
