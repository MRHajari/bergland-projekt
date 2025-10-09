import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

/**
 * 🧭 Squadron (Staffel)
 * Eine Staffel gehört zu einem Event und kann mehrere Anmeldungen (EventRegistrations) haben.
 */
export interface SquadronDto {
  id?: string;
  name: string;
  start_number?: string | null;
  members_count?: number;
  description?: string | null;

  // 🔗 Beziehungen
  event_id: string;

  // ⏱️ Metadaten
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SquadronService {
  private endpoint = 'squadrons';

  constructor(private api: ApiService) {}

  // ============================================================
  // 📋 Alle Staffeln abrufen
  // ============================================================
  getAll(): Observable<SquadronDto[]> {
    return this.api.get(this.endpoint);
  }

  // ============================================================
  // 🔍 Einzelne Staffel
  // ============================================================
  getById(id: string): Observable<SquadronDto> {
    return this.api.getById(this.endpoint, id);
  }

  // ============================================================
  // 🎯 Staffeln nach Event
  // ============================================================
  getByEvent(eventId: string): Observable<SquadronDto[]> {
    return this.api.get(`${this.endpoint}/event/${eventId}`);
  }

  // ============================================================
  // ➕ Neue Staffel erstellen
  // ============================================================
  create(data: Partial<SquadronDto>): Observable<SquadronDto> {
    return this.api.post(this.endpoint, data);
  }

  // ============================================================
  // ✏️ Staffel aktualisieren
  // ============================================================
  update(id: string, data: Partial<SquadronDto>): Observable<SquadronDto> {
    return this.api.put(this.endpoint, id, data);
  }

  // ============================================================
  // ❌ Staffel löschen
  // ============================================================
  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
