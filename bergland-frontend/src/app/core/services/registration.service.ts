// frontend/src/app/core/services/registration.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private endpoint = 'registrations'; // ruft /api/registrations auf (Event-Anmeldung)

  constructor(private api: ApiService) {}

  getAll(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint);
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

  // 🔹 Alle Registrierungen zu einem bestimmten Event
  getByEvent(eventId: string): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/by-event/${eventId}`);
  }

  // 🔹 Anzahl der Anmeldungen pro Event
  getCountByEvent(): Observable<Record<string, number>> {
    return this.api.get<Record<string, number>>(`${this.endpoint}/count-by-event`);
  }
}
