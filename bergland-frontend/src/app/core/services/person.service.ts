// frontend/src/app/core/services/person.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../api.service';

export interface Person {
  id?: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly endpoint = 'persons'; // → /api/persons im Backend

  constructor(private api: ApiService) {}

  // 🔹 Alle Personen abrufen
  getAll(): Observable<Person[]> {
    return this.api.get<Person[]>(this.endpoint).pipe(
      catchError(err => {
        console.error('❌ Fehler beim Laden der Personen:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Person nach ID abrufen
  getById(id: string): Observable<Person> {
    return this.api.getById<Person>(this.endpoint, id).pipe(
      catchError(err => {
        console.error(`❌ Fehler beim Laden der Person mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Neue Person anlegen
  create(data: Person): Observable<Person> {
    return this.api.post<Person>(this.endpoint, data).pipe(
      catchError(err => {
        console.error('❌ Fehler beim Erstellen der Person:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Person aktualisieren
  update(id: string, data: Partial<Person>): Observable<Person> {
    return this.api.put<Person>(this.endpoint, id, data).pipe(
      catchError(err => {
        console.error(`❌ Fehler beim Aktualisieren der Person mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Person löschen
  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id).pipe(
      catchError(err => {
        console.error(`❌ Fehler beim Löschen der Person mit ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
