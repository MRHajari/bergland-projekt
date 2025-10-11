import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../api.service';

export interface EventRegistrationInterface {
  id?: string;
  event_id: string;
  person_id: string;
  squadron_id?: string | null;
  participation_type: 'einzeln' | 'staffel';
  liability_accept: boolean;
  status?: string;

  // 🆕 Neue Felder:
  license_plate?: string;
  start_number?: string;
  catering_type?: string;
  wishes?: string;
  gender?: 'm' | 'w' | 'd';
  club?: string;
  staffel_aufnahme?: string;

  createdAt?: string;
  updatedAt?: string;
}


@Injectable({
  providedIn: 'root',
})
export class EventRegistrationService {
  private readonly endpoint = 'event-registrations'; // → /api/event-registrations

  constructor(private api: ApiService) {}

  // 🔹 Alle Registrierungen abrufen
  getAll(): Observable<EventRegistrationInterface[]> {
    return this.api.get<EventRegistrationInterface[]>(this.endpoint).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Laden der Registrierungen:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Einzelne Registrierung abrufen
  getById(id: string): Observable<EventRegistrationInterface> {
    return this.api.getById<EventRegistrationInterface>(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden der Registrierung mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Registrierung erstellen
  create(data: EventRegistrationInterface): Observable<EventRegistrationInterface> {
    return this.api.post<EventRegistrationInterface>(this.endpoint, data).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Erstellen der Registrierung:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Registrierung löschen
  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Löschen der Registrierung mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Registrierung aktualisieren
  update(id: string, data: Partial<EventRegistrationInterface>): Observable<EventRegistrationInterface> {
    return this.api.put<EventRegistrationInterface>(this.endpoint, id, data).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Aktualisieren der Registrierung mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🆕 🔹 Registrierungen nach Benutzer abrufen
  getByUser(userId: string): Observable<EventRegistrationInterface[]> {
    // Der Backend-Endpunkt könnte z. B. so aussehen:
    // GET /api/event-registrations/user/:userId
    const url = `${this.endpoint}/user/${userId}`;

    return this.api.get<EventRegistrationInterface[]>(url).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden der Registrierungen für Benutzer ${userId}:`, err);
        return throwError(() => err);
      })
    );
  }
}
