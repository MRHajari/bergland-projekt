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

  // ============================================================
  // 🔹 Header mit Auth-Token
  // ============================================================
  private getAuthHeaders(extraHeaders: Record<string, string> = {}): HttpHeaders {
    const token = this.auth.getAccessToken();
    const headersObj: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };

    if (token) {
      headersObj['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersObj);
  }

  // ============================================================
  // 🔹 Einheitliche Fehlerbehandlung
  // ============================================================
  private handleError(error: HttpErrorResponse) {
    // ✅ 404 = Kein echter Fehler (z. B. keine Buchung vorhanden)
    if (error.status === 404) {
      console.info('ℹ️ 404 – Ressource nicht gefunden (kein Problem).');
      // gib einfach null zurück, statt Fehler zu werfen
      return throwError(() => ({ status: 404, silent: true }));
    }
  
    const msg =
      error.error?.message ||
      error.message ||
      'Unbekannter Serverfehler. Bitte später erneut versuchen.';
  
    console.error('❌ API-Fehler:', msg, error);
  
    // ⚠️ Auth-Token prüfen
    if (error.status === 401) {
      console.warn('⚠️ 401 – Ungültiger oder abgelaufener Token. Benutzer wird ausgeloggt.');
      this.auth.logout();
    }
  
    return throwError(() => new Error(msg));
  }
  

  // ============================================================
  // 🔹 CRUD-Methoden mit Auth-Header
  // ============================================================

  /** 🔹 GET: Liste oder benutzerdefinierte URL */
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.getAuthHeaders(),
        params
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 GET by ID */
  getById<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}/${id}`, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 POST */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, data, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 PUT by ID */
  put<T>(endpoint: string, id: string | number, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}/${id}`, data, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 PUT custom (wenn kein /:id) */
  putCustom<T>(url: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${url}`, data, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 PATCH (für Teilupdates) */
  patch<T>(endpoint: string, id: string | number, data: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}/${id}`, data, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 DELETE */
  delete<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}/${id}`, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔹 DELETE Custom (z. B. mit Queryparametern oder anderem Pfad) */
  deleteCustom<T>(url: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${url}`, {
        headers: this.getAuthHeaders()
      })
      .pipe(catchError(this.handleError.bind(this)));
  }


  
}
