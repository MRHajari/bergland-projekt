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
  multi_bed_rooms?: number;
  total_beds?: number;

  // ==========================================================
  // 📊 Verfügbare Betten (vom Backend berechnet – aus Occupancy)
  // ==========================================================
  single_beds_total?: number;
  double_beds_total?: number;
  multi_beds_total?: number;

  available_single?: number;
  available_double?: number;
  available_multi?: number;

  // ==========================================================
  // 🔗 Referenzen (Event & Occupancy)
  // ==========================================================
  occupancy_id?: string;
  event_id?: string;

  // ==========================================================
  // 🧾 Historische Belegungen (falls du später Übersicht brauchst)
  // ==========================================================
  occupancies?: {
    id?: string;
    event_id?: string;
    used_beds?: number;
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
  request_multi?: number;
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
    return this.api.get<AccommodationInterface[]>(`occupancies/events/${eventId}/accommodations`);
  }  
  
}
