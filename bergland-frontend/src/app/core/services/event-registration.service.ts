import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../api.service';

// =====================================================
// 🧩 Teilnehmer (Person + Staffel-Zuordnung)
// =====================================================
export interface EventRegistrationParticipant {
  id?: string;
  registration_id?: string; // ✅ optional, weil erst nach Anlage vorhanden
  person_id: string;
  squadron_id?: string | null;
  participation_type: 'einzeln' | 'staffel';
  liability_accept: boolean;
  staffel_aufnahme?: string | null;

  // Relations
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    birth_date?: string;
  };
}

// =====================================================
// 🧩 Registrierung (Kopfebene, 1 pro User)
// =====================================================
export interface EventRegistrationInterface {
  id?: string;

  event_id: string;
  registered_by_person_id: string;

  phone_number?: string | null;
  license_plate?: string | null;
  start_number?: string | null;
  catering_type?: string | null;
  wishes?: string | null;
  gender?: 'm' | 'w' | 'd' | null;
  club?: string | null;
  status?: 'In Bearbeitung' | 'bestätigt' | 'abgelehnt';

  // 🧩 Teilnehmerliste
  participants?: EventRegistrationParticipant[];

  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// 🧩 Payloads für Requests
// =====================================================
export interface EventRegistrationParticipantPayload {
  person_id: string;
  squadron_id?: string | null;
  participation_type?: 'einzeln' | 'staffel';
  liability_accept?: boolean;
  staffel_aufnahme?: string | null;
  registration_id?: string;
  start_number?: string | null;
  catering_type?: string | null;
  gender?: 'm' | 'w' | 'd' | null;
}

export interface EventRegistrationGroupPayload {
  event_id: string;
  registered_by_person_id: string;
  phone_number?: string | null;
  license_plate?: string | null;
  wishes?: string | null;
  club?: string | null;
  status?: 'In Bearbeitung' | 'bestätigt' | 'abgelehnt';
  participants: EventRegistrationParticipantPayload[];
}

// =====================================================
// 🧩 Service
// =====================================================
@Injectable({
  providedIn: 'root',
})
export class EventRegistrationService {
  private readonly endpoint = 'event-registrations';

  constructor(private api: ApiService) {}

  // =====================================================
  // 📦 Basis-Endpunkte
  // =====================================================
  getAll(): Observable<EventRegistrationInterface[]> {
    return this.api.get<EventRegistrationInterface[]>(this.endpoint).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Laden der Registrierungen:', err);
        return throwError(() => err);
      })
    );
  }

  getById(id: string): Observable<EventRegistrationInterface> {
    return this.api.getById<EventRegistrationInterface>(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden der Registrierung ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  update(
    id: string,
    data: Partial<EventRegistrationInterface>
  ): Observable<EventRegistrationInterface> {
    return this.api.put<EventRegistrationInterface>(this.endpoint, id, data).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Aktualisieren der Registrierung ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Löschen der Registrierung ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // =====================================================
  // 🧩 Gruppen-Registrierungen
  // =====================================================
  /** Neue Gruppenregistrierung (mit Teilnehmern) erstellen */
  createGroupRegistration(payload: EventRegistrationGroupPayload): Observable<any> {
    return this.api.post(`${this.endpoint}/group`, payload).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Erstellen der Gruppen-Registrierung:', err);
        return throwError(() => err);
      })
    );
  }

  /** Teilnehmer zu bestehender Registrierung hinzufügen */
  addParticipant(payload: EventRegistrationParticipantPayload): Observable<any> {
    return this.api.post(`${this.endpoint}/participant`, payload).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Hinzufügen eines Teilnehmers:', err);
        return throwError(() => err);
      })
    );
  }

  /** Alle Gruppen eines Events abrufen (mit Teilnehmern) */
  getGroupByEvent(eventId: string): Observable<EventRegistrationInterface[]> {
    return this.api.get<EventRegistrationInterface[]>(`${this.endpoint}/group/event/${eventId}`).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden der Gruppen für Event ${eventId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** Nur Status einer Registrierung ändern */
  updateStatus(id: string, status: string): Observable<any> {
    return this.api.putCustom(`${this.endpoint}/${id}`, { status }).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Ändern des Status für Registrierung ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** 🗑️ Einzelnen Teilnehmer aus einer Registrierung löschen */
  deleteParticipant(participantId: string): Observable<any> {
    return this.api.delete(`${this.endpoint}/participant`, participantId).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Löschen des Teilnehmers ${participantId}:`, err);
        return throwError(() => err);
      })
    );
  }


/** 🧮 Alle Registrierungszahlen für alle Events abrufen */
getCountByEvent(): Observable<{ event_id: string; count: number }[]> {
  return this.api.get<{ event_id: string; count: number }[]>(`${this.endpoint}/count-by-event`).pipe(
    catchError((err) => {
      console.error('❌ Fehler beim Laden der Anmeldungszahlen:', err);
      return throwError(() => err);
    })
  );
}


  /** 🔍 Registrierungen nach Person abrufen */
  getByPerson(personId: string): Observable<EventRegistrationInterface[]> {
    return this.api.get<EventRegistrationInterface[]>(`${this.endpoint}/person/${personId}`).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden der Registrierungen für Person ${personId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** ❌ Registrierung anhand von Event + Person löschen */
  deleteByEventAndPerson(eventId: string, personId: string): Observable<any> {
    return this.api.delete(`${this.endpoint}/event/${eventId}/person/${personId}`, '').pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Entfernen der Person ${personId} aus Event ${eventId}:`, err);
        return throwError(() => err);
      })
    );
  }

/** Alle Registrierungen eines Users abrufen */
getByUser(userId: string): Observable<EventRegistrationInterface[]> {
  return this.api.get<EventRegistrationInterface[]>(`${this.endpoint}/user/${userId}`).pipe(
    catchError((err) => {
      console.error(`❌ Fehler beim Laden der Registrierungen für User ${userId}:`, err);
      return throwError(() => err);
    })
  );
}

/** ✏️ Startnummer eines Teilnehmers ändern (Admin) */
updateParticipantStartNumber(
  participantId: string,
  startNumber: string | null
): Observable<any> {
  return this.api.putCustom(
    `${this.endpoint}/participant/${participantId}/start-number`,
    { start_number: startNumber }
  ).pipe(
    catchError((err) => {
      console.error(
        `❌ Fehler beim Ändern der Startnummer für Teilnehmer ${participantId}:`,
        err
      );
      return throwError(() => err);
    })
  );
}

}
