import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Runtime {
  id: string;
  event_registration_id: string;
  event_route_id: string;
  duration_seconds: number;
  position?: number;
  recorded_by: string;
  createdAt?: string;
  updatedAt?: string;

  eventRoute?: {
    id: string;
    event_id: string;
    route_id: string;
  };
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

  // 🔍 Laufzeit zu Anmeldung
  getByRegistration(registrationId: string): Observable<Runtime> {
    return this.http.get<Runtime>(
      `${this.apiUrl}/registration/${registrationId}`
    );
  }

  // ➕ Neue Laufzeit
  create(data: {
    event_registration_id: string;
    event_route_id: string;
    duration_seconds: number;
  }): Observable<Runtime> {
    return this.http.post<Runtime>(this.apiUrl, data);
  }

  // ✏️ Laufzeit aktualisieren
  update(id: string, data: {
    event_registration_id: string;
    event_route_id: string;
    duration_seconds: number;
  }): Observable<Runtime> {
    return this.http.put<Runtime>(`${this.apiUrl}/${id}`, data);
  }

  // ❌ Löschen
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
