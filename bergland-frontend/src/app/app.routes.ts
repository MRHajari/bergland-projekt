import { Routes } from '@angular/router';

// 🔹 Auth-Bereich
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { VerifyEmail } from './features/auth/verify-email/verify-email';


// 🔹 Benutzer-Bereich
import { Events } from './features/events/events';
import { Booking } from './features/booking/booking';
import { Profile } from './features/profile/profile/profile';
import { Overview } from './features/profile/overview/overview';
import { Products } from './features/products/products';
import { EventDetail } from './features/events/event-detail/event-detail';

// 🔹 Admin-Bereich
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { ProductsAdmin } from './features/admin/products-admin/products-admin';
import { EventsAdmin } from './features/admin/events-admin/events-admin';
import { UsersAdmin } from './features/admin/users-admin/users-admin';
import { AccommodationsAdmin } from './features/admin/accommodations-admin/accommodations-admin';
import { EventAnmeldungenAdmin } from './features/admin/events-admin/event-anmeldungen-admin/event-anmeldungen-admin';


// 🔹 Layouts
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

// 🔹 Guards
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard'; // ⬅️ Diesen Guard brauchst du für Admin-Bereich

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
      { path: 'verify/:token', component: VerifyEmail }, // 🆕
    ],
  },

  // 🔸 Haupt-Layout (Benutzer + Admin)
  {
    path: '',
    component: MainLayout,
    children: [
      // 👤 Benutzerbereich
      { path: 'events', component: Events },
      { path: 'event-detail/:id', component: EventDetail },
      { path: 'products', component: Products },
      { path: 'booking', component: Booking, canActivate: [authGuard] },
      { path: 'profile', component: Profile, canActivate: [authGuard] },
      { path: 'overview', component: Overview, canActivate: [authGuard] },

  
      // ⚙️ Adminbereich
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', component: AdminDashboard },
          { path: 'products', component: ProductsAdmin },
          { path: 'events', component: EventsAdmin },
          { path: 'events/:id/teilnehmer', component: EventAnmeldungenAdmin }, // ✅ richtig!
          { path: 'users', component: UsersAdmin },
          { path: 'accommodations', component: AccommodationsAdmin },
        ],
      },
      
    ],
  },

  // 🔸 Fallback (unbekannte Route)
  { path: '**', redirectTo: 'login' },
];
