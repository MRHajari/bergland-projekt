// ============================================================
// ✅ AuthService – mit Login, Register, Verify, Refresh, Logout
// ============================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // ============================================================
  // 🔹 Registrierung
  // ============================================================
  register(userData: {
    first_name: string;
    last_name: string;
    birth_date: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError((err) => {
        console.error('❌ Registrierung fehlgeschlagen:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Login
  // ============================================================
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      }),
      catchError((err) => {
        console.error('❌ Login fehlgeschlagen:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Token Refresh
  // ============================================================
  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/refresh-token`, { token }).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      }),
      catchError((err) => {
        console.error('❌ Token-Aktualisierung fehlgeschlagen:', err);
        this.logout(); // ⛔ automatisch ausloggen
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Logout
  // ============================================================
  logout(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    const obs = this.http.post(`${this.apiUrl}/logout`, { token }).pipe(
      catchError((err) => {
        console.warn('⚠️ Logout-Fehler:', err);
        return throwError(() => err);
      })
    );

    // Token sofort entfernen, unabhängig vom Ergebnis
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    return obs;
  }

  // ============================================================
  // 🔹 E-Mail-Verifikation
  // ============================================================
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${token}`).pipe(
      catchError((err) => {
        console.error('❌ Fehler bei E-Mail-Verifikation:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Hilfsmethoden
  // ============================================================
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
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
}
