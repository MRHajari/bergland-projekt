import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type RegistrationStatus = 'bestätigt' | 'in_auswahl' | 'abgelehnt';
export type ParticipationType = 'einzeln' | 'staffel';

export interface EventRegistration {
  id?: string;
  event_id: string;
  person_id: string;

  phone_number?: string;
  license_plate?: string;
  participation_type: ParticipationType;
  catering_type?: string;
  wishes?: string;
  gender?: 'm' | 'w' | 'd';
  club?: string;
  start_number?: string;
  liability_accept: boolean;

  status?: RegistrationStatus;

  // Relationen
  relay_team_id?: string | null; // Lauftag
  squadron_id?: string | null;   // Staffel

  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EventRegistrationService {
  private apiUrl = `${environment.apiUrl}/event-registrations`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // ➕ Neue Anmeldung
  createEventRegistration(data: EventRegistration): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }

  // 📋 Alle
  getAllEventRegistrations(): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // 🔍 By ID
  getEventRegistrationById(id: string): Observable<EventRegistration> {
    return this.http.get<EventRegistration>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // ✏️ Update
  updateEventRegistration(id: string, data: Partial<EventRegistration>): Observable<EventRegistration> {
    return this.http.put<EventRegistration>(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  // ❌ Delete
  deleteEventRegistration(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🧩 NEU: nach Event
  getByEvent(eventId: string): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.apiUrl}/event/${eventId}`, { headers: this.getAuthHeaders() });
  }

  // 🧩 NEU: nach Person (Backend-Route ist /person/:personId)
  getByPerson(personId: string): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.apiUrl}/person/${personId}`, { headers: this.getAuthHeaders() });
  }

  /** 🔁 Optionaler Alias, falls du im Frontend schon getByUser() verwendest */
  getByUser(userId: string): Observable<EventRegistration[]> {
    return this.getByPerson(userId);
  }
}
