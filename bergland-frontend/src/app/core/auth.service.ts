// frontend/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // ✅ Backend-Basis-URL

  constructor(private http: HttpClient) {}

  // 🔹 Benutzer registrieren
  register(userData: {
    first_name: string;
    last_name: string;
    birth_date: string;
    email: string;
    password: string;
    role?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // 🔹 Login
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      }),
      catchError((err) => {
        console.error('Login fehlgeschlagen:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Refresh-Token
  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/refresh`, { token }).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      }),
      catchError((err) => {
        console.error('Token-Aktualisierung fehlgeschlagen:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Logout
  logout(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return this.http.post(`${this.apiUrl}/logout`, { token });
  }

  // ------------------------------------------------------------
  // 🔹 Hilfsmethoden
  // ------------------------------------------------------------
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      return !((payload.exp || 0) * 1000 < Date.now());
    } catch {
      return false;
    }
  }

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = jwtDecode<{ user?: { role?: string } }>(token);
      return payload.user?.role || null;
    } catch {
      return null;
    }
  }

  getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = jwtDecode<{ user?: { id?: string } }>(token);
      return payload.user?.id || null;
    } catch {
      return null;
    }
  }
}
