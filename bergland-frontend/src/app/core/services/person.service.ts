import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, map } from 'rxjs';
import { ApiService } from '../api.service';

export interface Person {
  id?: string;

  // 🧑‍💼 Basisdaten
  first_name: string;
  last_name: string;
  birth_date?: string;
  
  gender?: 'm' | 'w' | 'd';

  // 📧 Kontakt
  email?: string;
  phone?: string;

  // 🏠 Adresse
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;

  // 👤 Beziehung zum User
  owner_id?: string | null;

  // 📅 Systemdaten
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private readonly endpoint = 'persons'; // → /api/persons im Backend

  constructor(private api: ApiService) {}

  // 🔹 Alle Personen abrufen (optional gefiltert nach owner_id)
  getAll(ownerId?: string): Observable<Person[]> {
    const query = ownerId ? `?owner_id=${ownerId}` : '';
    return this.api.get<Person[]>(`${this.endpoint}${query}`).pipe(
      map(persons => persons.sort((a, b) => a.last_name.localeCompare(b.last_name))),
      catchError(err => {
        console.error('❌ Fehler beim Laden der Personen:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔹 Eine Person nach ID abrufen
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

  // 🔍 Suche nach Name oder Email (clientseitig)
  search(persons: Person[], term: string): Person[] {
    const lower = term.toLowerCase();
    return persons.filter(
      p =>
        p.first_name?.toLowerCase().includes(lower) ||
        p.last_name?.toLowerCase().includes(lower) ||
        p.email?.toLowerCase().includes(lower) ||
        p.city?.toLowerCase().includes(lower)
    );
  }

  // 🧩 Hilfsfunktion: Vollständige Adresse anzeigen
  formatAddress(person: Person): string {
    const parts = [person.street, person.postal_code, person.city, person.country].filter(Boolean);
    return parts.join(', ');
  }
}
