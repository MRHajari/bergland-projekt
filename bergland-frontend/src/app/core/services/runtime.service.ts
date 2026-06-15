import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Runtime {
  id: string;
  participant_id: string;
  event_route_id: string;
  duration_seconds: number;
  position?: number | null;
  recorded_by?: string;
  createdAt?: string;
  updatedAt?: string;

  eventRoute?: {
    id: string;
    event_id: string;
    route_id: string;
  };

  participant?: {
    id: string;
    registration_id: string;
    person_id: string;
    registration?: {
      id: string;
      event_id: string;
    };
  };
}

export interface RuntimeCreatePayload {
  participant_id: string;
  event_route_id: string;
  duration_seconds: number;
}

export interface RuntimeUpdatePayload {
  duration_seconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class RuntimeService {
  private apiUrl = 'http://localhost:3000/api/runtimes';

  constructor(private http: HttpClient) {}

  // 📋 Alle Laufzeiten
  getAll(): Observable<Runtime[]> {
    return this.http.get<Runtime[]>(this.apiUrl);
  }

  // 🔍 Laufzeit per ID
  getById(id: string): Observable<Runtime> {
    return this.http.get<Runtime>(`${this.apiUrl}/${id}`);
  }

  // 🔍 Laufzeiten eines Events
  getByEvent(eventId: string): Observable<Runtime[]> {
    return this.http.get<Runtime[]>(`${this.apiUrl}/event/${eventId}`);
  }

  // ➕ Neue Laufzeit
  create(data: RuntimeCreatePayload): Observable<Runtime> {
    return this.http.post<Runtime>(this.apiUrl, data);
  }

  // ✏️ Laufzeit aktualisieren
  update(id: string, data: RuntimeUpdatePayload): Observable<Runtime> {
    return this.http.put<Runtime>(`${this.apiUrl}/${id}`, data);
  }

  // ❌ Löschen
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
