import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getUserRole();
  const isAdmin = role === 'admin';
  const isLoggedIn = authService.isLoggedIn();


  if (isLoggedIn && role === 'admin') {
    return true;
  }

  if (!isAdmin) {
    router.navigate(['/']); // zurück zur Startseite
    return false;
  }

  return true;
};
