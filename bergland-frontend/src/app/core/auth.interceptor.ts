import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';

// ✅ Globaler Refresh-Lock (wichtig bei parallelen Requests)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Diese Requests NIE abfangen (sonst Endlosschleifen / doppelte Logins)
  const isAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/refresh-token') ||
    req.url.includes('/api/auth/logout') ||
    req.url.includes('/api/auth/verify');

  if (isAuthEndpoint) {
    return next(req);
  }

  // ✅ Access Token anhängen
  const accessToken = authService.getAccessToken();
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nur 401 interessiert uns hier
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Kein Refresh vorhanden -> harte Abmeldung
        hardLogout(authService, router);
        return throwError(() => error);
      }

      // ✅ Wenn gerade kein Refresh läuft -> starte genau EINEN
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            const newAccess = res?.accessToken;

            // Wenn Backend keinen Token liefert -> raus
            if (!newAccess) {
              isRefreshing = false;
              hardLogout(authService, router);
              return throwError(() => error);
            }

            // ✅ Token speichern + wartende Requests freigeben
            localStorage.setItem('accessToken', newAccess);
            if (res?.refreshToken) {
              localStorage.setItem('refreshToken', res.refreshToken);
            }
            if (res?.user) {
              localStorage.setItem('currentUser', JSON.stringify(res.user));
            }

            isRefreshing = false;
            refreshTokenSubject.next(newAccess);

            // ✅ originalen Request wiederholen
            return next(
              req.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } })
            );
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            hardLogout(authService, router);
            return throwError(() => refreshErr);
          })
        );
      }

      // ✅ Wenn bereits Refresh läuft -> warte bis neuer Token da ist
      return refreshTokenSubject.pipe(
        filter((t) => t != null),
        take(1),
        switchMap((t) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${t!}` } }))
        )
      );
    })
  );
};

function hardLogout(authService: AuthService, router: Router) {
  // Backend-Logout ist nice-to-have. Stabilität ist wichtiger.
  // -> Lokal sofort aufräumen und navigieren.
  try {
    authService.clearSessionLocal();
  } catch {}

  router.navigate(['/login']);
}
