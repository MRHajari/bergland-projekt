// ============================================================
// ✅ AuthService – mit Login, Register, Verify, Refresh, Logout
// ============================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  person_id?: string | null;
  first_name?: string;
  last_name?: string;
}

@Injectable({
  providedIn: 'root',
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
  // 🔹 Login (inkl. Speicherung des Benutzers)
  // ============================================================
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);

        // 🧠 Benutzerobjekt (mit person_id!) speichern
        if (res.user) localStorage.setItem('currentUser', JSON.stringify(res.user));
      }),
      catchError((err) => {
        console.error('❌ Login fehlgeschlagen:', err);
        return throwError(() => err);
      })
    );
  }

  // ============================================================
  // 🔹 Token Refresh (auch hier currentUser aktualisieren)
  // ============================================================
  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/refresh-token`, { token });
  }


  // ============================================================
  // 🔹 Logout
  // ============================================================
  logout(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
  
    // ✅ Lokal sofort löschen (stabil)
    this.clearSessionLocal();
  
    // ✅ Backend optional informieren
    if (!token) {
      return this.http.post(`${this.apiUrl}/logout`, { token: null });
    }
  
    return this.http.post(`${this.apiUrl}/logout`, { token }).pipe(
      catchError((err) => {
        // Backend-Fehler egal – lokal sind wir schon raus
        console.warn('⚠️ Logout-Fehler:', err);
        return throwError(() => err);
      })
    );
  }
  
  

  private clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
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

  getCurrentUser(): AuthUser | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  getUserId(): string | null {
    return this.getCurrentUser()?.id || null;
  }

  getPersonId(): string | null {
    return this.getCurrentUser()?.person_id || null;
  }

  getUserRole(): string | null {
    return this.getCurrentUser()?.role || null;
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

clearSessionLocal() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
}


}
