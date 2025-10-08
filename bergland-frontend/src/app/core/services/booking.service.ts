import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private endpoint = 'bookings';

  constructor(private api: ApiService) {}

  getAll(): Observable<any[]> {
    return this.api.get(this.endpoint);
  }

  getById(id: string): Observable<any> {
    return this.api.getById(this.endpoint, id);
  }

  create(data: any): Observable<any> {
    return this.api.post(this.endpoint, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(this.endpoint, id, data);
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }

  // 🧩 NEU: Alle Buchungen eines bestimmten Benutzers
  getByUser(userId: string | null): Observable<any[]> {
    if (!userId) return of([]); // Keine userId → leeres Array zurückgeben
    return this.api.get(`${this.endpoint}/user/${userId}`);
  }
}
