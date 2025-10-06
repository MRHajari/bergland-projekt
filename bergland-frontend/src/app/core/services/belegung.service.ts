// belegung.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class BelegungService {
  private apiUrl = 'http://localhost:3000/api/belegung';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createBelegung(eventId: string): Observable<any> {
    const userId = this.authService.getUserId(); // <- Stelle sicher, dass das implementiert ist
    return this.http.post(`${this.apiUrl}`, {
      id_event: eventId,
      id_person: userId
    });
  }
}
