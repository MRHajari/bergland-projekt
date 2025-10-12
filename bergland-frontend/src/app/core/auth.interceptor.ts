// frontend/src/app/core/services/auth.interceptor.ts
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

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const accessToken = authService.getAccessToken();

  let authReq = req;
  if (accessToken) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              const newAccess = res.accessToken;
              if (newAccess) {
                localStorage.setItem('accessToken', newAccess);
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newAccess}` },
                });
                return next(newReq);
              }
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            }),
            catchError(() => {
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
