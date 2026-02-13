import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Route {
  id: string;
  name: string;
  distance_km: number;
  difficulty?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private apiUrl = 'http://localhost:3000/api/routes';

  constructor(private http: HttpClient) {}

  // 📋 Alle Strecken
  getAll(): Observable<Route[]> {
    return this.http.get<Route[]>(this.apiUrl);
  }

  // 🔍 Strecke per ID
  getById(id: string): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`);
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
