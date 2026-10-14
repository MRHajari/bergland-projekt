import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Route {
  id: string;
  event_id: string;
  name: string;
  start_point?: string;
  end_point?: string;
  length_km?: number;
  elevation_m?: number;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) {}

  // 📋 Alle Strecken
  getAll(): Observable<Route[]> {
    return this.http.get<Route[]>(this.apiUrl);
  }

  // 🔍 Strecke per ID
  getById(id: string): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`);
  }

  // 📋 Strecken eines Events
  getByEvent(eventId: string): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/event/${eventId}`);
  }
  
  // ➕ Erstellen
  create(data: Route): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, data);
  }

  // ✏️ Aktualisieren
  update(id: string, data: Route): Observable<Route> {
    return this.http.put<Route>(`${this.apiUrl}/${id}`, data);
  }

  // ❌ Löschen
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
