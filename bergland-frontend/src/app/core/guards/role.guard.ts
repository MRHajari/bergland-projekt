import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isLoggedIn = authService.isLoggedIn();
    const role = authService.getUserRole();

    // 🔒 nicht eingeloggt
    if (!isLoggedIn) {
      router.navigate(['/login']);
      return false;
    }

    // 🚫 falsche Rolle
    if (!role || !allowedRoles.includes(role)) {
        router.navigate(['/']);
        return false;
      }
      

    // ✅ Zugriff erlaubt
    return true;
  };
};
