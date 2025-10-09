import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface EventDto {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;             // ISO (yyyy-MM-dd or ISO)
  end_date?: string | null;
  registration_deadline?: string | null;  // ISO
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private endpoint = 'events';

  constructor(private api: ApiService) {}

  getAll(): Observable<EventDto[]> {
    return this.api.get(this.endpoint);
  }

  getById(id: string): Observable<EventDto> {
    return this.api.getById(this.endpoint, id);
  }

  create(data: Partial<EventDto>): Observable<EventDto> {
    return this.api.post(this.endpoint, data);
  }

  update(id: string, data: Partial<EventDto>): Observable<EventDto> {
    return this.api.put(this.endpoint, id, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
