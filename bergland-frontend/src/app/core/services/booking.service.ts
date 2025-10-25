import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api.service';

// ============================================================
// 🧾 Booking Interface
// ============================================================
export interface BookingInterface {
  id?: string;
  event_registration_id?: string;
  event_id?: string;
  user_id?: string;
  accommodation_id?: string;
  single_beds?: number;
  double_beds?: number;
  multi_beds?: number;
  createdAt?: string;
  updatedAt?: string;

  // ➕ Relationen
  accommodation?: {
    id?: string;
    name?: string;
    city?: string;
    street?: string;
    postal_code?: string;
    country?: string;
  };

  eventRegistration?: {
    id?: string;
    event_id?: string;
    registered_by_person_id?: string;
    event?: {
      id?: string;
      name?: string;
      start_date?: string;
      end_date?: string;
    };
  };

  user?: {
    id?: string;
    email?: string;
    person?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

// ============================================================
// 💼 Booking Service
// ============================================================
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private endpoint = 'bookings';

  constructor(private api: ApiService) {}

  // ============================================================
  // 📋 Alle Buchungen (Admin oder Debug)
  // ============================================================
  getAll(): Observable<BookingInterface[]> {
    return this.api.get(this.endpoint);
  }

  // ============================================================
  // 🔍 Einzelne Buchung per ID
  // ============================================================
  getById(id: string): Observable<BookingInterface> {
    return this.api.getById(this.endpoint, id);
  }

  // ============================================================
  // ➕ Neue Buchung anlegen
  // ============================================================
  create(data: BookingInterface): Observable<BookingInterface> {
    const payload = {
      event_registration_id: data.event_registration_id,
      accommodation_id: data.accommodation_id,
      single_beds: data.single_beds ?? 0,
      double_beds: data.double_beds ?? 0,
      multi_beds: data.multi_beds ?? 0,
    };
    return this.api.post(this.endpoint, payload);
  }

  // ============================================================
  // ✏️ Buchung aktualisieren
  // ============================================================
  update(id: string, data: Partial<BookingInterface>): Observable<BookingInterface> {
    const payload = {
      single_beds: data.single_beds ?? 0,
      double_beds: data.double_beds ?? 0,
      multi_beds: data.multi_beds ?? 0,
    };
    return this.api.put(this.endpoint, id, payload);
  }

  // ============================================================
  // ❌ Buchung löschen
  // ============================================================
  delete(id: string): Observable<{ message: string }> {
    return this.api.delete(this.endpoint, id);
  }

  // ============================================================
  // 🔍 Buchung zu einer EventRegistration laden
  // ============================================================
  getByRegistration(registrationId: string): Observable<BookingInterface | null> {
    if (!registrationId) return of(null);
    return this.api.get(`${this.endpoint}/by-registration/${registrationId}`);
  }

  getAllByRegistration(registrationId: string): Observable<BookingInterface[]> {
    return this.api.get(`${this.endpoint}/by-registration/${registrationId}/all`);
  }

    // ============================================================
  // 👤 Alle Buchungen eines Benutzers (über alle Events)
  // ============================================================
  getByUser(userId: string): Observable<BookingInterface[]> {
    return this.api.get(`${this.endpoint}/by-user/${userId}`);
  }

  
}
