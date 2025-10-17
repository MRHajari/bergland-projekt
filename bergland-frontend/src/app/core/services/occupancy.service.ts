// src/app/core/services/occupancy.service.ts
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

  /** 🔹 Alle Belegungen (Admin-Übersicht) */
  getAll(): Observable<OccupancyInterface[]> {
    return this.api.get<OccupancyInterface[]>(this.endpoint);
  }

  /** 🔹 Belegung per ID */
  getById(id: string): Observable<OccupancyInterface> {
    return this.api.getById<OccupancyInterface>(this.endpoint, id);
  }

  /** 🔹 Alle Belegungen eines Events */
  getByEvent(eventId: string): Observable<OccupancyInterface[]> {
    return this.api.get<OccupancyInterface[]>(`occupancies/events/${eventId}/occupancies`);
  }
  
  /** 🔹 Neue Belegung anlegen */
  create(data: Partial<OccupancyInterface>): Observable<OccupancyInterface> {
    return this.api.post<OccupancyInterface>(this.endpoint, data);
  }

  /** 🔹 Belegung aktualisieren */
  update(id: string, data: Partial<OccupancyInterface>): Observable<OccupancyInterface> {
    return this.api.put<OccupancyInterface>(this.endpoint, id, data);
  }

  /** 🔹 Belegung löschen */
  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }

  /** 🔹 Zuordnungen für ein Event aktualisieren (Admin-Funktion) */
  updateAssignments(eventId: string, assignments: Partial<OccupancyInterface>[]): Observable<any> {
    return this.api.post<any>('occupancies/updateAssignments', {
      event_id: eventId,
      assignments,
    });
  }
  
  /** 🔹 Alle Belegungen einer Unterkunft */
getByAccommodation(accommodationId: string): Observable<OccupancyInterface[]> {
  return this.api.get<OccupancyInterface[]>(`occupancies?accommodation_id=${accommodationId}`);
}
  
}
