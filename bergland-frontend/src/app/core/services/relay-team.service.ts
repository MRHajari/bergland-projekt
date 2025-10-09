import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface RelayTeamDto {
  id: string;
  event_id: string;
  route_id: string;
  name?: string | null;
  run_date: string;           // yyyy-MM-dd
  start_time?: string | null; // HH:mm (optional)
  start_location?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RelayTeamService {
  private endpoint = 'relay-teams';

  constructor(private api: ApiService) {}

  getAll(): Observable<RelayTeamDto[]> {
    return this.api.get(this.endpoint);
  }

  getById(id: string): Observable<RelayTeamDto> {
    return this.api.getById(this.endpoint, id);
  }

  // 🔹 NEU: Lauftage eines Events
  getByEvent(eventId: string): Observable<RelayTeamDto[]> {
    return this.api.get(`${this.endpoint}/event/${eventId}`);
  }

  create(data: Partial<RelayTeamDto>): Observable<RelayTeamDto> {
    return this.api.post(this.endpoint, data);
  }

  update(id: string, data: Partial<RelayTeamDto>): Observable<RelayTeamDto> {
    return this.api.put(this.endpoint, id, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
