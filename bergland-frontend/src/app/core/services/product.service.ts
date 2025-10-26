import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../api.service';

export interface Product {
  id_produkt: string;
  produkt_name: string;
  beschreibung?: string;
  preis: number;
  mwst_satz: number;
  gueltig_von?: string | null;
  gueltig_bis?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly endpoint = 'products'; // → /api/products

  constructor(private api: ApiService) {}

  /** 💰 Alle Produkte abrufen */
  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>(this.endpoint).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Laden der Produkte:', err);
        return throwError(() => err);
      })
    );
  }

  /** 🔍 Einzelnes Produkt abrufen */
  getById(id: string): Observable<Product> {
    return this.api.getById<Product>(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Laden des Produkts ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** ➕ Neues Produkt erstellen */
  create(payload: Partial<Product>): Observable<Product> {
    return this.api.post<Product>(this.endpoint, payload).pipe(
      catchError((err) => {
        console.error('❌ Fehler beim Erstellen des Produkts:', err);
        return throwError(() => err);
      })
    );
  }

  /** ✏️ Produkt bearbeiten */
  update(id: string, payload: Partial<Product>): Observable<Product> {
    return this.api.put<Product>(this.endpoint, id, payload).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Aktualisieren des Produkts ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** 🗑️ Produkt löschen */
  delete(id: string): Observable<void> {
    return this.api.delete<any>(this.endpoint, id).pipe(
      catchError((err) => {
        console.error(`❌ Fehler beim Löschen des Produkts ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
  
}
