import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface AccommodationInterface {
  id?: string;
  name: string;
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  description?: string;

  // ==========================================================
  // 🛏️ Zimmeranzahl (Stammdaten aus Unterkunft)
  // ==========================================================
  single_rooms?: number;
  double_rooms?: number;
  quad_rooms?: number;   // 4-Bett-Zimmer
  quint_rooms?: number;  // 5-Bett-Zimmer
  sext_rooms?: number;   // 6-Bett-Zimmer

  total_beds?: number;

  // ==========================================================
  // 📊 Verfügbare Betten (vom Backend berechnet – aus Occupancy)
  // ==========================================================
  single_beds_total?: number;
  double_beds_total?: number;

  // ⚠️ Legacy
  multi_beds_total?: number;

  // ✅ NEU
  quad_beds_total?: number;
  quint_beds_total?: number;
  sext_beds_total?: number;

  available_single?: number;
  available_double?: number;

  // ⚠️ Legacy
  available_multi?: number;

  // ✅ NEU
  available_quad?: number;
  available_quint?: number;
  available_sext?: number;

  // ==========================================================
  // 🔗 Referenzen (Event & Occupancy)
  // ==========================================================
  occupancy_id?: string;
  event_id?: string;

  // ==========================================================
  // 🧾 Historische Belegungen
  // ==========================================================
  occupancies?: {
    id?: string;
    event_id?: string;
    used_beds?: number;

    // ⚠️ Legacy
    used_multi_beds?: number;

    // ✅ NEU
    used_quad_beds?: number;
    used_quint_beds?: number;
    used_sext_beds?: number;

    event?: {
      id?: string;
      name?: string;
      start_date?: string;
      end_date?: string;
    };
  }[];

  // ==========================================================
  // 🧍 Frontend-Only-Felder (nicht an Backend senden!)
  // ==========================================================
  request_single?: number;
  request_double?: number;

  // ⚠️ Legacy
  request_multi?: number;

  // ✅ NEU
  request_quad?: number;
  request_quint?: number;
  request_sext?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccommodationService {
  private endpoint = 'accommodations';

  constructor(private api: ApiService) {}

  getAll(): Observable<AccommodationInterface[]> {
    return this.api.get(this.endpoint);
  }

  getById(id: string): Observable<AccommodationInterface> {
    return this.api.getById(this.endpoint, id);
  }

  create(data: any): Observable<AccommodationInterface> {
    return this.api.post(this.endpoint, data);
  }

  update(id: string, data: any): Observable<AccommodationInterface> {
    return this.api.put(this.endpoint, id, data);
  }

  delete(id: string): Observable<AccommodationInterface> {
    return this.api.delete(this.endpoint, id);
  }

  // 🔹 Unterkünfte eines bestimmten Events laden
  getByEvent(eventId: string): Observable<AccommodationInterface[]> {
    return this.api.get<AccommodationInterface[]>(
      `occupancies/events/${eventId}/accommodations`
    );
  }
}
