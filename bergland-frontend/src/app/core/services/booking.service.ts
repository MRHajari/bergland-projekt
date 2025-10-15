import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api.service';

export interface BookingInterface {
  id?: string;
  event_id: string;
  person_id: string;
  accommodation_id: string;
  single_beds?: number;
  double_beds?: number;
  multi_beds?: number;
  createdAt?: string;
  updatedAt?: string;
  event?: { id: string; name: string };
  accommodation?: { id: string; name: string };
}


@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private endpoint = 'bookings';

  constructor(private api: ApiService) {}

  getAll(): Observable<BookingInterface[]> {
    return this.api.get(this.endpoint);
  }
  
  getById(id: string): Observable<BookingInterface> {
    return this.api.getById(this.endpoint, id);
  }
  
  create(data: BookingInterface): Observable<BookingInterface> {
    return this.api.post(this.endpoint, data);
  }
  
  update(id: string, data: Partial<BookingInterface>): Observable<BookingInterface> {
    return this.api.put(this.endpoint, id, data);
  }
  
  delete(id: string): Observable<{ message: string }> {
    return this.api.delete(this.endpoint, id);
  }
  
  getByUser(userId: string | null): Observable<BookingInterface[]> {
    if (!userId) return of([]);
    return this.api.get(`${this.endpoint}/user/${userId}`);
  }
  
  getByEvent(eventId: string): Observable<BookingInterface[]> {
    return this.api.get(`${this.endpoint}?event_id=${eventId}`);
  }
}
