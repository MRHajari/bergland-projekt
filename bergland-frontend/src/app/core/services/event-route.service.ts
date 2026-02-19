import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventRoute {
  id: string;
  event_id: string;
  route_id: string;
  day_date?: string;
  start_time?: string;
  note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventRouteService {

  private apiUrl = 'http://localhost:3000/api/event-routes';

  constructor(private http: HttpClient) {}

  // 📋 Alle Event-Strecken
  getAll(): Observable<EventRoute[]> {
    return this.http.get<EventRoute[]>(this.apiUrl);
  }

  // 🔍 nach ID
  getById(id: string): Observable<EventRoute> {
    return this.http.get<EventRoute>(`${this.apiUrl}/${id}`);
  }

  // 🔍 nach Event
  getByEvent(eventId: string): Observable<EventRoute[]> {
    return this.http.get<EventRoute[]>(`${this.apiUrl}/event/${eventId}`);
  }

  // ➕ erstellen
  create(data: EventRoute): Observable<EventRoute> {
    return this.http.post<EventRoute>(this.apiUrl, data);
  }

  // ✏️ update
  update(id: string, data: EventRoute): Observable<EventRoute> {
    return this.http.put<EventRoute>(`${this.apiUrl}/${id}`, data);
  }

  // ❌ delete
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
