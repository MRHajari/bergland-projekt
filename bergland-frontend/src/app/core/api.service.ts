// frontend/src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ------------------------------------------------------------
  // 🔹 Hilfsfunktion: Header mit Token erzeugen
  // ------------------------------------------------------------
  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getAccessToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ------------------------------------------------------------
  // 🔹 Allgemeine Fehlerbehandlung
  // ------------------------------------------------------------
  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.warn('⚠️ 401 – Token abgelaufen oder ungültig. Benutzer wird ausgeloggt.');
      this.auth.logout(); // optional: direkt Logout
    } else {
      console.error('❌ API-Fehler:', error);
    }
    return throwError(() => error);
  }

  // ------------------------------------------------------------
  // 🔹 CRUD-Methoden mit Auth-Header
  // ------------------------------------------------------------
  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getById<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  put<T>(endpoint: string, id: number | string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}/${id}`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** ✅ Flexiblere PUT-Variante ohne automatisches "/:id" */
  putCustom<T>(url: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${url}`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  delete<T>(endpoint: string, id: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }
}
