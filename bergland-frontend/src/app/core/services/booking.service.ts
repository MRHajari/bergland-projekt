import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api.service';

// ============================================================
// 🧾 Booking Interface
// ============================================================
export interface BookingInterface {
  id?: string;
  event_registration_id: string;     // 🔗 Pflichtfeld
  accommodation_id: string;
  user_id?: string;                  // ⚙️ Backend setzt automatisch
  event_id?: string;                 // ⚙️ Backend setzt automatisch

  single_beds?: number;
  double_beds?: number;
  multi_beds?: number;

  createdAt?: string;
  updatedAt?: string;

  accommodation?: { id: string; name: string; city?: string };
  eventRegistration?: { id: string; event_id?: string };
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
}
