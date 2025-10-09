import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface RouteDto {
  id: string;
  event_id: string;
  name: string;
  start_point?: string | null;
  end_point?: string | null;

  // Je nach Backend-Variante – beide optional abdecken:
  length_km?: number | null;      // unsere erste Modellvariante
  elevation_m?: number | null;
  distance_km?: number | null;    // falls du das Feld im Backend nutzt (Seed)
  difficulty?: string | null;

  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RouteService {
  private endpoint = 'routes';

  constructor(private api: ApiService) {}

  getAll(): Observable<RouteDto[]> {
    return this.api.get(this.endpoint);
  }

  getById(id: string): Observable<RouteDto> {
    return this.api.getById(this.endpoint, id);
  }

  // 🔹 NEU: Strecken eines Events
  getByEvent(eventId: string): Observable<RouteDto[]> {
    return this.api.get(`${this.endpoint}/event/${eventId}`);
  }

  create(data: Partial<RouteDto>): Observable<RouteDto> {
    return this.api.post(this.endpoint, data);
  }

  update(id: string, data: Partial<RouteDto>): Observable<RouteDto> {
    return this.api.put(this.endpoint, id, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
