// frontend/src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  const role = authService.getUserRole();

  // 🔒 Wenn nicht eingeloggt → auf Loginseite
  if (!isLoggedIn) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 🚫 Wenn kein Admin → zur Startseite oder Events
  if (role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  // ✅ Zugriff erlaubt
  return true;
};
