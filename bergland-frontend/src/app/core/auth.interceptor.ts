import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Access Token holen
  const accessToken = authService.getAccessToken();

  // Falls ein Token existiert, hänge ihn an die Anfrage
  let authReq = req;
  if (accessToken) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  // Anfrage weiterleiten und auf Fehler reagieren
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Falls 401 → versuchen, Refresh Token zu holen
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              const newAccessToken = res.accessToken;
              if (newAccessToken) {
                // neuen Token speichern
                localStorage.setItem('accessToken', newAccessToken);

                // Anfrage mit neuem Token wiederholen
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newAccessToken}` }
                });
                return next(newReq);
              }
              // Wenn kein neuer Token → Logout
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            }),
            catchError(() => {
              // Refresh fehlgeschlagen → Logout
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          // Kein Refresh Token → Logout
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
