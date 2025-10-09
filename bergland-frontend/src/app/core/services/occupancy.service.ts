import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface OccupancyDto {
  id?: string;

  // Beziehungen
  event_id: string;            // z. B. „Berglauf 2025“
  accommodation_id: string;    // Hotel / Unterkunft

  // Verfügbarkeitsdaten
  date_from?: string | null;   // ISO-Datum (z. B. 2025-06-21)
  date_to?: string | null;     // ISO-Datum (z. B. 2025-06-22)
  available_beds?: number;     // aktuelle freie Betten
  reserved_beds?: number;      // bereits reserviert
  notes?: string | null;       // optionale Bemerkung (z. B. „ausgebucht“)

  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class OccupancyService {
  private endpoint = 'occupancies';

  constructor(private api: ApiService) {}

  // 📋 Alle Belegungen abrufen
  getAll(): Observable<OccupancyDto[]> {
    return this.api.get(this.endpoint);
  }

  // 🔍 Einzelne Belegung
  getById(id: string): Observable<OccupancyDto> {
    return this.api.getById(this.endpoint, id);
  }

  // 🏨 Belegungen nach Unterkunft
  getByAccommodation(accommodationId: string): Observable<OccupancyDto[]> {
    return this.api.get(`${this.endpoint}/accommodation/${accommodationId}`);
  }

  // 🎯 Belegungen nach Event
  getByEvent(eventId: string): Observable<OccupancyDto[]> {
    return this.api.get(`${this.endpoint}/event/${eventId}`);
  }

  // ➕ Neue Belegung
  create(data: Partial<OccupancyDto>): Observable<OccupancyDto> {
    return this.api.post(this.endpoint, data);
  }

  // ✏️ Update
  update(id: string, data: Partial<OccupancyDto>): Observable<OccupancyDto> {
    return this.api.put(this.endpoint, id, data);
  }

  // ❌ Löschen
  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
