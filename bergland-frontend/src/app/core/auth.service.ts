// frontend/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, timer, Subscription } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private refreshSub?: Subscription;

  constructor(private http: HttpClient) {}

  // ============================================================
  // 🔹 Login
  // ============================================================
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        this.scheduleTokenRefresh(res.accessToken);
      }),
      catchError(err => {
        console.error('❌ Login fehlgeschlagen:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Token automatisch erneuern
  // ============================================================
  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/refresh-token`, { token }).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        this.scheduleTokenRefresh(res.accessToken);
        console.log('🔁 Token erfolgreich aktualisiert');
      }),
      catchError(err => {
        console.error('❌ Token-Aktualisierung fehlgeschlagen:', err);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Automatische Erneuerung planen
  // ============================================================
  private scheduleTokenRefresh(accessToken: string) {
    if (this.refreshSub) this.refreshSub.unsubscribe();

    try {
      const payload = jwtDecode<JwtPayload>(accessToken);
      const exp = (payload.exp || 0) * 1000;
      const delay = exp - Date.now() - 60_000; // 1 min vorher erneuern
      if (delay > 0) {
        this.refreshSub = timer(delay).subscribe(() => this.refreshToken().subscribe());
        console.log(`⏰ Auto-Refresh geplant in ${Math.round(delay / 1000)}s`);
      }
    } catch (err) {
      console.warn('⚠️ Konnte Token-Ablauf nicht planen:', err);
    }
  }

  // ============================================================
  // 🔹 Logout
  // ============================================================
  logout(): void {
    const token = localStorage.getItem('refreshToken');
    this.http.post(`${this.apiUrl}/logout`, { token }).subscribe(() => {
      console.log('👋 Abgemeldet');
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (this.refreshSub) this.refreshSub.unsubscribe();
    window.location.href = '/login';
  }

  // ============================================================
  // 🔹 Hilfsfunktionen
  // ============================================================
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return (payload.exp || 0) * 1000 > Date.now();
    } catch {
      return false;
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
