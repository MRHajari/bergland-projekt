import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// 🔹 Interface für Typensicherheit
export interface EventRegistration {
  id?: string;
  event_id: string;
  person_id: string;
  phone_number?: string;
  license_plate?: string;
  participation_type: 'einzeln' | 'staffel';
  catering_type?: string;
  wishes?: string;
  gender?: 'm' | 'w' | 'd';
  club?: string;
  start_number?: string;
  liability_accept?: boolean;
  status?: 'bestätigt' | 'in_auswahl' | 'abgelehnt';
  relay_team_id?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class EventRegistrationService {
  private apiUrl = `${environment.apiUrl}/event-registrations`;

  constructor(private http: HttpClient) {}


  

  // 🔹 Header mit Token (für geschützte Routen)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // ➕ Neue Anmeldung erstellen
  createEventRegistration(data: EventRegistration): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // 📋 Alle Anmeldungen abrufen
  getAllEventRegistrations(): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // 🔍 Einzelne Anmeldung per ID abrufen
  getEventRegistrationById(id: string): Observable<EventRegistration> {
    return this.http.get<EventRegistration>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✏️ Anmeldung aktualisieren
  updateEventRegistration(id: string, data: Partial<EventRegistration>): Observable<EventRegistration> {
    return this.http.put<EventRegistration>(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // ❌ Anmeldung löschen
  deleteEventRegistration(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 🧩 🔹 NEU: Alle Anmeldungen eines Benutzers abrufen
  getByUser(userId: string): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
