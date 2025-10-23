import { Routes } from '@angular/router';

// 🔹 Auth-Bereich
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { VerifyEmail } from './features/auth/verify-email/verify-email';

// 🔹 Benutzer-Bereich
import { Events } from './features/events/events';
import { EventRegistration } from './features/events/event-registration/event-registration';
import { BookingAccommodation } from './features/booking/booking-accommodation';
import { Profile } from './features/profile/profile/profile';
import { Products } from './features/products/products';
import { AccommodationsList } from './features/accommodations/accommodations-list/accommodations-list';
import { AccommodationDetail } from './features/accommodations/accommodation-detail/accommodation-detail';
import { MyRegistrations } from './features/my-registrations/my-registrations';

// 🔹 Admin-Bereich
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { ProductsAdmin } from './features/admin/products-admin/products-admin';
import { EventsAdmin } from './features/admin/events-admin/events-admin';
import { UsersAdmin } from './features/admin/users-admin/users-admin';
import { AccommodationsAdmin } from './features/admin/accommodations-admin/accommodations-admin';

// 🔹 Layouts
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

// 🔹 Guards
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // 🔸 Standardweiterleitung
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔸 Auth-Seiten (Login & Register)
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'verify/:token', component: VerifyEmail },
    ],
  },

  // 🔸 Haupt-Layout (Benutzer + Admin)
  {
    path: '',
    component: MainLayout,
    children: [
      // 👤 Benutzerbereich
      { path: 'events', component: Events },
      { path: 'event-registration/:id', component: EventRegistration },
      { path: 'products', component: Products },
      { path: 'booking-accommodation', component: BookingAccommodation, canActivate: [authGuard] },
      { path: 'profile', component: Profile, canActivate: [authGuard] },

      // 🧾 Meine Anmeldungen
      { path: 'my-registrations', component: MyRegistrations, canActivate: [authGuard] },

      // 🏨 Unterkünfte (Benutzer)
      { path: 'accommodations', component: AccommodationsList, canActivate: [authGuard] },
      { path: 'accommodations/:id', component: AccommodationDetail, canActivate: [authGuard] },

      // ⚙️ Adminbereich
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', component: AdminDashboard },
          { path: 'products', component: ProductsAdmin },
          { path: 'events', component: EventsAdmin },
          { path: 'events/:id/registrations', loadComponent: () => import('./features/admin/events-admin/event-registrations-admin/event-registrations-admin.js').then(m => m.EventRegistrationsAdmin) },
          { path: 'users', component: UsersAdmin },
          { path: 'accommodations', component: AccommodationsAdmin },
        ],
      },
    ],
  },

  // 🔸 Fallback (unbekannte Route)
  { path: '**', redirectTo: 'login' },
];
