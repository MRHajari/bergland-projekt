import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Backend-URL

  constructor(private http: HttpClient) {}

  // Register new user
  register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Login user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);
        }
        if (res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken);
        }
      }),
      catchError((err) => {
        console.error('Login failed', err);
        return throwError(() => err);
      })
    );
  }

  // Refresh access token
 // Refresh access token
refreshToken(): Observable<any> {
  const token = localStorage.getItem('refreshToken');
  return this.http.post(`${this.apiUrl}/refresh`, { token }).pipe(
    tap((res: any) => {
      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
      }
      if (res.refreshToken) {
        // 🔥 WICHTIG: neuen Refresh-Token auch speichern
        localStorage.setItem('refreshToken', res.refreshToken);
      }
    })
  );
}


  // Logout user
  logout(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return this.http.post(`${this.apiUrl}/logout`, { token });
  }

  // Helper methods
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }


  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
  
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const isExpired = (payload.exp || 0) * 1000 < Date.now();
      return !isExpired;
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
    } catch (error) {
      console.error('Fehler beim Token-Dekodieren:', error);
      return null;
    }
  }
  
  
  getUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
  
    try {
      const payload = jwtDecode<{ user?: { id?: number } }>(token);
      return payload.user?.id || null;
    } catch {
      return null;
    }
  }
  
  
}
