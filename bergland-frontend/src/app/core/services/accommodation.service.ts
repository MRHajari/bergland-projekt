import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface AccommodationInterface {
  id?: string;
  name: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  single_rooms: number;
  double_rooms: number;
  multi_bed_rooms: number;
  total_beds?: number;
  description?: string;
  event_id?: string;
  createdAt?: string;
  updatedAt?: string;
    // 🧩 neue Zeile:
    occupancies?: {
      id: string;
      event_id: string;
      single_beds_total?: number;
      double_beds_total?: number;
      multi_beds_total?: number;
      event?: {
        id: string;
        name: string;
        start_date?: string;
        end_date?: string;
      };
    }[];
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
