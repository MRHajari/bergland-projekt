import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RelayTeam {
  id: string;
  event_id: string;
  route_id: string;
  run_date: string;
  start_time?: string;
  start_location?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RelayTeamService {
  private apiUrl = 'http://localhost:3000/api/relay-teams';

  constructor(private http: HttpClient) {}

  // 📋 Alle Lauftage
  getAll(): Observable<RelayTeam[]> {
    return this.http.get<RelayTeam[]>(this.apiUrl);
  }

  // 🔍 Lauftag per ID
  getById(id: string): Observable<RelayTeam> {
    return this.http.get<RelayTeam>(`${this.apiUrl}/${id}`);
  }

  // 🔍 Lauftage eines Events
  getByEvent(eventId: string): Observable<RelayTeam[]> {
    return this.http.get<RelayTeam[]>(
      `${this.apiUrl}/event/${eventId}`
    );
  }

  // ➕ Erstellen
  create(data: RelayTeam): Observable<RelayTeam> {
    return this.http.post<RelayTeam>(this.apiUrl, data);
  }

  // ✏️ Aktualisieren
  update(id: string, data: RelayTeam): Observable<RelayTeam> {
    return this.http.put<RelayTeam>(`${this.apiUrl}/${id}`, data);
  }

  // ❌ Löschen
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
