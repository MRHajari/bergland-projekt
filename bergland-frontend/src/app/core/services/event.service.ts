import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../api.service';

export interface Event {
  id?: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  createdAt?: string;
  updatedAt?: string;

  // 📦 Mitgeladene Relationen (optional)
  routes?: { id: string; name: string; distance_km: number }[];
  squadrons?: { id: string; name: string; members_count: number }[];
  eventRegistrations?: {
    id: string;
    person?: { id: string; first_name: string; last_name: string };
  }[];
  occupancies?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly endpoint = 'events'; // → /api/events im Backend

  constructor(private api: ApiService) {}

  // ============================================================
  // 📋 Alle Events abrufen (mit Details)
  // ============================================================
  getAll(): Observable<Event[]> {
    return this.api.get<Event[]>(this.endpoint).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Laden der Events:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔍 Einzelnes Event mit allen zugehörigen Daten abrufen
  // ============================================================
  getById(id: string): Observable<Event> {
    return this.api.getById<Event>(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden des Events mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // ➕ Neues Event erstellen
  // ============================================================
  create(data: Event): Observable<Event> {
    return this.api.post<Event>(this.endpoint, data).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Erstellen des Events:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // ✏️ Event aktualisieren
  // ============================================================
  update(id: string, data: Partial<Event>): Observable<Event> {
    return this.api.put<Event>(this.endpoint, id, data).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Aktualisieren des Events mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // ❌ Event löschen
  // ============================================================
  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Löschen des Events mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
