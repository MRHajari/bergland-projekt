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

  // 🆕 Zusätzliche Felder:
  phone_number?: string | null;        // ✅ NEU hinzugefügt
  license_plate?: string | null;
  start_number?: string | null;
  catering_type?: string | null;
  wishes?: string | null;
  gender?: 'm' | 'w' | 'd' | null;
  club?: string | null;
  staffel_aufnahme?: string | null;

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

  // 🔹 Registrierungen nach Person abrufen
  getByPerson(personId: string): Observable<EventRegistrationInterface[]> {
    const url = `${this.endpoint}/person/${personId}`;
    return this.api.get<EventRegistrationInterface[]>(url).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden der Registrierungen für Person ${personId}:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Registrierung einer bestimmten Person aus Event löschen
  deleteByEventAndPerson(eventId: string, personId: string): Observable<any> {
    return this.api.deleteCustom(`event-registrations/${eventId}/person/${personId}`);
  }

    // 🔹 Anzahl der Anmeldungen pro Event
    getCountByEvent(): Observable<Record<string, number>> {
      return this.api.get<Record<string, number>>(`${this.endpoint}/count-by-event`);
    }

}
