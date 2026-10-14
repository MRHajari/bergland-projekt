import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const apiUrl = new URL(environment.apiUrl, location.origin);
  const requestUrl = new URL(req.url, location.origin);
  const apiPath = apiUrl.pathname.replace(/\/$/, '');
  if (requestUrl.origin !== apiUrl.origin ||
      (requestUrl.pathname !== apiPath && !requestUrl.pathname.startsWith(`${apiPath}/`))) {
    return next(req);
  }

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
      if (!isAuthenticationError(error)) {
        return throwError(() => error);
      }

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        // Kein Refresh vorhanden -> harte Abmeldung
        hardLogout(authService, router);
        return throwError(() => error);
      }

      return authService.refreshSession().pipe(
        catchError((refreshError) => {
          hardLogout(authService, router);
          return throwError(() => refreshError);
        }),
        switchMap((session) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${session.accessToken}` } }))
        )
      );
    })
  );
};

function hardLogout(authService: AuthService, router: Router) {
  try {
    authService.handleSessionExpired(router.url);
  } catch {}
}

function isAuthenticationError(error: HttpErrorResponse): boolean {
  if (error.status === 401) return true;
  if (error.status !== 403) return false;

  const message =
    error.error?.message ||
    error.error?.error ||
    error.message ||
    '';

  const normalized = String(message).toLowerCase();
  return (
    normalized.includes('token') &&
    (
      normalized.includes('abgelaufen') ||
      normalized.includes('ungültig') ||
      normalized.includes('invalid') ||
      normalized.includes('expired')
    )
  );
}
