import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api.service';

// ============================================================
// 🧾 Booking Interface
// ============================================================
export interface BookingInterface {
  id?: string;
  user_id: string;                 // ✅ geändert von person_id → user_id
  event_id: string;
  accommodation_id: string;
  single_beds?: number;
  double_beds?: number;
  multi_beds?: number;
  createdAt?: string;
  updatedAt?: string;
  event?: { id: string; name: string; start_date?: string; end_date?: string };
  accommodation?: { id: string; name: string; city?: string };
}

// ============================================================
// 💼 Booking Service
// ============================================================
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private endpoint = 'bookings';

  constructor(private api: ApiService) {}

  // 📋 Alle Buchungen (Admin)
  getAll(): Observable<BookingInterface[]> {
    return this.api.get(this.endpoint);
  }

  // 🔍 Buchung per ID
  getById(id: string): Observable<BookingInterface> {
    return this.api.getById(this.endpoint, id);
  }

  // ➕ Neue Buchung anlegen
  create(data: BookingInterface): Observable<BookingInterface> {
    return this.api.post(this.endpoint, data);
  }

  // ✏️ Buchung aktualisieren
  update(id: string, data: Partial<BookingInterface>): Observable<BookingInterface> {
    return this.api.put(this.endpoint, id, data);
  }

  // ❌ Buchung löschen
  delete(id: string): Observable<{ message: string }> {
    return this.api.delete(this.endpoint, id);
  }

  // 👤 Alle Buchungen eines bestimmten Users
  getByUser(userId: string | null): Observable<BookingInterface[]> {
    if (!userId) return of([]);
    return this.api.get(`${this.endpoint}/user/${userId}`);
  }

  // 📅 Buchungen eines bestimmten Events (Admin)
  getByEvent(eventId: string): Observable<BookingInterface[]> {
    return this.api.get(`${this.endpoint}/event/${eventId}`);
  }
}
