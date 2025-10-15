import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface OccupancyInterface {
  id?: string;
  event_id: string;
  accommodation_id: string;
  single_beds_total?: number;
  double_beds_total?: number;
  multi_beds_total?: number;
  single_beds_booked?: number;
  double_beds_booked?: number;
  multi_beds_booked?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class OccupancyService {
  private endpoint = 'occupancies';

  constructor(private api: ApiService) {}

  getAll(): Observable<OccupancyInterface[]> {
    return this.api.get<OccupancyInterface[]>(this.endpoint);
  }

  getById(id: string): Observable<OccupancyInterface> {
    return this.api.getById<OccupancyInterface>(this.endpoint, id);
  }

  getByAccommodation(accommodationId: string): Observable<OccupancyInterface[]> {
    return this.api.get<OccupancyInterface[]>(`${this.endpoint}?accommodation_id=${accommodationId}`);
  }

  getByEvent(eventId: string): Observable<OccupancyInterface[]> {
    return this.api.get<OccupancyInterface[]>(`${this.endpoint}?event_id=${eventId}`);
  }

  create(data: Partial<OccupancyInterface>): Observable<OccupancyInterface> {
    return this.api.post<OccupancyInterface>(this.endpoint, data);
  }

  update(id: string, data: Partial<OccupancyInterface>): Observable<OccupancyInterface> {
    return this.api.put<OccupancyInterface>(this.endpoint, id, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
