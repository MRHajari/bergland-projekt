import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import{ AuthService } from '../auth.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BelegungService {
  private endpoint = 'belegung';
  private baseUrl = `${environment.apiUrl}/${this.endpoint}`;

  private authService = inject(AuthService);

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  getAll(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint);
  }

  getByEvent(eventId: string): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/event/${eventId}`);
  }

  getCountByEvent(): Observable<Record<string, number>> {
    return this.api.get<Record<string, number>>(`${this.endpoint}/stats/count-by-event`);
  }

  createBelegung(id_event: string): Observable<any> {
    const id_person = this.authService.getUserId();;
    return this.api.post(this.endpoint, { id_event, id_person });
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }

  getByUserAndEvent(userId: string, eventId: string): Observable<any> {
    return this.api.get(`${this.endpoint}/user/${userId}/event/${eventId}`);
  }

  // 🔹 Diese Methode musste angepasst werden:
  deleteByUserAndEvent(userId: string, eventId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/${userId}/event/${eventId}`);
  }
}
